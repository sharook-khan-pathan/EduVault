import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { subjectApi, materialApi } from '../../api/services';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MATERIAL_TYPES = ['PDF', 'PPT', 'DOC', 'ASSIGNMENT', 'LAB_MANUAL', 'PREVIOUS_PAPER', 'OTHER'];

export default function UploadMaterialPage() {
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'PDF', subjectId: '', unitNumber: '' });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    subjectApi.getMySubjects().then(r => setSubjects(r.data.data || []));
  }, []);

  const handleFile = (f) => {
    if (f && f.size > 50 * 1024 * 1024) { toast.error('File too large (max 50MB)'); return; }
    setFile(f);
    if (!form.title) setForm(prev => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, '') }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!form.subjectId) { toast.error('Please select a subject'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('type', form.type);
      formData.append('subjectId', form.subjectId);
      if (form.unitNumber) formData.append('unitNumber', form.unitNumber);

      await materialApi.upload(formData);
      toast.success('Material uploaded successfully!');
      navigate('/faculty/materials');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Material</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Share study materials with your students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
              file ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
              'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input id="fileInput" type="file" className="hidden"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
              onChange={e => handleFile(e.target.files[0])} />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FiFile className="text-green-600" size={32} />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <>
                <FiUpload className="mx-auto text-gray-400 mb-3" size={36} />
                <p className="font-medium text-gray-700 dark:text-gray-300">Drop file here or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">PDF, PPT, DOC, Images • Max 50MB</p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="card space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" placeholder="e.g. Unit 1 - Introduction to Data Structures"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} placeholder="Brief description of this material..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Material Type *</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unit Number</label>
                <input type="number" className="input" placeholder="e.g. 1" min={1} max={10}
                  value={form.unitNumber} onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Subject *</label>
              <select className="input" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || !file} className="btn-primary flex-1 justify-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><FiUpload size={16} /> Upload Material</>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
