import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    const isSuccess = onLogin(password.trim());
    if (isSuccess) {
      setPassword('');
      setErrorMsg('');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] rounded-lg max-w-md w-full border border-black/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#2D463E] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#C05A3D] flex items-center justify-center text-white shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg uppercase tracking-tight">
                Đăng Nhập Quản Trị Bếp
              </h2>
              <p className="font-sans text-[11px] text-[#E5E1D8]/80 uppercase tracking-wider font-semibold">
                An Tịnh Chay • Bếp Nội Bộ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-[#F4F1EA] p-3.5 rounded-sm border-l-2 border-[#C05A3D] text-xs font-sans text-[#1A1A1A]/80 leading-relaxed">
            <p className="font-bold text-[#1A1A1A] mb-0.5">Quyền truy cập dành cho Quản lý / Bếp trưởng</p>
            <p>Khách hàng chỉ có quyền xem menu. Đăng nhập mật khẩu Admin để sửa món, báo hết hàng hoặc chỉnh thông tin quán.</p>
          </div>

          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5">
              Mật khẩu Quản Trị *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Nhập mật khẩu..."
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-[#F4F1EA] border border-black/10 rounded-sm text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 hover:text-[#1A1A1A] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-sans font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <p className="text-[11px] text-[#1A1A1A]/50 font-sans mt-1.5 italic">
              * Mật khẩu mặc định: <code className="bg-[#E5E1D8] px-1 py-0.5 rounded text-[#C05A3D] font-mono font-bold">antinh123</code>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-sm bg-[#2D463E] hover:bg-[#1f332d] text-white text-xs font-sans uppercase tracking-wider font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C05A3D]" />
              <span>Đăng Nhập Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
