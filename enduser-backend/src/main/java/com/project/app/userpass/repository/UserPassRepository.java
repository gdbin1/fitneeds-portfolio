package com.project.app.userpass.repository;

import java.util.List;
import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.app.userpass.entity.UserPass;

@Repository
public interface UserPassRepository extends JpaRepository<UserPass, Long> {

    List<UserPass> findByUser_UserId(String UserId);

    // 거래에서 "판매자 소유 이용권" 검증용
    Optional<UserPass> findByUserPassIdAndUser_UserId(Long userPassId, String userId);

    //  구매자에게 같은 sport_id 이용권이 이미 있는지 확인용
    Optional<UserPass> findByUser_UserIdAndSportType_SportId(String userId, Long sportId);

    // ✅ 조회 API용 (LAZY 직렬화 사고 방지: user, sportType을 미리 로딩)
    @Query("""
        select up
        from UserPass up
        join fetch up.user u
        join fetch up.sportType st
        where u.userId = :userId
    """)
    List<UserPass> findUserPassesWithUserAndSport(@Param("userId") String userId);

    @Query(value = "select count(*) from USER_PASS", nativeQuery = true)
    long countUserPass();
}
