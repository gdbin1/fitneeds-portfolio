package com.project.app.pass_trade_favorite.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "FAVORITE")
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_id") // ⭐ 핵심
    private Long favoriteId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    // getter / setter
}
