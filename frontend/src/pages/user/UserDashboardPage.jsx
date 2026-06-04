import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/dashboard/SidebarLayout';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../services/api';
import { currency } from '../../utils/formatters';

const UserDashboardPage = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/applications').then((response) => setApplications(response.data.applications));
  }, []);

  const approved = applications.filter((item) => item.status === 'Approved').length;
  const pending = applications.filter((item) => item.status === 'Pending' || item.status === 'Under Review').length;

  return (
    <SidebarLayout title="User Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Applied Plans" value={applications.length} />
        <StatCard label="Pending Reviews" value={pending} />
        <StatCard label="Approved Plans" value={approved} />
      </div>
      <div className="grid gap-4">
        {applications.map((application) => (
          <div key={application._id} className="glass rounded-[2rem] p-6">
            <h3 className="text-2xl font-semibold">{application.planId?.planName}</h3>
            <p className="mt-2 text-white/70">Premium: {currency(application.premium)}</p>
            <p className="mt-2 text-white/70">Status: {application.status}</p>
            <p className="mt-2 text-white/70">OCR: {application.ocrStatus}</p>
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default UserDashboardPage;
