package com.example.governance.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
public class Budget {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "department_id") public Department department;
  public double allocatedAmount; public double spentAmount; public String financialYear;
}
