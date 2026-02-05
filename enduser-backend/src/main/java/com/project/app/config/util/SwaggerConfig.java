package com.project.app.config.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

/**
 * Swagger API 문서 설정
 * 
 * Swagger란?
 * - REST API를 시각적으로 문서화하고 테스트할 수 있는 도구
 * - 브라우저에서 API를 직접 호출해볼 수 있습니다
 * 
 * 접속 방법:
 * - 애플리케이션 실행 후 http://localhost:8080/swagger-ui/index.html 접속
 * - 모든 API 목록과 테스트 기능을 확인할 수 있습니다
 */
@Configuration
public class SwaggerConfig {

	/**
	 * OpenAPI 설정
	 * API 문서의 기본 정보를 설정합니다
	 */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                		.title("FitNeeds User api")                                    // API 문서 제목
                        .description("FitNeeds User 관련 API 문서입니다.")  // API 설명
                        .version("1.0.0"));                                  // API 버전
    }
}