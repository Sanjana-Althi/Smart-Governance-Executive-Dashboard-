import * as api from '../services/reportingApi';
import type { Point } from '../services/reportingApi';
import { Async, BarC, Badge, Card, Grid, Kpi, LineC, MultiBar, PageTitle, PieC, Progress, Table, money } from '../components/ui';

const pts = (p: Point[]) => p.map(x => [x.name, x.value] as (string | number)[]);

export function Dashboard() {
  return <Async load={() => Promise.all([api.getDashboardSummary(), api.getServiceMetrics(), api.getRevenueReport(), api.getGrievanceReport(), api.getBudgetReport(), api.getDepartmentPerformance()])}>
    {([s, sv, rv, gr, bu, dp]) => <>
      <PageTitle>Executive Governance Dashboard</PageTitle>
      <Grid cols={4}>
        <Kpi label="Citizen Satisfaction" value={`${s.citizenSatisfaction} / 5`} sub={`${s.totalResponses} citizen responses`} />
        <Kpi label="Service SLA" value={`${s.serviceSla}%`} sub={`${s.slaCompliantServices} SLA-compliant of ${s.totalServices} services (${s.completedServices} completed)`} />
        <Kpi label="Revenue Collected" value={money(s.revenueCollected)} sub={`Monthly avg ${money(s.monthlyRevenue)}`} />
        <Kpi label="Budget Utilization" value={`${s.budgetUtilization}%`} sub={`Spent ${money(s.spentBudget)} of ${money(s.allocatedBudget)} · Remaining ${money(s.remainingBudget)}`} />
      </Grid>
      <Grid cols={2}>
        <Card title="Service Performance (SLA % by department)"><BarC data={sv.slaByDepartment} color="#16a34a" /></Card>
        <Card title="Revenue Trend"><LineC data={rv.monthlyTrend} fmt={money} /></Card>
        <Card title="Grievance Analytics (by category)"><BarC data={gr.byCategory} color="#d97706" /></Card>
        <Card title="Budget Utilization (% by department)"><BarC data={bu.rows.map((r: any) => ({ name: r.department, value: r.utilization }))} color="#7c3aed" /></Card>
      </Grid>
      <Card title="Department Performance"><DeptTable rows={dp} /></Card>
    </>}</Async>;
}

const DeptTable = ({ rows }: { rows: any[] }) => <Table csv="department-performance"
  cols={['Department', 'Services', 'Completed', 'SLA %', 'Grievances', 'Resolved', 'Revenue', 'Budget', 'Utilization %']}
  rows={rows.map(r => [r.department, r.services, r.completed, `${r.slaPercent}%`, r.grievances, r.resolved, money(r.revenue), money(r.budget), `${r.utilization}%`])} />;

export function ServiceMetrics() {
  return <Async load={api.getServiceMetrics}>{(d: any) => <>
    <PageTitle>Service Metrics</PageTitle>
    <Grid cols={4}>
      <Kpi label="Total Services" value={String(d.total)} /><Kpi label="Completed" value={String(d.completed)} />
      <Kpi label="In Progress" value={String(d.inProgress)} /><Kpi label="Pending" value={String(d.pending)} />
      <Kpi label="SLA-Compliant" value={String(d.slaCompliant)} /><Kpi label="SLA Compliance" value={`${d.slaPercent}%`} />
      <Kpi label="Avg Processing Time" value={`${d.avgProcessingDays} days`} />
    </Grid>
    <Grid cols={3}>
      <Card title="Services by Status"><PieC data={d.byStatus} /></Card>
      <Card title="Services by Department"><BarC data={d.byDepartment} /></Card>
      <Card title="SLA Performance (%)"><BarC data={d.slaByDepartment} color="#16a34a" /></Card>
    </Grid>
    <Card title="Service Report"><Table csv="service-report" cols={['Department', 'Services', 'SLA %']}
      rows={d.byDepartment.map((p: Point, i: number) => [p.name, p.value, `${d.slaByDepartment[i]?.value ?? 0}%`])} /></Card>
  </>}</Async>;
}

export function Grievances() {
  return <Async load={api.getGrievanceReport}>{(d: any) => <>
    <PageTitle>Grievance Analytics</PageTitle>
    <Grid cols={4}>
      <Kpi label="Total Grievances" value={String(d.total)} /><Kpi label="Resolved" value={String(d.resolved)} />
      <Kpi label="In Progress" value={String(d.inProgress)} /><Kpi label="Pending" value={String(d.pending)} />
      <Kpi label="Resolution Rate" value={`${d.resolutionRate}%`} /><Kpi label="Avg Resolution Time" value={`${d.avgResolutionDays} days`} />
    </Grid>
    <Grid cols={3}>
      <Card title="By Category"><PieC data={d.byCategory} /></Card>
      <Card title="By Department"><BarC data={d.byDepartment} color="#d97706" /></Card>
      <Card title="Monthly Trend"><LineC data={d.monthlyTrend} /></Card>
    </Grid>
    <Card title="Grievance Report: by Category"><Table csv="grievance-report" cols={['Category', 'Grievances']} rows={pts(d.byCategory)} /></Card>
  </>}</Async>;
}

export function RevenuePage() {
  return <Async load={api.getRevenueReport}>{(d: any) => <>
    <PageTitle>Revenue Tracking</PageTitle>
    <Grid cols={3}>
      <Kpi label="Total Revenue Collected" value={money(d.total)} /><Kpi label="Monthly Average" value={money(d.monthlyAverage)} />
      <Kpi label="Months Tracked" value={String(d.monthlyTrend.length)} />
    </Grid>
    <Grid cols={2}>
      <Card title="Monthly Revenue"><LineC data={d.monthlyTrend} fmt={money} /></Card>
      <Card title="Revenue by Department"><BarC data={d.byDepartment} fmt={money} /></Card>
    </Grid>
    <Card title="Revenue by Service"><Table csv="revenue-report" cols={['Service', 'Revenue']} rows={d.byService.map((p: Point) => [p.name, money(p.value)])} /></Card>
  </>}</Async>;
}

export function BudgetPage() {
  return <Async load={api.getBudgetReport}>{(d: any) => <>
    <PageTitle>Budget Utilization</PageTitle>
    <Grid cols={4}>
      <Kpi label="Allocated" value={money(d.allocated)} /><Kpi label="Expenditure" value={money(d.spent)} />
      <Kpi label="Remaining" value={money(d.remaining)} /><Kpi label="Utilization" value={`${d.utilization}%`} />
    </Grid>
    <Card title="Overall Utilization"><Progress value={d.utilization} /></Card>
    <Card title="Budget vs Expenditure by Department">
      <MultiBar data={d.rows.map((r: any) => ({ name: r.department, allocated: r.allocated, spent: r.spent }))} keys={[['allocated', 'Allocated'], ['spent', 'Spent']]} /></Card>
    <Card title="Budget Report"><Table csv="budget-report" cols={['Department', 'Allocated', 'Spent', 'Remaining', 'Utilization']}
      rows={d.rows.map((r: any) => [r.department, money(r.allocated), money(r.spent), money(r.remaining), `${r.utilization}%`])} />
      {d.rows.map((r: any) => <div key={r.department} className="bar-row"><span>{r.department}</span><Progress value={r.utilization} /></div>)}</Card>
  </>}</Async>;
}

export function Departments() {
  return <Async load={api.getDepartmentPerformance}>{(rows: any[]) => <>
    <PageTitle>Department Performance</PageTitle>
    <Card title="Department Comparison">
      <MultiBar data={rows.map(r => ({ name: r.department, sla: r.slaPercent, utilization: r.utilization, rating: r.avgRating * 20 }))}
        keys={[['sla', 'SLA %'], ['utilization', 'Budget Utilization %'], ['rating', 'Satisfaction (x20)']]} /></Card>
    <Card title="Performance Report"><DeptTable rows={rows} /></Card>
  </>}</Async>;
}

export function Satisfaction() {
  return <Async load={api.getCitizenSatisfaction}>{(d: any) => <>
    <PageTitle>Citizen Satisfaction</PageTitle>
    <Grid cols={2}><Kpi label="Average Rating" value={`${d.average} / 5`} /><Kpi label="Total Responses" value={String(d.totalResponses)} /></Grid>
    <Grid cols={2}>
      <Card title="Rating Distribution"><BarC data={d.distribution} color="#16a34a" /></Card>
      <Card title="Satisfaction Trend"><LineC data={d.trend} /></Card>
      <Card title="By Department"><BarC data={d.byDepartment} /></Card>
      <Card title="By Service"><Table csv="citizen-satisfaction" cols={['Service', 'Avg Rating']} rows={pts(d.byService)} /></Card>
    </Grid>
  </>}</Async>;
}

const level = (v: number, ok: number, review: number): 'Compliant' | 'Needs Review' | 'Pending' => v >= ok ? 'Compliant' : v >= review ? 'Needs Review' : 'Pending';

export function Compliance() {
  return <Async load={() => Promise.all([api.getDashboardSummary(), api.getGrievanceReport(), api.getServiceMetrics(), api.getDepartmentPerformance()])}>
    {([s, g, sv, dp]) => {
      const completion = sv.total ? Math.round(sv.completed * 1000 / sv.total) / 10 : 0;
      const flagged = dp.filter((r: any) => r.slaPercent < 90 || r.grievances - r.resolved > 0);
      return <>
        <PageTitle>Compliance & Audit</PageTitle>
        <Grid cols={4}>
          <Kpi label="SLA Compliance" value={`${s.serviceSla}%`} /><Kpi label="Pending Grievances" value={String(g.pending + g.inProgress)} />
          <Kpi label="Budget Utilization" value={`${s.budgetUtilization}%`} /><Kpi label="Services Reviewed" value={String(sv.total)} />
        </Grid>
        <Card title="Compliance Indicators (rule: ≥ target = Compliant)">
          <table><tbody>
            {[['SLA Compliance', `${s.serviceSla}%`, '≥ 90%', level(s.serviceSla, 90, 75)],
              ['Budget Utilization', `${s.budgetUtilization}%`, '70–95%', s.budgetUtilization >= 70 && s.budgetUtilization <= 95 ? 'Compliant' : 'Needs Review'],
              ['Grievance Resolution', `${g.resolutionRate}%`, '≥ 80%', level(g.resolutionRate, 80, 60)],
              ['Service Completion', `${completion}%`, '≥ 75%', level(completion, 75, 50)]].map(r =>
              <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><Badge status={r[3] as any} /></td></tr>)}
          </tbody></table>
        </Card>
        <Card title="Departments with Pending Issues">
          <Table csv="compliance-audit" cols={['Department', 'SLA %', 'Open Grievances']}
            rows={flagged.map((r: any) => [r.department, `${r.slaPercent}%`, r.grievances - r.resolved])} /></Card>
      </>;
    }}</Async>;
}
