package com.project.app.config.util;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import org.hibernate.engine.jdbc.internal.FormatStyle;

import com.p6spy.engine.logging.Category;
import com.p6spy.engine.spy.appender.MessageFormattingStrategy;

public class P6SpyFormatter implements MessageFormattingStrategy {

    @Override
    public String formatMessage(int connectionId, String now, long elapsed, String category, String prepared, String sql, String url) {
        sql = formatSql(category, sql);
        
        if (Category.COMMIT.getName().equals(category)) {
            return "";  // COMMIT 로그는 출력 안 함
        }
        
        Date _now = new Date();
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
        
        return format.format(_now) + " | " + elapsed + "ms | " + category + " | connection " + connectionId + "\n" 
            +"===================START===================" + sql;
    }

    private String formatSql(String category, String sql) {
        if (sql == null || sql.trim().equals("")) return sql;
        
        // MyBatis와 Hibernate 로그 모두 포맷팅
        if (Category.STATEMENT.getName().equals(category)) {
            String tmpsql = sql.trim().toLowerCase(Locale.ROOT);
            if (tmpsql.startsWith("create") || tmpsql.startsWith("alter") || tmpsql.startsWith("comment")) {
                sql = FormatStyle.DDL.getFormatter().format(sql);
            } else {
                sql = FormatStyle.BASIC.getFormatter().format(sql);
            }
            
            // 스택트레이스 분석으로 출처 확인
            String source = getQuerySource();
            if (source.equals("hibernate")) {
                sql = "\n << Query >>\nHibernate: " + sql;
            } else if (source.equals("mybatis")) {
                sql = "\n  << Query >>\nMyBatis: " + sql;
            } else {
                sql = "\nJDBC: " + sql;  // 출처를 명확히 구분할 수 없는 경우
            }
        }
        
        sql += ";\n====================END====================";
        
        
        return sql;
    }
    
    /**
     * 스택트레이스를 분석하여 쿼리 출처(Hibernate/MyBatis)를 확인
     */
    private String getQuerySource() {
        StackTraceElement[] stackTrace = new Throwable().getStackTrace();
        
        for (StackTraceElement element : stackTrace) {
            String className = element.getClassName();
            
            if (className.contains("org.hibernate") || 
                className.contains("jakarta.persistence") || 
                className.contains("javax.persistence")) {
                return "hibernate";
            }
            
            if (className.contains("org.mybatis") || 
                className.contains("org.apache.ibatis")) {
                return "mybatis";
            }
        }
        
        return "unknown";
    }
}