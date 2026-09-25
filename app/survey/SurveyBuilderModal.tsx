'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Copy, Trash2, Save, Lock, Unlock, 
  Loader2, MessageSquareText, Image as ImageIcon, Split,
  FileSpreadsheet, Users, GraduationCap, UserCheck, Search, UserPlus,
  ChevronDown, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SurveyForm, Question, QuestionType, Section } from './types';

interface Props {
  survey: SurveyForm | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
}

const POPULAR_INTAKES = ["2021", "2022", "2023", "2024", "2025", "2026"];

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !disabled) {
      const key = e.key.toLowerCase();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      let tag = '';
      if (key === 'b') tag = '**';
      else if (key === 'i') tag = '*';
      else if (key === 'u') tag = '<u>';

      if (tag) {
        e.preventDefault();
        const closeTag = tag === '<u>' ? '</u>' : tag;
        const replacement = selectedText ? `${tag}${selectedText}${closeTag}` : `${tag}chữ_mới${closeTag}`;
        const newValue = value.substring(0, start) + replacement + value.substring(end);

        onChange(newValue);

        setTimeout(() => {
          textarea.focus();
          const newPos = start + tag.length + (selectedText ? selectedText.length : 7);
          textarea.setSelectionRange(start + tag.length, newPos);
        }, 0);
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      disabled={disabled}
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`w-full resize-none overflow-hidden leading-relaxed outline-none transition-all ${className}`}
    />
  );
}

export default function SurveyBuilderModal({ survey, currentUserId, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<'editor' | 'responses'>('editor');
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(survey?.title || 'Mẫu khảo sát chưa có tiêu đề');
  const [description, setDescription] = useState(survey?.description || '');
  const [isLocked, setIsLocked] = useState(!!survey?.is_locked);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [targetScope, setTargetScope] = useState<'intake' | 'specific'>(() => {
    if (survey?.target_users && survey.target_users.length > 0) return 'specific';
    return 'intake';
  });

  const [selectedIntakes, setSelectedIntakes] = useState<string[]>(
    Array.isArray(survey?.target_intakes) ? survey!.target_intakes : []
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    Array.isArray(survey?.target_users) ? survey!.target_users : []
  );

  const [accounts, setAccounts] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const extractIntake = (cls: string, sid: string) => {
    const match = String(cls || '').match(/(?:19|20)\d{2}/);
    if (match) return `K${match[0]}`;
    const s = String(sid || '').trim();
    if (s.length >= 2) {
      const prefix = parseInt(s.substring(0, 2), 10);
      if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
        return `K20${prefix}`;
      }
    }
    return '';
  };

  useEffect(() => {
    const fetchAllPersonnelAndAccounts = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [personnelRes, accountsRes, usersRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { headers })
        ]);

        let rawPersonnel: any[] = [];
        let rawAccounts: any[] = [];
        let rawUsers: any[] = [];

        if (personnelRes.status === 'fulfilled' && personnelRes.value.ok) {
          const data = await personnelRes.value.json();
          if (Array.isArray(data)) rawPersonnel = data;
        }

        if (accountsRes.status === 'fulfilled' && accountsRes.value.ok) {
          const data = await accountsRes.value.json();
          if (Array.isArray(data)) rawAccounts = data;
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          const data = await usersRes.value.json();
          if (Array.isArray(data)) rawUsers = data;
        }

        const map = new Map<string, any>();

        rawPersonnel.forEach((p: any) => {
          const sid = String(p.student_id || p.mssv || p.studentId || p.code || '').trim();
          const cls = String(p.class_name || p.class || p.className || p.lop || '').trim();
          const name = String(p.full_name || p.fullName || p.name || p.displayName || '').trim();
          const email = String(p.email || '').trim().toLowerCase();
          const uid = String(p.user_id || p.account_id || p._id || '');

          const key = sid || email || uid || name;
          if (!key) return;

          map.set(key, {
            ...p,
            student_id: sid,
            class: cls,
            full_name: name,
            displayName: name,
            email: email,
            _id: String(p._id || uid),
            intake: extractIntake(cls, sid),
            identifiers: [sid, email, uid, String(p._id)].filter(Boolean)
          });
        });

        rawUsers.forEach((u: any) => {
          const sid = String(u.student_id || u.studentId || u.mssv || '').trim();
          const cls = String(u.class || u.class_name || u.className || u.lop || '').trim();
          const name = String(u.full_name || u.displayName || u.name || '').trim();
          const email = String(u.email || u.personal_email || '').trim().toLowerCase();
          const uid = String(u._id || u.user_id || u.account_id || '');

          let existingKey: string | null = null;
          for (const [k, v] of map.entries()) {
            if (
              (sid && v.student_id === sid) ||
              (email && v.email === email) ||
              (uid && v.identifiers?.includes(uid)) ||
              (name && v.full_name?.toLowerCase() === name.toLowerCase())
            ) {
              existingKey = k;
              break;
            }
          }

          if (existingKey) {
            const current = map.get(existingKey);
            const combinedSid = current.student_id || sid;
            const combinedCls = current.class || cls;
            map.set(existingKey, {
              ...current,
              ...u,
              student_id: combinedSid,
              class: combinedCls,
              full_name: current.full_name || name,
              displayName: current.displayName || name,
              intake: extractIntake(combinedCls, combinedSid),
              identifiers: Array.from(new Set([...(current.identifiers || []), sid, email, uid, String(u._id)].filter(Boolean)))
            });
          } else {
            const key = sid || email || uid || name;
            map.set(key, {
              ...u,
              student_id: sid,
              class: cls,
              full_name: name,
              displayName: name,
              email: email,
              _id: String(u._id || uid),
              intake: extractIntake(cls, sid),
              identifiers: [sid, email, uid, String(u._id)].filter(Boolean)
            });
          }
        });

        rawAccounts.forEach((acc: any) => {
          const accUsername = String(acc.username || '').trim();
          const accEmail = String(acc.email || '').trim().toLowerCase();
          const accName = String(acc.displayName || acc.full_name || '').trim();
          const accId = String(acc._id || acc.id || '');
          const accSid = String(acc.student_id || '').trim();

          let existingKey: string | null = null;
          for (const [k, v] of map.entries()) {
            if (
              (accSid && v.student_id === accSid) ||
              (accUsername && (v.student_id === accUsername || v.identifiers?.includes(accUsername))) ||
              (accEmail && (v.email === accEmail || v.identifiers?.includes(accEmail))) ||
              (accId && v.identifiers?.includes(accId)) ||
              (accName && v.full_name?.toLowerCase() === accName.toLowerCase())
            ) {
              existingKey = k;
              break;
            }
          }

          if (existingKey) {
            const current = map.get(existingKey);
            map.set(existingKey, {
              ...current,
              username: accUsername,
              identifiers: Array.from(new Set([...(current.identifiers || []), accId, accUsername, accEmail, accSid].filter(Boolean)))
            });
          } else {
            let extractedSid = accSid;
            if (!extractedSid && /^\d{7,10}$/.test(accUsername)) {
              extractedSid = accUsername;
            }
            if (!extractedSid && /^\d{7,10}@/.test(accEmail)) {
              extractedSid = accEmail.split('@')[0];
            }

            const key = extractedSid || accEmail || accUsername || accId;
            map.set(key, {
              ...acc,
              student_id: extractedSid,
              class: acc.class || '',
              full_name: accName,
              displayName: accName,
              email: accEmail,
              username: accUsername,
              _id: accId,
              intake: extractIntake(acc.class || '', extractedSid),
              identifiers: [accId, accUsername, accEmail, extractedSid].filter(Boolean)
            });
          }
        });

        const list = Array.from(map.values()).sort((a, b) => 
          (a.displayName || a.full_name || '').localeCompare(b.displayName || b.full_name || '', 'vi')
        );

        setAccounts(list);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllPersonnelAndAccounts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [sections, setSections] = useState<Section[]>(
    survey?.sections && survey.sections.length > 0
      ? survey.sections
      : [{ id: 'sec_default', title: 'Mục chưa có tiêu đề', description: '' }]
  );

  const [questions, setQuestions] = useState<Question[]>(
    survey?.questions && survey.questions.length > 0 
      ? survey.questions 
      : [{
          id: 'q_' + Date.now(),
          text: 'Câu hỏi chưa có tiêu đề',
          type: 'multiple_choice',
          required: false,
          section_id: 'sec_default',
          options: [
            { id: 'opt_1', text: 'Tùy chọn 1' },
            { id: 'opt_2', text: 'Tùy chọn 2' }
          ]
        }]
  );

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(questions[0]?.id || null);
  const responses = survey?.responses || [];

  const handleSwitchScope = (scope: 'intake' | 'specific') => {
    setTargetScope(scope);
    if (scope === 'intake') {
      setSelectedUsers([]);
    } else {
      setSelectedIntakes([]);
    }
  };

  const toggleIntake = (intake: string) => {
    if (selectedIntakes.includes(intake)) {
      setSelectedIntakes(selectedIntakes.filter(i => i !== intake));
    } else {
      setSelectedIntakes([...selectedIntakes, intake]);
    }
  };

  const handleAddUser = (acc: any) => {
    const idKey = String(acc.student_id || acc._id);
    if (!selectedUsers.includes(idKey)) {
      setSelectedUsers([...selectedUsers, idKey]);
    }
    setUserSearchTerm('');
    setIsUserDropdownOpen(false);
  };

  const handleRemoveUser = (idKey: string) => {
    setSelectedUsers(selectedUsers.filter(u => u !== idKey));
  };

  const filteredAccounts = accounts.filter(acc => {
    const sid = acc.student_id ? String(acc.student_id) : '';
    const id = acc._id ? String(acc._id) : '';
    const idList = acc.identifiers || [];

    const isAlreadySelected = selectedUsers.some(selected => 
      selected === sid || 
      selected === id || 
      idList.includes(selected)
    );

    if (isAlreadySelected) return false;

    const s = userSearchTerm.toLowerCase().trim();
    if (!s) return true;

    return (
      (acc.displayName || acc.full_name || '').toLowerCase().includes(s) ||
      (acc.student_id || '').toLowerCase().includes(s) ||
      (acc.class || '').toLowerCase().includes(s) ||
      (acc.intake || '').toLowerCase().includes(s)
    );
  });

  const getPersonDetailText = (person: any) => {
    const parts: string[] = [];
    if (person.student_id) parts.push(`MSSV: ${person.student_id}`);
    if (person.class) parts.push(`Lớp: ${person.class}`);
    if (person.intake) parts.push(`Khóa: ${person.intake}`);
    if (parts.length === 0) return 'Chưa cập nhật thông tin học tập';
    return parts.join(' — ');
  };

  const getPersonBadgeLabel = (idKey: string) => {
    const matched = accounts.find(a => 
      String(a.student_id) === String(idKey) || 
      String(a._id) === String(idKey) ||
      a.identifiers?.includes(String(idKey))
    );

    if (!matched) return idKey;

    const name = matched.displayName || matched.full_name || idKey;
    const subParts: string[] = [];
    if (matched.student_id) subParts.push(matched.student_id);
    if (matched.class) subParts.push(matched.class);
    else if (matched.intake) subParts.push(matched.intake);

    if (subParts.length > 0) {
      return `${name} (${subParts.join(' — ')})`;
    }
    return name;
  };

  const handleAddQuestion = (targetSectionId?: string) => {
    const secId = targetSectionId || sections[sections.length - 1].id;
    const newQ: Question = {
      id: 'q_' + Date.now(),
      text: 'Câu hỏi chưa có tiêu đề',
      type: 'multiple_choice',
      required: false,
      section_id: secId,
      options: [{ id: 'opt_1', text: 'Tùy chọn 1' }]
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionId(newQ.id);
  };

  const handleAddSection = () => {
    const newSec: Section = {
      id: 'sec_' + Date.now(),
      title: 'Mục chưa có tiêu đề',
      description: ''
    };
    setSections([...sections, newSec]);
    handleAddQuestion(newSec.id);
  };

  const handleRemoveSection = (secId: string) => {
    if (sections.length <= 1) {
      showToast('Biểu mẫu phải có ít nhất 1 phần!', 'error');
      return;
    }
    setSections(sections.filter(s => s.id !== secId));
    const fallbackSecId = sections[0].id;
    setQuestions(prev => prev.map(q => q.section_id === secId ? { ...q, section_id: fallbackSecId } : q));
  };

  const handleSectionChange = (secId: string, field: keyof Section, val: string) => {
    setSections(prev => prev.map(s => s.id === secId ? { ...s, [field]: val } : s));
  };

  const handleDuplicateQuestion = (qToDup: Question) => {
    const duplicated: Question = {
      ...qToDup,
      id: 'q_' + Date.now(),
      options: qToDup.options?.map(o => ({ ...o, id: 'opt_' + Math.random().toString(36).substr(2, 5) }))
    };
    const index = questions.findIndex(q => q.id === qToDup.id);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    setQuestions(newQuestions);
    setActiveQuestionId(duplicated.id);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length === 1) {
      showToast('Phiếu khảo sát phải có ít nhất 1 câu hỏi!', 'error');
      return;
    }
    const filtered = questions.filter(q => q.id !== id);
    setQuestions(filtered);
    if (activeQuestionId === id) {
      setActiveQuestionId(filtered[0]?.id || null);
    }
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleImageUpload = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Dung lượng ảnh tối đa 3MB!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleQuestionChange(qId, 'image_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOption = (qId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const opts = q.options || [];
        return {
          ...q,
          options: [...opts, { id: 'opt_' + Date.now(), text: `Tùy chọn ${opts.length + 1}` }]
        };
      }
      return q;
    }));
  };

  const handleOptionTextChange = (qId: string, optId: string, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: (q.options || []).map(o => o.id === optId ? { ...o, text } : o)
        };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qId: string, optId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        if ((q.options || []).length <= 1) {
          showToast('Câu hỏi phải có ít nhất 1 tùy chọn đáp án!', 'error');
          return q;
        }
        return { ...q, options: (q.options || []).filter(o => o.id !== optId) };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề phiếu khảo sát!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        voucherNo: survey?.voucherNo,
        title,
        description,
        is_locked: isLocked,
        target_intakes: targetScope === 'intake' ? selectedIntakes : [],
        target_users: targetScope === 'specific' ? selectedUsers : [],
        created_by: currentUserId,
        sections,
        questions
      };

      const url = survey?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/surveys/${survey._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/surveys`;

      const method = survey?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Đã lưu phiếu khảo sát thành công!', 'success');
        setTimeout(() => {
          onSaved();
          onClose();
        }, 1200);
      } else {
        showToast('Lưu phiếu khảo sát thất bại!', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Không thể kết nối đến máy chủ!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const exportResponsesToExcel = () => {
    if (!responses || responses.length === 0) {
      showToast('Chưa có lượt nộp bài khảo sát nào!', 'info');
      return;
    }

    const headers = ['STT', 'MSSV', 'Họ và tên', ...questions.map(q => q.text), 'Thời gian nộp'];
    const rows = responses.map((resp, idx) => {
      const answerMap: Record<string, string> = {};
      (resp.answers || []).forEach((a: any) => {
        answerMap[a.question_id] = Array.isArray(a.value) ? a.value.join(', ') : String(a.value || '');
      });

      const qAnswers = questions.map(q => answerMap[q.id] || '');
      return [
        idx + 1,
        resp.student_id || '',
        resp.full_name || '',
        ...qAnswers,
        new Date(resp.submitted_at).toLocaleString('vi-VN')
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kết quả');
    XLSX.writeFile(workbook, `Khao_sat_${survey?.voucherNo || 'Detail'}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex flex-col overflow-hidden text-slate-800 animate-in fade-in duration-200">
      {toastMessage && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-300 text-white ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-[#0054a5]'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-3 shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0054a5] to-[#1d92ff] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <MessageSquareText size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-[#0054a5] border border-blue-200/80 font-bold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                {survey?.voucherNo || 'TẠO MỚI'}
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề biểu mẫu"
                className="font-bold text-sm sm:text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#0054a5] outline-none px-1 py-0.5 transition-all truncate max-w-[130px] sm:max-w-xs md:max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
              activeTab === 'editor' 
                ? 'bg-white text-[#0054a5] shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            Câu hỏi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'responses' 
                ? 'bg-white text-[#0054a5] shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <span>Câu trả lời</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'responses' ? 'bg-[#0054a5] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {responses.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">Lưu biểu mẫu</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {activeTab === 'editor' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6 relative pb-28">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm relative overflow-visible">
              <div className="h-2 w-full bg-gradient-to-r from-[#0054a5] via-blue-500 to-[#1d92ff] rounded-t-3xl" />
              
              <div className="p-5 sm:p-7 space-y-5">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề biểu mẫu"
                    className="w-full text-xl sm:text-2xl font-black text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-[#0054a5] outline-none pb-1.5 transition-all"
                  />
                  <AutoResizeTextarea
                    value={description}
                    onChange={(val) => setDescription(val)}
                    placeholder="Mô tả chi tiết biểu mẫu (Ctrl+B in đậm, Ctrl+I in nghiêng, Ctrl+U gạch chân)..."
                    className="text-xs sm:text-sm text-slate-600 font-medium border-b border-transparent hover:border-slate-200 focus:border-[#0054a5] p-1"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
                      <Sparkles size={15} className="text-[#0054a5]" />
                      <span>Cấu hình đối tượng tham gia</span>
                    </div>

                    <div className="flex p-1 bg-slate-200/80 rounded-xl w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleSwitchScope('intake')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          targetScope === 'intake'
                            ? 'bg-white text-[#0054a5] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        <GraduationCap size={15} />
                        <span>Theo khóa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchScope('specific')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          targetScope === 'specific'
                            ? 'bg-white text-[#0054a5] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        <UserCheck size={15} />
                        <span>Chỉ định cá nhân</span>
                      </button>
                    </div>
                  </div>

                  {targetScope === 'intake' && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-[#0054a5] flex items-center gap-1.5">
                          <GraduationCap size={15} /> Lựa chọn khóa sinh viên
                        </label>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {selectedIntakes.length === 0 ? "Mọi khóa sinh viên" : `Giới hạn: ${selectedIntakes.length} khóa`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedIntakes([])}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            selectedIntakes.length === 0
                              ? 'bg-[#0054a5] text-white border-[#0054a5] shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          Tất cả các khóa
                        </button>

                        {POPULAR_INTAKES.map(intake => {
                          const isChecked = selectedIntakes.includes(intake);
                          return (
                            <button
                              key={intake}
                              type="button"
                              onClick={() => toggleIntake(intake)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                isChecked
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              {isChecked ? `✓ K${intake}` : `K${intake}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {targetScope === 'specific' && (
                    <div className="space-y-2 pt-1 relative animate-in fade-in duration-150" ref={userDropdownRef}>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-[#0054a5] flex items-center gap-1.5">
                          <UserCheck size={15} /> Danh sách cá nhân được chỉ định
                        </label>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {selectedUsers.length === 0 ? "Chưa chọn ai" : `Đã chọn: ${selectedUsers.length} người`}
                        </span>
                      </div>

                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2.5 bg-white rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                          {selectedUsers.map(idKey => (
                            <span
                              key={idKey}
                              className="inline-flex items-center gap-2 bg-blue-50/90 border border-blue-200 text-[#0054a5] px-3 py-1 rounded-xl text-xs font-bold shadow-2xs"
                            >
                              <span>{getPersonBadgeLabel(idKey)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(idKey)}
                                className="p-0.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Tìm kiếm theo họ tên, MSSV, lớp để chỉ định..."
                            value={userSearchTerm}
                            onFocus={() => setIsUserDropdownOpen(true)}
                            onChange={(e) => {
                              setUserSearchTerm(e.target.value);
                              setIsUserDropdownOpen(true);
                            }}
                            className="w-full py-2.5 pl-10 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:ring-2 focus:ring-[#0054a5]/10 transition-all text-slate-800 placeholder:text-slate-400"
                          />
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {isUserDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[90] max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                            {filteredAccounts.length > 0 ? (
                              filteredAccounts.slice(0, 30).map(acc => {
                                const name = acc.displayName || acc.full_name || 'Thành viên';
                                const detailText = getPersonDetailText(acc);

                                return (
                                  <div
                                    key={acc._id || acc.student_id}
                                    onClick={() => handleAddUser(acc)}
                                    className="p-3 sm:px-4 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition-colors group"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#0054a5] truncate">
                                        {name}
                                      </p>
                                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                                        {detailText}
                                      </p>
                                    </div>
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0054a5] group-hover:text-white flex items-center justify-center text-slate-400 transition-all shrink-0">
                                      <UserPlus size={14} />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-6 text-center text-xs text-slate-400 italic">
                                Không tìm thấy sinh viên/nhân sự phù hợp với từ khóa...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {sections.map((sec, secIdx) => {
              const secQuestions = questions.filter(q => (q.section_id || sections[0].id) === sec.id);

              return (
                <div key={sec.id} className="space-y-4">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden border-l-8 border-l-[#0054a5]">
                    <div className="bg-[#0054a5] text-white px-4 py-1.5 inline-block font-black text-xs uppercase rounded-br-2xl tracking-wide">
                      Phần {secIdx + 1} / {sections.length}
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleSectionChange(sec.id, 'title', e.target.value)}
                          placeholder="Mục không có tiêu đề"
                          className="w-full text-base sm:text-lg font-bold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-[#0054a5] outline-none transition-all pb-1"
                        />
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer shrink-0"
                            title="Xóa phần này"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <AutoResizeTextarea
                        value={sec.description || ''}
                        onChange={(val) => handleSectionChange(sec.id, 'description', val)}
                        placeholder="Mô tả mục (không bắt buộc)..."
                        className="text-xs sm:text-sm text-slate-500 border-b border-transparent hover:border-slate-200 focus:border-[#0054a5] p-1"
                      />
                    </div>
                  </div>

                  {secQuestions.map((q) => {
                    const isActive = activeQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        onClick={() => setActiveQuestionId(q.id)}
                        className={`bg-white rounded-3xl border shadow-sm transition-all relative ${
                          isActive 
                            ? 'border-slate-300 ring-4 ring-[#0054a5]/10 border-l-8 border-l-[#0054a5] p-5 sm:p-7 space-y-5' 
                            : 'border-slate-200 hover:border-slate-300 p-5 space-y-3 cursor-pointer'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="w-full sm:flex-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-200 focus-within:border-[#0054a5] focus-within:bg-white transition-all">
                            <AutoResizeTextarea
                              value={q.text}
                              onChange={(val) => handleQuestionChange(q.id, 'text', val)}
                              placeholder="Nội dung câu hỏi..."
                              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent"
                            />
                          </div>

                          {isActive && (
                            <select
                              value={q.type}
                              onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value as QuestionType)}
                              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#0054a5] cursor-pointer w-full sm:w-auto shrink-0 shadow-2xs"
                            >
                              <option value="short_text">Trả lời ngắn</option>
                              <option value="paragraph">Đoạn văn</option>
                              <option value="multiple_choice">Trắc nghiệm (1 chọn)</option>
                              <option value="checkboxes">Hộp kiểm (nhiều chọn)</option>
                              <option value="dropdown">Menu thả xuống</option>
                            </select>
                          )}
                        </div>

                        {q.image_url && (
                          <div className="relative group max-w-md rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img src={q.image_url} alt="Ảnh câu hỏi" className="w-full max-h-64 object-contain" />
                            {isActive && (
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(q.id, 'image_url', '')}
                                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 border-none cursor-pointer"
                                title="Xóa ảnh"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        )}

                        <div className="pt-2">
                          {q.type === 'short_text' && (
                            <div className="p-3.5 border-b border-dashed border-slate-300 text-xs text-slate-400 font-medium max-w-sm">
                              Văn bản câu trả lời ngắn
                            </div>
                          )}

                          {q.type === 'paragraph' && (
                            <div className="p-3.5 border-b border-dashed border-slate-300 text-xs text-slate-400 font-medium max-w-md">
                              Văn bản câu trả lời dài (Ctrl+B/I/U)
                            </div>
                          )}

                          {['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type) && (
                            <div className="space-y-3">
                              {(q.options || []).map((opt, optIdx) => (
                                <div key={opt.id} className="flex items-center gap-3">
                                  {q.type === 'multiple_choice' && <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
                                  {q.type === 'checkboxes' && <div className="w-4 h-4 rounded-md border-2 border-slate-300 shrink-0" />}
                                  {q.type === 'dropdown' && <span className="text-xs font-bold text-slate-400 shrink-0">{optIdx + 1}.</span>}

                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => handleOptionTextChange(q.id, opt.id, e.target.value)}
                                    className="flex-1 p-2 border-b border-transparent hover:border-slate-200 focus:border-[#0054a5] text-xs font-semibold text-slate-800 outline-none transition-all"
                                  />

                                  {isActive && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(q.id, opt.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg border-none bg-transparent cursor-pointer"
                                      title="Xóa lựa chọn"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {isActive && (
                                <div className="flex items-center gap-2 pt-1">
                                  <div className="w-4 h-4 rounded-full border-2 border-transparent shrink-0" />
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(q.id)}
                                    className="text-xs font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer"
                                  >
                                    + Thêm tùy chọn
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {isActive && (
                          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 text-slate-500">
                            <label className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-[#0054a5]" title="Chèn ảnh vào câu hỏi">
                              <ImageIcon size={18} />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(q.id, e)} />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(q)}
                              className="p-2 hover:bg-slate-100 rounded-xl transition-colors border-none bg-transparent cursor-pointer text-slate-600"
                              title="Nhân bản câu hỏi"
                            >
                              <Copy size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors border-none bg-transparent cursor-pointer text-slate-600"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 size={18} />
                            </button>

                            <div className="h-6 w-px bg-slate-200 mx-1" />

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <span className="text-xs font-bold text-slate-600">Bắt buộc</span>
                              <input
                                type="checkbox"
                                checked={q.required}
                                onChange={(e) => handleQuestionChange(q.id, 'required', e.target.checked)}
                                className="w-4 h-4 accent-[#0054a5] rounded cursor-pointer"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {secIdx < sections.length - 1 && (
                    <div className="p-3 bg-white/80 rounded-2xl border border-dashed border-slate-300 text-xs font-bold text-slate-500 text-center">
                      Sau phần {secIdx + 1}: Tiếp tục tới phần tiếp theo (Phần {secIdx + 2})
                    </div>
                  )}
                </div>
              );
            })}

            <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 flex flex-col items-center gap-2 z-40">
              <button
                type="button"
                onClick={() => handleAddQuestion()}
                className="p-3 bg-[#0054a5] hover:bg-blue-700 text-white rounded-xl transition-transform hover:scale-105 shadow-md border-none cursor-pointer"
                title="Thêm câu hỏi mới"
              >
                <Plus size={20} />
              </button>

              <button
                type="button"
                onClick={handleAddSection}
                className="p-3 bg-slate-100 hover:bg-[#0054a5] text-slate-700 hover:text-white rounded-xl transition-all border-none cursor-pointer"
                title="Tách phần / Tách trang"
              >
                <Split size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6 pb-28">
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {responses.length} câu trả lời
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Bản tóm tắt kết quả khảo sát tổng hợp từ hệ thống
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={exportResponsesToExcel}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all border-none cursor-pointer active:scale-95"
                  >
                    <FileSpreadsheet size={16} /> Xuất Excel
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                      isLocked ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-blue-50 text-[#0054a5] hover:bg-blue-100'
                    }`}
                  >
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    <span>{isLocked ? 'Đã khóa nhận bài' : 'Đang mở nhận bài'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#0054a5] bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                <Users size={16} />
                <span>Số người tham gia thực hiện khảo sát: {responses.length} sinh viên</span>
              </div>
            </div>

            {responses.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 font-medium italic">
                Chưa có lượt phản hồi nào cho bài khảo sát này.
              </div>
            ) : (
              questions.map((q, idx) => {
                const answerList = responses
                  .map(r => {
                    const found = (r.answers || []).find((a: any) => a.question_id === q.id);
                    return {
                      student_id: r.student_id,
                      full_name: r.full_name,
                      val: found ? found.value : null
                    };
                  })
                  .filter(item => item.val !== null && item.val !== undefined && item.val !== '');

                const totalAnswersForQ = answerList.length;

                return (
                  <div key={q.id} className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                        {idx + 1}. {q.text}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">
                        {totalAnswersForQ} câu trả lời
                      </p>
                    </div>

                    {['short_text', 'paragraph'].includes(q.type) && (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {answerList.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Chưa có câu trả lời.</p>
                        ) : (
                          answerList.map((item, aIdx) => (
                            <div key={aIdx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-700 font-medium space-y-1">
                              <p className="font-bold text-slate-900 whitespace-pre-wrap">{String(item.val)}</p>
                              {(item.student_id || item.full_name) && (
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  — {item.full_name || 'Sinh viên'} {item.student_id ? `(${item.student_id})` : ''}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type) && (
                      <div className="space-y-3 pt-1">
                        {(q.options || []).map((opt) => {
                          const count = answerList.filter(item => {
                            if (Array.isArray(item.val)) {
                              return item.val.includes(opt.text);
                            }
                            return String(item.val) === opt.text;
                          }).length;

                          const percentage = totalAnswersForQ > 0 
                            ? ((count / totalAnswersForQ) * 100).toFixed(1) 
                            : '0';

                          return (
                            <div key={opt.id} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span>{opt.text}</span>
                                <span className="text-[#0054a5]">
                                  {count} lượt ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-[#0054a5] to-[#1d92ff] h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}