import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SidebarLayout from '../../components/dashboard/SidebarLayout';
import api from '../../services/api';

const ApplyInsurancePage = () => {
  const [plans, setPlans] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: { age: 28 } });
  const selectedPlanId = watch('planId');

  useEffect(() => {
    api.get('/plans').then((response) => setPlans(response.data.plans));
  }, []);

  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId);
  const requiredDocuments = selectedPlan?.requiredDocuments || [];

  useEffect(() => {
    setUploadedDocs([]);
    setUploadError('');
    setSubmitError('');
    setSubmitSuccess('');
  }, [selectedPlanId]);

  const uploadFile = async (documentName, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setSubmitError('');
    setSubmitSuccess('');
    setUploadingDoc(documentName);

    const form = new FormData();
    form.append('file', file);
    form.append('name', documentName);

    try {
      const { data } = await api.post('/upload', form);
      setUploadedDocs((current) => {
        const remaining = current.filter((doc) => doc.name !== documentName);
        return [...remaining, data.document];
      });
    } catch (error) {
      setUploadError(error?.response?.data?.message || `Failed to upload ${documentName}`);
    } finally {
      setUploadingDoc('');
      event.target.value = '';
    }
  };

  const onSubmit = async (values) => {
    setSubmitError('');
    setSubmitSuccess('');

    if (!selectedPlan) {
      setSubmitError('Select a plan before submitting');
      return;
    }

    if (uploadedDocs.length !== requiredDocuments.length) {
      setSubmitError('Upload every required document before submitting the application');
      return;
    }

    try {
      await api.post('/applications', {
        planId: values.planId,
        age: Number(values.age),
        documents: uploadedDocs
      });
      reset({ planId: '', age: 28 });
      setUploadedDocs([]);
      setSubmitSuccess('Application submitted successfully');
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to submit application');
    }
  };

  const isUploaded = (documentName) => uploadedDocs.some((doc) => doc.name === documentName);
  const getUploadedDoc = (documentName) => uploadedDocs.find((doc) => doc.name === documentName);

  return (
    <SidebarLayout title="Apply for Insurance">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="glass space-y-4 rounded-[2rem] p-6" onSubmit={handleSubmit(onSubmit)}>
          <select className="input" {...register('planId')}>
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>{plan.planName}</option>
            ))}
          </select>
          <input className="input" type="number" placeholder="Applicant age" {...register('age')} />
          {selectedPlan && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-white/45">Upload Requirements</p>
                <p className="mt-2 text-white/70">Upload {requiredDocuments.length} required documents. Supported formats: PDF, JPG, JPEG, PNG. Maximum size: 10MB each.</p>
              </div>
              {requiredDocuments.map((documentName) => {
                const uploadedDoc = getUploadedDoc(documentName);
                return (
                  <div key={documentName} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{documentName}</p>
                        <p className="text-sm text-white/60">
                          {uploadedDoc ? `Uploaded: ${uploadedDoc.fileName}` : 'No file uploaded yet'}
                        </p>
                      </div>
                      <label className="btn-secondary cursor-pointer px-4 py-2 text-sm">
                        {uploadingDoc === documentName ? 'Uploading...' : isUploaded(documentName) ? 'Replace File' : 'Upload File'}
                        <input
                          className="hidden"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(event) => uploadFile(documentName, event)}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {uploadError && <p className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">{uploadError}</p>}
          {submitError && <p className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">{submitError}</p>}
          {submitSuccess && <p className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">{submitSuccess}</p>}
          <button className="btn-primary w-full" type="submit">Submit Application</button>
        </form>
        <div className="space-y-4">
          {selectedPlan && (
            <div className="glass rounded-[2rem] p-6">
              <h3 className="text-2xl font-semibold">{selectedPlan.planName}</h3>
              <p className="mt-2 text-white/65">{selectedPlan.description}</p>
              <p className="mt-4 text-white/65">Required Documents: {selectedPlan.requiredDocuments.join(', ')}</p>
            </div>
          )}
          <div className="glass rounded-[2rem] p-6">
            <h3 className="text-2xl font-semibold">Uploaded Documents</h3>
            <div className="mt-4 space-y-3">
              {!uploadedDocs.length && <p className="text-white/60">No documents uploaded yet.</p>}
              {uploadedDocs.map((doc) => (
                <div key={doc.blobName} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p>{doc.name}</p>
                  <p className="mt-1 text-sm text-white/60">{doc.fileName}</p>
                  {doc.ocr?.status === 'completed' && (
                    <p className="mt-2 text-sm text-white/60">OCR completed for this PDF.</p>
                  )}
                  {doc.ocr?.status === 'failed' && (
                    <p className="mt-2 text-sm text-white/60">OCR failed: {doc.ocr.message || 'Unknown error'}</p>
                  )}
                  {doc.ocr?.status === 'skipped' && (
                    <p className="mt-2 text-sm text-white/60">OCR skipped: {doc.ocr.message}</p>
                  )}
                  <a className="text-sm text-white/60" href={doc.url} rel="noreferrer" target="_blank">Open document</a>
                  {doc.ocr?.extractedText && (
                    <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                      {doc.ocr.extractedText}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ApplyInsurancePage;
