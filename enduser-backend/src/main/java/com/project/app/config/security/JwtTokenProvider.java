package com.project.app.config.security;

import java.nio.charset.StandardCharsets; // getBytes()를 위해 추가
import java.security.Key; // java.security.Key 임포트
import java.util.Base64;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys; // Keys 유틸리티 클래스 임포트
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT (JSON Web Token) 토큰 처리 클래스
 * 로그인 시 토큰을 생성하고, 요청 시 토큰을 검증하는 역할을 합니다
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKeySource; // 원본 문자열 비밀 키

    private Key secretKey;

//    private final long tokenValidTime = 30 * 60 * 1000L; //30분
    private final long tokenValidTime = 10 * 60 * 60 * 1000L; //10시간

    private final UserDetailsService userDetailsService;

    public JwtTokenProvider(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @PostConstruct
    protected void init() {
        // secretKeySource를 UTF-8 바이트로 변환 후 HMAC-SHA 키 생성
        byte[] keyBytes = secretKeySource.getBytes(StandardCharsets.UTF_8);
        secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

	public String createToken(String userPk, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(userPk);
        claims.put("roles", roles);
        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + tokenValidTime))
                .signWith(secretKey)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUserPk(token));
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

	public String getUserPk(String token) {
        return Jwts.parserBuilder()
        		.setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

	public boolean validateToken(String jwtToken) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder()
            		.setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(jwtToken);
            return !claims.getBody().getExpiration().before(new Date());
        } catch (Exception e) {
            log.error("JWT token validation failed: {}", e.getMessage()); // 로깅 추가
            return false;
        }
    }
}