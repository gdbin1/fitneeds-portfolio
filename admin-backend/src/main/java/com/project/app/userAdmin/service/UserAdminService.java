package com.project.app.userAdmin.service; // 패키지 변경

import java.util.List;
import java.util.Optional;

import com.project.app.user.dto.UserRequestDto;
import com.project.app.user.entity.User;
import com.project.app.userAdmin.dto.UserAdminRequestDto;
import com.project.app.userAdmin.entity.UserAdmin;

public interface UserAdminService {
	
	UserAdmin createAdminUser(UserAdminRequestDto adminRequestDto);
	UserAdmin updateAdminUser(UserAdminRequestDto adminRequestDto);
	boolean existsByUserId(String userId);
	boolean existsByEmail(String email);
	Optional<UserAdmin> findByUserId(String userId);
	List<UserAdmin> getAllUsers();
	List<UserAdmin> getTeachers();
	Optional<UserAdmin> getUserByEmailAdmin(String email);
	Optional<UserAdmin> getUserByEmail(String email);
	void updateUserBranch(UserAdminRequestDto adminRequestDto);
	void updateUserIsActive(UserAdminRequestDto adminRequestDto);
	void updateUserRole(UserAdminRequestDto adminRequestDto);
}