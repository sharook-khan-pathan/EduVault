import { FiDownload, FiEdit2, FiTrash2, FiEye, FiFile } from 'react-icons/fi';
import { TypeBadge } from './UI';
import { materialApi } from '../../api/services';
import { formatDistanceToNow } from '../../utils/helpers';

export default function MaterialCard({ material, onEdit, onDelete, showActions = false }) {
  const handleDownload = () => {
    const url = materialApi.getDownloadUrl(material.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.fileName;
    a.click();
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start gap-4">
        {/* File icon */}
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiFile className="text-blue-600 dark:text-blue-400" size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{material.title}</h3>
              {material.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{material.description}</p>
              )}
            </div>
            <TypeBadge type={material.type} />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
            {material.subjectName && <span>📚 {material.subjectName}</span>}
            {material.unitNumber && <span>Unit {material.unitNumber}</span>}
            {material.fileSize && <span>📄 {material.fileSize}</span>}
            <span>⬇️ {material.downloadCount} downloads</span>
            <span>🕐 {formatDistanceToNow(material.uploadedAt)}</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleDownload}
              className="btn-primary text-sm py-1.5 px-3"
            >
              <FiDownload size={14} />
              Download
            </button>
            {showActions && (
              <>
                <button
                  onClick={() => onEdit?.(material)}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  <FiEdit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(material)}
                  className="btn-danger text-sm py-1.5 px-3"
                >
                  <FiTrash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
