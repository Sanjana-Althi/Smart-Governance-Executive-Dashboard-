package com.example.governance.dto;
import java.util.List;
public class Dtos {
  public record Point(String name, double value) {}
  public record DashboardSummary(double citizenSatisfaction, long totalResponses, double serviceSla, long totalServices,
      long completedServices, long slaCompliantServices, double revenueCollected, double monthlyRevenue,
      double allocatedBudget, double spentBudget, double remainingBudget, double budgetUtilization) {}
  public record ServiceMetrics(long total, long completed, long pending, long inProgress, long slaCompliant, double slaPercent,
      double avgProcessingDays, List<Point> byStatus, List<Point> byDepartment, List<Point> slaByDepartment) {}
  public record GrievanceReport(long total, long resolved, long pending, long inProgress, double resolutionRate,
      double avgResolutionDays, List<Point> byCategory, List<Point> byDepartment, List<Point> monthlyTrend) {}
  public record RevenueReport(double total, double monthlyAverage, List<Point> byDepartment, List<Point> byService, List<Point> monthlyTrend) {}
  public record BudgetRow(String department, double allocated, double spent, double remaining, double utilization) {}
  public record BudgetReport(double allocated, double spent, double remaining, double utilization, List<BudgetRow> rows) {}
  public record DepartmentRow(String department, long services, long completed, double slaPercent, long grievances,
      long resolved, double revenue, double budget, double utilization, double avgRating) {}
  public record SatisfactionReport(double average, long totalResponses, List<Point> distribution, List<Point> trend,
      List<Point> byDepartment, List<Point> byService) {}
}
