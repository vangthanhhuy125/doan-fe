'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Bell, UploadCloud, FileText, Trash2, 
  Users, GraduationCap, Building2, UserCheck, 
  Search, CheckCircle2, AlertCircle, Mail, CheckSquare, Square
} from 'lucide-react';

interface NoticeFormProps {
  data?: any;
  onClose: () => void;
  onSave: (item: any) => Promise<void>;
}

export type EmailTargetMode = 'ALL' | 'BY_INTAKE' | 'BY_BRANCH' | 'SPECIFIC';

export default function NoticeForm({ data, onClose, onSave }: NoticeFormProps) {
  const [title, setTitle] = useState(data?.title || '');
  const [content, setContent] = useState(data?.content || '');
  const [sendEmail, setSendEmail] = useState(data?.sendEmail || false);
  const [emailTarget, setEmailTarget] = useState<EmailTargetMode>(data?.emailTarget || 'ALL');

  // Quản lý file đính kèm
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<any>(data?.file || null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Danh sách nhân sự & bộ lọc
  const [userList, setUserList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Lựa chọn theo khóa, chi đoàn, cá nhân
  const [selectedIntakes, setSelectedIntakes] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  // Tìm kiếm nội bộ từng tab
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [showRecipientPreview, setShowRecipientPreview] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Tải danh sách nhân sự từ hệ thống
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const uData = await res.json();
          setUserList(Array.isArray(uData) ? uData : []);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách người nhận:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Trích xuất Khóa và Chi đoàn tự động từ danh sách nhân sự
  const extractIntake = (u: any): string => {
    const classStr = u.class_name || u.class || u.chi_doan || '';
    const match = String(classStr).match(/(?:19|20)\d{2}/);
    if (match) return `K${match[0]}`;
    const sid = String(u.student_id || u.mssv || '').trim();
    if (sid.length >= 2) {
      const prefix = parseInt(sid.substring(0, 2), 10);
      if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
        return `K20${prefix}`;
      }
    }
    return 'Khác';
  };

  const extractBranch = (u: any): string => {
    return String(u.class_name || u.class || u.chi_doan || u.unitBranch || u.unit || 'Chưa phân chi đoàn').trim();
  };

  // Thống kê danh sách các Khóa có trong danh bạ
  const intakeStats = useMemo(() => {
    const map = new Map<string, number>();
    userList.forEach((u) => {
      const intake = extractIntake(u);
      map.set(intake, (map.get(intake) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([intake, count]) => ({ intake, count }))
      .sort((a, b) => b.intake.localeCompare(a.intake));
  }, [userList]);

  // Thống kê danh sách các Chi đoàn có trong danh bạ
  const branchStats = useMemo(() => {
    const map = new Map<string, number>();
    userList.forEach((u) => {
      const branch = extractBranch(u);
      map.set(branch, (map.get(branch) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => a.branch.localeCompare(b.branch));
  }, [userList]);

  // 3. Tính toán danh sách người nhận thực tế realtime (Live Resolved Recipients)
  const resolvedRecipients = useMemo(() => {
    if (!sendEmail) return [];

    switch (emailTarget) {
      case 'ALL':
        return userList;
      case 'BY_INTAKE':
        if (selectedIntakes.length === 0) return [];
        return userList.filter((u) => selectedIntakes.includes(extractIntake(u)));
      case 'BY_BRANCH':
        if (selectedBranches.length === 0) return [];
        return userList.filter((u) => selectedBranches.includes(extractBranch(u)));
      case 'SPECIFIC':
        return selectedUsers;
      default:
        return [];
    }
  }, [sendEmail, emailTarget, userList, selectedIntakes, selectedBranches, selectedUsers]);

  // Số lượng người có địa chỉ email hợp lệ
  const validEmailRecipients = useMemo(() => {
    return resolvedRecipients.filter((u) => u.email && String(u.email).includes('@'));
  }, [resolvedRecipients]);

  // 4. Xử lý file đính kèm
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert('Dung lượng tệp đính kèm tối đa là 25MB!');
        return;
      }
      setAttachedFile(file);
      setRemoveExistingFile(false);
    }
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert('Dung lượng tệp đính kèm tối đa là 25MB!');
        return;
      }
      setAttachedFile(file);
      setRemoveExistingFile(false);
    }
  };

  // 5. Thao tác chọn theo Khóa
  const toggleSelectIntake = (intake: string) => {
    setSelectedIntakes((prev) =>
      prev.includes(intake) ? prev.filter((i) => i !== intake) : [...prev, intake]
    );
  };

  const selectAllIntakes = () => {
    setSelectedIntakes(intakeStats.map((item) => item.intake));
  };

  // 6. Thao tác chọn theo Chi đoàn
  const toggleSelectBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const selectAllBranches = () => {
    setSelectedBranches(branchStats.map((item) => item.branch));
  };

  // 7. Thao tác chọn theo Cá nhân
  const toggleSelectUser = (user: any) => {
    const uid = user._id || user.id || user.student_id;
    const isExist = selectedUsers.some((u) => (u._id || u.id || u.student_id) === uid);
    if (isExist) {
      setSelectedUsers(selectedUsers.filter((u) => (u._id || u.id || u.student_id) !== uid));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const selectAllFilteredUsers = (filteredList: any[]) => {
    const newItems = [...selectedUsers];
    filteredList.forEach((fu) => {
      const uid = fu._id || fu.id || fu.student_id;
      if (!newItems.some((u) => (u._id || u.id || u.student_id) === uid)) {
        newItems.push(fu);
      }
    });
    setSelectedUsers(newItems);
  };

  const unselectAllUsers = () => {
    setSelectedUsers([]);
  };

  // Lọc cá nhân theo ô tìm kiếm
  const filteredUsers = useMemo(() => {
    const s = userSearchTerm.toLowerCase().trim();
    if (!s) return userList;
    return userList.filter((u) => {
      const name = (u.full_name || u.name || '').toLowerCase();
      const sid = (u.student_id || u.mssv || '').toLowerCase();
      const mail = (u.email || '').toLowerCase();
      const cls = extractBranch(u).toLowerCase();
      return name.includes(s) || sid.includes(s) || mail.includes(s) || cls.includes(s);
    });
  }, [userList, userSearchTerm]);

  // Lọc chi đoàn theo ô tìm kiếm
  const filteredBranches = useMemo(() => {
    const s = branchSearchTerm.toLowerCase().trim();
    if (!s) return branchStats;
    return branchStats.filter((b) => b.branch.toLowerCase().includes(s));
  }, [branchStats, branchSearchTerm]);

  // 8. Submit dữ liệu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (sendEmail && resolvedRecipients.length === 0) {
      alert('Bạn đã chọn gửi email nhưng chưa có người nhận nào phù hợp với điều kiện!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        title: title.trim(),
        content: content.trim(),
        sendEmail,
        emailTarget,
        targetIntakes: selectedIntakes,
        targetBranches: selectedBranches,
        receiverIds: resolvedRecipients.map((u) => u._id || u.id || u.user_id).filter(Boolean),
        receiverEmails: validEmailRecipients.map((u) => u.email).filter(Boolean),
        recipientCount: resolvedRecipients.length,
        file: attachedFile,
        removeExistingFile,
        posted_at: data?.posted_at || new Date().toISOString(),
      };
      await onSave(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in zoom-in duration-200 text-slate-800">
      <div className="bg-white w-full max-w-4xl sm:max-w-5xl rounded-[1.8rem] sm:rounded-[2.2rem] shadow-2xl overflow-hidden border border-white/20 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className={`p-4 sm:p-5 flex items-center justify-between text-white shrink-0 ${data ? 'bg-amber-500' : 'bg-[#0054a5]'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold tracking-wider text-sm sm:text-base">
                {data ? 'Cập nhật thông báo triển khai' : 'Soạn thông báo'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thân Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 sm:p-7 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            {/* Tiêu đề thông báo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider">
                Tiêu đề thông báo *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none font-bold text-sm text-slate-800 transition-all"
                placeholder="Tiêu đề"
              />
            </div>

            {/* Nội dung thông báo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider">
                Nội dung chi tiết *
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs sm:text-sm text-slate-800 resize-none leading-relaxed font-medium transition-all"
                placeholder="Nhập nội dung văn bản thông báo hoặc kế hoạch chi tiết cần triển khai..."
              />
            </div>

            {/* Tài liệu đính kèm */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider">
                Tài liệu / Văn bản đính kèm
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {!attachedFile && !existingFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDropFile}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isDragging
                      ? 'border-[#0054a5] bg-blue-50/70'
                      : 'border-slate-200 bg-slate-50 hover:bg-blue-50/40 hover:border-[#0054a5]'
                  }`}
                >
                  <UploadCloud size={24} className="text-[#0054a5]" />
                  <p className="text-xs font-bold text-slate-700">
                    Kéo thả tài liệu vào đây hoặc <span className="text-[#0054a5] underline">chọn tệp từ máy tính</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Hỗ trợ PDF, DOCX, XLSX, PNG, JPG (Dung lượng tối đa 25MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 bg-[#0054a5] text-white rounded-xl shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {attachedFile ? attachedFile.name : existingFile?.originalname || existingFile?.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {attachedFile
                          ? `${(attachedFile.size / 1024 / 1024).toFixed(2)} MB • File mới chuẩn bị gửi`
                          : `${((existingFile?.size || 0) / 1024).toFixed(1)} KB • File đính kèm hiện tại`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-bold text-[#0054a5] hover:bg-white rounded-xl transition-all border-none bg-transparent cursor-pointer"
                    >
                      Đổi tệp khác
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile(null);
                        setExistingFile(null);
                        setRemoveExistingFile(true);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                      title="Gỡ tệp"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* KHU VỰC CẤU HÌNH GỬI EMAIL */}
            <div className="p-5 bg-slate-50/80 rounded-3xl border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 accent-[#0054a5] cursor-pointer rounded"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 tracking-wide">
                    <Mail size={15} className="text-[#0054a5]" />
                    <span>Đồng thời gửi email thông báo</span>
                  </div>
                </label>

                {sendEmail && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      Sẽ gửi đến:{' '}
                      <strong className="text-[#0054a5] font-black">{resolvedRecipients.length}</strong> người
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRecipientPreview(!showRecipientPreview)}
                      className="text-[11px] font-bold text-[#0054a5] hover:underline bg-white px-2.5 py-1 rounded-xl border border-slate-200 cursor-pointer"
                    >
                      {showRecipientPreview ? 'Ẩn danh sách' : 'Xem danh sách người nhận'}
                    </button>
                  </div>
                )}
              </div>

              {sendEmail && (
                <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
                  {/* 4 Nút Lựa chọn Hình thức Gửi */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        mode: 'ALL' as EmailTargetMode,
                        label: 'Gửi tất cả',
                        sub: 'Toàn bộ danh bạ',
                        icon: Users,
                      },
                      {
                        mode: 'BY_INTAKE' as EmailTargetMode,
                        label: 'Gửi theo Khóa',
                        sub: `${intakeStats.length} khóa đào tạo`,
                        icon: GraduationCap,
                      },
                      {
                        mode: 'BY_BRANCH' as EmailTargetMode,
                        label: 'Gửi theo Chi đoàn',
                        sub: `${branchStats.length} chi đoàn / lớp`,
                        icon: Building2,
                      },
                      {
                        mode: 'SPECIFIC' as EmailTargetMode,
                        label: 'Từng cá nhân',
                        sub: `${selectedUsers.length} người đã chọn`,
                        icon: UserCheck,
                      },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isActive = emailTarget === opt.mode;
                      return (
                        <button
                          key={opt.mode}
                          type="button"
                          onClick={() => setEmailTarget(opt.mode)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isActive
                              ? 'bg-[#0054a5] text-white border-[#0054a5] shadow-md shadow-blue-900/10'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon size={18} className={isActive ? 'text-white' : 'text-[#0054a5]'} />
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-emerald-400' : 'bg-slate-200'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{opt.label}</p>
                            <p className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                              {opt.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* OPTION 1: GỬI TẤT CẢ */}
                  {emailTarget === 'ALL' && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0054a5] flex items-center justify-center font-bold">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Email sẽ được gửi đến tất cả cán bộ, đoàn viên trong hệ thống
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Tổng cộng: <strong className="text-slate-700">{userList.length}</strong> tài khoản ({validEmailRecipients.length} tài khoản có email hợp lệ)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OPTION 2: GỬI THEO KHÓA */}
                  {emailTarget === 'BY_INTAKE' && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          Chọn các khóa nhận thông báo ({selectedIntakes.length} khóa đã chọn):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllIntakes}
                            className="text-[11px] font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer"
                          >
                            Chọn tất cả
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setSelectedIntakes([])}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {intakeStats.map((item) => {
                          const isChecked = selectedIntakes.includes(item.intake);
                          return (
                            <button
                              key={item.intake}
                              type="button"
                              onClick={() => toggleSelectIntake(item.intake)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-50 border-[#0054a5] text-[#0054a5] font-bold shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold'
                              }`}
                            >
                              <p className="text-xs">{item.intake}</p>
                              <p className="text-[10px] text-slate-400 font-normal">
                                {item.count} SV
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* OPTION 3: GỬI THEO CHI ĐOÀN */}
                  {emailTarget === 'BY_BRANCH' && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="relative w-full sm:w-64">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm nhanh chi đoàn / lớp..."
                            value={branchSearchTerm}
                            onChange={(e) => setBranchSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllBranches}
                            className="text-[11px] font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer"
                          >
                            Chọn tất cả ({branchStats.length})
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setSelectedBranches([])}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {filteredBranches.map((item) => {
                          const isChecked = selectedBranches.includes(item.branch);
                          return (
                            <label
                              key={item.branch}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                                isChecked
                                  ? 'bg-blue-50/70 border-[#0054a5] text-[#0054a5] font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                              }`}
                            >
                              <span className="truncate pr-2">{item.branch}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {item.count} SV
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectBranch(item.branch)}
                                  className="w-3.5 h-3.5 accent-[#0054a5] rounded cursor-pointer"
                                />
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* OPTION 4: GỬI THEO TỪNG CÁ NHÂN */}
                  {emailTarget === 'SPECIFIC' && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="relative w-full sm:w-72">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm theo Tên, MSSV, Email, Chi đoàn..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => selectAllFilteredUsers(filteredUsers)}
                            className="text-[11px] font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer"
                          >
                            Chọn tất cả kết quả ({filteredUsers.length})
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={unselectAllUsers}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                          >
                            Xóa hết đã chọn
                          </button>
                        </div>
                      </div>

                      {/* Danh sách người nhận chọn đích danh */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto custom-scrollbar p-1">
                        {filteredUsers.map((u) => {
                          const uid = u._id || u.id || u.student_id;
                          const isChecked = selectedUsers.some(
                            (su) => (su._id || su.id || su.student_id) === uid
                          );
                          return (
                            <div
                              key={uid}
                              onClick={() => toggleSelectUser(u)}
                              className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                                isChecked
                                  ? 'bg-blue-50/80 border-[#0054a5] text-[#0054a5]'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-bold truncate">{u.full_name || u.name}</p>
                                <p className="text-[10px] text-slate-400 truncate font-semibold">
                                  {u.student_id || u.mssv} • {extractBranch(u)}
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 accent-[#0054a5] rounded"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Badges người đã chọn */}
                      {selectedUsers.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">
                            Đã chọn ({selectedUsers.length} người):
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                            {selectedUsers.map((u) => (
                              <span
                                key={u._id || u.id || u.student_id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-[#0054a5] border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                              >
                                {u.full_name || u.name}
                                <X
                                  size={12}
                                  className="cursor-pointer hover:text-rose-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectUser(u);
                                  }}
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DRAWER / MODAL PREVIEW DANH SÁCH NGƯỜI NHẬN */}
                  {showRecipientPreview && (
                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0054a5]">
                          Danh sách người nhận dự kiến ({resolvedRecipients.length} người):
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {validEmailRecipients.length} có địa chỉ email
                        </span>
                      </div>
                      <div className="max-h-36 overflow-y-auto custom-scrollbar divide-y divide-blue-100 bg-white rounded-xl border border-blue-100">
                        {resolvedRecipients.slice(0, 100).map((u, i) => (
                          <div key={i} className="p-2 px-3 text-xs flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              {i + 1}. {u.full_name || u.name} ({u.student_id || u.mssv})
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {u.email || <span className="text-rose-500 font-bold">Chưa có email</span>}
                            </span>
                          </div>
                        ))}
                        {resolvedRecipients.length > 100 && (
                          <div className="p-2 text-center text-xs text-slate-400 font-bold italic">
                            ... và {resolvedRecipients.length - 100} người khác
                          </div>
                        )}
                        {resolvedRecipients.length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400 italic font-medium">
                            Chưa có người nhận nào phù hợp với bộ lọc hiện tại.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Nút Thao tác */}
          <div className="p-4 sm:px-7 sm:py-4 flex justify-end gap-3 bg-white border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all uppercase text-xs border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-2.5 text-white rounded-2xl font-bold shadow-lg transition-all uppercase text-xs border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                data
                  ? 'bg-amber-500 shadow-amber-200 hover:bg-amber-600'
                  : 'bg-[#0054a5] shadow-blue-500/20 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <span>Đang xử lý...</span>
              ) : data ? (
                'Cập nhật thông báo'
              ) : (
                'Phát hành thông báo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}