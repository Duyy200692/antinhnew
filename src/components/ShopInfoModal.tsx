import React from 'react';
import { X, Phone, MapPin, Clock, ShieldCheck, HeartHandshake, Info, Store } from 'lucide-react';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '../data/mockDishes';
import { ShopInfo } from '../types';

interface ShopInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopInfo?: ShopInfo;
  onOpenAdminModal?: () => void;
}

export const ShopInfoModal: React.FC<ShopInfoModalProps> = ({
  isOpen,
  onClose,
  shopInfo = DEFAULT_SHOP_INFO,
  onOpenAdminModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] rounded-lg max-w-xl w-full border border-black/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#F4F1EA] px-6 py-5 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5E1D8] flex items-center justify-center text-[#C05A3D] text-lg font-bold">
              🪷
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-[#1A1A1A]">
                {shopInfo.name}
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C05A3D] font-bold">
                Quy Chế & Đặt Bếp Nội Bộ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] flex items-center justify-center text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Intro notice */}
          <div className="bg-[#F4F1EA] p-4 rounded-sm border-l-2 border-[#C05A3D] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#C05A3D] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#1A1A1A]/80 font-sans">
              {shopInfo.notice ||
                'App nội bộ dành cho nhân viên xem thực đơn hàng ngày, đặt xôi, bánh mì chà bông chay và nắm lịch món chính luân phiên của bếp ăn theo từng thứ trong tuần.'}
            </p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5">
              <div className="flex items-center gap-2 mb-2 text-xs font-sans uppercase tracking-wider font-bold text-[#C05A3D]">
                <Clock className="w-4 h-4" />
                <span>Giờ Bếp Mở Cửa</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#1A1A1A]">{shopInfo.openHours}</p>
              <p className="text-xs text-[#1A1A1A]/60 mt-1">Phục vụ các ngày từ Thứ 2 - Chủ Nhật</p>
            </div>

            <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5">
              <div className="flex items-center gap-2 mb-2 text-xs font-sans uppercase tracking-wider font-bold text-[#2D463E]">
                <Phone className="w-4 h-4" />
                <span>Người Phụ Trách</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#1A1A1A]">{shopInfo.contactPerson}</p>
              <p className="text-xs text-[#1A1A1A]/80 font-mono mt-1">SĐT/Zalo: {shopInfo.phone}</p>
            </div>
          </div>

          {/* Address */}
          <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#C05A3D] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-[#1A1A1A] mb-1">
                Địa Chỉ Bếp Ăn
              </h3>
              <p className="text-sm text-[#1A1A1A]/80 font-serif">{shopInfo.address}</p>
            </div>
          </div>

          {/* Policies / Notes */}
          <div className="border-t border-black/10 pt-4 space-y-3">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A] uppercase tracking-wide">
              Lưu Ý Cho Nhân Viên & Đặt Món
            </h3>

            <div className="space-y-2 text-xs text-[#1A1A1A]/80">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D463E] shrink-0 mt-0.5" />
                <span>
                  <strong>Món cố định:</strong> Xôi hạt sen, Xôi lá cẩm, Bánh mì chà bông nấm và các món làm sẵn có đủ các ngày trong tuần.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 text-[#C05A3D] shrink-0 mt-0.5" />
                <span>
                  <strong>Món theo ngày:</strong> Bếp đổi món chính theo lịch (ví dụ Thứ 2: Bún bò huế chay, Thứ 4: Phở chay, Thứ 7: Cơm niêu, v.v.).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#1A1A1A]/60 shrink-0 mt-0.5" />
                <span>
                  <strong>Báo số lượng:</strong> Vui lòng báo số lượng suất trước 09h00 sáng để bếp chuẩn bị đầy đủ và tươm tất.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F4F1EA] px-6 py-4 border-t border-black/10 flex items-center justify-between">
          {onOpenAdminModal ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminModal();
              }}
              className="px-4 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] font-sans uppercase tracking-wider font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#C05A3D]" />
              <span>Chỉnh Sửa Quán</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white font-sans uppercase tracking-wider font-bold text-xs transition-colors cursor-pointer"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

