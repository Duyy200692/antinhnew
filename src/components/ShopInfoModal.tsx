import React, { useState, useEffect } from 'react';
import { X, Phone, MapPin, Clock, ShieldCheck, HeartHandshake, Info, ShoppingBag, Send, Check, Edit3, Save } from 'lucide-react';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '../data/mockDishes';
import { ShopInfo } from '../types';

interface ShopInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopInfo?: ShopInfo;
  onSaveShopInfo?: (info: ShopInfo) => void;
  onOpenAdminModal?: (tab?: 'dishes' | 'shop' | 'password') => void;
}

export const ShopInfoModal: React.FC<ShopInfoModalProps> = ({
  isOpen,
  onClose,
  shopInfo,
  onSaveShopInfo,
  onOpenAdminModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'edit' | 'order_xoi'>('info');

  const safeInfo: ShopInfo = {
    ...DEFAULT_SHOP_INFO,
    ...(shopInfo || {}),
  };

  // Direct Edit Form States
  const [formName, setFormName] = useState(safeInfo.name);
  const [formBadgeText, setFormBadgeText] = useState(safeInfo.badgeText || 'Bếp Nội Bộ');
  const [formAddress, setFormAddress] = useState(safeInfo.address);
  const [formPhone, setFormPhone] = useState(safeInfo.phone);
  const [formContactPerson, setFormContactPerson] = useState(safeInfo.contactPerson);
  const [formOpenHours, setFormOpenHours] = useState(safeInfo.openHours);
  const [formOrderHours, setFormOrderHours] = useState(safeInfo.orderHours);
  const [formSlogan, setFormSlogan] = useState(safeInfo.slogan);
  const [formNotice, setFormNotice] = useState(safeInfo.notice);
  const [formZaloUrl, setFormZaloUrl] = useState(safeInfo.zaloUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync edit form with current shopInfo props whenever modal opens or shopInfo updates
  useEffect(() => {
    if (isOpen) {
      const s = { ...DEFAULT_SHOP_INFO, ...(shopInfo || {}) };
      setFormName(s.name || '');
      setFormBadgeText(s.badgeText || 'Bếp Nội Bộ');
      setFormAddress(s.address || '');
      setFormPhone(s.phone || '');
      setFormContactPerson(s.contactPerson || '');
      setFormOpenHours(s.openHours || '');
      setFormOrderHours(s.orderHours || '');
      setFormSlogan(s.slogan || '');
      setFormNotice(s.notice || '');
      setFormZaloUrl(s.zaloUrl || '');
    }
  }, [isOpen, shopInfo]);

  // Quick Xoi Order Form State
  const [xoiType, setXoiType] = useState('Xôi Hạt Sen Nếp Cái Hoa Vàng');
  const [quantity, setQuantity] = useState(5);
  const [note, setNote] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveDirectShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShopInfo = {
      ...safeInfo,
      name: formName.trim() || safeInfo.name || DEFAULT_SHOP_INFO.name,
      badgeText: formBadgeText.trim() || safeInfo.badgeText || 'Bếp Nội Bộ',
      address: formAddress.trim() || safeInfo.address || DEFAULT_SHOP_INFO.address,
      phone: formPhone.trim() || safeInfo.phone || DEFAULT_SHOP_INFO.phone,
      contactPerson: formContactPerson.trim() || safeInfo.contactPerson || DEFAULT_SHOP_INFO.contactPerson,
      openHours: formOpenHours.trim() || safeInfo.openHours || DEFAULT_SHOP_INFO.openHours,
      orderHours: formOrderHours.trim() || safeInfo.orderHours || DEFAULT_SHOP_INFO.orderHours,
      slogan: formSlogan.trim() || safeInfo.slogan || DEFAULT_SHOP_INFO.slogan,
      notice: formNotice.trim() || safeInfo.notice || DEFAULT_SHOP_INFO.notice,
      zaloUrl: formZaloUrl.trim() || safeInfo.zaloUrl || DEFAULT_SHOP_INFO.zaloUrl,
    };

    if (onSaveShopInfo) {
      onSaveShopInfo(updated);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveSubTab('info');
    }, 1500);
  };

  const handleOrderViaZalo = () => {
    const text = `Kính gửi Bếp ${safeInfo.name},\nTôi muốn đặt: ${quantity} phần ${xoiType}.\nGhi chú: ${note || 'Không có'}.\nVui lòng xác nhận đơn đặt xôi của tôi!`;
    const encoded = encodeURIComponent(text);
    const zaloUrl = safeInfo.zaloUrl ? `${safeInfo.zaloUrl}?text=${encoded}` : `https://zalo.me/${safeInfo.phone.replace(/\s+/g, '')}`;
    window.open(zaloUrl, '_blank');
  };

  const handleCopyOrderText = () => {
    const text = `Đặt Xôi - Bếp ${safeInfo.name}:\n- Món: ${xoiType}\n- Số lượng: ${quantity} phần\n- Ghi chú: ${note || 'Không có'}\n- LH Bếp: ${safeInfo.contactPerson} (${safeInfo.phone})`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFCFB] text-[#1A1A1A] rounded-lg max-w-2xl w-full border border-black/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#F4F1EA] px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5E1D8] flex items-center justify-center text-[#C05A3D] text-lg font-bold">
              🪷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-[#1A1A1A]">
                  {safeInfo.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('edit')}
                  className="p-1.5 rounded bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer flex items-center gap-1 text-xs font-sans font-bold"
                  title="Chỉnh sửa thông tin quán"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                  <span className="hidden sm:inline">Chỉnh Sửa</span>
                </button>
              </div>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C05A3D] font-bold">
                Quy Chế & Đặt Xôi Bếp Nội Bộ
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-black/10 bg-[#E5E1D8]/50 p-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('info')}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'info'
                ? 'bg-[#2D463E] text-white shadow-xs'
                : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Thông Tin Quán</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('edit')}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'edit'
                ? 'bg-[#C05A3D] text-white shadow-xs'
                : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh Sửa Quán</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('order_xoi')}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'order_xoi'
                ? 'bg-[#2D463E] text-white shadow-xs'
                : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đặt Xôi Cúng</span>
          </button>
        </div>

        {/* Body Tab 1: Info View */}
        {activeSubTab === 'info' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Intro notice */}
            <div className="bg-[#F4F1EA] p-4 rounded-sm border-l-2 border-[#C05A3D] flex items-start justify-between gap-3 group">
              <div className="flex items-start gap-3 flex-1">
                <Info className="w-5 h-5 text-[#C05A3D] shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-[#1A1A1A]/80 font-sans">
                  {safeInfo.notice ||
                    'App nội bộ dành cho nhân viên xem thực đơn hàng ngày, đặt xôi, bánh mì chà bông chay và nắm lịch món chính luân phiên của bếp ăn theo từng thứ trong tuần.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('edit')}
                className="p-1.5 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer shrink-0"
                title="Sửa thông báo nội bộ"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
              </button>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider font-bold text-[#C05A3D]">
                    <Clock className="w-4 h-4" />
                    <span>Giờ Bếp Mở Cửa</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('edit')}
                    className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                    title="Sửa giờ bếp mở cửa"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                  </button>
                </div>
                <p className="text-sm font-serif font-bold text-[#1A1A1A]">{safeInfo.openHours}</p>
                <p className="text-xs text-[#1A1A1A]/60 mt-1">Phục vụ các ngày trong tuần</p>
              </div>

              <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider font-bold text-[#C05A3D]">
                    <Info className="w-4 h-4 text-[#C05A3D]" />
                    <span>Thời Gian Báo Đặt Món</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('edit')}
                    className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                    title="Sửa thời gian báo đặt món"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                  </button>
                </div>
                <p className="text-sm font-serif font-bold text-[#1A1A1A]">
                  {safeInfo.orderHours || 'Báo suất món chính trước 09h00 sáng hàng ngày'}
                </p>
                <p className="text-xs text-[#1A1A1A]/60 mt-1">Báo số lượng sớm để bếp chuẩn bị</p>
              </div>

              <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5 sm:col-span-2 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider font-bold text-[#2D463E]">
                    <Phone className="w-4 h-4" />
                    <span>Người Phụ Trách & Hotline</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('edit')}
                    className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                    title="Sửa thông tin liên hệ / hotline"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                  </button>
                </div>
                <p className="text-sm font-serif font-bold text-[#1A1A1A]">{safeInfo.contactPerson}</p>
                <p className="text-xs text-[#1A1A1A]/80 font-mono mt-1">SĐT/Zalo đặt món: {safeInfo.phone}</p>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5 flex items-start justify-between gap-3 group">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C05A3D] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-[#1A1A1A] mb-1">
                    Địa Chỉ Bếp Ăn
                  </h3>
                  <p className="text-sm text-[#1A1A1A]/80 font-serif">{safeInfo.address}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('edit')}
                className="p-1.5 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer shrink-0"
                title="Sửa địa chỉ bếp"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
              </button>
            </div>

            {/* Policies / Notes */}
            <div className="border-t border-black/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#1A1A1A] uppercase tracking-wide">
                  Lưu Ý Cho Nhân Viên & Đặt Món
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('edit')}
                  className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                  title="Chỉnh sửa khẩu hiệu & ghi chú bếp"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                </button>
              </div>

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
        )}

        {/* Body Tab 2: Direct Edit Form */}
        {activeSubTab === 'edit' && (
          <form onSubmit={handleSaveDirectShopInfo} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {saveSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-sm text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Đã cập nhật & đồng bộ thông tin quán thành công lên Firebase!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Tên Quán / Bếp Ăn *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: AN TỊNH - MENU CHAY NỘI BỘ"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Danh Hiệu / Huy Hiệu
                </label>
                <input
                  type="text"
                  value={formBadgeText}
                  onChange={(e) => setFormBadgeText(e.target.value)}
                  placeholder="VD: Bếp Nội Bộ"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Số Điện Thoại Hotline *
                </label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="VD: 0909 310 567"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Người Phụ Trách *
                </label>
                <input
                  type="text"
                  required
                  value={formContactPerson}
                  onChange={(e) => setFormContactPerson(e.target.value)}
                  placeholder="VD: Ms. Bình"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Giờ Mở Cửa Bếp *
                </label>
                <input
                  type="text"
                  required
                  value={formOpenHours}
                  onChange={(e) => setFormOpenHours(e.target.value)}
                  placeholder="VD: 06:30 - 20:30 (Thứ 2 - Chủ Nhật)"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#C05A3D] mb-1">
                  Thời Gian Nhận Đặt Món *
                </label>
                <input
                  type="text"
                  required
                  value={formOrderHours}
                  onChange={(e) => setFormOrderHours(e.target.value)}
                  placeholder="VD: Báo suất món chính trước 09h00 sáng"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-[#C05A3D]/40 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-medium"
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
                  placeholder="VD: 121/7 (nhà sau) Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Đường Dẫn Zalo / Fanpage
                </label>
                <input
                  type="text"
                  value={formZaloUrl}
                  onChange={(e) => setFormZaloUrl(e.target.value)}
                  placeholder="VD: https://zalo.me/0909310567"
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Slogan & Lời Chào Giới Thiệu
                </label>
                <textarea
                  rows={2}
                  value={formSlogan}
                  onChange={(e) => setFormSlogan(e.target.value)}
                  placeholder="VD: Chúc quý khách có một sức khoẻ tốt..."
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Thông Báo Nội Bộ Cho Nhân Viên
                </label>
                <textarea
                  rows={2}
                  value={formNotice}
                  onChange={(e) => setFormNotice(e.target.value)}
                  placeholder="VD: App nội bộ dành cho nhân viên xem thực đơn..."
                  className="w-full px-3 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setActiveSubTab('info')}
                className="px-4 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-sm bg-[#C05A3D] hover:bg-[#a54a30] text-white text-xs font-sans uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#E5E1D8]" />
                <span>Lưu & Đồng Bộ Firebase</span>
              </button>
            </div>
          </form>
        )}

        {/* Body Tab 3: Order Xoi */}
        {activeSubTab === 'order_xoi' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="bg-amber-50 p-4 rounded-sm border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <ShoppingBag className="w-4 h-4 text-[#C05A3D]" />
                Đặt Xôi Nếp Cái Hoa Vàng & Bánh Mì Chay Số Lượng Lớn
              </p>
              <p className="text-amber-800/80">
                Bếp An Tịnh nhận nấu xôi cúng rằm, xôi hạt sen, xôi lá cẩm cho các sự kiện, tiệc nội bộ công ty. Vui lòng báo số lượng trước 1 ngày.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Chọn Loại Xôi / Món Đặt Trước
                </label>
                <select
                  value={xoiType}
                  onChange={(e) => setXoiType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F1EA] border border-black/10 rounded-sm font-serif font-bold text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                >
                  <option value="Xôi Hạt Sen Nếp Cái Hoa Vàng">Xôi Hạt Sen Nếp Cái Hoa Vàng - 35.000đ/Phần</option>
                  <option value="Xôi Lá Cẩm Đậu Xanh Dừa Sợi">Xôi Lá Cẩm Đậu Xanh Dừa Sợi - 35.000đ/Phần</option>
                  <option value="Bánh Mì Chà Bông Nấm Chay">Bánh Mì Chà Bông Nấm Chay - 30.000đ/Phần</option>
                  <option value="Mâm Xôi Cúng Rằm (Lớn)">Mâm Xôi Cúng Rằm (Lớn) - 150.000đ/Mâm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Số Lượng Suất Đặt
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded bg-[#E5E1D8] hover:bg-[#D9D1C2] text-lg font-bold flex items-center justify-center text-[#1A1A1A]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center py-1.5 bg-[#F4F1EA] border border-black/10 rounded-sm font-serif font-bold text-base text-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded bg-[#E5E1D8] hover:bg-[#D9D1C2] text-lg font-bold flex items-center justify-center text-[#1A1A1A]"
                  >
                    +
                  </button>
                  <span className="text-xs font-sans text-black/60 italic">suất / mâm</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                  Ghi Chú Đóng Gói / Thời Gian Giao
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Nhận lúc 07h30 sáng mai, gói lá chuối riêng..."
                  className="w-full px-3 py-2 bg-[#F4F1EA] border border-black/10 rounded-sm font-sans text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOrderViaZalo}
                  className="w-full sm:flex-1 py-2.5 bg-[#2D463E] hover:bg-[#1f332d] text-white rounded-sm font-sans text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 text-[#E5E1D8]" />
                  <span>Gửi Đơn Đặt Xôi Qua Zalo Bếp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyOrderText}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] rounded-sm font-sans text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-emerald-700" /> : null}
                  <span>{copiedSuccess ? 'Đã Sao Chép!' : 'Sao Chép Nội Dung'}</span>
                </button>
              </div>

              <div className="p-3 rounded bg-[#F4F1EA] border border-black/10 flex items-center justify-between text-xs text-[#1A1A1A]/80">
                <span>Hotline trực tiếp: <strong>{safeInfo.phone}</strong> ({safeInfo.contactPerson})</span>
                <a
                  href={`tel:${safeInfo.phone.replace(/\s+/g, '')}`}
                  className="px-2.5 py-1 bg-[#C05A3D] text-white rounded-sm font-bold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi Ngay</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#F4F1EA] px-6 py-4 border-t border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/70 font-sans font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2D463E] inline-block" />
            <span>Bếp An Tịnh • Thông tin & Chỉnh sửa</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white font-sans uppercase tracking-wider font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

