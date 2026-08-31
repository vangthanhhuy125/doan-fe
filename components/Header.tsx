// Header.tsx
'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  LogOut, User, UserCircle, KeyRound, X, Eye, EyeOff, Check, Lock, Loader2, ClipboardList, CheckCircle2, AlertCircle 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Khách");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  const isConfirmMatch = confirmPassword.length > 0 && confirmPassword === newPassword;

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.full_name || user.displayName || user.username || "Thành viên");
        setUserAvatar(user.image_url || null);
      } catch (err) {
        setUserName("Thành viên");
        setUserAvatar(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsOpen(false);
    router.push("/login");
  };

  const handleProfile = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  const resetPasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setErrorMessage("");
    setShowPasswordModal(false);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!oldPassword) {
      setErrorMessage("Vui lòng nhập mật khẩu cũ!");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Mật khẩu mới chưa thỏa mãn tất cả các điều kiện!");
      return;
    }

    if (!isConfirmMatch) {
      setErrorMessage("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      let userId = "";
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user._id || user.user_id || user.id || "";
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Đổi mật khẩu thành công!", "success");
        resetPasswordModal();
      } else {
        setErrorMessage(data.message || "Đổi mật khẩu thất bại, vui lòng kiểm tra lại!");
      }
    } catch (error) {
      setErrorMessage("Không thể kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm relative z-30">
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-300 text-white ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pl-11 lg:pl-0">
        <Image src="/truong-doan-khoa.png" alt="Logo" width={120} height={120} className="w-auto h-9 sm:h-10 object-contain" />
        <span className="font-semibold text-[#0054a5] hidden md:block text-[15px] leading-tight">
          Đoàn khoa Công nghệ Phần mềm, <br/> Đoàn trường Đại học Công nghệ Thông tin - ĐHQG-HCM   
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center rounded-full transition-all focus:outline-none ring-2 ring-transparent hover:ring-[#0054a5]/30 p-0.5 cursor-pointer"
            title="Tài khoản"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#0054a5]"
                onError={() => setUserAvatar(null)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0054a5]/10 text-[#0054a5] flex items-center justify-center border-2 border-[#0054a5]">
                <User size={22} className="stroke-[2.2]" />
              </div>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400">Tài khoản</p>
                <p className="text-sm font-bold text-[#0054a5] truncate mt-0.5">{userName}</p>
              </div>

              <div className="p-1.5 space-y-1">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-all cursor-pointer border-none bg-transparent"
                >
                  <UserCircle size={18} className="text-[#0054a5]" />
                  <span>Trang cá nhân</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/survey");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-all cursor-pointer border-none bg-transparent"
                >
                  <ClipboardList size={18} className="text-[#0054a5]" />
                  <span>Tạo phiếu khảo sát</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-all cursor-pointer border-none bg-transparent"
                >
                  <KeyRound size={18} className="text-[#0054a5]" />
                  <span>Đổi mật khẩu</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border-none bg-transparent"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col">
            <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Lock size={20} />
                <h3 className="font-bold tracking-widest text-sm">Đổi mật khẩu</h3>
              </div>
              <button 
                onClick={resetPasswordModal} 
                className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4 text-left">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full p-3 pr-10 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#0054a5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full p-3 pr-10 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#0054a5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 mt-2 text-[11px] font-semibold">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">Yêu cầu mật khẩu mới:</p>
                  
                  <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {hasMinLength ? <Check size={10} /> : '•'}
                    </div>
                    <span>Tối thiểu 8 ký tự</span>
                  </div>

                  <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasUpperCase ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {hasUpperCase ? <Check size={10} /> : '•'}
                    </div>
                    <span>Có ít nhất 1 chữ cái in hoa (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasNumber ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {hasNumber ? <Check size={10} /> : '•'}
                    </div>
                    <span>Có ít nhất 1 chữ số (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasSpecialChar ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {hasSpecialChar ? <Check size={10} /> : '•'}
                    </div>
                    <span>Có ít nhất 1 ký tự đặc biệt (!@#$%...)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-gray-500">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full p-3 pr-10 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#0054a5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {confirmPassword && (
                  <p className={`text-[11px] font-bold mt-1 ${isConfirmMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isConfirmMatch ? '✓ Mật khẩu xác nhận trùng khớp' : '✕ Mật khẩu xác nhận chưa trùng khớp'}
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetPasswordModal}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs border-none bg-transparent cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid || !isConfirmMatch}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>{loading ? "Đang xử lý..." : "Xác nhận đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}