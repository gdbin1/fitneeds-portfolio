package com.project.app.passfaq.repository;

import com.project.app.passfaq.entity.PassFaq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PassFaqRepository extends JpaRepository<PassFaq, Long> {

    List<PassFaq> findByCategory(String category);
}
