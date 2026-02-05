package com.project.app.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/**
 * 웹 관련 설정을 담당하는 구성 클래스입니다.
 * 주로 CORS(Cross-Origin Resource Sharing) 설정을 정의하여
 * 다른 도메인으로부터의 웹 요청을 제어합니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 애플리케이션 프로퍼티(application.properties 또는 application.yml)에서
     * 'my.cors.allowed-origins' 키에 설정된 허용 오리진(도메인)들을 주입받습니다.
     * 여러 오리진은 콤마(,)로 구분되어야 합니다.
     */
	@Value("${my.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * CORS(Cross-Origin Resource Sharing) 매핑을 추가합니다.
     * 이는 웹 브라우저가 다른 도메인(오리진)의 리소스에 안전하게 접근할 수 있도록
     * 서버 측에서 허용 정책을 정의하는 역할을 합니다.
     *
     * @param registry CORS 설정을 등록하는 데 사용되는 CorsRegistry 객체
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로("/**")에 대해 CORS 설정을 적용합니다.
        	/**
        	 * 'allowedOrigins' 필드에서 주입받은 문자열을 콤마(,) 기준으로 분리하여
        	 * 리소스 접근을 허용할 오리진(도메인) 목록을 지정합니다.
             */
                .allowedOrigins(allowedOrigins.split(","))
            /** 
             * 클라이언트에서 서버로 요청할 때 허용되는 HTTP 메소드들을 지정합니다.
             * GET, POST, PUT, PATCH, DELETE 외에 OPTIONS는 Preflight 요청을 위해 필요합니다.
             */
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            /**
             * 클라이언트 요청에 포함될 수 있는 모든 HTTP 헤더를 허용합니다.
             */
                .allowedHeaders("*")
            /**	클라이언트 요청에 쿠키, HTTP 인증 헤더 등의 자격 증명(credentials)을
             * 포함하여 보낼 수 있도록 허용합니다.
             */
                .allowCredentials(true)
            /** 
             * Preflight 요청(실제 요청 전 브라우저가 보내는 사전 요청)의 결과를
             * 3600초(1시간) 동안 캐시하도록 설정합니다. 이 시간 동안은 사전 요청 없이 실제 요청을 보낼 수 있습니다.
             */
                .maxAge(3600);
    }
}