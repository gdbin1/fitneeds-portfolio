package com.project.app.ticket.repository;

import com.project.app.sportTypes.entity.SportType;
import com.project.app.ticket.entity.UserPass;
import com.project.app.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPassRepository extends JpaRepository<UserPass, Long> {

    // 기본 조회
    Optional<UserPass> findByUserAndSport(User user, SportType sportType);

    // 마켓 서비스용 조회
    @Query("SELECT up FROM UserPass up WHERE up.user.userId = :userId AND up.sport.sportId = :sportId")
    Optional<UserPass> findByUserIdAndSportId(@Param("userId") String userId, @Param("sportId") Long sportId);
}

