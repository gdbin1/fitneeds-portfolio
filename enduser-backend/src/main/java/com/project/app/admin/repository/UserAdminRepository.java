package com.project.app.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.admin.entity.UserAdmin;

@Repository
public interface UserAdminRepository extends JpaRepository<UserAdmin, String> {

}
