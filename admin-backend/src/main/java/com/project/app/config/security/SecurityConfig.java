package com.project.app.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 보안 설정 클래스 애플리케이션의 인증(로그인)과 인가(권한) 처리를 담당합니다
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	/**
	 * 보안 필터 체인 설정 어떤 URL은 인증 없이 접근 가능하고, 어떤 URL은 로그인이 필요한지 정의합니다
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider)
			throws Exception {
		http
			// CSRF 보호 비활성화 (REST API에서는 일반적으로 비활성화)
			.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
			// URL별 접근 권한 설정
			.authorizeHttpRequests(auth -> auth
				// 아래 URL들은 로그인 없이 누구나 접근 가능
				.requestMatchers(

					"/", // 메인 페이지
					"/login", // 로그인 페이지
					"/index.html", // 인덱스 페이지

					// 백엔드 API 경로
					"/api/**", // 모든 API (필요시 세부 경로로 제한 가능)

					// 정적 리소스 (CSS, JS, 이미지 등)
					"/favicon.ico", // 파비콘
					"/css/**", // CSS 파일
					"/js/**", // JavaScript 파일
					"/images/**", // 이미지 파일
					"/static/**", // static 폴더 하위 파일
					"/public/**", // public 폴더 하위 파일
					"/webjars/**", // WebJars 라이브러리

					// 기타
					"/error", // 에러 페이지

					// Swagger API 문서 (개발용)
					"/swagger-ui/**", // Swagger UI 화면
					"/v3/api-docs/**" // API 명세서
					// ,"/swagger-resources/**" // Swagger 리소스
				).permitAll()

				// 위에 명시되지 않은 모든 요청은 로그인 필요
				.anyRequest().authenticated())

			// JWT 인증 필터를 Spring Security 필터 체인에 추가
			// 모든 요청이 들어올 때마다 JWT 토큰을 검사합니다
			.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
					UsernamePasswordAuthenticationFilter.class);

		// 세션을 사용하지 않음 (JWT 토큰 방식이므로)
		http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();

		// ✅ 프론트 개발 서버 Origin 허용
		config.setAllowedOrigins(List.of("http://localhost:5174"));

		// 또는 포트가 바뀔 수 있으면 아래 패턴 사용(개발용)
		// config.setAllowedOriginPatterns(List.of("http://localhost:*"));

		config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization","Content-Type"));
		config.setExposedHeaders(List.of("Authorization"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config); // 또는 "/api/**"
		return source;
	}

	/**
	 * 비밀번호 암호화 도구 등록 BCrypt 알고리즘을 사용하여 비밀번호를 안전하게 암호화합니다 평문 비밀번호를 절대 데이터베이스에 저장하지
	 * 않습니다!
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}