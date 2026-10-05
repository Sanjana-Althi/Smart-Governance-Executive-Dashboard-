package com.example.governance.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name = "services")
public class ServiceRequest {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "department_id") public Department department;
  public String serviceName; public String status; public LocalDate requestDate; public LocalDate completionDate; public Boolean slaCompliant;
}
