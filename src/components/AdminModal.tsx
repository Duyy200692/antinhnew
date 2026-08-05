import React, { useState, useMemo } from 'react';
import { DishItem, ShopInfo, DishCategory } from '../types';
import { CATEGORIES, DAYS_OF_WEEK } from '../data/mockDishes';
import { getCategoryLabel, getDayLabel } from '../utils/dayUtils';
import {
  X,
  ShieldCheck,
  Edit3,
  Trash2,
  PlusCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Store,
  UtensilsCrossed,
  Save,
  Clock,
  AlertCircle,
  Sparkles,
  Phone,
  MapPin,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'dishes' | 'shop' | 'password';
  dishes: DishItem[];
  onToggleStock: (dishId: string, soldOutNote?: string) => void;
  onEditDish: (dish: DishItem) => void;
  onSaveDish?: (dish: DishItem) => void;
  onSaveAllDishes?: (updatedList: DishItem[]) => void;
  onAddNewDish: () => void;
  onDeleteDish: (dishId: string) => void;
  onResetAllToAvailable: () => void;
  shopInfo: ShopInfo;
  onSaveShopInfo: (info: ShopInfo) => void;
  onResetShopInfo: () => void;
  onLogoutAdmin: () => void;
  onChangeAdminPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'dishes',
  dishes,
  onToggleStock,
  onEditDish,
  onSaveDish,
  onSaveAllDishes,
  onAddNewDish,
  onDeleteDish,
  onResetAllToAvailable,
  shopInfo,
  onSaveShopInfo,
  onResetShopInfo,
  onLogoutAdmin,
  onChangeAdminPassword,
}) => {
  const [activeTab, setActiveTab] = useState<'dishes' | 'shop' | 'password'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'sold_out'>('all');
  const [customNoteDishId, setCustomNoteDishId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Inline Editing States for Dish Name & Price
  const [editingInlineDishId, setEditingInlineDishId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlinePrice, setInlinePrice] = useState('');
  const [inlineUnit, setInlineUnit] = useState('Phần');
  const [inlineSaveStatus, setInlineSaveStatus] = useState<string | null>(null);

  // Shop Info Edit State
  const [formName, setFormName] = useState(shopInfo.name);
  const [formBadgeText, setFormBadgeText] = useState(shopInfo.badgeText || 'Bếp Nội Bộ');
  const [formAddress, setFormAddress] = useState(shopInfo.address);
  const [formPhone, setFormPhone] = useState(shopInfo.phone);
  const [formContactPerson, setFormContactPerson] = useState(shopInfo.contactPerson);
  const [formOpenHours, setFormOpenHours] = useState(shopInfo.openHours);
  const [formOrderHours, setFormOrderHours] = useState(shopInfo.orderHours || 'Báo suất món chính trước 09h00 sáng | Đặt xôi & tiệc trước 1 ngày');
  const [formSlogan, setFormSlogan] = useState(shopInfo.slogan);
  const [formNotice, setFormNotice] = useState(
    shopInfo.notice ||
      'App nội bộ dành cho nhân viên xem thực đơn hàng ngày, đặt xôi, bánh mì chà bông chay và nắm lịch món chính luân phiên của bếp ăn theo từng thứ trong tuần.'
  );
  const [formZaloUrl, setFormZaloUrl] = useState(shopInfo.zaloUrl || '');
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  // Synchronize form state and activeTab whenever modal is opened or shopInfo updates
  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setFormName(shopInfo.name);
      setFormBadgeText(shopInfo.badgeText || 'Bếp Nội Bộ');
      setFormAddress(shopInfo.address);
      setFormPhone(shopInfo.phone);
      setFormContactPerson(shopInfo.contactPerson);
      setFormOpenHours(shopInfo.openHours);
      setFormOrderHours(shopInfo.orderHours || 'Báo suất món chính trước 09h00 sáng | Đặt xôi & tiệc trước 1 ngày');
      setFormSlogan(shopInfo.slogan);
      setFormNotice(
        shopInfo.notice ||
          'App nội bộ dành cho nhân viên xem thực đơn hàng ngày, đặt xôi, bánh mì chà bông chay và nắm lịch món chính luân phiên của bếp ăn theo từng thứ trong tuần.'
      );
      setFormZaloUrl(shopInfo.zaloUrl || '');
    }
  }, [isOpen, shopInfo]);

  // Password Change State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStatus, setPassStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        dish.name.toLowerCase().includes(q) ||
        dish.description.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || dish.category === selectedCategory;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'available' && dish.isAvailableToday) ||
        (stockFilter === 'sold_out' && !dish.isAvailableToday);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [dishes, searchQuery, selectedCategory, stockFilter]);

  const soldOutCount = useMemo(() => {
    return dishes.filter((d) => !d.isAvailableToday).length;
  }, [dishes]);

  const handleSaveShopForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShopInfo({
      ...shopInfo,
      name: formName,
      badgeText: formBadgeText,
      address: formAddress,
      phone: formPhone,
      contactPerson: formContactPerson,
      openHours: formOpenHours,
      orderHours: formOrderHours,
      slogan: formSlogan,
      notice: formNotice,
      zaloUrl: formZaloUrl,
    });
    setShopSaveSuccess(true);
    setTimeout(() => setShopSaveSuccess(false), 2500);
  };

  const handleQuickNoteSelect = (dishId: string, note: string) => {
    onToggleStock(dishId, note);
    setCustomNoteDishId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] rounded-lg max-w-5xl w-full border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#F4F1EA] px-6 py-4 border-b border-black/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#2D463E] text-[#E5E1D8] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C05A3D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl uppercase tracking-tight text-[#1A1A1A]">
                  Trung Tâm Quản Trị Bếp • {shopInfo.name}
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-sans font-bold uppercase tracking-wider border border-emerald-300">
                  🟢 Admin Active
                </span>
              </div>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C05A3D] font-bold">
                Cập nhật Tạm hết món sớm • Chỉnh sửa thông tin quán • Đổi mật khẩu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Bạn chắc chắn muốn đăng xuất quyền Admin? Khách hàng chỉ có thể xem menu.')) {
                  onLogoutAdmin();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-sm bg-red-50 hover:bg-red-100 text-red-700 text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-200 transition-colors cursor-pointer"
              title="Đăng xuất khỏi quyền Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất Admin</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] flex items-center justify-center text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#FDFCFB] border-b border-black/10 px-6 pt-2 flex flex-wrap items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`pb-3 px-2 font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'dishes'
                ? 'border-[#C05A3D] text-[#C05A3D]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Quản Lý Món & Báo Hết Sớm</span>
            {soldOutCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-sm bg-[#C05A3D] text-white text-[10px] font-bold">
                {soldOutCount} tạm hết
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-3 px-2 font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'border-[#C05A3D] text-[#C05A3D]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Chỉnh Sửa Thông Tin Quán</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-2 font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'border-[#C05A3D] text-[#C05A3D]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi Mật Khẩu Admin</span>
          </button>
        </div>

        {/* Tab 1: Dishes & Sold Out Early Manager */}
        {activeTab === 'dishes' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Sync Notification Banner */}
            {inlineSaveStatus && (
              <div className="px-4 py-2.5 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-sans font-bold flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C05A3D]" />
                  <span>{inlineSaveStatus}</span>
                </div>
                <button onClick={() => setInlineSaveStatus(null)} className="text-emerald-700 hover:text-emerald-950">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-sm bg-[#F4F1EA] border border-black/10">
              <div className="flex items-center gap-3">
                <div className="text-xs font-sans">
                  <p className="font-bold text-[#1A1A1A]">Khôi phục trạng thái & Đồng bộ Firebase</p>
                  <p className="text-[#1A1A1A]/70 text-[11px]">
                    Sửa tên món, giá bán trực tiếp trên bảng bên dưới và tự động đẩy mảng <code className="bg-black/10 px-1 py-0.5 rounded font-mono text-[10px]">list</code> lên Firebase.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {onSaveAllDishes && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSaveAllDishes) {
                        setInlineSaveStatus('Đang đẩy dữ liệu lên Firebase...');
                        onSaveAllDishes(dishes);
                        setInlineSaveStatus(`✅ Đã đẩy toàn bộ ${dishes.length} món lên Firebase thành công!`);
                        setTimeout(() => setInlineSaveStatus(null), 3000);
                      }
                    }}
                    className="px-3 py-2 rounded-sm bg-[#1A1A1A] hover:bg-black text-white font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Đẩy toàn bộ mảng list lên Firebase document menu_dishes_list/list"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lưu Tất Cả Lên Firebase</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onResetAllToAvailable}
                  className="px-3 py-2 rounded-sm bg-[#2D463E] hover:bg-[#1f332d] text-white font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C05A3D]" />
                  <span>Mở Bếp Ngày Mới (Sẵn có tất cả)</span>
                </button>
                <button
                  type="button"
                  onClick={onAddNewDish}
                  className="px-3 py-2 rounded-sm bg-[#C05A3D] hover:bg-[#a0452c] text-white font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Thêm Món Mới</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/40" />
                <input
                  type="text"
                  placeholder="Tìm theo tên món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#F4F1EA] border border-black/10 rounded-sm text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              {/* Category & Stock Filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as DishCategory | 'all')}
                  className="px-3 py-2 bg-[#F4F1EA] border border-black/10 rounded-sm text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                >
                  <option value="all">Tất cả danh mục</option>
                  {CATEGORIES.filter((c) => c.id !== 'all_categories').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-sm bg-[#F4F1EA] border border-black/10 p-0.5">
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`px-3 py-1 rounded-sm text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                      stockFilter === 'all'
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Tất cả ({dishes.length})
                  </button>
                  <button
                    onClick={() => setStockFilter('available')}
                    className={`px-3 py-1 rounded-sm text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                      stockFilter === 'available'
                        ? 'bg-[#2D463E] text-white'
                        : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Đang có ({dishes.length - soldOutCount})
                  </button>
                  <button
                    onClick={() => setStockFilter('sold_out')}
                    className={`px-3 py-1 rounded-sm text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                      stockFilter === 'sold_out'
                        ? 'bg-[#C05A3D] text-white'
                        : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Tạm hết ({soldOutCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Dishes Table */}
            <div className="border border-black/10 rounded-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F1EA] border-b border-black/10 font-sans text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                      <th className="py-3 px-4">Món ăn (Tên món)</th>
                      <th className="py-3 px-4">Danh mục / Ngày</th>
                      <th className="py-3 px-4">Giá bán</th>
                      <th className="py-3 px-4 text-center">Trạng thái bếp (Hết sớm / Có sẵn)</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-sans text-sm">
                    {filteredDishes.length > 0 ? (
                      filteredDishes.map((dish) => {
                        const isInlineEditing = editingInlineDishId === dish.id;

                        return (
                          <tr
                            key={dish.id}
                            className={`hover:bg-[#F4F1EA]/50 transition-colors ${
                              !dish.isAvailableToday ? 'bg-amber-50/50' : ''
                            }`}
                          >
                            {/* Dish Name + image thumbnail */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-12 h-12 rounded-sm object-cover border border-black/10 shrink-0"
                                />
                                <div className="flex-1">
                                  {isInlineEditing ? (
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={inlineName}
                                        onChange={(e) => setInlineName(e.target.value)}
                                        placeholder="Nhập tên món ăn mới..."
                                        className="w-full px-2 py-1 bg-amber-50 border border-[#C05A3D] rounded-sm font-serif font-bold text-sm text-[#1A1A1A] focus:outline-none"
                                        autoFocus
                                      />
                                      <p className="text-[11px] text-[#C05A3D] font-sans">
                                        Nhấn "Lưu Firebase" để cập nhật ngay.
                                      </p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="font-serif font-bold text-[#1A1A1A] leading-snug">
                                        {dish.name}
                                      </p>
                                      <p className="text-xs text-[#1A1A1A]/60 line-clamp-1">
                                        {dish.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category / Days */}
                            <td className="py-3 px-4 text-xs">
                              <span className="inline-block px-2 py-0.5 rounded-sm bg-[#F4F1EA] font-semibold text-[#1A1A1A] border border-black/10 mb-1">
                                {getCategoryLabel(dish.category)}
                              </span>
                              <div className="text-[11px] text-[#1A1A1A]/60">
                                {dish.availableDays.includes('all')
                                  ? 'Cố định cả tuần'
                                  : dish.availableDays.map((d) => getDayLabel(d)).join(', ')}
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-3 px-4 font-serif font-bold text-[#C05A3D] whitespace-nowrap">
                              {isInlineEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={inlinePrice}
                                    onChange={(e) => setInlinePrice(e.target.value)}
                                    placeholder="45.000đ"
                                    className="w-24 px-2 py-1 bg-amber-50 border border-[#C05A3D] rounded-sm text-xs font-bold font-serif text-[#C05A3D] focus:outline-none"
                                  />
                                  <span className="text-[11px] font-sans text-black/60">/ {dish.unit}</span>
                                </div>
                              ) : (
                                <>
                                  {dish.price}
                                  <span className="text-[11px] font-sans font-normal text-[#1A1A1A]/60 ml-1">
                                    / {dish.unit}
                                  </span>
                                </>
                              )}
                            </td>

                            {/* Stock Status + Early Sold Out Quick Notes */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onToggleStock(dish.id)}
                                  className={`px-3 py-1.5 rounded-sm text-xs font-sans uppercase tracking-wider font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                                    dish.isAvailableToday
                                      ? 'bg-[#2D463E] text-white hover:bg-[#1f332d]'
                                      : 'bg-[#C05A3D] text-white hover:bg-[#a0452c]'
                                  }`}
                                >
                                  {dish.isAvailableToday ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Đang Có Sẵn</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Đã Báo Tạm Hết</span>
                                    </>
                                  )}
                                </button>

                                {!dish.isAvailableToday && (
                                  <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
                                    {dish.soldOutNote && (
                                      <span className="px-2 py-0.5 rounded-sm bg-[#1A1A1A] text-white font-medium">
                                        {dish.soldOutNote}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomNoteDishId(dish.id);
                                        setTempNoteText(dish.soldOutNote || 'Hết sớm lúc 10h30');
                                      }}
                                      className="text-[#C05A3D] underline hover:text-[#1A1A1A] font-bold text-[10px] cursor-pointer"
                                    >
                                      + Ghi chú hết sớm
                                    </button>
                                  </div>
                                )}

                                {/* Custom Sold Out Note Popover */}
                                {customNoteDishId === dish.id && (
                                  <div className="mt-1 p-2 bg-[#F4F1EA] rounded-sm border border-black/10 shadow-md flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={tempNoteText}
                                      onChange={(e) => setTempNoteText(e.target.value)}
                                      placeholder="VD: Hết xôi lúc 10h30"
                                      className="px-2 py-1 text-xs rounded-sm border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleQuickNoteSelect(dish.id, tempNoteText)}
                                      className="px-2 py-1 bg-[#1A1A1A] text-white text-xs rounded-sm font-bold cursor-pointer"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setCustomNoteDishId(null)}
                                      className="p-1 text-xs text-black/60 hover:text-black cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {isInlineEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!inlineName.trim()) return;
                                        const updatedDish: DishItem = {
                                          ...dish,
                                          name: inlineName.trim(),
                                          price: inlinePrice.trim(),
                                          unit: inlineUnit.trim() || dish.unit,
                                        };
                                        setEditingInlineDishId(null);
                                        setInlineSaveStatus(`Đang lưu món "${updatedDish.name}" lên Firebase...`);
                                        if (onSaveDish) {
                                          await onSaveDish(updatedDish);
                                        } else if (onSaveAllDishes) {
                                          const newList = dishes.map((d) => (d.id === dish.id ? updatedDish : d));
                                          await onSaveAllDishes(newList);
                                        }
                                        setInlineSaveStatus(`✅ Đã cập nhật "${updatedDish.name}" và đồng bộ Firebase!`);
                                        setTimeout(() => setInlineSaveStatus(null), 3000);
                                      }}
                                      className="px-2.5 py-1.5 rounded-sm bg-[#C05A3D] hover:bg-[#a0452c] text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Lưu Firebase</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingInlineDishId(null)}
                                      className="px-2 py-1.5 rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-sans font-bold cursor-pointer"
                                    >
                                      Hủy
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingInlineDishId(dish.id);
                                        setInlineName(dish.name);
                                        setInlinePrice(dish.price);
                                        setInlineUnit(dish.unit || 'Phần');
                                      }}
                                      className="px-2.5 py-1.5 rounded-sm bg-amber-100 hover:bg-amber-200 text-[#C05A3D] font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1 border border-amber-300"
                                      title="Sửa nhanh tên & giá ngay tại dòng này"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Sửa Nhanh</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onEditDish(dish)}
                                      className="px-2 py-1.5 rounded-sm bg-[#F4F1EA] hover:bg-[#E5E1D8] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                                      title="Sửa chi tiết (Hình ảnh, danh mục, ngày bán)"
                                    >
                                      <span>Chi tiết</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Bạn muốn xoá món "${dish.name}" khỏi menu?`)) {
                                          onDeleteDish(dish.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-sm bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                      title="Xoá món"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#1A1A1A]/60">
                          Không tìm thấy món ăn nào khớp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Shop Profile Settings */}
        {activeTab === 'shop' && (
          <form onSubmit={handleSaveShopForm} className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="bg-[#F4F1EA] p-4 rounded-sm border-l-2 border-[#C05A3D] flex items-start gap-3">
              <Store className="w-5 h-5 text-[#C05A3D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-sans font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Chỉnh Sửa Thông Tin Quán & Giờ Bếp
                </p>
                <p className="text-xs text-[#1A1A1A]/70 font-sans mt-0.5">
                  Các thông tin này sẽ hiển thị trực tiếp trên thanh tiêu đề, modal Thông Tin Quán và chân trang app.
                </p>
              </div>
            </div>

            {shopSaveSuccess && (
              <div className="p-3 bg-[#2D463E] text-white rounded-sm text-xs font-sans font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#E5E1D8]" />
                <span>Đã lưu thông tin quán mới thành công!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Tên Thương Hiệu / Quán *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: AN TỊNH - MENU CHAY NỘI BỘ"
                  required
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Huy Hiệu Phân Loại Bếp
                </label>
                <input
                  type="text"
                  value={formBadgeText}
                  onChange={(e) => setFormBadgeText(e.target.value)}
                  placeholder="VD: Bếp Nội Bộ hoặc Quán Chay An Tịnh"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Người Phụ Trách / Bếp Trưởng
                </label>
                <input
                  type="text"
                  value={formContactPerson}
                  onChange={(e) => setFormContactPerson(e.target.value)}
                  placeholder="VD: Ms. Bình"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Số Điện Thoại / Hotline Đặt Món
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="VD: 0909 310 567"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Giờ Mở Cửa Phục Vụ *
                </label>
                <input
                  type="text"
                  value={formOpenHours}
                  onChange={(e) => setFormOpenHours(e.target.value)}
                  placeholder="VD: 06:30 - 20:30 (Thứ 2 - Chủ Nhật)"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#C05A3D] mb-1">
                  Thời Gian Nhận Đặt Món & Báo Suất *
                </label>
                <input
                  type="text"
                  value={formOrderHours}
                  onChange={(e) => setFormOrderHours(e.target.value)}
                  placeholder="VD: Báo suất món chính trước 09h00 sáng | Đặt xôi cúng trước 1 ngày"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-[#C05A3D]/40 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Đường Dẫn Zalo / Fanpage
                </label>
                <input
                  type="text"
                  value={formZaloUrl}
                  onChange={(e) => setFormZaloUrl(e.target.value)}
                  placeholder="VD: https://zalo.me/0909310567"
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Địa Chỉ Quán / Bếp Ăn
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="VD: 121/7 Lê Thị Riêng, Phường Bến Thành, Quận 1..."
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Lời Chào & Giới Thiệu Thương Hiệu (Slogan)
                </label>
                <textarea
                  rows={2}
                  value={formSlogan}
                  onChange={(e) => setFormSlogan(e.target.value)}
                  placeholder="VD: Chúc quý khách có một sức khoẻ tốt..."
                  className="w-full px-4 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Thông Báo & Quy Chế Lưu Ý Cho Khách Hàng / Nhân Viên
                </label>
                <textarea
                  rows={2}
                  value={formNotice}
                  onChange={(e) => setFormNotice(e.target.value)}
                  placeholder="VD: Vui lòng báo số lượng suất trước 09h00 sáng để bếp chuẩn bị..."
                  className="w-full px-4 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Khôi phục thông tin quán gốc ban đầu?')) {
                    onResetShopInfo();
                    const defaultInfo = {
                      name: 'An Tịnh Chay',
                      address:
                        '121/7 (nhà sau) Lê Thị Riêng, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
                      phone: '0909 310 567',
                      contactPerson: 'Ms. Bình',
                      openHours: '06:30 - 20:30 (Thứ 2 - Chủ Nhật)',
                      slogan:
                        'Chúc quý khách có một sức khoẻ tốt. Nơi cung cấp món chay làm sẵn & xôi nếp cái hoa vàng chuẩn vị.',
                      features: [],
                    };
                    setFormName(defaultInfo.name);
                    setFormAddress(defaultInfo.address);
                    setFormPhone(defaultInfo.phone);
                    setFormContactPerson(defaultInfo.contactPerson);
                    setFormOpenHours(defaultInfo.openHours);
                    setFormSlogan(defaultInfo.slogan);
                  }
                }}
                className="px-4 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                Khôi phục mặc định
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-sm bg-[#2D463E] hover:bg-[#1f332d] text-white text-xs font-sans uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#E5E1D8]" />
                  <span>Lưu Thay Đổi Quán</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Security & Password Settings */}
        {activeTab === 'password' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newPass !== confirmPass) {
                setPassStatus({ success: false, message: 'Mật khẩu mới và xác nhận không khớp!' });
                return;
              }
              if (newPass.length < 4) {
                setPassStatus({ success: false, message: 'Mật khẩu mới phải có ít nhất 4 ký tự.' });
                return;
              }
              const res = onChangeAdminPassword(oldPass, newPass);
              setPassStatus(res);
              if (res.success) {
                setOldPass('');
                setNewPass('');
                setConfirmPass('');
              }
            }}
            className="p-6 overflow-y-auto flex-1 space-y-6"
          >
            <div className="bg-[#F4F1EA] p-4 rounded-sm border-l-2 border-[#2D463E] flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-[#2D463E] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-sans font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Thay Đổi Mật Khẩu Đăng Nhập Quản Trị
                </p>
                <p className="text-xs text-[#1A1A1A]/70 font-sans mt-0.5">
                  Đổi mật khẩu bảo vệ trung tâm quản trị bếp. Khách hàng xem ứng dụng sẽ không có quyền chỉnh sửa menu trừ khi có mật khẩu này.
                </p>
              </div>
            </div>

            {passStatus && (
              <div
                className={`p-3.5 rounded-sm text-xs font-sans font-bold flex items-center gap-2 ${
                  passStatus.success
                    ? 'bg-[#2D463E] text-white'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {passStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#E5E1D8]" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                )}
                <span>{passStatus.message}</span>
              </div>
            )}

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => {
                    setOldPass(e.target.value);
                    setPassStatus(null);
                  }}
                  placeholder="Nhập mật khẩu hiện tại..."
                  required
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                    setPassStatus(null);
                  }}
                  placeholder="Nhập mật khẩu mới..."
                  required
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                    setPassStatus(null);
                  }}
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                  className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/10">
              <span className="text-xs text-[#1A1A1A]/50 italic">
                * Mật khẩu lưu an toàn trong hệ thống của bếp.
              </span>
              <button
                type="submit"
                className="px-6 py-2 rounded-sm bg-[#2D463E] hover:bg-[#1f332d] text-white text-xs font-sans uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#E5E1D8]" />
                <span>Cập Nhật Mật Khẩu</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        {activeTab === 'dishes' && (
          <div className="bg-[#F4F1EA] px-6 py-3 border-t border-black/10 flex items-center justify-between text-xs font-sans shrink-0">
            <span className="text-[#1A1A1A]/70">
              Tổng số món: <strong className="text-[#1A1A1A]">{dishes.length}</strong> • Đang có sẵn:{' '}
              <strong className="text-[#2D463E]">{dishes.length - soldOutCount}</strong> • Tạm hết hôm nay:{' '}
              <strong className="text-[#C05A3D]">{soldOutCount}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white font-sans text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
