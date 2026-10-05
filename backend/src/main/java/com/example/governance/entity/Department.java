package com.example.governance.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
public class Department {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String name;
}
