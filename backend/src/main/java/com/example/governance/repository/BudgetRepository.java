package com.example.governance.repository;
import com.example.governance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BudgetRepository extends JpaRepository<Budget, Long> {}
