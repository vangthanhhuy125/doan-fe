'use client';

import { useState, useEffect } from "react";
import { Bell, Eye, Edit, Trash2, Plus, Calendar, X, Search, RotateCcw, FileText, Download } from "lucide-react";
import NoticeForm from "./NoticeForm";
import ConfirmNoticeDelete from "./ConfirmNoticeDelete";
import { usePermissions } from "@/hooks/usePermissions";

export default function NotificationPage() {
  const { canCreate, canView, canEdit, canDelete } = usePermissions('cong-tac-doan');
  const hasAnyAction = canView || canEdit || canDelete;

  const [notices, setNotices] = useState<any[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [formMode, setFormMode] = useState<{ open: boolean, data: any }>({ open: false, data: null });
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const localUser = userStr ? JSON.parse(userStr) : null;
      const userId = localUser?._id || localUser?.user_id || '';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements?manage=true&userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId,
        }
      });
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Gửi FormData kèm Token và đầy đủ cấu hình email
  const handleSave = async (item: any) => {
    const isEdit = !!item._id;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/announcements/${item._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/announcements`;

    const token = localStorage.getItem('token') || '';
    const userStr = localStorage.getItem('user');
    const localUser = userStr ? JSON.parse(userStr) : null;
    const userId = localUser?._id || localUser?.user_id || '';

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;

    return new Promise<void>(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append('title', item.title);
        formData.append('content', item.content);
        formData.append('sendEmail', String(item.sendEmail));
        formData.append('emailTarget', item.emailTarget || 'ALL');

        if (item.posted_at) {
          formData.append('posted_at', item.posted_at);
        }
        if (item.targetIntakes && item.targetIntakes.length > 0) {
          formData.append('targetIntakes', JSON.stringify(item.targetIntakes));
        }
        if (item.targetBranches && item.targetBranches.length > 0) {
          formData.append('targetBranches', JSON.stringify(item.targetBranches));
        }
        if (item.receiverIds && item.receiverIds.length > 0) {
          formData.append('receiverIds', JSON.stringify(item.receiverIds));
        }
        if (item.receiverEmails && item.receiverEmails.length > 0) {
          formData.append('receiverEmails', JSON.stringify(item.receiverEmails));
        }
        if (item.file instanceof File) {
          formData.append('file', item.file);
        }
        if (item.removeExistingFile) {
          formData.append('removeExistingFile', 'true');
        }

        const res = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers,
          body: formData,
        });

        if (res.ok) {
          await fetchNotices();
          setFormMode({ open: false, data: null });
          resolve();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || "Lỗi khi lưu thông báo!");
          reject(new Error("Lỗi khi lưu thông báo"));
        }
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${deleteItem._id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        await fetchNotices();
        setDeleteItem(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Tải file an toàn từ mọi nguồn lưu trữ
  const handleDownloadFile = (fileObj: any) => {
    if (!fileObj) return;
    if (fileObj.url) {
      window.open(fileObj.url, '_blank');
      return;
    }
    if (fileObj.path) {
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${fileObj.path.startsWith('/') ? '' : '/'}${fileObj.path}`;
      window.open(fullUrl, '_blank');
      return;
    }
    if (fileObj.buffer) {
      const base64Data = typeof fileObj.buffer === 'string'
        ? fileObj.buffer
        : fileObj.buffer.data || '';
      if (base64Data) {
        const link = document.createElement('a');
        link.href = `data:${fileObj.mimetype || 'application/octet-stream'};base64,${base64Data}`;
        link.download = fileObj.originalname || 'tai_lieu_dinh_kem';
        link.click();
        return;
      }
    }
    alert('Không tìm thấy đường dẫn tệp tải về!');
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const isFiltering = searchTerm !== "" || startDate !== "" || endDate !== "";

  const filteredNotices = notices.filter(item => {
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const itemDate = new Date(item.posted_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 text-black">
      {/* Tiêu đề trang */}
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100 transition-transform hover:scale-105">
            <Bell size={24} />
          </div>
          <h2 className="font-black text-[#0054a5] tracking-tight text-2xl">
            Thông báo - Triển khai
          </h2>
        </div>

        {canCreate && (
          <button
            onClick={() => setFormMode({ open: true, data: null })}
            className="flex items-center gap-2 bg-[#0054a5] text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-wider border-none cursor-pointer"
          >
            <Plus size={16} /> <span>Soạn thông báo mới</span>
          </button>
        )}
      </div>

      {/* Bộ lọc tìm kiếm */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-bold"
            />
          </div>

          <div className="flex items-center gap-2 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[10px] font-bold text-gray-400 whitespace-nowrap">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[10px] font-bold text-gray-400 whitespace-nowrap">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-blue-500 font-bold"
              />
            </div>
            {isFiltering && (
              <button
                onClick={resetFilters}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:rotate-180 duration-500 border-none bg-transparent cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bảng danh sách thông báo */}
      <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-xl bg-white">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px] tracking-widest">
            <tr>
              <th className="px-6 py-5 text-center w-16">STT</th>
              <th className="px-6 py-5 text-center">Nội dung thông báo</th>
              <th className="px-6 py-5 text-center w-40">Ngày đăng</th>
              {hasAnyAction && (
                <th className="px-6 py-5 text-center w-40">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((item, index) => (
                <tr key={item._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-5 text-center font-bold text-gray-400 group-hover:text-[#0054a5]">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800 group-hover:text-[#0054a5] transition-colors leading-snug">
                      {item.title}
                    </p>
                    {item.file && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0054a5] bg-blue-50 px-2 py-0.5 rounded-md mt-1 border border-blue-100">
                        <FileText size={12} /> Có tệp đính kèm ({item.file.originalname || 'Tài liệu'})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center text-gray-500 text-xs font-semibold whitespace-nowrap">
                    {new Date(item.posted_at).toLocaleDateString('vi-VN')}
                  </td>
                  {hasAnyAction && (
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {canView && (
                          <button
                            onClick={() => setSelectedNotice(item)}
                            className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => setFormMode({ open: true, data: item })}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={hasAnyAction ? 4 : 3} className="px-6 py-10 text-center text-gray-400 italic font-bold">
                  Không tìm thấy thông báo nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xem chi tiết thông báo */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 max-h-[85vh] flex flex-col">
            <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold tracking-wider text-sm">Chi tiết thông báo triển khai</h3>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 text-black custom-scrollbar">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                <Calendar size={14} /> Ngày đăng: {new Date(selectedNotice.posted_at).toLocaleDateString('vi-VN')}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0054a5] leading-tight">
                {selectedNotice.title}
              </h2>
              <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-xs sm:text-sm">
                {selectedNotice.content}
              </div>

              {selectedNotice.file && (
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-[#0054a5] text-white rounded-xl shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">
                        {selectedNotice.file.originalname || selectedNotice.file.name || 'Tài liệu đính kèm'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {selectedNotice.file.size ? `${(selectedNotice.file.size / 1024).toFixed(1)} KB` : 'Tài liệu đính kèm'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(selectedNotice.file)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0054a5] hover:bg-blue-700 px-3.5 py-2 rounded-xl border-none cursor-pointer shadow-sm transition-all"
                  >
                    <Download size={14} /> Tải tài liệu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Soạn / Chỉnh sửa */}
      {formMode.open && (
        <NoticeForm
          data={formMode.data}
          onClose={() => setFormMode({ open: false, data: null })}
          onSave={handleSave}
        />
      )}

      {/* Modal xác nhận xóa */}
      {deleteItem && (
        <ConfirmNoticeDelete
          title={deleteItem.title}
          onClose={() => setDeleteItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}