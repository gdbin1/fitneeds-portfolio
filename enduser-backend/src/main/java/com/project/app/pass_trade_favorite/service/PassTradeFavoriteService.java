package com.project.app.pass_trade_favorite.service;

import com.project.app.pass_trade_favorite.dto.PassTradeFavoriteResponse;
import com.project.app.pass_trade_favorite.entity.Favorite;
import com.project.app.pass_trade_favorite.repository.PassTradeFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 이용권 거래 게시글 즐겨찾기 서비스
 *
 * ✔ pass_trade 도메인과 분리된 부가 기능
 * ✔ 즐겨찾기 자체의 CRUD만 담당
 * ✔ 외부 컨트롤러에 직접 노출되지 않고
 *   PassTradeService를 통해서만 사용됨
 */
@Service
@Transactional
@RequiredArgsConstructor
public class PassTradeFavoriteService {

    private final PassTradeFavoriteRepository favoriteRepository;

    /**
     * 특정 게시글이 즐겨찾기 상태인지 여부 확인
     *
     * @param userId 사용자 ID
     * @param postId 게시글 ID
     * @return 즐겨찾기 여부 (true / false)
     */
    public boolean isFavorite(String userId, Long postId) {
        return favoriteRepository.existsByUserIdAndPostId(userId, postId);
    }

    /**
     * 즐겨찾기 추가
     *
     * [설계 포인트]
     * - toggle 로직은 상위 Service에서 처리
     * - 여기서는 "추가"만 책임진다
     */
    public void addFavorite(String userId, Long postId) {
        if (favoriteRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new IllegalStateException("이미 즐겨찾기에 추가된 게시글입니다.");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setPostId(postId);

        favoriteRepository.save(favorite); // ⭐ 실제 INSERT
    }


    /**
     * 즐겨찾기 해제
     */
    public void removeFavorite(String userId, Long postId) {
        favoriteRepository.deleteByUserIdAndPostId(userId, postId);
    }

    /**
     * 사용자가 즐겨찾기한 게시글 ID 목록 조회
     *
     * ✔ 메인 거래 게시글 목록에서 isFavorite 표시용
     */


    @Transactional(readOnly = true)
    public List<PassTradeFavoriteResponse> getFavorites(String userId) {

        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(fav -> {
                    PassTradeFavoriteResponse dto = new PassTradeFavoriteResponse();
                    dto.setFavoriteId(fav.getFavoriteId());
                    dto.setUserId(fav.getUserId());
                    dto.setPostId(fav.getPostId());
                    dto.setFavorite(true); // 즐겨찾기 목록이므로 항상 true
                    dto.setRegDt(null);    // 컬럼 있으면 매핑
                    return dto;
                })
                .toList();
    }

}
