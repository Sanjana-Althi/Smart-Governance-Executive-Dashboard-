package com.example.governance.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name = "citizen_feedback")
public class CitizenFeedback {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "department_id") public Department department;
  public String serviceName; public int rating; public LocalDate feedbackDate;
}
