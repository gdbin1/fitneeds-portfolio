package com.project.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

/**
 * Spring Boot 애플리케이션의 시작점 (메인 클래스)
 * 
 * 특정 기능을 제외하고 싶을 때 아래 주석을 해제하세요: - Batch 기능 제외: @SpringBootApplication(exclude
 * = {BatchAutoConfiguration.class}) - JPA 기능 제외: @SpringBootApplication(exclude
 * = {HibernateJpaAutoConfiguration.class}) - MyBatis 기능
 * 제외: @SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
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
