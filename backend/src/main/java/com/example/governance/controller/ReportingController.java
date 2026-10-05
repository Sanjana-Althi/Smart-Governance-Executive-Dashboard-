package com.example.governance.controller;
import com.example.governance.dto.Dtos.*;
import com.example.governance.service.ReportingService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportingController {
  private final ReportingService svc;
  public ReportingController(ReportingService s) { svc = s; }
  @GetMapping("/dashboard-summary") public DashboardSummary dashboard() { return svc.dashboardSummary(); }
  @GetMapping("/service-metrics") public ServiceMetrics services() { return svc.serviceMetrics(); }
  @GetMapping("/grievances") public GrievanceReport grievances() { return svc.grievanceReport(); }
  @GetMapping("/revenue") public RevenueReport revenue() { return svc.revenueReport(); }
  @GetMapping("/budget") public BudgetReport budget() { return svc.budgetReport(); }
  @GetMapping("/department-performance") public List<DepartmentRow> departments() { return svc.departmentPerformance(); }
  @GetMapping("/citizen-satisfaction") public SatisfactionReport satisfaction() { return svc.citizenSatisfaction(); }

  @RestControllerAdvice
  static class Errors {
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> handle(Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Report generation failed", "detail", String.valueOf(e.getMessage())));
    }
  }
}
