package com.project.app.user.service; // 패키지 변경

import java.util.List;
import java.util.Optional;

import com.project.app.user.dto.UserRequestDto;
import com.project.app.user.entity.User;
import com.project.app.userAdmin.dto.UserAdminRequestDto;

public interface UserService {
	
	User createUser(UserRequestDto userRequestDto);
	boolean existsByUserId(String userId);
	boolean existsByEmail(String email);
	Optional<User> findByUserId(String userId);
	List<User> getAllUsers();
	List<User> getTeachers();
	Optional<User> getUserByEmailAdmin(String email);
	Optional<User> getUserByEmail(String email);
	void updateUserIsActive(UserRequestDto userRequestDto);
}