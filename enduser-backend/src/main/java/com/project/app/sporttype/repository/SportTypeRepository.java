package com.project.app.sporttype.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.sporttype.entity.SportType;

@Repository
public interface SportTypeRepository extends JpaRepository<SportType, Long> {

}
