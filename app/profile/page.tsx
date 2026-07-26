'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, GraduationCap, ShieldCheck, Camera, Save, Bell, Loader2, UserCheck, AtSign } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'notifications'>('info');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [className, setClassName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [notifications] = useState([
    { id: 1, title: 'Thông báo họp Ban chấp hành tháng 5', date: '10/05/2026', read: false },
    { id: 2, title: 'Đã cập nhật trạng thái đóng Đoàn phí 2025 - 2026', date: '02/05/2026', read: true },
    { id: 3, title: 'Phân công hỗ trợ Chiến dịch Mùa Hè Xanh 2026', date: '25/04/2026', read: true },
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userInfo = user.user_info || user;
        
        setProfile(user);
        setFullName(userInfo.full_name || user.full_name || '');
        
        const mssv = userInfo.student_id || user.student_id || '';
        setStudentId(mssv);
        
        const sEmail = userInfo.email || user.email || (mssv ? `${mssv}@gm.uit.edu.vn` : '');
        setStudentEmail(sEmail);

        setPersonalEmail(userInfo.personal_email || user.personal_email || '');
        setClassName(userInfo.class || user.class || '');
        setPhone(userInfo.phone || user.phone || '');
        setBirthday(userInfo.birthday || user.birthday || '');
        setImageUrl(userInfo.image_url || user.image_url || '');
      } catch (e) {
        console.error('Lỗi parse user:', e);
      }
    }
    setLoading(false);
  }, []);

  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
    if (value.trim()) {
      setStudentEmail(`${value.trim()}@gm.uit.edu.vn`);
    } else {
      setStudentEmail('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Dung lượng ảnh tối đa là 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const userId = profile._id || profile.user_id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
        },
        body: JSON.stringify({
          full_name: fullName,
          student_id: studentId,
          email: studentEmail,
          personal_email: personalEmail,
          class: className,
          phone,
          birthday,
          image_url: imageUrl,
        }),
      });

      if (res.ok) {
        const updatedUser = {
          ...profile,
          full_name: fullName,
          student_id: studentId,
          email: studentEmail,
          personal_email: personalEmail,
          class: className,
          phone,
          birthday,
          image_url: imageUrl,
          ...(profile.user_info ? {
            user_info: {
              ...profile.user_info,
              full_name: fullName,
              student_id: studentId,
              email: studentEmail,
              personal_email: personalEmail,
              class: className,
              phone,
              birthday,
              image_url: imageUrl
            }
          } : {})
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Cập nhật thông tin cá nhân thành công!');
        window.location.reload();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Cập nhật thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-sm md:flex-row border border-gray-100">
        <div className="relative group">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#0054a5] bg-blue-50">
            {imageUrl ? (
              <img src={imageUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-[#0054a5]" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#0054a5] p-2 text-white shadow-md transition-all hover:bg-blue-700">
            <Camera size={14} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl font-bold uppercase text-[#0054a5]">
            {fullName || 'Đoàn viên'}
          </h2>
          <p className="text-sm font-semibold text-gray-500">
            MSSV: <span className="text-gray-800">{studentId || '—'}</span>
          </p>
          <span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0054a5]">
            Lớp: {className || 'Chưa cập nhật'}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 pt-2 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserCheck size={18} />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bell size={18} />
            <span>Thông báo</span>
            <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              3
            </span>
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="p-6 space-y-6">
            <h3 className="flex items-center gap-2 border-b pb-3 text-lg font-bold text-gray-800">
              <ShieldCheck className="text-[#0054a5]" size={20} /> Chi tiết thông tin
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Họ và tên</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
                  <User size={18} className="text-[#0054a5]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Mã số sinh viên</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
                  <GraduationCap size={18} className="text-[#0054a5]" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => handleStudentIdChange(e.target.value)}
                    placeholder="Nhập MSSV (ví dụ: 24520212)"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Email sinh viên 
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-medium text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    readOnly
                    value={studentEmail}
                    placeholder="mssv@gm.uit.edu.vn"
                    className="w-full bg-transparent text-sm font-medium outline-none cursor-not-allowed text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Email cá nhân</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
                  <AtSign size={18} className="text-[#0054a5]" />
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="Nhập email cá nhân"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Lớp sinh hoạt</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
                  <GraduationCap size={18} className="text-[#0054a5]" />
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Nhập lớp sinh hoạt (ví dụ: KTPM2024.1)"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Ngày sinh</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
                  <Calendar size={18} className="text-[#0054a5]" />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Số điện thoại</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
                  <Phone size={18} className="text-[#0054a5]" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#0054a5] px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-3">
            <h3 className="border-b pb-3 text-lg font-bold text-gray-800 flex items-center gap-2">
              <Bell size={20} className="text-[#0054a5]" /> Danh sách thông báo
            </h3>

            <div className="divide-y divide-gray-100">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-3.5 px-3 rounded-xl transition-all ${
                    !item.read ? 'bg-blue-50/50 font-semibold' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${!item.read ? 'bg-[#0054a5]' : 'bg-transparent'}`} />
                    <p className="text-sm text-gray-800">{item.title}</p>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}