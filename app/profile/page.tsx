'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import TabNavigation from './TabNavigation';
import InfoTab from './InfoTab';
import NotificationsTab from './NotificationsTab';
import UserRegistrationTab from './UserRegistrationTab';
import SurveyTab from './SurveyTab';
import AnnouncementModal from './AnnouncementModal';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'notifications' | 'registrations' | 'surveys'>('info');
  const [profile, setProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States form
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [className, setClassName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [newRoleInput, setNewRoleInput] = useState('');

  // States thông báo
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  // State đếm số phiếu CHƯA đăng ký & CHƯA làm khảo sát
  const [unsubmittedCount, setUnsubmittedCount] = useState(0);
  const [unsubmittedSurveyCount, setUnsubmittedSurveyCount] = useState(0);

  // ĐÁNH DẤU ĐÃ ĐỌC QUA API BACKEND
  const handleMarkAsRead = async (notifId: string) => {
    if (!notifId || !currentUserId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${notifId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ user_id: currentUserId })
      });

      if (res.ok) {
        setAnnouncements(prev => prev.map(a => {
          const aId = a._id || a.id;
          if (String(aId) === String(notifId)) {
            const existingReadBy = Array.isArray(a.read_by) ? a.read_by : [];
            if (!existingReadBy.includes(currentUserId)) {
              return { ...a, read_by: [...existingReadBy, currentUserId] };
            }
          }
          return a;
        }));
      }
    } catch (e) {
      console.error('Lỗi khi lưu trạng thái đã đọc lên Server:', e);
    }
  };

  const fetchUnsubmittedCount = async (currentStudentId: string) => {
    if (!currentStudentId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const count = data.filter((form: any) => {
            const isSubmitted = form.submissions?.some(
              (sub: any) => sub.student_id === currentStudentId
            );
            return !isSubmitted;
          }).length;
          setUnsubmittedCount(count);
        }
      }
    } catch (e) {
      console.error('Lỗi đếm phiếu chưa đăng ký:', e);
    }
  };

  const fetchUnsubmittedSurveyCount = async (currentStudentId: string) => {
    if (!currentStudentId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const count = data.filter((survey: any) => {
            const isSubmitted = survey.responses?.some(
              (r: any) => r.student_id === currentStudentId
            );
            return !isSubmitted;
          }).length;
          setUnsubmittedSurveyCount(count);
        }
      }
    } catch (e) {
      console.error('Lỗi đếm phiếu khảo sát chưa làm:', e);
    }
  };

  const fetchAnnouncements = async (realUserId: string) => {
    setLoadingNotifs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements?userId=${realUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': String(realUserId),
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Lỗi lấy thông báo:', e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }
      try {
        const localUser = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        const accountId = String(localUser._id || localUser.user_id || localUser.id || '');
        setCurrentUserId(accountId);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': accountId || '',
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          const realProfileId = String(data._id || data.user_id || accountId);
          setCurrentUserId(realProfileId);

          setFullName(data.full_name || '');
          setStudentId(data.student_id || '');
          setStudentEmail(data.email || (data.student_id ? `${data.student_id}@gm.uit.edu.vn` : ''));
          setPersonalEmail(data.personal_email || '');
          setClassName(data.class || '');
          setPhone(data.phone || '');
          setBirthday(data.birthday || '');
          setImageUrl(data.image_url || '');
          setRoles(Array.isArray(data.roles) ? data.roles : ['Đoàn viên']);

          await fetchAnnouncements(realProfileId);

          if (data.student_id) {
            await fetchUnsubmittedCount(data.student_id);
            await fetchUnsubmittedSurveyCount(data.student_id);
          }
        } else {
          await fetchAnnouncements(accountId);
        }
      } catch (e) {
        console.error('Lỗi lấy profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleAddRole = () => {
    if (newRoleInput.trim() && !roles.includes(newRoleInput.trim())) {
      setRoles([...roles, newRoleInput.trim()]);
      setNewRoleInput('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter(r => r !== roleToRemove));
  };

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
        alert('Dung lượng ảnh tối đa 2MB!');
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
          roles,
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
          roles,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Cập nhật thông tin cá nhân thành công!');
        window.location.reload();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Cập nhật thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      alert('Không thể kết nối máy chủ!');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleDownloadFile = (fileObj: any) => {
    if (!fileObj || !fileObj.buffer) return;
    const link = document.createElement('a');
    link.href = `data:${fileObj.mimetype};base64,${fileObj.buffer}`;
    link.download = fileObj.originalname || 'tai-lieu-dinh-kem';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unreadNotifCount = announcements.filter(item => {
    const readByArr = Array.isArray(item.read_by) ? item.read_by : [];
    return !readByArr.includes(currentUserId);
  }).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  const isSelectedNotifRead = selectedNotif
    ? (Array.isArray(selectedNotif.read_by) && selectedNotif.read_by.includes(currentUserId))
    : false;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 text-black">
      <ProfileHeader
        fullName={fullName}
        studentId={studentId}
        className={className}
        imageUrl={imageUrl}
        roles={roles}
        onImageChange={handleImageChange}
      />
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifCount={unreadNotifCount}
          registrationCount={unsubmittedCount}
          surveyCount={unsubmittedSurveyCount}
        />
        {activeTab === 'info' && (
          <InfoTab
            fullName={fullName} setFullName={setFullName}
            studentId={studentId} handleStudentIdChange={handleStudentIdChange}
            studentEmail={studentEmail}
            personalEmail={personalEmail} setPersonalEmail={setPersonalEmail}
            className={className} setClassName={setClassName}
            phone={phone} setPhone={setPhone}
            birthday={birthday} setBirthday={setBirthday}
            roles={roles}
            newRoleInput={newRoleInput} setNewRoleInput={setNewRoleInput}
            handleAddRole={handleAddRole} handleRemoveRole={handleRemoveRole}
            handleSave={handleSave} saving={saving}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab
            loading={loadingNotifs}
            announcements={announcements}
            currentUserId={currentUserId}
            onSelectNotif={setSelectedNotif}
            formatDate={formatDate}
          />
        )}
        {activeTab === 'registrations' && (
          <UserRegistrationTab
            userInfo={{
              student_id: studentId,
              full_name: fullName,
              class_name: className,
            }}
            onRefreshCount={() => fetchUnsubmittedCount(studentId)}
          />
        )}
        {activeTab === 'surveys' && (
          <SurveyTab
            userInfo={{
              student_id: studentId,
              full_name: fullName,
            }}
            onRefreshCount={() => fetchUnsubmittedSurveyCount(studentId)}
          />
        )}
      </div>

      <AnnouncementModal
        selectedNotif={selectedNotif}
        onClose={() => setSelectedNotif(null)}
        formatDate={formatDate}
        handleDownloadFile={handleDownloadFile}
        onMarkAsRead={handleMarkAsRead}
        isRead={isSelectedNotifRead}
      />
    </div>
  );
}