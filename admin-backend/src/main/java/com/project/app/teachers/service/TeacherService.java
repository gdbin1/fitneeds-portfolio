// file: src/main/java/com/project/app/teachers/service/TeacherService.java
package com.project.app.teachers.service;

import com.project.app.branch.entity.Branch;
import com.project.app.branch.repository.BranchRepository;
import com.project.app.config.util.UserIdGenerator;
import com.project.app.myclass.dto.MyClassDto;
import com.project.app.myclass.dto.ScheduleListQuery;
import com.project.app.myclass.dto.row.MyClassScheduleRow;
import com.project.app.myclass.mapper.MyClassMapper;
import com.project.app.sportTypes.entity.SportType;
import com.project.app.sportTypes.repository.SportTypeRepository;
import com.project.app.teachers.dto.TeacherDto;
import com.project.app.teachers.dto.TeacherStatusUpdateReq;
import com.project.app.teachers.exception.TeacherProfileMissingException;
import com.project.app.teachers.entity.*;
import com.project.app.teachers.mapper.TeacherMapper;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherMapper teacherMapper;
    private final UserAdminRepository userAdminRepo;
    private final BranchRepository branchRepo;
    private final SportTypeRepository sportTypeRepo;
    private final PasswordEncoder passwordEncoder;

    // 강사 배정 수업 목록(teachers에서 재사용)
    private final MyClassMapper myClassMapper;

    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "MANAGER", "TEACHER");

    // ------------------------
    // Public APIs
    // ------------------------

    /**
     * GET /api/teachers
     * 기준: USERS_ADMIN(role=TEACHER)
     *
     * status:
     * - null/blank: ACTIVE (기본 동작)
     * - ALL: 상태필터 해제 + 프로필 없는 강사도 포함
     * - RETIRED: RESIGNED로 치환
     * - 허용: ACTIVE / LEAVE / RESIGNED / ALL
     */
    @Transactional(readOnly = true)
    public List<TeacherDto.Resp> list(String requesterId, Long requestedBranchId, Long sportId, String status, String keyword) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        String resolvedStatus = normalizeStatusOrNull(status); // ALL이면 null
        String resolvedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

        // 권한별 스코프
        if ("TEACHER".equalsIgnoreCase(role)) {
            return listAsTeacher(requesterId, sportId, resolvedStatus);
        }

        Long effectiveBranchId;
        if ("MANAGER".equalsIgnoreCase(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            effectiveBranchId = requester.getBrchId();
        } else {
            effectiveBranchId = requestedBranchId;
        }

        List<UserAdmin> teacherAdmins = teacherMapper.findTeacherAdminsByFilters(
                effectiveBranchId,
                sportId,
                resolvedStatus,
                resolvedKeyword
        );

        if (teacherAdmins == null || teacherAdmins.isEmpty()) return List.of();

        List<String> userIds = teacherAdmins.stream()
                .map(UserAdmin::getUserId)
                .filter(Objects::nonNull)
                .toList();

        List<TeacherProfile> profiles = teacherMapper.findByUserIdInAndFilters(userIds, null, resolvedStatus);
        Map<String, TeacherProfile> profileMap = (profiles == null ? List.<TeacherProfile>of() : profiles).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(TeacherProfile::getUserId, p -> p, (a, b) -> a));

        if (resolvedStatus != null) {
            teacherAdmins = teacherAdmins.stream()
                    .filter(ua -> profileMap.containsKey(ua.getUserId()))
                    .toList();
        }

        return teacherAdmins.stream()
                .map(ua -> toSummaryResp(ua, profileMap.get(ua.getUserId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public TeacherDto.ListResp listPaged(
            String requesterId,
            Long requestedBranchId,
            Long sportId,
            String status,
            String keyword,
            Integer page,
            Integer size
    ) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        int safePage = (page == null || page < 1) ? 1 : page;
        int safeSize = (size == null || size < 1) ? 25 : Math.min(size, 200);
        int offset = (safePage - 1) * safeSize;

        String resolvedStatus = normalizeStatusOrNull(status); // ALL이면 null
        String resolvedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

        if ("TEACHER".equalsIgnoreCase(role)) {
            List<TeacherDto.Resp> items = listAsTeacher(requesterId, sportId, resolvedStatus);
            return new TeacherDto.ListResp(items, 1, safeSize, items.size());
        }

        Long effectiveBranchId;
        if ("MANAGER".equalsIgnoreCase(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            effectiveBranchId = requester.getBrchId();
        } else {
            effectiveBranchId = requestedBranchId;
        }

        long total = teacherMapper.countTeacherAdminsByFilters(
                effectiveBranchId,
                sportId,
                resolvedStatus,
                resolvedKeyword
        );
        if (total == 0) {
            return new TeacherDto.ListResp(List.of(), safePage, safeSize, 0);
        }

        List<UserAdmin> teacherAdmins = teacherMapper.findTeacherAdminsByFiltersPaged(
                effectiveBranchId,
                sportId,
                resolvedStatus,
                resolvedKeyword,
                offset,
                safeSize
        );
        if (teacherAdmins == null || teacherAdmins.isEmpty()) {
            return new TeacherDto.ListResp(List.of(), safePage, safeSize, total);
        }

        List<String> userIds = teacherAdmins.stream()
                .map(UserAdmin::getUserId)
                .filter(Objects::nonNull)
                .toList();

        List<TeacherProfile> profiles = teacherMapper.findByUserIdInAndFilters(userIds, null, resolvedStatus);
        Map<String, TeacherProfile> profileMap = (profiles == null ? List.<TeacherProfile>of() : profiles).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(TeacherProfile::getUserId, p -> p, (a, b) -> a));

        List<TeacherDto.Resp> items = teacherAdmins.stream()
                .filter(ua -> resolvedStatus == null || profileMap.containsKey(ua.getUserId()))
                .map(ua -> toSummaryResp(ua, profileMap.get(ua.getUserId())))
                .toList();

        return new TeacherDto.ListResp(items, safePage, safeSize, total);
    }

    @Transactional(readOnly = true)
    public TeacherDto.Resp detail(String requesterId, String targetUserId) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        UserAdmin targetUa = userAdminRepo.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("UserAdmin not found: " + targetUserId));

        if (!"TEACHER".equalsIgnoreCase(safe(targetUa.getRole()))) {
            throw new IllegalArgumentException("Target is not TEACHER: " + targetUserId);
        }

        TeacherProfile profile = teacherMapper.findById(targetUserId); // null 가능

        // 접근 제어는 "대상 userId + 지점" 기준
        Long targetBrchId = (profile != null && profile.getBrchId() != null) ? profile.getBrchId() : targetUa.getBrchId();
        enforceAccessToTarget(role, requester, targetUserId, targetBrchId);

        return toFullResp(targetUa, profile);
    }

    /**
     * 강사 배정 수업 목록
     */
    @Transactional(readOnly = true)
    public List<MyClassDto.ScheduleResp> listAssignedSchedules(String requesterId, String targetTeacherId, ScheduleListQuery q) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        UserAdmin targetUa = userAdminRepo.findByUserId(targetTeacherId)
                .orElseThrow(() -> new IllegalArgumentException("UserAdmin not found: " + targetTeacherId));

        if (!"TEACHER".equalsIgnoreCase(safe(targetUa.getRole()))) {
            throw new IllegalArgumentException("Target is not TEACHER: " + targetTeacherId);
        }

        Long targetBrchId = targetUa.getBrchId();
        enforceAccessToTarget(role, requester, targetTeacherId, targetBrchId);

        ScheduleListQuery query = (q == null) ? new ScheduleListQuery() : q;
        query.setTeacherId(targetTeacherId);

        if ("MANAGER".equalsIgnoreCase(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            query.setBrchId(requester.getBrchId());
        }

        return myClassMapper.selectScheduleList(query).stream()
                .filter(Objects::nonNull)
                .map(this::toMyClassScheduleResp)
                .toList();
    }

    @Transactional
    public TeacherDto.Resp create(String requesterId, TeacherDto.CreateReq req) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        if ("TEACHER".equalsIgnoreCase(role)) throw new AccessDeniedException("TEACHER cannot create teachers");

        // MANAGER은 본인 지점으로만 생성
        if ("MANAGER".equalsIgnoreCase(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            if (req.brchId() == null) {
                req = new TeacherDto.CreateReq(
                        req.userId(),
                        req.userName(),
                        req.email(),
                        req.password(),
                        req.phoneNumber(),
                        requester.getBrchId(),
                        req.hireDt(),
                        req.intro(),
                        req.profileImgUrl(),
                        req.updUserId(),
                        req.sports(),
                        req.certificates(),
                        req.careers()
                );
            } else if (!Objects.equals(req.brchId(), requester.getBrchId())) {
                throw new AccessDeniedException("MANAGER can only create teachers in own branch");
            }
        }

        requireBranch(req.brchId());

        String userId = (req.userId() == null || req.userId().isBlank())
                ? new UserIdGenerator().generateUniqueUserId()
                : req.userId();

        if (userAdminRepo.existsByUserId(userId)) throw new IllegalArgumentException("UserAdmin already exists: " + userId);
        if (userAdminRepo.existsByEmail(req.email())) throw new IllegalArgumentException("Email already exists: " + req.email());

        UserAdmin userAdmin = UserAdmin.builder()
                .userId(userId)
                .userName(req.userName())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .phoneNumber(req.phoneNumber())
                .role("TEACHER")
                .agreeAt(LocalDateTime.now())
                .isActive(true)
                .brchId(req.brchId())
                .build();
        userAdminRepo.saveAndFlush(userAdmin);

        TeacherProfile profile = TeacherProfile.builder()
                .userId(userId)
                .brchId(req.brchId())
                .sttsCd("ACTIVE")
                .hireDt(req.hireDt())
                .leaveRsn("")
                .intro(req.intro())
                .profileImgUrl(req.profileImgUrl())
                .regDt(LocalDateTime.now())
                .updDt(LocalDateTime.now())
                .updUserId(req.updUserId())
                .build();
        teacherMapper.insert(profile);

        upsertChildren(userId, req.updUserId(), req.sports(), req.certificates(), req.careers());

        return detail(requesterId, userId);
    }



    /**
     * 프로필이 없는 기존 TEACHER에 대해 TEACHER_PROFILE을 생성한다.
     * - 프론트에서 '프로필 생성 필요' 안내 후 사용자가 동의했을 때만 호출하는 용도
     * POST /api/teachers/{userId}/profile
     */
    @Transactional
    public void createProfile(String requesterId, String targetUserId) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        if ("TEACHER".equalsIgnoreCase(role)) throw new AccessDeniedException("TEACHER cannot create teacher profile");

        UserAdmin targetUa = userAdminRepo.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("UserAdmin not found: " + targetUserId));

        if (!"TEACHER".equalsIgnoreCase(safe(targetUa.getRole()))) {
            throw new IllegalArgumentException("Target is not TEACHER: " + targetUserId);
        }

        Long targetBrchId = targetUa.getBrchId();
        enforceAccessToTarget(role, requester, targetUserId, targetBrchId);

        // 이미 있으면 그대로 종료(idempotent)
        TeacherProfile exists = teacherMapper.findById(targetUserId);
        if (exists != null) return;

        if (targetBrchId == null) throw new IllegalArgumentException("Target teacher has no brchId: " + targetUserId);
        requireBranch(targetBrchId);

        TeacherProfile profile = TeacherProfile.builder()
                .userId(targetUserId)
                .brchId(targetBrchId)
                .sttsCd("ACTIVE")
                .hireDt(null)
                .leaveRsn("")
                .intro("")
                .profileImgUrl("")
                .regDt(LocalDateTime.now())
                .updDt(LocalDateTime.now())
                .updUserId(requesterId)
                .build();
        teacherMapper.insert(profile);
    }

    @Transactional
    public TeacherDto.Resp update(String requesterId, String targetUserId, TeacherDto.UpdateReq req) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        UserAdmin targetUa = userAdminRepo.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("UserAdmin not found: " + targetUserId));

        if (!"TEACHER".equalsIgnoreCase(safe(targetUa.getRole()))) {
            throw new IllegalArgumentException("Target is not TEACHER: " + targetUserId);
        }

        TeacherProfile targetProfile = teacherMapper.findById(targetUserId);
        if (targetProfile == null) {
            throw new TeacherProfileMissingException(targetUserId);
        }

        enforceAccessToTarget(role, requester, targetUserId, targetProfile.getBrchId());

        // TEACHER는 지점 변경 금지
        if ("TEACHER".equalsIgnoreCase(role) && req.brchId() != null && !Objects.equals(req.brchId(), targetProfile.getBrchId())) {
            throw new AccessDeniedException("TEACHER cannot change branch");
        }

        if (req.brchId() != null) requireBranch(req.brchId());

        // USERS_ADMIN 수정
        if (req.userName() != null) targetUa.setUserName(req.userName());
        if (req.phoneNumber() != null) targetUa.setPhoneNumber(req.phoneNumber());
        if (req.email() != null && !req.email().equals(targetUa.getEmail())) {
            if (userAdminRepo.existsByEmail(req.email())) throw new IllegalArgumentException("Email already exists: " + req.email());
            targetUa.setEmail(req.email());
        }
        if (req.brchId() != null) targetUa.setBrchId(req.brchId());
        userAdminRepo.save(targetUa);

        // TEACHER_PROFILE 수정
        targetProfile.update(req.brchId(), req.intro(), req.profileImgUrl(), req.updUserId());
        teacherMapper.update(targetProfile);

        // 하위 테이블 교체
        if (req.sports() != null) {
            teacherMapper.deleteSportsByUserId(targetUserId);
            req.sports().stream().filter(Objects::nonNull).forEach(s -> {
                TeacherSport sport = TeacherSport.builder()
                        .userId(targetUserId)
                        .sportId(s.sportId())
                        .mainYn(Boolean.TRUE.equals(s.mainYn()))
                        .sortNo(s.sortNo() == null ? 1 : s.sortNo())
                        .regDt(LocalDateTime.now())
                        .updDt(LocalDateTime.now())
                        .build();
                teacherMapper.insertSport(sport);
            });
        }
        if (req.certificates() != null) {
            teacherMapper.deleteCertsByUserId(targetUserId);
            req.certificates().stream().filter(Objects::nonNull).forEach(c -> {
                TeacherCertificate cert = TeacherCertificate.builder()
                        .userId(targetUserId)
                        .certNm(c.certNm())
                        .issuer(c.issuer())
                        .acqDt(c.acqDt())
                        .certNo(c.certNo())
                        .regDt(LocalDateTime.now())
                        .updDt(LocalDateTime.now())
                        .updUserId(req.updUserId())
                        .build();
                teacherMapper.insertCert(cert);
            });
        }
        if (req.careers() != null) {
            teacherMapper.deleteCareersByUserId(targetUserId);
            req.careers().stream().filter(Objects::nonNull).forEach(c -> {
                TeacherCareer career = TeacherCareer.builder()
                        .userId(targetUserId)
                        .orgNm(c.orgNm())
                        .roleNm(c.roleNm()) // ✅ getRoleNm() 아님
                        .strtDt(c.strtDt())
                        .endDt(c.endDt())
                        .regDt(LocalDateTime.now())
                        .updDt(LocalDateTime.now())
                        .updUserId(req.updUserId())
                        .build();
                teacherMapper.insertCareer(career);
            });
        }

        return detail(requesterId, targetUserId);
    }

    @Transactional
    public void retire(String requesterId, String targetUserId, TeacherDto.RetireReq req) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        if ("TEACHER".equalsIgnoreCase(role)) throw new AccessDeniedException("TEACHER cannot retire teachers");

        TeacherProfile targetProfile = teacherMapper.findById(targetUserId);

        enforceAccessToTarget(role, requester, targetUserId, targetProfile.getBrchId());

        UserAdmin targetUser = userAdminRepo.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("UserAdmin not found: " + targetUserId));

        String updaterId = req.updaterId();
        String leaveRsn = (req.leaveRsn() == null) ? "" : req.leaveRsn();

        targetProfile.retire(req.leaveDt(), leaveRsn, updaterId);
        teacherMapper.update(targetProfile);

        targetUser.setIsActive(false);
        userAdminRepo.save(targetUser);
    }

    @Transactional
    public void updateStatus(String requesterId, String targetUserId, TeacherStatusUpdateReq req) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole());
        requireKnownRole(role);

        if ("TEACHER".equalsIgnoreCase(role)) throw new AccessDeniedException("TEACHER cannot change status");

        TeacherProfile targetProfile = teacherMapper.findById(targetUserId);

        enforceAccessToTarget(role, requester, targetUserId, targetProfile.getBrchId());

        String newStatus = normalizeStatus(req.getSttsCd());

        // RESIGNED는 retire API로만
        if ("RESIGNED".equals(newStatus)) {
            throw new IllegalArgumentException("퇴직 상태는 /retire API로만 변경 가능합니다.");
        }

        targetProfile.setSttsCd(newStatus);
        targetProfile.setUpdDt(LocalDateTime.now());
        teacherMapper.update(targetProfile);
    }

    // ------------------------
    // 권한/유틸
    // ------------------------

    private void requireKnownRole(String role) {
        if (!ALLOWED_ROLES.contains(role.toUpperCase())) {
            throw new AccessDeniedException("Unknown role: " + role);
        }
    }

    private UserAdmin requireRequester(String requesterId) {
        return userAdminRepo.findByUserId(requesterId)
                .orElseThrow(() -> new AccessDeniedException("Requester not found"));
    }

    private void enforceAccessToTarget(String role, UserAdmin requester, String targetUserId, Long targetBrchId) {
        String r = role.toUpperCase();

        if ("ADMIN".equals(r)) return;

        if ("MANAGER".equals(r)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            if (targetBrchId == null || !Objects.equals(requester.getBrchId(), targetBrchId)) {
                throw new AccessDeniedException("MANAGER can only manage own branch teachers");
            }
            return;
        }

        if ("TEACHER".equals(r)) {
            if (!Objects.equals(requester.getUserId(), targetUserId)) {
                throw new AccessDeniedException("TEACHER can only access own profile");
            }
            return;
        }

        throw new AccessDeniedException("Unknown role: " + role);
    }

    private List<TeacherDto.Resp> listAsTeacher(String requesterId, Long sportId, String resolvedStatus) {
        UserAdmin ua = userAdminRepo.findByUserId(requesterId).orElse(null);
        if (ua == null) return List.of();

        TeacherProfile p = teacherMapper.findById(requesterId); // null 가능

        // status 필터가 있으면 프로필이 있어야 통과
        if (resolvedStatus != null) {
            if (p == null || !resolvedStatus.equalsIgnoreCase(safe(p.getSttsCd()))) return List.of();
        }

        if (sportId != null) {
            boolean hasSport = teacherMapper.findSportsByUserId(requesterId).stream()
                    .anyMatch(s -> s != null && Objects.equals(s.getSportId(), sportId));
            if (!hasSport) return List.of();
        }

        return List.of(toSummaryResp(ua, p));
    }

    private void requireBranch(Long brchId) {
        if (brchId == null) throw new IllegalArgumentException("brchId is null");
        if (!branchRepo.existsById(brchId)) throw new IllegalArgumentException("Branch not found: " + brchId);
    }

    private String safe(String s) {
        return (s == null) ? "" : s;
    }

    /**
     * 목록용 status 정규화
     * - null/blank => ACTIVE
     * - ALL => null(필터 해제)
     * - RETIRED => RESIGNED
     */
    private String normalizeStatusOrNull(String status) {
// ✅ 변경: null/blank => null (ALL, 필터 해제)
        if (status == null || status.isBlank()) return null;


        String s = status.trim().toUpperCase();
        if ("ALL".equals(s)) return null;


        if ("RETIRED".equals(s)) s = "RESIGNED";
        if (!Set.of("ACTIVE", "LEAVE", "RESIGNED").contains(s)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        return s;
    }

    /**
     * 상태 변경용(ALL 허용 X)
     */
    private String normalizeStatus(String status) {
        String s = (status == null || status.isBlank()) ? "ACTIVE" : status.trim().toUpperCase();
        if ("RETIRED".equals(s)) s = "RESIGNED";
        if (!Set.of("ACTIVE", "LEAVE", "RESIGNED").contains(s)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        return s;
    }

    private void upsertChildren(
            String userId,
            String updUserId,
            List<TeacherDto.SportReq> sports,
            List<TeacherDto.CertificateReq> certs,
            List<TeacherDto.CareerReq> careers
    ) {
        if (sports != null) {
            sports.stream().filter(Objects::nonNull).forEach(s -> {
                TeacherSport sport = TeacherSport.builder()
                        .userId(userId)
                        .sportId(s.sportId())
                        .mainYn(Boolean.TRUE.equals(s.mainYn()))
                        .sortNo(s.sortNo() == null ? 1 : s.sortNo())
                        .regDt(LocalDateTime.now())
                        .updDt(LocalDateTime.now())
                        .build();
                teacherMapper.insertSport(sport);
            });
        }

        if (certs != null) {
            certs.stream().filter(Objects::nonNull).forEach(c -> {
                TeacherCertificate cert = TeacherCertificate.builder()
                        .userId(userId)
                        .certNm(c.certNm())
                        .issuer(c.issuer())
                        .acqDt(c.acqDt())
                        .certNo(c.certNo())
                        .regDt(LocalDateTime.now())
                        .updDt(LocalDateTime.now())
                        .updUserId(updUserId)
                        .build();
                teacherMapper.insertCert(cert);
            });
        }

        if (careers != null) {
            careers.stream().filter(Objects::nonNull).forEach(c -> {
                TeacherCareer career = TeacherCareer.builder()
                        .userId(userId)
                        .orgNm(c.orgNm())
                        .roleNm(c.roleNm())
                        .strtDt(c.strtDt())
                        .endDt(c.endDt())
                        .regDt(LocalDateTime.now())
                        .updDt(LocalDateTime.now())
                        .updUserId(updUserId)
                        .build();
                teacherMapper.insertCareer(career);
            });
        }
    }

    private MyClassDto.ScheduleResp toMyClassScheduleResp(MyClassScheduleRow r) {
        return new MyClassDto.ScheduleResp(
                r.getSchdId(),
                r.getProgId(),
                r.getProgNm(),
                r.getTeacherId(),
                r.getTeacherName(),
                r.getBrchId(),
                r.getBrchNm(),
                r.getStrtDt(),
                r.getStrtTm(),
                r.getEndTm(),
                r.getMaxNopCnt(),
                r.getRsvCnt(),
                r.getSttsCd(),
                r.getDescription()
        );
    }

    // ------------------------
    // Mapping helpers
    // ------------------------

    private TeacherDto.Resp toSummaryResp(UserAdmin ua, TeacherProfile profile) {
        Long brchId = (ua.getBrchId() != null) ? ua.getBrchId() : (profile != null ? profile.getBrchId() : null);
        Branch br = (brchId == null) ? null : branchRepo.findById(brchId).orElse(null);

        List<TeacherSport> sports = teacherMapper.findSportsByUserId(ua.getUserId());
        List<TeacherDto.SportResp> sportResps = toSportResps(sports);

        return new TeacherDto.Resp(
                ua.getUserId(),
                safe(ua.getUserName()),
                safe(ua.getEmail()),
                safe(ua.getPhoneNumber()),
                brchId,
                br != null ? safe(br.getBrchNm()) : "",
                safe(ua.getRole()),
                Boolean.TRUE.equals(ua.getIsActive()) ? 1 : 0,

                profile != null ? safe(profile.getSttsCd()) : "",
                profile != null ? profile.getHireDt() : null,
                profile != null ? profile.getLeaveDt() : null,
                profile != null ? safe(profile.getLeaveRsn()) : "",
                profile != null ? safe(profile.getIntro()) : "",
                profile != null ? safe(profile.getProfileImgUrl()) : "",

                sportResps,
                List.of(),
                List.of(),
                profile != null ? profile.getRegDt() : null,
                profile != null ? profile.getUpdDt() : null,
                profile != null ? safe(profile.getUpdUserId()) : ""
        );
    }

    private TeacherDto.Resp toFullResp(UserAdmin ua, TeacherProfile profile) {
        Long brchId = (profile != null && profile.getBrchId() != null) ? profile.getBrchId() : ua.getBrchId();
        Branch br = (brchId == null) ? null : branchRepo.findById(brchId).orElse(null);

        List<TeacherSport> sports = teacherMapper.findSportsByUserId(ua.getUserId());
        List<TeacherCertificate> certs = teacherMapper.findCertsByUserId(ua.getUserId());
        List<TeacherCareer> careers = teacherMapper.findCareersByUserId(ua.getUserId());

        List<TeacherDto.SportResp> sportResps = toSportResps(sports);

        List<TeacherDto.CertificateResp> certResps = (certs == null ? List.<TeacherCertificate>of() : certs).stream()
                .filter(Objects::nonNull)
                .map(c -> new TeacherDto.CertificateResp(
                        c.getCertId(), safe(c.getCertNm()), safe(c.getIssuer()), c.getAcqDt(), safe(c.getCertNo())))
                .toList();

        List<TeacherDto.CareerResp> careerResps = (careers == null ? List.<TeacherCareer>of() : careers).stream()
                .filter(Objects::nonNull)
                .map(c -> new TeacherDto.CareerResp(
                        c.getCareerId(), safe(c.getOrgNm()), safe(c.getRoleNm()), c.getStrtDt(), c.getEndDt()))
                .toList();

        return new TeacherDto.Resp(
                ua.getUserId(),
                safe(ua.getUserName()),
                safe(ua.getEmail()),
                safe(ua.getPhoneNumber()),
                brchId,
                br != null ? safe(br.getBrchNm()) : "",
                safe(ua.getRole()),
                Boolean.TRUE.equals(ua.getIsActive()) ? 1 : 0,

                profile != null ? safe(profile.getSttsCd()) : "",
                profile != null ? profile.getHireDt() : null,
                profile != null ? profile.getLeaveDt() : null,
                profile != null ? safe(profile.getLeaveRsn()) : "",
                profile != null ? safe(profile.getIntro()) : "",
                profile != null ? safe(profile.getProfileImgUrl()) : "",

                sportResps,
                certResps,
                careerResps,
                profile != null ? profile.getRegDt() : null,
                profile != null ? profile.getUpdDt() : null,
                profile != null ? safe(profile.getUpdUserId()) : ""
        );
    }

    private List<TeacherDto.SportResp> toSportResps(List<TeacherSport> sports) {
        if (sports == null || sports.isEmpty()) return List.of();

        List<Long> sportIds = sports.stream()
                .filter(Objects::nonNull)
                .map(TeacherSport::getSportId)
                .distinct()
                .toList();

        Map<Long, String> sportNameMap = sportTypeRepo.findAllById(sportIds).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(SportType::getSportId, s -> safe(s.getSportNm()), (a, b) -> a));

        return sports.stream()
                .filter(Objects::nonNull)
                .map(s -> new TeacherDto.SportResp(
                        s.getSportId(),
                        sportNameMap.getOrDefault(s.getSportId(), ""),
                        Boolean.TRUE.equals(s.getMainYn()) ? 1 : 0,
                        s.getSortNo() == null ? 1 : s.getSortNo()
                ))
                .toList();
    }
}