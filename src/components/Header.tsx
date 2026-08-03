import React from 'react';
import { Search, PlusCircle, Calendar, Info, Sparkles, ShieldCheck, Lock, LogOut, Eye } from 'lucide-react';
import { DayOfWeek, ShopInfo } from '../types';
import { getDayLabel, getTodayDayOfWeek } from '../utils/dayUtils';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '../data/mockDishes';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDay: DayOfWeek | 'today';
  setSelectedDay: (day: DayOfWeek | 'today') => void;
  onOpenAddModal: () => void;
  onOpenShopInfoModal: () => void;
  onOpenWeeklyOverviewModal: () => void;
  onOpenAdminModal: () => void;
  isAdminLoggedIn: boolean;
  onRequireAdminLogin: (onSuccess?: () => void) => void;
  onLogoutAdmin: () => void;
  shopInfo?: ShopInfo;
  totalDishesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDay,
  setSelectedDay,
  onOpenAddModal,
  onOpenShopInfoModal,
  onOpenWeeklyOverviewModal,
  onOpenAdminModal,
  isAdminLoggedIn,
  onRequireAdminLogin,
  onLogoutAdmin,
  shopInfo = DEFAULT_SHOP_INFO,
  totalDishesCount,
}) => {
  const todayDay = getTodayDayOfWeek();
  const todayLabel = getDayLabel(todayDay);

  const handleAdminBtnClick = () => {
    if (isAdminLoggedIn) {
      onOpenAdminModal();
    } else {
      onRequireAdminLogin(onOpenAdminModal);
    }
  };

  const handleAddDishBtnClick = () => {
    if (isAdminLoggedIn) {
      onOpenAddModal();
    } else {
      onRequireAdminLogin(onOpenAddModal);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCFB] text-[#1A1A1A] shadow-xs border-b border-black/10">
      {/* Top Banner - Editorial subtle notice */}
      <div className="bg-[#F4F1EA] text-[10px] sm:text-xs py-1 px-3 sm:px-4 border-b border-black/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#1A1A1A]/80 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C05A3D] animate-pulse shrink-0" />
            <span className="font-serif font-bold tracking-wide text-xs sm:text-sm">{shopInfo.name}</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline font-sans text-[11px] uppercase tracking-wider text-[#1A1A1A]/70">LH: {shopInfo.contactPerson} ({shopInfo.phone})</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-sans font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span className="hidden sm:inline">Quyền Admin (Đã đăng nhập)</span>
                  <span className="sm:hidden">Admin</span>
                </span>
                <button
                  onClick={onLogoutAdmin}
                  className="text-[10px] sm:text-[11px] text-red-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Đăng xuất khỏi Admin"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-sans text-[#1A1A1A]/60 bg-[#E5E1D8]/60 px-1.5 py-0.5 rounded">
                <Eye className="w-3 h-3 text-[#1A1A1A]/60" />
                <span className="hidden sm:inline">Chế độ Khách Hàng (Chỉ xem)</span>
                <span className="sm:hidden">Khách xem</span>
              </span>
            )}

            <span className="text-black/20 hidden sm:inline">•</span>

            <button
              onClick={onOpenShopInfoModal}
              className="flex items-center gap-1 text-[#C05A3D] hover:text-[#A0452C] transition-colors text-[10px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Thông tin quán & Đặt xôi</span>
              <span className="sm:hidden">Thông tin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#E5E1D8] border border-black/10 flex items-center justify-center shadow-xs text-[#C05A3D] font-bold text-base sm:text-2xl shrink-0">
                <span>🪷</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-3xl font-serif font-black uppercase tracking-tighter leading-none text-[#1A1A1A]">
                    {shopInfo.name}
                  </h1>
                  <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm bg-[#2D463E] text-white whitespace-nowrap">
                    {shopInfo.badgeText || 'Bếp Nội Bộ'}
                  </span>
                </div>
                <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mt-0.5 hidden sm:block">
                  Món Làm Sẵn Cố Định • Seasonal Daily Menu
                </span>
              </div>
            </div>

            {/* Mobile quick info button */}
            <button
              onClick={onOpenShopInfoModal}
              className="sm:hidden p-1.5 rounded bg-[#F4F1EA] text-[#C05A3D] text-xs font-bold flex items-center gap-1 border border-black/10"
              title="Xem thông tin quán"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Bar & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1A1A1A]/40" />
              <input
                type="text"
                placeholder="Tìm món chay, xôi, bánh mì..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 bg-[#F4F1EA] border border-black/10 rounded-md sm:rounded-lg text-xs sm:text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C05A3D] focus:border-[#C05A3D] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#C05A3D] hover:underline font-medium"
                >
                  Xoá
                </button>
              )}
            </div>

            {/* Actions for Internal Menu App */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-end">
              <button
                onClick={handleAdminBtnClick}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-sans uppercase tracking-wider font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isAdminLoggedIn
                    ? 'bg-[#2D463E] hover:bg-[#1f332d] text-white'
                    : 'bg-[#1A1A1A] hover:bg-[#C05A3D] text-white'
                }`}
                title={isAdminLoggedIn ? 'Mở Trung Tâm Quản Trị Bếp' : 'Yêu cầu đăng nhập mật khẩu Admin'}
              >
                {isAdminLoggedIn ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C05A3D]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#E5E1D8]" />
                )}
                <span>{isAdminLoggedIn ? 'Quản Trị' : 'Admin'}</span>
              </button>

              <button
                onClick={onOpenWeeklyOverviewModal}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-md sm:rounded-lg bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-[11px] sm:text-sm font-sans uppercase tracking-wider font-bold border border-black/10 transition-colors cursor-pointer whitespace-nowrap"
                title="Xem tổng quan lịch món trong tuần"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C05A3D]" />
                <span>Lịch tuần</span>
              </button>

              <button
                onClick={handleAddDishBtnClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg bg-[#C05A3D] hover:bg-[#a0452c] text-white font-sans uppercase tracking-wider font-bold text-[11px] sm:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title={isAdminLoggedIn ? 'Thêm món chay mới' : 'Cần mật khẩu Admin để thêm món'}
              >
                {!isAdminLoggedIn && <Lock className="w-3 h-3 text-white/80" />}
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Thêm món</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Special Indicator Banner */}
        <div className="mt-2.5 pt-2 sm:mt-4 sm:pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-[#C05A3D] text-white font-sans text-[10px] uppercase tracking-wider font-bold">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{todayLabel}</span>
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-[#1A1A1A]/60 italic">
              {totalDishesCount} món trong menu
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-sans uppercase tracking-wider font-semibold">
            <button
              onClick={() => setSelectedDay('today')}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm transition-all cursor-pointer ${
                selectedDay === 'today'
                  ? 'bg-[#C05A3D] text-white font-bold shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#E5E1D8]/50'
              }`}
            >
              Thực đơn hôm nay
            </button>
            <span className="text-[#1A1A1A]/20">•</span>
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm transition-all cursor-pointer ${
                selectedDay === 'all'
                  ? 'bg-[#2D463E] text-white font-bold shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#E5E1D8]/50'
              }`}
            >
              Món cố định
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
