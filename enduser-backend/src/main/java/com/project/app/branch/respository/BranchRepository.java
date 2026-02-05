package com.project.app.branch.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.branch.entity.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
	
//	boolean existsByBrchNm(String brchNm);
//	Optional<Branch> findByBrchNm(String brchNm);
}
