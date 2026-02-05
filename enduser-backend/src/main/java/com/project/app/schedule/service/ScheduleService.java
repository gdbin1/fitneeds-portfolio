package com.project.app.schedule.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.schedule.dto.GroupedScheduleResponseDto;
import com.project.app.schedule.dto.ScheduleResponseDto;
import com.project.app.schedule.entity.Schedule;
import com.project.app.schedule.entity.ScheduleSttsCd;
import com.project.app.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

	private final ScheduleRepository scheduleRepository;

	/**
	 * 특정 스포츠 ID 기준으로 스케줄을 조회하고 그룹핑/페이징 처리합니다.
	 */
	@Transactional(readOnly = true)
	public Page<GroupedScheduleResponseDto> getSchedulesBySportIdForR(Long sportId, String searchKeyword,
			LocalDate currentDate, LocalTime currentTime, LocalDate selectedDate, Pageable pageable) {
		try {
			log.info("서비스: 스포츠 ID로 스케줄 조회 요청: sportId={}, searchKeyword={}", sportId, searchKeyword);

			List<Schedule> allSchedules = scheduleRepository.findAvailableSchedulesBySportId(sportId, currentDate,
					currentTime, selectedDate, searchKeyword, List.of(ScheduleSttsCd.AVAILABLE, ScheduleSttsCd.OPEN));

			log.debug("서비스: 스포츠 ID {} 로 조회된 총 스케줄 수: {}", sportId, allSchedules.size());
			return applyGroupingAndPaging(allSchedules, pageable);

		} catch (Exception e) {
			log.error("서비스: 스포츠 ID {} 로 스케줄 조회 중 오류 발생: {}", sportId, e.getMessage(), e);
			throw new RuntimeException("스포츠 ID로 스케줄 조회 실패", e);
		}
	}

	/**
	 * 특정 지점 ID 기준으로 스케줄을 조회하고 그룹핑/페이징 처리합니다.
	 */
	@Transactional(readOnly = true)
	public Page<GroupedScheduleResponseDto> getSchedulesByBrchIdForR(Long brchId, String searchKeyword,
			LocalDate currentDate, LocalTime currentTime, LocalDate selectedDate, Pageable pageable) {
		try {
			log.info("서비스: 지점 ID로 스케줄 조회 요청: brchId={}, searchKeyword={}", brchId, searchKeyword);

			List<Schedule> allSchedules = scheduleRepository.findAvailableSchedulesByBrchId(brchId, currentDate,
					currentTime, selectedDate, searchKeyword, List.of(ScheduleSttsCd.AVAILABLE, ScheduleSttsCd.OPEN));

			log.debug("서비스: 지점 ID {} 로 조회된 총 스케줄 수: {}", brchId, allSchedules.size());
			return applyGroupingAndPaging(allSchedules, pageable);
		} catch (Exception e) {
			log.error("서비스: 지점 ID {} 로 스케줄 조회 중 오류 발생: {}", brchId, e.getMessage(), e);
			throw new RuntimeException("지점 ID로 스케줄 조회 실패", e);
		}
	}

	/**
	 * 조회된 스케줄 리스트를 (강사+프로그램+시간) 기준으로 그룹핑하고 날짜별 개별 ID를 매핑합니다.
	 */
	private Page<GroupedScheduleResponseDto> applyGroupingAndPaging(List<Schedule> allSchedules, Pageable pageable) {
		if (allSchedules == null || allSchedules.isEmpty()) {
			return Page.empty(pageable);
		}

		// Key: userId-progId-strtTm-endTm
		Map<String, GroupedScheduleResponseDto> groupedSchedulesMap = new LinkedHashMap<>();
		
		// Key: userId-progId-strtTm-endTm, Value: 해당 그룹에 속하는 (schdId + strtDt) 객체들의 집합
		// 날짜순 정렬을 위해 TreeSet 사용 (Comparator 정의)
		Map<String, Set<GroupedScheduleResponseDto.ScheduleSessionDto>> sessionsMap = new LinkedHashMap<>();

		allSchedules.forEach(schedule -> {
			// 1. 그룹 식별을 위한 키 생성
			String key = String.format("%s-%s-%s-%s",
					schedule.getUserAdmin() != null ? schedule.getUserAdmin().getUserId() : "NULL_USER",
					schedule.getProgram() != null ? schedule.getProgram().getProgId().toString() : "NULL_PROG",
					schedule.getStrtTm() != null ? schedule.getStrtTm().toString() : "00:00",
					schedule.getEndTm() != null ? schedule.getEndTm().toString() : "00:00");

			// 2. 그룹 DTO가 없으면 새로 생성
			if (!groupedSchedulesMap.containsKey(key)) {
				GroupedScheduleResponseDto newGroup = GroupedScheduleResponseDto.from(schedule);
				groupedSchedulesMap.put(key, newGroup);
				// 날짜순 정렬을 위한 TreeSet 초기화
				sessionsMap.put(key, new TreeSet<>(Comparator.comparing(GroupedScheduleResponseDto.ScheduleSessionDto::getDate)));
			}

			// 3. 현재 스케줄의 ID와 날짜를 세션 정보로 추가 (핵심 수정 사항)
			sessionsMap.get(key).add(new GroupedScheduleResponseDto.ScheduleSessionDto(
					schedule.getSchdId(), 
					schedule.getStrtDt()
			));
		});

		// 4. 각 그룹 DTO에 정렬된 세션 리스트와 시작/종료일 설정
		List<GroupedScheduleResponseDto> allGroupedList = new ArrayList<>(groupedSchedulesMap.values());
		for (GroupedScheduleResponseDto dto : allGroupedList) {
			String keyFromDto = String.format("%s-%s-%s-%s",
					dto.getUserId(),
					dto.getProgId().toString(),
					dto.getStrtTm().toString(),
					dto.getEndTm().toString());

			Set<GroupedScheduleResponseDto.ScheduleSessionDto> sessions = sessionsMap.get(keyFromDto);
			
			if (sessions != null && !sessions.isEmpty()) {
				List<GroupedScheduleResponseDto.ScheduleSessionDto> sortedSessions = new ArrayList<>(sessions);
				
				// DTO의 세션 리스트 채우기
				dto.setSessions(sortedSessions);
				
				// 전체 기간(시작일~종료일) 업데이트
				dto.setGroupedStrtDt(sortedSessions.get(0).getDate());
				dto.setGroupedEndDt(sortedSessions.get(sortedSessions.size() - 1).getDate());
			}
		}

		// 5. 전체 리스트 정렬 (화면 표시 순서: 시작날짜 -> 강사명 -> 시작시간)
		allGroupedList.sort(Comparator.comparing(GroupedScheduleResponseDto::getGroupedStrtDt)
				.thenComparing(GroupedScheduleResponseDto::getUserName)
				.thenComparing(GroupedScheduleResponseDto::getStrtTm));

		// 6. 페이징 처리
		int start = (int) pageable.getOffset();
		int end = Math.min((start + pageable.getPageSize()), allGroupedList.size());

		if (start > allGroupedList.size()) {
			return new PageImpl<>(new ArrayList<>(), pageable, allGroupedList.size());
		}

		return new PageImpl<>(allGroupedList.subList(start, end), pageable, allGroupedList.size());
	}

	/**
	 * 스케줄러가 호출하여 지난 날짜의 스케줄을 CLOSED 상태로 업데이트합니다.
	 */
	@Transactional
	public int updatePastSchedulesToClosed(String batchUser) {
		LocalDate today = LocalDate.now();
		Collection<ScheduleSttsCd> activeSttsCds = List.of(ScheduleSttsCd.AVAILABLE);
		List<Schedule> activePastSchedules = scheduleRepository.findByStrtDtBeforeAndSttsCdIn(today, activeSttsCds);

		int updatedCount = 0;
		for (Schedule schedule : activePastSchedules) {
			schedule.setSttsCd(ScheduleSttsCd.CLOSED);
			updatedCount++;
		}
		return updatedCount;
	}
}
