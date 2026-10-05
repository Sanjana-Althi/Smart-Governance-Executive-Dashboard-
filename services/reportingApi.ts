import axios from 'axios';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080', timeout: 15000 });
const get = (path: string) => http.get(`/api/reports/${path}`).then(r => r.data);

export interface Point { name: string; value: number }
export const getDashboardSummary = () => get('dashboard-summary');
export const getServiceMetrics = () => get('service-metrics');
export const getGrievanceReport = () => get('grievances');
export const getRevenueReport = () => get('revenue');
export const getBudgetReport = () => get('budget');
export const getDepartmentPerformance = () => get('department-performance');
export const getCitizenSatisfaction = () => get('citizen-satisfaction');
