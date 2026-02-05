package com.project.app.ticket.service;

import com.project.app.config.security.SecurityHelper;
import com.project.app.global.dto.BasePagingRequest;
import com.project.app.global.dto.PagedResponse;
import com.project.app.sportTypes.entity.SportType;
import com.project.app.sportTypes.repository.SportTypeRepository;
import com.project.app.ticket.dto.*;
import com.project.app.ticket.entity.PassLog;
import com.project.app.ticket.entity.PassStatusCd;
import com.project.app.ticket.entity.UserPass;
import com.project.app.ticket.mapper.PassLogMapper;
import com.project.app.ticket.mapper.UserPassMapper;
import com.project.app.ticket.repository.PassLogRepository;
import com.project.app.ticket.repository.UserPassRepository;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminPassService 테스트")
class AdminPassServiceTest {

    @Mock
    private UserPassMapper userPassMapper;
    @Mock
    private UserPassRepository userPassRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SportTypeRepository sportTypeRepository;
    @Mock
    private PassLogRepository passLogRepository;
    @Mock
    private PassLogMapper passLogMapper;
    @Mock
    private SecurityHelper securityHelper;

    @InjectMocks
    private AdminPassService adminPassService;

    private User testUser;
    private SportType testSport;
    private UserPass testUserPass;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId("testUser")
                .userName("테스트유저")
                .build();

        testSport = SportType.builder()
                .sportId(1L)
                .sportNm("테니스")
                .useYn(true)
                .build();

        testUserPass = UserPass.builder()
                .passId(1L)
                .user(testUser)
                .sport(testSport)
                .passStatusCode(PassStatusCd.ACTIVE)
                .remainingCount(10)
                .initCount(10)
                .build();
    }

    @Test
    @DisplayName("이용권 목록 조회 - 성공")
    void getPassList_success() {
        // given
        BasePagingRequest paging = new BasePagingRequest(1, 10, null, "DESC");
        UserPassSearchRequest request = new UserPassSearchRequest(null, null, null, null, paging);

        UserPassResponse response = new UserPassResponse(
                1L, "테스트유저", 1L, "테니스",
                "ACTIVE", 10, null, null, null
        );

        given(userPassMapper.countTicketList(request)).willReturn(1);
        given(userPassMapper.selectTicketList(request)).willReturn(List.of(response));

        // when
        PagedResponse<UserPassResponse> result = adminPassService.getPassList(request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
        verify(userPassMapper).countTicketList(request);
        verify(userPassMapper).selectTicketList(request);
    }

    @Test
    @DisplayName("특정 회원의 ACTIVE 이용권 조회 - 성공")
    void getUserActivePasses_success() {
        // given
        String userId = "testUser";
        UserPassResponse response = new UserPassResponse(
                1L, "테스트유저", 1L, "테니스",
                "ACTIVE", 10, null, null, null
        );

        given(userPassMapper.selectTicketList(any(UserPassSearchRequest.class)))
                .willReturn(List.of(response));

        // when
        List<UserPassResponse> result = adminPassService.getUserActivePasses(userId);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).passStatusCode()).isEqualTo("ACTIVE");
        verify(userPassMapper).selectTicketList(any(UserPassSearchRequest.class));
    }

    @Test
    @DisplayName("이용권 상세 조회 - 성공")
    void getPassDetail_success() {
        // given
        Long passId = 1L;
        PassLogResponse logResponse = new PassLogResponse(
                1L, "MANUAL_REG", 10,
                "관리자 수동 등록", null, null
        );

        given(userPassRepository.findById(passId)).willReturn(Optional.of(testUserPass));
        given(passLogMapper.selectPassLogByPassId(passId)).willReturn(List.of(logResponse));

        // when
        UserPassResponse result = adminPassService.getPassDetail(passId);

        // then
        assertThat(result).isNotNull();
        assertThat(result.passId()).isEqualTo(passId);
        assertThat(result.histories()).hasSize(1);
        verify(userPassRepository).findById(passId);
        verify(passLogMapper).selectPassLogByPassId(passId);
    }

    @Test
    @DisplayName("이용권 상세 조회 - 존재하지 않는 이용권")
    void getPassDetail_notFound() {
        // given
        Long passId = 999L;
        given(userPassRepository.findById(passId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> adminPassService.getPassDetail(passId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이용권 정보를 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("이용권 생성 - 신규 생성")
    void createPass_newPass() {
        // given
        UserPassCreateRequest request = new UserPassCreateRequest(
                "testUser", 1L, 10, "ACTIVE", null
        );

        given(userRepository.findById("testUser")).willReturn(Optional.of(testUser));
        given(sportTypeRepository.findById(1L)).willReturn(Optional.of(testSport));
        given(userPassRepository.findByUserAndSport(testUser, testSport))
                .willReturn(Optional.empty());
        given(userPassRepository.save(any(UserPass.class))).willReturn(testUserPass);

        // when
        adminPassService.createPass(request);

        // then
        verify(userRepository).findById("testUser");
        verify(sportTypeRepository).findById(1L);
        verify(userPassRepository).findByUserAndSport(testUser, testSport);
        verify(userPassRepository).save(any(UserPass.class));
        verify(passLogRepository).save(any(PassLog.class));
    }

    @Test
    @DisplayName("이용권 생성 - 기존 이용권 충전 (Top-up)")
    void createPass_topUp() {
        // given
        UserPassCreateRequest request = new UserPassCreateRequest(
                "testUser", 1L, 5, "ACTIVE", null
        );

        given(userRepository.findById("testUser")).willReturn(Optional.of(testUser));
        given(sportTypeRepository.findById(1L)).willReturn(Optional.of(testSport));
        given(userPassRepository.findByUserAndSport(testUser, testSport))
                .willReturn(Optional.of(testUserPass));

        // when
        adminPassService.createPass(request);

        // then
        assertThat(testUserPass.getRemainingCount()).isEqualTo(15); // 10 + 5
        assertThat(testUserPass.getInitCount()).isEqualTo(15);
        verify(passLogRepository).save(any(PassLog.class));
    }

    @Test
    @DisplayName("이용권 생성 - 존재하지 않는 회원")
    void createPass_userNotFound() {
        // given
        UserPassCreateRequest request = new UserPassCreateRequest(
                "unknown", 1L, 10, "ACTIVE", null
        );

        given(userRepository.findById("unknown")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> adminPassService.createPass(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("회원 정보를 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("이용권 생성 - 존재하지 않는 스포츠")
    void createPass_sportNotFound() {
        // given
        UserPassCreateRequest request = new UserPassCreateRequest(
                "testUser", 999L, 10, "ACTIVE", null
        );

        given(userRepository.findById("testUser")).willReturn(Optional.of(testUser));
        given(sportTypeRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> adminPassService.createPass(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("스포츠 종목 정보를 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("이용권 수정 - 성공")
    void updatePass_success() {
        // given
        Long passId = 1L;
        UserPassUpdateRequest request = new UserPassUpdateRequest(15, "횟수 증가");

        given(userPassRepository.findById(passId)).willReturn(Optional.of(testUserPass));

        // when
        adminPassService.updatePass(passId, request);

        // then
        assertThat(testUserPass.getRemainingCount()).isEqualTo(15);
        verify(passLogRepository).save(any(PassLog.class));
    }

    @Test
    @DisplayName("이용권 수정 - 정지 상태에서 수정 시도")
    void updatePass_suspended_fails() {
        // given
        Long passId = 1L;
        UserPassUpdateRequest request = new UserPassUpdateRequest(15, "횟수 증가");

        UserPass suspendedPass = UserPass.builder()
                .passId(1L)
                .user(testUser)
                .sport(testSport)
                .passStatusCode(PassStatusCd.SUSPENDED)
                .remainingCount(10)
                .initCount(10)
                .build();

        given(userPassRepository.findById(passId)).willReturn(Optional.of(suspendedPass));

        // when & then
        assertThatThrownBy(() -> adminPassService.updatePass(passId, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("현재 상태")
                .hasMessageContaining("수정할 수 없습니다");
    }

    @Test
    @DisplayName("이용권 수정 - 삭제 상태에서 수정 시도")
    void updatePass_deleted_fails() {
        // given
        Long passId = 1L;
        UserPassUpdateRequest request = new UserPassUpdateRequest(15, "횟수 증가");

        UserPass deletedPass = UserPass.builder()
                .passId(1L)
                .user(testUser)
                .sport(testSport)
                .passStatusCode(PassStatusCd.DELETED)
                .remainingCount(0)
                .initCount(10)
                .build();

        given(userPassRepository.findById(passId)).willReturn(Optional.of(deletedPass));

        // when & then
        assertThatThrownBy(() -> adminPassService.updatePass(passId, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("수정할 수 없습니다");
    }

    @Test
    @DisplayName("이용권 상태 변경 - ACTIVE -> SUSPENDED")
    void updatePassStatus_activeToSuspended() {
        // given
        Long passId = 1L;
        given(userPassRepository.findById(passId)).willReturn(Optional.of(testUserPass));

        // when
        adminPassService.updatePassStatus(passId, "SUSPENDED");

        // then
        assertThat(testUserPass.getPassStatusCode()).isEqualTo(PassStatusCd.SUSPENDED);
        verify(passLogRepository).save(any(PassLog.class));
    }

    @Test
    @DisplayName("이용권 상태 변경 - SUSPENDED -> ACTIVE")
    void updatePassStatus_suspendedToActive() {
        // given
        Long passId = 1L;
        UserPass suspendedPass = UserPass.builder()
                .passId(1L)
                .user(testUser)
                .sport(testSport)
                .passStatusCode(PassStatusCd.SUSPENDED)
                .remainingCount(10)
                .initCount(10)
                .build();

        given(userPassRepository.findById(passId)).willReturn(Optional.of(suspendedPass));

        // when
        adminPassService.updatePassStatus(passId, "ACTIVE");

        // then
        assertThat(suspendedPass.getPassStatusCode()).isEqualTo(PassStatusCd.ACTIVE);
        verify(passLogRepository).save(any(PassLog.class));
    }

    @Test
    @DisplayName("이용권 상태 변경 - DELETED로 변경 시도 (실패)")
    void updatePassStatus_toDeleted_fails() {
        // given
        Long passId = 1L;
        given(userPassRepository.findById(passId)).willReturn(Optional.of(testUserPass));

        // when & then
        assertThatThrownBy(() -> adminPassService.updatePassStatus(passId, "DELETED"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("삭제 처리는 DELETE API를 사용해야 합니다.");
    }

    @Test
    @DisplayName("이용권 삭제 - 성공")
    void deletePass_success() {
        // given
        Long passId = 1L;
        given(userPassRepository.findById(passId)).willReturn(Optional.of(testUserPass));

        // when
        adminPassService.deletePass(passId);

        // then
        assertThat(testUserPass.getRemainingCount()).isEqualTo(0);
        assertThat(testUserPass.getPassStatusCode()).isEqualTo(PassStatusCd.DELETED);
        verify(passLogRepository).save(any(PassLog.class));
    }

    @Test
    @DisplayName("이용권 삭제 - 이미 삭제된 이용권")
    void deletePass_alreadyDeleted() {
        // given
        Long passId = 1L;
        UserPass deletedPass = UserPass.builder()
                .passId(1L)
                .user(testUser)
                .sport(testSport)
                .passStatusCode(PassStatusCd.DELETED)
                .remainingCount(0)
                .initCount(10)
                .build();

        given(userPassRepository.findById(passId)).willReturn(Optional.of(deletedPass));

        // when & then
        assertThatThrownBy(() -> adminPassService.deletePass(passId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("이미 삭제된 이용권입니다.");
    }

    @Test
    @DisplayName("회원 검색 - 성공")
    void searchUsers_success() {
        // given
        String keyword = "테스트";
        List<User> users = List.of(testUser);

        given(userRepository.findByUserNameContainingOrUserIdContaining(keyword, keyword))
                .willReturn(users);

        // when
        var result = adminPassService.searchUsers(keyword);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).userId()).isEqualTo("testUser");
        assertThat(result.get(0).userName()).isEqualTo("테스트유저");
    }

    @Test
    @DisplayName("회원 검색 - 빈 키워드")
    void searchUsers_emptyKeyword() {
        // when
        var result = adminPassService.searchUsers("");

        // then
        assertThat(result).isEmpty();
        verify(userRepository, times(0)).findByUserNameContainingOrUserIdContaining(anyString(), anyString());
    }

    @Test
    @DisplayName("활성 스포츠 목록 조회 - 성공")
    void getActiveSports_success() {
        // given
        List<SportType> sports = List.of(testSport);
        given(sportTypeRepository.findByUseYnOrderBySportNm(true)).willReturn(sports);

        // when
        var result = adminPassService.getActiveSports();

        // then
        assertThat(result).hasSize(1);
        verify(sportTypeRepository).findByUseYnOrderBySportNm(true);
    }
}

