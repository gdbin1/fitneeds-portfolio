package com.project.app.market.mapper;

import com.project.app.market.dto.PostResponse;
import com.project.app.market.dto.PostSearchRequest;
import com.project.app.market.dto.TradeResponse;
import com.project.app.market.dto.TradeSearchRequest;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MarketMapper {
    List<PostResponse> selectPostList(PostSearchRequest request);

    int countPostList(PostSearchRequest request);

    List<TradeResponse> selectTradeList(TradeSearchRequest request);

    int countTradeList(TradeSearchRequest request);
}
