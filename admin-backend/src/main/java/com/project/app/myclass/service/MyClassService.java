// file: src/main/java/com/project/app/myclass/service/MyClassService.java
package com.project.app.myclass.service;

import com.project.app.myclass.dto.MyClassDto;
import com.project.app.myclass.dto.ScheduleListQuery;
import com.project.app.myclass.dto.row.MyClassReservationRow;
import com.project.app.myclass.dto.row.MyClassScheduleRow;
import com.project.app.myclass.mapper.MyClassMapper;
import com.project.app.userAdmin.entity.UserAdmin;
import com.project.app.userAdmin.repository.UserAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MyClassService {

    private final MyClassMapper myClassMapper;
    private final UserAdminRepository userAdminRepo;

    @Transactional(readOnly = true)
    public List<MyClassDto.ScheduleResp> listSchedules(String requesterId, ScheduleListQuery q) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole()).toUpperCase();

        // 권한 강제
        if ("TEACHER".equals(role)) {
            q.setTeacherId(requesterId);
        } else if ("MANAGER".equals(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            q.setBrchId(requester.getBrchId());
        } else if (!"ADMIN".equals(role)) {
            throw new AccessDeniedException("Unknown role: " + role);
        }

        return myClassMapper.selectScheduleList(q).stream()
                .filter(Objects::nonNull)
                .map(this::toScheduleResp)
                .toList();
    }

    @Transactional(readOnly = true)
    public MyClassDto.ListResp listSchedulesPaged(String requesterId, ScheduleListQuery q) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole()).toUpperCase();

        int safePage = (q.getPage() == null || q.getPage() < 1) ? 1 : q.getPage();
        int safeSize = (q.getSize() == null || q.getSize() < 1) ? 25 : Math.min(q.getSize(), 200);
        int offset = (safePage - 1) * safeSize;

        q.setPage(safePage);
        q.setSize(safeSize);
        q.setOffset(offset);

        // 권한 강제
        if ("TEACHER".equals(role)) {
            q.setTeacherId(requesterId);
        } else if ("MANAGER".equals(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            q.setBrchId(requester.getBrchId());
        } else if (!"ADMIN".equals(role)) {
            throw new AccessDeniedException("Unknown role: " + role);
        }

        long total = myClassMapper.countScheduleList(q);
        if (total == 0) {
            return new MyClassDto.ListResp(List.of(), safePage, safeSize, 0);
        }

        List<MyClassDto.ScheduleResp> items = myClassMapper.selectScheduleListPaged(q).stream()
                .filter(Objects::nonNull)
                .map(this::toScheduleResp)
                .toList();

        return new MyClassDto.ListResp(items, safePage, safeSize, total);
    }

    @Transactional(readOnly = true)
    public MyClassDto.ScheduleResp getSchedule(String requesterId, Long schdId) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole()).toUpperCase();

        MyClassScheduleRow row = myClassMapper.selectScheduleDetail(schdId);
        if (row == null) throw new IllegalArgumentException("Schedule not found: " + schdId);

        enforceAccess(role, requester, row);
        return toScheduleResp(row);
    }

    @Transactional(readOnly = true)
    public List<MyClassDto.ReservationResp> getReservations(String requesterId, Long schdId) {
        UserAdmin requester = requireRequester(requesterId);
        String role = safe(requester.getRole()).toUpperCase();

        MyClassScheduleRow schedule = myClassMapper.selectScheduleDetail(schdId);
        if (schedule == null) throw new IllegalArgumentException("Schedule not found: " + schdId);

        enforceAccess(role, requester, schedule);

        List<MyClassReservationRow> rows = myClassMapper.selectReservationsByScheduleId(schdId);
        return rows.stream().filter(Objects::nonNull).map(this::toReservationResp).toList();
    }

    @Transactional(readOnly = true)
    public MyClassDto.ScheduleDetailResp getScheduleDetailWithReservations(String requesterId, Long schdId) {
        MyClassDto.ScheduleResp schedule = getSchedule(requesterId, schdId);
        List<MyClassDto.ReservationResp> reservations = getReservations(requesterId, schdId);
        return new MyClassDto.ScheduleDetailResp(schedule, reservations);
    }

    // -------------------------
    // 권한/유틸
    // -------------------------
    private UserAdmin requireRequester(String requesterId) {
        return userAdminRepo.findByUserId(requesterId)
                .orElseThrow(() -> new AccessDeniedException("Requester not found"));
    }

    private void enforceAccess(String role, UserAdmin requester, MyClassScheduleRow schedule) {
        if ("ADMIN".equals(role)) return;

        if ("MANAGER".equals(role)) {
            if (requester.getBrchId() == null) throw new IllegalStateException("MANAGER has no brchId");
            if (!Objects.equals(requester.getBrchId(), schedule.getBrchId())) {
                throw new AccessDeniedException("MANAGER can only access own branch schedules");
            }
            return;
        }

        if ("TEACHER".equals(role)) {
            if (!Objects.equals(requester.getUserId(), schedule.getTeacherId())) {
                throw new AccessDeniedException("TEACHER can only access own schedules");
            }
            return;
        }

        throw new AccessDeniedException("Unknown role: " + role);
    }

    private String safe(String s) { return (s == null) ? "" : s; }

    private MyClassDto.ScheduleResp toScheduleResp(MyClassScheduleRow r) {
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

    private MyClassDto.ReservationResp toReservationResp(MyClassReservationRow r) {
        return new MyClassDto.ReservationResp(
                r.getRsvId(),
                r.getUserId(),
                r.getUserName(),
                r.getPhoneNumber(),
                r.getSttsCd(),
                r.getRsvDt(),
                r.getRsvTime(),
                r.getAttendanceStatus(),
                r.getReviewWritten(),
                r.getCnclRsn(),
                r.getUpdId(),
                r.getAtndYn(),
                r.getCheckinAt()
        );
    }
}
