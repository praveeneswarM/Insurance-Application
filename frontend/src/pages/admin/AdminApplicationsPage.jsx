import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/dashboard/SidebarLayout';
import api from '../../services/api';
import { currency, dateLabel } from '../../utils/formatters';

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);

  const loadApplications = () => api.get('/applications').then((response) => setApplications(response.data.applications));

  useEffect(() => {
    loadApplications();
  }, []);

  const review = async (id, action) => {
    await api.put(`/admin/application/${id}/${action}`, { adminComments: `${action} by admin` });
    loadApplications();
  };

  return (
    <SidebarLayout title="Application Reviews">
      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application._id} className="glass rounded-[2rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">{application.planId?.planName}</h3>
                <p className="mt-2 text-white/65">{application.userId?.name} | {currency(application.premium)} | {dateLabel(application.submittedAt)}</p>
                <p className="mt-2 text-white/75">Status: {application.status}</p>
                <p className="mt-2 text-white/75">OCR: {application.ocrStatus}</p>
                {application.ocrProcessedAt && <p className="mt-2 text-white/60">OCR Processed: {dateLabel(application.ocrProcessedAt)}</p>}
              </div>
              <div className="flex gap-3">
                <button className="btn-primary" onClick={() => review(application._id, 'approve')}>Approve</button>
                <button className="btn-secondary" onClick={() => review(application._id, 'reject')}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default AdminApplicationsPage;
