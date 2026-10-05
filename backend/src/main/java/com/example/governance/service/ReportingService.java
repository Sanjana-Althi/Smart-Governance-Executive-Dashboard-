package com.example.governance.service;
import com.example.governance.dto.Dtos.*;
import com.example.governance.entity.*;
import com.example.governance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.function.ToDoubleFunction;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportingService {
  private final DepartmentRepository depts; private final ServiceRepository services;
  private final GrievanceRepository grievances; private final RevenueRepository revenues;
  private final BudgetRepository budgets; private final CitizenFeedbackRepository feedback;

  public ReportingService(DepartmentRepository d, ServiceRepository s, GrievanceRepository g,
                          RevenueRepository r, BudgetRepository b, CitizenFeedbackRepository f) {
    depts = d; services = s; grievances = g; revenues = r; budgets = b; feedback = f;
  }

  // ---- safe math helpers (no divide-by-zero) ----
  private static double r1(double v) { return Math.round(v * 10) / 10.0; }
  private static double r2(double v) { return Math.round(v * 100) / 100.0; }
  private static double pct(double a, double b) { return b == 0 ? 0 : r1(a * 100 / b); }
  private static <T> List<Point> sum(Collection<T> c, Function<T, String> k, ToDoubleFunction<T> v) {
    Map<String, Double> m = new TreeMap<>();
    for (T t : c) m.merge(k.apply(t), v.applyAsDouble(t), Double::sum);
    return m.entrySet().stream().map(e -> new Point(e.getKey(), r2(e.getValue()))).toList();
  }
  private static <T> List<Point> count(Collection<T> c, Function<T, String> k) { return sum(c, k, t -> 1); }
  private static <T> List<Point> avg(Collection<T> c, Function<T, String> k, ToDoubleFunction<T> v) {
    Map<String, double[]> m = new TreeMap<>();
    for (T t : c) { double[] a = m.computeIfAbsent(k.apply(t), x -> new double[2]); a[0] += v.applyAsDouble(t); a[1]++; }
    return m.entrySet().stream().map(e -> new Point(e.getKey(), r2(e.getValue()[0] / e.getValue()[1]))).toList();
  }
  private static String month(java.time.LocalDate d) { return d == null ? "Unknown" : d.toString().substring(0, 7); }
  private static double avgDays(List<ServiceRequest> l) {
    return r1(l.stream().filter(s -> s.completionDate != null && s.requestDate != null)
        .mapToLong(s -> ChronoUnit.DAYS.between(s.requestDate, s.completionDate)).average().orElse(0));
  }
  private static long n(Collection<ServiceRequest> l, String st) { return l.stream().filter(s -> st.equalsIgnoreCase(s.status)).count(); }
  private static long g(Collection<Grievance> l, String st) { return l.stream().filter(s -> st.equalsIgnoreCase(s.status)).count(); }
  private static long slaOk(Collection<ServiceRequest> l) { return l.stream().filter(s -> Boolean.TRUE.equals(s.slaCompliant)).count(); }
  private static long slaApplicable(Collection<ServiceRequest> l) { return l.stream().filter(s -> s.slaCompliant != null).count(); }
  private static String dn(Department d) { return d == null ? "Unassigned" : d.name; }
  private static boolean in(Department d, Department x) { return d != null && x != null && d.id.equals(x.id); }

  public DashboardSummary dashboardSummary() {
    var sv = services.findAll(); var fb = feedback.findAll(); var rev = revenues.findAll(); var bu = budgets.findAll();
    double revenue = rev.stream().mapToDouble(x -> x.amount).sum();
    long months = rev.stream().map(x -> month(x.collectionDate)).distinct().count();
    double alloc = bu.stream().mapToDouble(x -> x.allocatedAmount).sum(), spent = bu.stream().mapToDouble(x -> x.spentAmount).sum();
    return new DashboardSummary(r1(fb.stream().mapToInt(x -> x.rating).average().orElse(0)), fb.size(),
        pct(slaOk(sv), slaApplicable(sv)), sv.size(), n(sv, "COMPLETED"), slaOk(sv), r2(revenue),
        months == 0 ? 0 : r2(revenue / months), alloc, spent, alloc - spent, pct(spent, alloc));
  }

  public ServiceMetrics serviceMetrics() {
    var sv = services.findAll();
    var byDept = sv.stream().collect(Collectors.groupingBy(s -> dn(s.department), TreeMap::new, Collectors.toList()));
    return new ServiceMetrics(sv.size(), n(sv, "COMPLETED"), n(sv, "PENDING"), n(sv, "IN_PROGRESS"), slaOk(sv),
        pct(slaOk(sv), slaApplicable(sv)), avgDays(sv), count(sv, s -> s.status), count(sv, s -> dn(s.department)),
        byDept.entrySet().stream().map(e -> new Point(e.getKey(), pct(slaOk(e.getValue()), slaApplicable(e.getValue())))).toList());
  }

  public GrievanceReport grievanceReport() {
    var gr = grievances.findAll();
    double days = gr.stream().filter(x -> x.resolvedDate != null && x.createdDate != null)
        .mapToLong(x -> ChronoUnit.DAYS.between(x.createdDate, x.resolvedDate)).average().orElse(0);
    return new GrievanceReport(gr.size(), g(gr, "RESOLVED"), g(gr, "PENDING"), g(gr, "IN_PROGRESS"), pct(g(gr, "RESOLVED"), gr.size()),
        r1(days), count(gr, x -> x.category), count(gr, x -> dn(x.department)), count(gr, x -> month(x.createdDate)));
  }

  public RevenueReport revenueReport() {
    var rv = revenues.findAll();
    double total = rv.stream().mapToDouble(x -> x.amount).sum();
    var trend = sum(rv, x -> month(x.collectionDate), x -> x.amount);
    return new RevenueReport(r2(total), trend.isEmpty() ? 0 : r2(total / trend.size()),
        sum(rv, x -> dn(x.department), x -> x.amount), sum(rv, x -> x.serviceName, x -> x.amount), trend);
  }

  public BudgetReport budgetReport() {
    var bu = budgets.findAll();
    var rows = bu.stream().map(b -> new BudgetRow(dn(b.department), b.allocatedAmount, b.spentAmount,
        b.allocatedAmount - b.spentAmount, pct(b.spentAmount, b.allocatedAmount))).sorted(Comparator.comparing(BudgetRow::department)).toList();
    double a = bu.stream().mapToDouble(b -> b.allocatedAmount).sum(), s = bu.stream().mapToDouble(b -> b.spentAmount).sum();
    return new BudgetReport(a, s, a - s, pct(s, a), rows);
  }

  public List<DepartmentRow> departmentPerformance() {
    var sv = services.findAll(); var gr = grievances.findAll(); var rv = revenues.findAll();
    var bu = budgets.findAll(); var fb = feedback.findAll();
    return depts.findAll().stream().sorted(Comparator.comparing(d -> d.name)).map(d -> {
      var s = sv.stream().filter(x -> in(x.department, d)).toList();
      var gg = gr.stream().filter(x -> in(x.department, d)).toList();
      var b = bu.stream().filter(x -> in(x.department, d)).toList();
      double alloc = b.stream().mapToDouble(x -> x.allocatedAmount).sum(), spent = b.stream().mapToDouble(x -> x.spentAmount).sum();
      return new DepartmentRow(d.name, s.size(), n(s, "COMPLETED"), pct(slaOk(s), slaApplicable(s)), gg.size(), g(gg, "RESOLVED"),
          r2(rv.stream().filter(x -> in(x.department, d)).mapToDouble(x -> x.amount).sum()), alloc, pct(spent, alloc),
          r2(fb.stream().filter(x -> in(x.department, d)).mapToInt(x -> x.rating).average().orElse(0)));
    }).toList();
  }

  public SatisfactionReport citizenSatisfaction() {
    var fb = feedback.findAll();
    List<Point> dist = new ArrayList<>();
    for (int i = 1; i <= 5; i++) { int r = i; dist.add(new Point(r + " star", fb.stream().filter(x -> x.rating == r).count())); }
    return new SatisfactionReport(r2(fb.stream().mapToInt(x -> x.rating).average().orElse(0)), fb.size(), dist,
        avg(fb, x -> month(x.feedbackDate), x -> x.rating), avg(fb, x -> dn(x.department), x -> x.rating), avg(fb, x -> x.serviceName, x -> x.rating));
  }
}
