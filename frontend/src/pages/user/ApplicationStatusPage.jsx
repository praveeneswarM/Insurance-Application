import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/dashboard/SidebarLayout';
import api from '../../services/api';
import { dateLabel } from '../../utils/formatters';

const ApplicationStatusPage = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/applications').then((response) => setApplications(response.data.applications));
  }, []);

  return (
    <SidebarLayout title="Application Timeline">
      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application._id} className="glass rounded-[2rem] p-6">
            <h3 className="text-2xl font-semibold">{application.planId?.planName}</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {['Submitted', 'Under Review', application.status].map((stage) => (
                <div key={stage} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/45">{stage}</p>
                  <p className="mt-3 text-white/70">{dateLabel(application.submittedAt)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-white/45">OCR Status</p>
              <p className="mt-3 text-white/70">{application.ocrStatus}</p>
              {application.ocrProcessedAt && <p className="mt-2 text-white/60">{dateLabel(application.ocrProcessedAt)}</p>}
            </div>
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default ApplicationStatusPage;
