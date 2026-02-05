package com.project.app.config.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;


public class JwtAuthenticationFilter extends GenericFilterBean {

	// JWT 토큰을 처리하는 클래스
	private final JwtTokenProvider jwtTokenProvider;

	// 생성자: JwtTokenProvider를 주입받습니다
	public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
		this.jwtTokenProvider = jwtTokenProvider;
	}

	/**
	 * 필터 메인 로직 모든 HTTP 요청이 들어올 때마다 실행됩니다
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {


		try {
			// 1. HTTP 요청 헤더에서 JWT 토큰 추출
			String token = resolveToken((HttpServletRequest) request);

			// 2. 토큰이 존재하고 유효한지 검사
			if (token != null && jwtTokenProvider.validateToken(token)) {
				// 3. 토큰에서 사용자 정보를 추출하여 인증 객체 생성
				Authentication authentication = jwtTokenProvider.getAuthentication(token);

				// 4. Spring Security에 인증 정보 등록 (로그인 상태로 만듬)
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
			chain.doFilter(request, response);

		} catch (Exception e) {
			// ❗ 여기서 401로 명확히 내리는 게 좋음 (403보다 자연스러움)
			((jakarta.servlet.http.HttpServletResponse) response).sendError(401, "Invalid token");
			return;
		}
	}

	/**
	 * HTTP 요청 헤더에서 JWT 토큰 추출
	 * 
	 * 헤더 형식: Authorization: Bearer {JWT 토큰} 예시: Authorization: Bearer
	 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
	 * 
	 * @param request HTTP 요청 객체
	 * @return JWT 토큰 문자열 (없으면 null)
	 */
	private String resolveToken(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");

		// "Bearer " 로 시작하는지 확인
		if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
			// "Bearer " 를 제외한 나머지 부분이 실제 토큰
			return bearerToken.substring(7);
		}
		return null;
	}
}