package com.project.app.pass_trade_favorite.repository;

import com.project.app.pass_trade_favorite.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PassTradeFavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserIdAndPostId(String userId, Long postId);

    void deleteByUserIdAndPostId(String userId, Long postId);

    List<Favorite> findByUserId(String userId);
}
