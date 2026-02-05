package com.project.app.user.entity; // 패키지 변경

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "USERS") //USER는 예약어이므로 'USERS' 사용
@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor 포함
@NoArgsConstructor
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자 (Builder 사용 시 내부적으로 활용)
@Builder // Builder 패턴 제공
public class User {

 // 컬럼 이름은 user_id으로 변경 (DB 관례)
 @Id
 @Column(name = "user_id", nullable = false, unique = true) 
 private String userId;

 @Column(name = "email", nullable = false, unique = true) 
 private String email;

 @Column(name = "password", nullable = false)
 private String password;

 // 컬럼 이름은 user_name으로 변경 (DB 관례)
 @Column(name = "user_name", nullable = false)
 private String userName;

 // 컬럼 이름은 phone_number 등으로 변경 고려 (DB 관례), nullable = true는 생략 가능 (기본값이 true)
 @Column(name = "phone_number")
 private String phoneNumber; 

 @ColumnDefault("'USER'") // 문자열은 작은따옴표로 감싸야 함
 @Column(name = "role", nullable = false)
 private String role; //USER, ADMIN, MANAGER, ETC....
 
 @Column(name = "agree_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
 private LocalDateTime agreeAt;

 @ColumnDefault("1") // 1 = TRUE
 @Column(name = "is_active", nullable = false, columnDefinition = "TINYINT(1)")
 private Boolean isActive; // String -> Boolean 타입으로 변경

}