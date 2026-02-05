package com.project.app.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.admin.entity.TeacherCertificate;

@Repository
public interface TeacherCertificateRepository extends JpaRepository<TeacherCertificate, Long> {

	List<TeacherCertificate> findByUserAdmin_UserId(String userId);
}
