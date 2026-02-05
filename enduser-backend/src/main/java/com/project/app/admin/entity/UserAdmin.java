package com.project.app.admin.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;

import com.project.app.branch.entity.Branch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "USERS_ADMIN", indexes = {
		@Index(name = "idx_user_name", columnList = "user_name"),
		@Index(name = "idx_user_branch", columnList = "brch_id")
})
public class UserAdmin {

	@Id
	@Column(name = "user_id", nullable = false, length = 50)
	private String userId;
	
	@Column(name = "user_name", nullable = false, length = 100)
	private String userName;
	
	@Column(name = "email", nullable = false, unique = true, length = 255)
	private String email;
	
	@Column(name = "password", nullable = false, length = 255)
	private String password;
	
	@Column(name = "phone_number", nullable = true, length = 20)
	private String phoneNumber;
	
	@Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50, nullable = false)
    @Builder.Default
    private UserAdminRole role = UserAdminRole.USER;
	
	@Column(name = "is_active", nullable = false)
    @ColumnDefault("1")
    private boolean isActive = true;
	
	@Column(name = "agree_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime agreeAt = LocalDateTime.now();
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "brch_id", nullable = true)
	private Branch branch;
}
