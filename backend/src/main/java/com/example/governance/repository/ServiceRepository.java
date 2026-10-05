package com.example.governance.repository;
import com.example.governance.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ServiceRepository extends JpaRepository<ServiceRequest, Long> {}
