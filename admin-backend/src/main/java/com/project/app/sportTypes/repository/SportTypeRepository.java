package com.project.app.sportTypes.repository;

import com.project.app.sportTypes.entity.SportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SportTypeRepository extends JpaRepository<SportType, Long> {
    // 사용 중인 스포츠 타입 목록 조회 (Boolean 타입)
    List<SportType> findByUseYnOrderBySportNm(Boolean useYn);

    // 스포츠명으로 조회
    Optional<SportType> findBySportNm(String sportNm);

    // 스포츠명 검색 (LIKE 검색)
    List<SportType> findBySportNmContaining(String sportNm);
}
