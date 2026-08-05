import React from 'react';
import { DishItem } from '../types';
import { getCategoryLabel, getDayLabel } from '../utils/dayUtils';
import { X, CheckCircle2, XCircle, Clock, Edit3, PhoneCall, Lock } from 'lucide-react';
import { SHOP_INFO } from '../data/mockDishes';

interface DishDetailModalProps {
  dish: DishItem | null;
  onClose: () => void;
  onToggleStock: (dishId: string) => void;
  onEditDish: (dish: DishItem) => void;
  isAdminLoggedIn?: boolean;
  onRequireAdminLogin?: (onSuccess?: () => void) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  onClose,
  onToggleStock,
  onEditDish,
  isAdminLoggedIn = false,
  onRequireAdminLogin,
}) => {
  if (!dish) return null;

  const isAllWeek = dish.availableDays.includes('all');

  const handleToggleStockWithAuth = () => {
    if (isAdminLoggedIn) {
      onToggleStock(dish.id);
    } else if (onRequireAdminLogin) {
      onRequireAdminLogin(() => onToggleStock(dish.id));
    }
  };

  const handleEditDishWithAuth = () => {
    if (isAdminLoggedIn) {
      onClose();
      onEditDish(dish);
    } else if (onRequireAdminLogin) {
      onRequireAdminLogin(() => {
        onClose();
        onEditDish(dish);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-2xl bg-[#FDFCFB] rounded-lg shadow-2xl overflow-hidden border border-black/10 max-h-[90vh] flex flex-col">
        {/* Top Image Section */}
        <div className="relative h-64 sm:h-80 w-full bg-[#E5E1D8] shrink-0">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Badge on Top Left */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-sm bg-[#2D463E] text-white font-sans text-xs uppercase tracking-wider font-bold shadow-xs">
              {getCategoryLabel(dish.category)}
            </span>
            {isAllWeek ? (
              <span className="px-3 py-1 rounded-sm bg-[#1A1A1A] text-[#E5E1D8] font-sans text-xs uppercase tracking-wider font-bold shadow-xs">
                Cố định bán cả tuần
              </span>
            ) : (
              <span className="px-3 py-1 rounded-sm bg-[#C05A3D] text-white font-sans text-xs uppercase tracking-wider font-bold shadow-xs">
                Áp dụng: {dish.availableDays.map((d) => getDayLabel(d)).join(', ')}
              </span>
            )}
          </div>

          {/* Title & Price overlay on bottom left of image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl sm:text-3xl font-serif font-black leading-tight mb-1 uppercase tracking-tight">
              {dish.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[#E5E1D8] font-serif font-bold text-xl sm:text-2xl">
                {dish.price}
              </span>
              <span className="text-white/80 font-sans text-xs uppercase tracking-wider">/ {dish.unit}</span>
            </div>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Availability Status & Prep Time */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-sm bg-[#F4F1EA] border border-black/10">
            <div className="flex items-center gap-2">
              {dish.isAvailableToday ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2D463E] text-white font-sans text-xs uppercase tracking-wider font-bold">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Đang Có Sẵn Trong Quán</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#C05A3D] text-white font-sans text-xs uppercase tracking-wider font-bold">
                  <XCircle className="w-4 h-4 text-white" />
                  <span>Tạm Hết Món Hôm Nay</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider font-semibold text-[#1A1A1A]/70">
              <Clock className="w-4 h-4 text-[#C05A3D]" />
              <span>Thời gian chuẩn bị: {dish.prepTime}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C05A3D] mb-2">
              Mô Tả Món Ăn & Nguyên Liệu
            </h4>
            <p className="text-[#1A1A1A]/80 font-sans text-sm sm:text-base leading-relaxed bg-[#F4F1EA] p-4 rounded-sm border border-black/5">
              {dish.description}
            </p>
          </div>

          {/* Ordering Callout */}
          <div className="p-4 rounded-sm bg-[#F4F1EA] border border-black/10 flex items-center justify-between gap-3">
            <div className="text-xs sm:text-sm font-sans">
              <p className="font-bold text-[#1A1A1A]">Đặt món hoặc xôi số lượng lớn?</p>
              <p className="text-[#1A1A1A]/70 text-xs mt-0.5">
                Liên hệ trực tiếp {SHOP_INFO.contactPerson} ({SHOP_INFO.phone}) • {SHOP_INFO.address}
              </p>
            </div>
            <a
              href={`tel:${SHOP_INFO.phone.replace(/[^0-9]/g, '')}`}
              className="px-4 py-2 rounded-sm bg-[#2D463E] hover:bg-[#1f332d] text-white font-sans uppercase tracking-wider font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-[#C05A3D]" />
              <span>Gọi ngay</span>
            </a>
          </div>
        </div>

        {/* Modal Footer with Staff Action Buttons (Only shown for Admin) */}
        <div className="p-4 bg-[#F4F1EA] border-t border-black/10 flex items-center justify-between gap-3 shrink-0">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleStockWithAuth}
                className={`px-4 py-2 rounded-sm text-xs sm:text-sm font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  dish.isAvailableToday
                    ? 'bg-[#C05A3D] text-white hover:bg-[#a0452c]'
                    : 'bg-[#2D463E] text-white hover:bg-[#1f332d]'
                }`}
                title="Chuyển trạng thái còn / hết"
              >
                {dish.isAvailableToday ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Báo Hết Sớm Hôm Nay</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Báo Có Món Lại</span>
                  </>
                )}
              </button>

              <button
                onClick={handleEditDishWithAuth}
                className="px-4 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs sm:text-sm font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Sửa món"
              >
                <Edit3 className="w-4 h-4 text-[#C05A3D]" />
                <span>Sửa Món</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/70 font-sans font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2D463E] inline-block" />
              <span>Bếp An Tịnh • Thực đơn chay</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white text-xs sm:text-sm font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
