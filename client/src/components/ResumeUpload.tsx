import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onFileAccepted: (file: File) => void;
  currentFile?: File | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUpload({ onFileAccepted, currentFile }: Props) {
  const [rejectMsg, setRejectMsg] = useState('');

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setRejectMsg('');
    if (rejected.length) {
      const code = rejected[0]?.errors[0]?.code;
      if (code === 'file-too-large') setRejectMsg('File exceeds 10 MB limit.');
      else setRejectMsg('Only PDF files are accepted.');
      return;
    }
    if (accepted[0]) onFileAccepted(accepted[0]);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
        style={{
          border: `2px dashed ${isDragActive ? '#7c3aed' : currentFile ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
          background: isDragActive
            ? 'rgba(124,58,237,0.07)'
            : currentFile
              ? 'rgba(52,211,153,0.05)'
              : 'rgba(255,255,255,0.02)',
          boxShadow: isDragActive ? '0 0 24px rgba(124,58,237,0.3)' : 'none',
        }}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {currentFile ? (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="text-4xl mb-3">📄</div>
              <p className="font-semibold text-white text-sm">{currentFile.name}</p>
              <p className="text-xs text-slate-400 mt-1">{formatBytes(currentFile.size)}</p>
              <span className="badge-success mt-3 inline-flex">PDF Ready</span>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-4xl mb-3">{isDragActive ? '📂' : '☁️'}</div>
              <p className="text-sm font-medium text-slate-300">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume PDF'}
              </p>
              <p className="text-xs text-slate-500 mt-1">or click to browse — max 10 MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {rejectMsg && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 px-1">
          ⚠ {rejectMsg}
        </motion.p>
      )}

      {currentFile && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFileAccepted(null as any); }}
          className="btn-ghost text-xs py-1.5 px-3"
        >
          Remove file
        </button>
      )}
    </div>
  );
}
