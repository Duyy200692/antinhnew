import React, { useState } from 'react';
import { X, Phone, MapPin, Clock, ShieldCheck, HeartHandshake, Info, ShoppingBag, Send, Check, Edit3 } from 'lucide-react';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '../data/mockDishes';
import { ShopInfo } from '../types';

interface ShopInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopInfo?: ShopInfo;
  onOpenAdminModal?: (tab?: 'dishes' | 'shop' | 'password') => void;
}

export const ShopInfoModal: React.FC<ShopInfoModalProps> = ({
  isOpen,
  onClose,
  shopInfo,
  onOpenAdminModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'order_xoi'>('info');

  // Quick Xoi Order Form State
  const [xoiType, setXoiType] = useState('Xôi Hạt Sen Nếp Cái Hoa Vàng');
  const [quantity, setQuantity] = useState(5);
  const [note, setNote] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const safeInfo: ShopInfo = {
    ...DEFAULT_SHOP_INFO,
    ...(shopInfo || {}),
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
      <div className="bg-[#FDFCFB] text-[#1A1A1A] rounded-lg max-w-xl w-full border border-black/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                {onOpenAdminModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminModal('shop');
                    }}
                    className="p-1 rounded bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                    title="Chỉnh sửa tên & thông tin quán"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                  </button>
                )}
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
            <span>Thông Tin Quán & Giờ Bếp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('order_xoi')}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'order_xoi'
                ? 'bg-[#C05A3D] text-white shadow-xs'
                : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đặt Xôi Cúng & Tiệc Chay</span>
          </button>
        </div>

        {/* Body Tab 1: Info */}
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
              {onOpenAdminModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminModal('shop');
                  }}
                  className="p-1.5 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer shrink-0"
                  title="Sửa thông báo nội bộ"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                </button>
              )}
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F4F1EA] rounded-sm border border-black/5 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider font-bold text-[#C05A3D]">
                    <Clock className="w-4 h-4" />
                    <span>Giờ Bếp Mở Cửa</span>
                  </div>
                  {onOpenAdminModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminModal('shop');
                      }}
                      className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                      title="Sửa giờ bếp mở cửa"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                    </button>
                  )}
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
                  {onOpenAdminModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminModal('shop');
                      }}
                      className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                      title="Sửa thời gian báo đặt món"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                    </button>
                  )}
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
                  {onOpenAdminModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminModal('shop');
                      }}
                      className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                      title="Sửa thông tin liên hệ / hotline"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                    </button>
                  )}
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
              {onOpenAdminModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminModal('shop');
                  }}
                  className="p-1.5 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer shrink-0"
                  title="Sửa địa chỉ bếp"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                </button>
              )}
            </div>

            {/* Policies / Notes */}
            <div className="border-t border-black/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#1A1A1A] uppercase tracking-wide">
                  Lưu Ý Cho Nhân Viên & Đặt Món
                </h3>
                {onOpenAdminModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminModal('shop');
                    }}
                    className="p-1 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] hover:text-[#C05A3D] transition-colors cursor-pointer"
                    title="Chỉnh sửa khẩu hiệu & ghi chú bếp"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C05A3D]" />
                  </button>
                )}
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

        {/* Body Tab 2: Order Xoi */}
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
            <span>Bếp An Tịnh • Quy chế & Thông tin</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white font-sans uppercase tracking-wider font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
