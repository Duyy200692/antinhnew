import React from 'react';
import { DishItem } from '../types';
import { getCategoryLabel, getDayLabel } from '../utils/dayUtils';
import { CheckCircle2, XCircle, Clock, Tag, Eye, Lock } from 'lucide-react';

interface DishCardProps {
  dish: DishItem;
  onSelectDish: (dish: DishItem) => void;
  onToggleStock: (dishId: string, e: React.MouseEvent) => void;
  isAdminLoggedIn?: boolean;
  onRequireAdminLogin?: (onSuccess?: () => void) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  onSelectDish,
  onToggleStock,
  isAdminLoggedIn = false,
  onRequireAdminLogin,
}) => {
  const isAllWeek = dish.availableDays.includes('all');

  const handleStockToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdminLoggedIn) {
      onToggleStock(dish.id, e);
    } else if (onRequireAdminLogin) {
      onRequireAdminLogin(() => onToggleStock(dish.id, e));
    }
  };

  const getCategoryBadgeClass = (cat: DishItem['category']) => {
    switch (cat) {
      case 'ready_made':
        return 'bg-[#2D463E] text-white border-black/10';
      case 'sticky_rice_bread':
        return 'bg-[#C05A3D] text-white border-black/10';
      case 'cereal_cake':
        return 'bg-[#1A1A1A] text-white border-black/10';
      case 'daily_main':
      default:
        return 'bg-[#E5E1D8] text-[#1A1A1A] border-black/10 font-bold';
    }
  };

  return (
    <div
      onClick={() => onSelectDish(dish)}
      className={`group relative bg-[#FDFCFB] rounded-lg border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
        dish.isAvailableToday
          ? 'border-black/10 shadow-xs hover:shadow-md hover:border-black/25'
          : 'border-black/5 bg-[#F4F1EA]/80 opacity-70'
      }`}
    >
      {/* Top Image Container */}
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-[#E5E1D8]">
          <img
            src={dish.image}
            alt={dish.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              !dish.isAvailableToday ? 'grayscale-[30%]' : ''
            }`}
            loading="lazy"
          />

          {/* Top-Left Category & Day Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <span
              className={`font-sans text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-sm font-bold border shadow-xs ${getCategoryBadgeClass(
                dish.category
              )}`}
            >
              {getCategoryLabel(dish.category)}
            </span>

            {isAllWeek ? (
              <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#1A1A1A] text-[#E5E1D8] font-bold border border-black/20 shadow-xs">
                Cố định cả tuần
              </span>
            ) : (
              <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#C05A3D] text-white font-bold border border-black/20 shadow-xs">
                {dish.availableDays.map((d) => getDayLabel(d)).join(', ')}
              </span>
            )}
          </div>

          {/* Top-Right Quick Inspection Badge */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A]/80 text-white p-1.5 rounded-full shadow-md">
            <Eye className="w-3.5 h-3.5" />
          </div>

          {/* Sold Out Badge overlay if temporarily unavailable */}
          {!dish.isAvailableToday && (
            <div className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center">
              <span className="px-3 py-1.5 rounded-sm bg-[#C05A3D] text-white font-sans font-bold text-xs uppercase tracking-widest shadow-lg transform -rotate-1 mb-1.5">
                Tạm hết hôm nay
              </span>
              {dish.soldOutNote ? (
                <span className="px-2.5 py-1 rounded-sm bg-[#1A1A1A] text-white font-sans text-[11px] font-medium shadow-sm">
                  {dish.soldOutNote}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-sm bg-black/60 text-[#E5E1D8] font-sans text-[10px] uppercase tracking-wider">
                  Hết sớm trong ngày
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif font-bold text-[#1A1A1A] text-lg leading-snug group-hover:text-[#C05A3D] transition-colors line-clamp-2">
              {dish.name}
            </h3>
          </div>

          <p className="font-sans text-[#1A1A1A]/70 text-xs leading-relaxed line-clamp-2 mb-4">
            {dish.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {dish.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#F4F1EA] text-[#1A1A1A]/80 text-[10px] font-sans uppercase tracking-wider font-semibold border border-black/5"
              >
                <Tag className="w-2.5 h-2.5 text-[#C05A3D]" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Price, Unit & Staff Quick Stock Toggle */}
      <div className="px-5 py-3.5 bg-[#F4F1EA] border-t border-black/5 flex items-center justify-between gap-2">
        <div>
          <span className="text-base font-serif font-bold text-[#C05A3D]">
            {dish.price}
          </span>
          <span className="font-sans text-[11px] uppercase tracking-wider text-[#1A1A1A]/50 ml-1">/ {dish.unit}</span>
        </div>

        {/* Quick Toggle Stock (Admin required) */}
        <button
          onClick={handleStockToggleClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-sans uppercase tracking-wider font-bold transition-all cursor-pointer ${
            dish.isAvailableToday
              ? 'bg-[#2D463E] text-white hover:bg-[#1f332d]'
              : 'bg-[#C05A3D] text-white hover:bg-[#a0452c]'
          }`}
          title={isAdminLoggedIn ? "Bấm để chuyển trạng thái Có sẵn / Hết sớm" : "Cần mật khẩu Admin để chuyển trạng thái"}
        >
          {!isAdminLoggedIn && <Lock className="w-3 h-3 text-white/80" />}
          {dish.isAvailableToday ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sẵn có</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>Hết sớm</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
