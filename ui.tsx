import { ReactNode, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Point } from '../services/reportingApi';

export const money = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;
const COLORS = ['#1d4ed8', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#7c3aed'];

/** Loads data, shows loading / error / empty states. */
export function Async<T>({ load, children }: { load: () => Promise<T>; children: (d: T) => ReactNode }) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    load().then(setData).catch(e => setErr(e?.message ?? 'Request failed'));
  }, []); // eslint-disable-line
  if (err) return <div className="state error">Could not load data from the backend ({err}). Make sure Spring Boot is running on port 8080.</div>;
  if (!data) return <div className="state">Loading…</div>;
  if (Array.isArray(data) && data.length === 0) return <div className="state">No data available. Run database/seed-data.sql.</div>;
  return <>{children(data)}</>;
}

export const PageTitle = ({ children }: { children: ReactNode }) => <h2 className="page-title">{children}</h2>;
export const Grid = ({ cols = 4, children }: { cols?: number; children: ReactNode }) => <div className="grid" style={{ ['--cols' as string]: cols }}>{children}</div>;
export const Kpi = ({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) =>
  <div className={`card kpi ${tone ?? ''}`}><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>;
export const Card = ({ title, children }: { title: string; children: ReactNode }) =>
  <div className="card"><h3>{title}</h3>{children}</div>;
export const Progress = ({ value }: { value: number }) =>
  <div className="progress"><div style={{ width: `${Math.min(value, 100)}%`, background: value > 90 ? '#dc2626' : value > 75 ? '#d97706' : '#16a34a' }} /></div>;

const Empty = () => <div className="state">No data</div>;
export function BarC({ data, fmt, color = '#1d4ed8' }: { data: Point[]; fmt?: (v: number) => string; color?: string }) {
  if (!data?.length) return <Empty />;
  return <ResponsiveContainer width="100%" height={240}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} />
    <YAxis fontSize={11} tickFormatter={fmt} /><Tooltip formatter={(v: number) => fmt ? fmt(v) : v} /><Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>;
}
export function LineC({ data, fmt }: { data: Point[]; fmt?: (v: number) => string }) {
  if (!data?.length) return <Empty />;
  return <ResponsiveContainer width="100%" height={240}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} />
    <YAxis fontSize={11} tickFormatter={fmt} /><Tooltip formatter={(v: number) => fmt ? fmt(v) : v} /><Line dataKey="value" stroke="#1d4ed8" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>;
}
export function PieC({ data }: { data: Point[] }) {
  if (!data?.length) return <Empty />;
  return <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={85} label>
    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>;
}
export function MultiBar({ data, keys }: { data: Record<string, any>[]; keys: [string, string][] }) {
  if (!data?.length) return <Empty />;
  return <ResponsiveContainer width="100%" height={260}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} />
    <Tooltip /><Legend />{keys.map(([k, label], i) => <Bar key={k} dataKey={k} name={label} fill={COLORS[i]} />)}</BarChart></ResponsiveContainer>;
}

/** Table with optional CSV export. */
export function Table({ cols, rows, csv }: { cols: string[]; rows: (string | number)[][]; csv?: string }) {
  const exportCsv = () => {
    const text = [cols, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = `${csv}.csv`; a.click();
  };
  return <div className="table-wrap">{csv && <button className="btn" onClick={exportCsv}>Export CSV</button>}
    <table><thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>) : <tr><td colSpan={cols.length}>No records</td></tr>}</tbody></table></div>;
}
export const Badge = ({ status }: { status: 'Compliant' | 'Needs Review' | 'Pending' }) =>
  <span className={`badge ${status.replace(' ', '-').toLowerCase()}`}>{status}</span>;
