package com.project.app.market.repository;

import com.project.app.market.entity.PassTradePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketPostRepository extends JpaRepository<PassTradePost, Long> {
}
