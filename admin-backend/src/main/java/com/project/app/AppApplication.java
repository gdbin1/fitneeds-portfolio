package com.project.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

/**
 * Spring Boot 애플리케이션의 시작점 (메인 클래스)
 */
@SpringBootApplication
@EnableScheduling
@EnableJpaAuditing
public class AppApplication {

	// 애플리케이션 실행 메소드
	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

	/**
	 * RestTemplate Bean 등록 외부 API를 호출할 때 사용하는 HTTP 클라이언트 도구
	 */
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}
