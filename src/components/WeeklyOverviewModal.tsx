import React from 'react';
import { X, Calendar, Sparkles, Utensils, CheckCircle2 } from 'lucide-react';
import { DishItem, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../data/mockDishes';
import { getCategoryLabel } from '../utils/dayUtils';

interface WeeklyOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishes: DishItem[];
  onSelectDay: (day: DayOfWeek | 'today') => void;
}

export const WeeklyOverviewModal: React.FC<WeeklyOverviewModalProps> = ({
  isOpen,
  onClose,
  dishes,
  onSelectDay,
}) => {
  if (!isOpen) return null;

  const weeklyDays = DAYS_OF_WEEK.filter((d) => d.id !== 'all');
  const allWeekDishes = dishes.filter((d) => d.availableDays.includes('all'));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] rounded-lg max-w-4xl w-full border border-black/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#F4F1EA] px-6 py-5 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5E1D8] flex items-center justify-center text-[#C05A3D]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-[#1A1A1A]">
                Lịch Món Tuần - An Tịnh Chay
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C05A3D] font-bold">
                Thực Đơn Món Chính Luân Phiên & Món Cố Định
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
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* All-week summary box */}
          <div className="bg-[#F4F1EA] p-4 rounded-sm border border-black/10">
            <div className="flex items-center gap-2 mb-2 font-serif text-sm font-bold text-[#2D463E]">
              <Sparkles className="w-4 h-4 text-[#C05A3D]" />
              <span>Món Phục Vụ Cố Định Tất Cả Các Ngày ({allWeekDishes.length} món)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allWeekDishes.map((d) => (
                <span
                  key={d.id}
                  className="px-2.5 py-1 rounded-sm bg-[#FDFCFB] border border-black/10 text-xs font-sans text-[#1A1A1A]/80 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2D463E]" />
                  <span>{d.name}</span>
                  <span className="text-[10px] text-[#C05A3D] font-bold">({d.price})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Grid of Monday to Sunday */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyDays.map((day) => {
              const dayDishes = dishes.filter(
                (d) => !d.availableDays.includes('all') && d.availableDays.includes(day.id)
              );

              return (
                <div
                  key={day.id}
                  className="bg-[#F4F1EA] border border-black/10 rounded-sm p-4 flex flex-col justify-between hover:border-black/30 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-3">
                      <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                        {day.label}
                      </h3>
                      <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#2D463E] text-white font-bold">
                        {dayDishes.length} món theo ngày
                      </span>
                    </div>

                    {dayDishes.length === 0 ? (
                      <p className="text-xs text-[#1A1A1A]/40 italic py-2">
                        Chỉ phục vụ món cố định làm sẵn trong ngày này.
                      </p>
                    ) : (
                      <ul className="space-y-2 mb-3">
                        {dayDishes.map((d) => (
                          <li
                            key={d.id}
                            className="text-xs bg-[#FDFCFB] p-2.5 rounded-sm border border-black/5 flex items-start justify-between gap-2"
                          >
                            <div>
                              <p className="font-serif font-bold text-[#1A1A1A]">{d.name}</p>
                              <span className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider font-sans">
                                {getCategoryLabel(d.category)}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#C05A3D] whitespace-nowrap">
                              {d.price}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onSelectDay(day.id);
                      onClose();
                    }}
                    className="w-full mt-2 py-1.5 bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs font-sans uppercase tracking-wider font-bold rounded-sm transition-colors cursor-pointer"
                  >
                    Xem Chi Tiết Ngày Này
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F4F1EA] px-6 py-4 border-t border-black/10 flex items-center justify-between">
          <p className="text-xs text-[#1A1A1A]/60 font-sans italic">
            * Nhấp vào nút "Xem Chi Tiết" để chuyển bộ lọc sang ngày tương ứng.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white font-sans uppercase tracking-wider font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng Lịch
          </button>
        </div>
      </div>
    </div>
  );
};
