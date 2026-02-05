package com.project.app.config.util;

import java.sql.Connection;
import java.sql.DatabaseMetaData;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionTester implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=============== 데이터베이스 연결 테스트 시작 ===============");
        
        try (Connection connection = dataSource.getConnection()) {
            // 연결 정보 출력
            DatabaseMetaData metaData = connection.getMetaData();
            System.out.println("데이터베이스 연결 성공!");
            System.out.println("JDBC 드라이버: " + metaData.getDriverName());
            System.out.println("드라이버 버전: " + metaData.getDriverVersion());
            System.out.println("데이터베이스 제품명: " + metaData.getDatabaseProductName());
            System.out.println("데이터베이스 제품 버전: " + metaData.getDatabaseProductVersion());
            System.out.println("URL: " + metaData.getURL());
            System.out.println("사용자명: " + metaData.getUserName());
            
            // 간단한 쿼리 실행 테스트
            try {
                Integer result = jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);
                System.out.println("쿼리 실행 결과: " + result + " (정상)");
            } catch (Exception e) {
                System.out.println("쿼리 실행 실패: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("데이터베이스 연결 실패: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=============== 데이터베이스 연결 테스트 완료 ===============");
    }
}