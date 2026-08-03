import React from 'react';
import { DishCategory } from '../types';
import { CATEGORIES } from '../data/mockDishes';
import { Utensils, PackageCheck, Wheat, Cookie, LayoutGrid, CheckSquare, Square } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: DishCategory | 'all_categories';
  onSelectCategory: (cat: DishCategory | 'all_categories') => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  onlyAvailable,
  onToggleOnlyAvailable,
  categoryCounts,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'PackageCheck':
        return <PackageCheck className="w-3.5 h-3.5" />;
      case 'Wheat':
        return <Wheat className="w-3.5 h-3.5" />;
      case 'Cookie':
        return <Cookie className="w-3.5 h-3.5" />;
      case 'LayoutGrid':
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-[#F4F1EA] border-b border-black/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-row items-center justify-between gap-2">
        {/* Category Pill Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-sm text-[11px] sm:text-xs font-sans uppercase tracking-wider transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs font-bold'
                    : 'bg-[#FDFCFB] hover:bg-[#E5E1D8] text-[#1A1A1A]/80 border-black/10 font-semibold'
                }`}
              >
                <span className={isSelected ? 'text-[#C05A3D]' : 'text-[#C05A3D]/80'}>
                  {getIcon(cat.iconName)}
                </span>
                <span>{cat.label}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded-sm font-bold ${
                    isSelected
                      ? 'bg-[#C05A3D] text-white'
                      : 'bg-[#E5E1D8] text-[#1A1A1A]/70'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stock Switch Toggle for Internal Kitchen Staff */}
        <button
          onClick={onToggleOnlyAvailable}
          className="shrink-0 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm bg-[#FDFCFB] border border-black/10 hover:bg-[#E5E1D8] text-[10px] sm:text-xs font-sans uppercase tracking-wider font-bold text-[#1A1A1A]/80 transition-colors cursor-pointer"
          title="Lọc chỉ hiển thị món đang có sẵn trong ngày"
        >
          {onlyAvailable ? (
            <CheckSquare className="w-3.5 h-3.5 text-[#C05A3D]" />
          ) : (
            <Square className="w-3.5 h-3.5 text-[#1A1A1A]/30" />
          )}
          <span className="hidden sm:inline">Chỉ xem món sẵn có</span>
          <span className="sm:hidden">Sẵn có</span>
        </button>
      </div>
    </div>
  );
};
