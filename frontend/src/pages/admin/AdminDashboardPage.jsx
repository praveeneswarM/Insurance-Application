import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import SidebarLayout from '../../components/dashboard/SidebarLayout';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((response) => setDashboard(response.data));
  }, []);

  const metrics = dashboard?.metrics || {};
  const charts = dashboard?.charts || {};
  const pieColors = ['#ffffff', '#7a7a7a', '#3c3c3c'];

  return (
    <SidebarLayout title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={metrics.totalUsers || 0} />
        <StatCard label="Total Plans" value={metrics.totalPlans || 0} />
        <StatCard label="Applications" value={metrics.totalApplications || 0} />
        <StatCard label="Pending" value={metrics.pendingApplications || 0} />
        <StatCard label="Approved" value={metrics.approvedApplications || 0} />
        <StatCard label="Rejected" value={metrics.rejectedApplications || 0} />
        <StatCard label="OCR Pending" value={metrics.pendingOcr || 0} />
        <StatCard label="OCR Processing" value={metrics.processingOcr || 0} />
        <StatCard label="OCR Completed" value={metrics.completedOcr || 0} />
        <StatCard label="OCR Failed" value={metrics.failedOcr || 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold">Monthly Applications</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyApplications || []}>
                <XAxis dataKey="_id" stroke="#9d9d9d" />
                <YAxis stroke="#9d9d9d" />
                <Tooltip />
                <Bar dataKey="count" fill="#ffffff" radius={[16, 16, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold">Approval Ratio</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.approvalRatio || []} dataKey="value" nameKey="name" outerRadius={110}>
                  {(charts.approvalRatio || []).map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="glass rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold">Recent Audit Logs</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="pb-3">Action</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Performed By</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.recentAuditLogs || []).map((log) => (
                <tr className="border-t border-white/10" key={log._id}>
                  <td className="py-3">{log.action}</td>
                  <td className="py-3 text-white/70">{log.description}</td>
                  <td className="py-3 text-white/70">{log.performedBy?.name || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboardPage;
