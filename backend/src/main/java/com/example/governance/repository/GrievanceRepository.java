package com.example.governance.repository;
import com.example.governance.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {}
