package com.example.governance.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
public class Grievance {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "department_id") public Department department;
  public String category; public String status; public LocalDate createdDate; public LocalDate resolvedDate;
}
