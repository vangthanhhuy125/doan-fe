'use client';

import { useState } from 'react';
import { 
  X, UploadCloud, Link as LinkIcon, FileText, 
  CheckCircle2, AlertCircle, Loader2, FolderKanban 
} from 'lucide-react';

interface TaskOption {
  id: string;
  title: string;
  activityName?: string;
  isCompleted?: boolean;
}

interface Props {
  tasks: TaskOption[];
  preselectedTaskId?: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateEvidenceModal({ tasks, preselectedTaskId, onClose, onCreated }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(preselectedTaskId || tasks[0]?.id || '');
  const [evidenceType, setEvidenceType] = useState<'file' | 'url'>('file');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('Dung lượng file tối đa là 15MB!');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      if (!evidenceTitle) {
        setEvidenceTitle(file.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedTaskId) {
      setErrorMsg('Vui lòng chọn công việc cần gắn minh chứng!');
      return;
    }

    if (evidenceType === 'file' && !selectedFile) {
      setErrorMsg('Vui lòng tải lên file minh chứng!');
      return;
    }

    if (evidenceType === 'url') {
      const cleanUrl = url.trim();
      if (!cleanUrl) {
        setErrorMsg('Vui lòng nhập đường dẫn liên kết minh chứng!');
        return;
      }
      if (!/^https?:\/\//i.test(cleanUrl)) {
        setErrorMsg('Đường dẫn phải bắt đầu bằng http:// hoặc https://!');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      let payload: any;

      if (evidenceType === 'file') {
        const formData = new FormData();
        formData.append('taskId', selectedTaskId);
        formData.append('title', evidenceTitle.trim() || selectedFile!.name);
        formData.append('type', 'file');
        formData.append('file', selectedFile!);
        payload = formData;
      } else {
        payload = JSON.stringify({
          taskId: selectedTaskId,
          title: evidenceTitle.trim() || url.trim(),
          type: 'url',
          url: url.trim(),
        });
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/evidences`, {
        method: 'POST',
        headers: {
          ...(evidenceType === 'url' ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Thêm minh chứng thất bại, vui lòng thử lại!');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối máy chủ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-slate-800">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0054a5] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Tạo minh chứng công việc</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chọn nhiệm vụ cần đính kèm */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <FolderKanban size={13} className="text-[#0054a5]" /> Chọn nhiệm vụ liên kết *
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white cursor-pointer transition-all"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.activityName ? `(${t.activityName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn hình thức minh chứng */}
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-bold uppercase text-slate-500">Hình thức minh chứng *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEvidenceType('file')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  evidenceType === 'file'
                    ? 'bg-blue-50 border-[#0054a5] text-[#0054a5] ring-2 ring-blue-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText size={16} />
                <span>Tải file lên</span>
              </button>
              <button
                type="button"
                onClick={() => setEvidenceType('url')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  evidenceType === 'url'
                    ? 'bg-blue-50 border-[#0054a5] text-[#0054a5] ring-2 ring-blue-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LinkIcon size={16} />
                <span>Đường dẫn (URL)</span>
              </button>
            </div>
          </div>

          {/* Tên minh chứng */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500">Tên hiển thị minh chứng</label>
            <input
              type="text"
              value={evidenceTitle}
              onChange={(e) => setEvidenceTitle(e.target.value)}
              placeholder="VD: Kế_hoạch_tập_huấn_GamApp.pdf / Link Drive tổng hợp..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
            />
          </div>

          {/* Vùng upload file hoặc nhập link */}
          {evidenceType === 'file' ? (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500">File tài liệu / hình ảnh *</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#0054a5] bg-slate-50/50 transition-all relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud size={32} className="mx-auto text-slate-400 mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-700">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Nhấp để đổi file khác
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">Kéo thả hoặc nhấp để tải file lên</p>
                    <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ PDF, DOCX, XLSX, PNG, JPG (Tối đa 15MB)</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500">Đường dẫn liên kết (URL) *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 italic">
                * Khuyến nghị dùng link Google Drive đã mở quyền xem công khai hoặc cấp quyền cho Ban Thường vụ.
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-100 text-xs uppercase border-none bg-transparent cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-md transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Lưu minh chứng</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}