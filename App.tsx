import { NavLink, Route, Routes } from 'react-router-dom';
import * as P from './pages/Pages';

const nav: [string, string, () => JSX.Element][] = [
  ['/', 'Dashboard', P.Dashboard], ['/services', 'Service Metrics', P.ServiceMetrics],
  ['/grievances', 'Grievance Reports', P.Grievances], ['/revenue', 'Revenue Reports', P.RevenuePage],
  ['/budget', 'Budget Utilization', P.BudgetPage], ['/departments', 'Department Performance', P.Departments],
  ['/satisfaction', 'Citizen Satisfaction', P.Satisfaction], ['/compliance', 'Compliance & Audit', P.Compliance],
];

export default function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Smart Governance<small>Executive Analytics</small></div>
        {nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
      </aside>
      <div className="main">
        <header className="topbar">Executive Governance Dashboard</header>
        <main className="content">
          <Routes>{nav.map(([to, , C]) => <Route key={to} path={to} element={<C />} />)}</Routes>
        </main>
      </div>
    </div>
  );
}
