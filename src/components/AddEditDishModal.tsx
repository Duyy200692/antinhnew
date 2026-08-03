import React, { useState, useEffect } from 'react';
import { DishItem, DayOfWeek, DishCategory } from '../types';
import { DAYS_OF_WEEK, CATEGORIES } from '../data/mockDishes';
import { X, Save, Plus, Trash2, Check, Sparkles, Upload, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { compressImageToWebp, uploadWebpImageToFirebase } from '../utils/imageUtils';

interface AddEditDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: DishItem) => void;
  onDelete?: (dishId: string) => void;
  initialDish?: DishItem | null;
}

export const AddEditDishModal: React.FC<AddEditDishModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDish,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Phần');
  const [category, setCategory] = useState<DishCategory>('daily_main');
  const [availableDays, setAvailableDays] = useState<DayOfWeek[]>(['all']);
  const [image, setImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [prepTime, setPrepTime] = useState('5 - 10 phút');
  const [isAvailableToday, setIsAvailableToday] = useState(true);

  // WebP Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [webpStats, setWebpStats] = useState<{ orig: number; comp: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // High quality Unsplash food presets
  const IMAGE_PRESETS = [
    {
      label: 'Món nước / Bún / Phở',
      url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Cơm chay / Cơm tấm',
      url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Nấm / Chà bông / Khổ qua',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Xôi chay / Bánh mì',
      url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Bánh hạt ngũ cốc',
      url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    },
  ];

  useEffect(() => {
    if (initialDish) {
      setName(initialDish.name);
      setDescription(initialDish.description);
      setPrice(initialDish.price);
      setUnit(initialDish.unit);
      setCategory(initialDish.category);
      setAvailableDays(initialDish.availableDays);
      setImage(initialDish.image);
      setTagsInput(initialDish.tags.join(', '));
      setPrepTime(initialDish.prepTime);
      setIsAvailableToday(initialDish.isAvailableToday);
    } else {
      setName('');
      setDescription('');
      setPrice('45.000đ');
      setUnit('Phần');
      setCategory('daily_main');
      setAvailableDays(['all']);
      setImage(IMAGE_PRESETS[1].url);
      setTagsInput('Món chay, Thơm ngon');
      setPrepTime('5 - 10 phút');
      setIsAvailableToday(true);
    }
    setWebpStats(null);
  }, [initialDish, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tập tin hình ảnh hợp lệ.');
      return;
    }
    setIsUploadingImage(true);
    setWebpStats(null);
    try {
      // Automatically compress & convert to .webp format
      const { webpDataUrl, originalSize, compressedSize } = await compressImageToWebp(file, 1200, 0.82);
      setWebpStats({ orig: originalSize, comp: compressedSize });

      // Upload to Firebase Storage or fall back seamlessly to compressed .webp Data URL
      const finalUrl = await uploadWebpImageToFirebase(webpDataUrl, 'menu_dishes');
      setImage(finalUrl);
    } catch (err) {
      console.error('Lỗi nén và tải ảnh .webp:', err);
      alert('Có lỗi khi nén ảnh sang định dạng .webp. Vui lòng thử lại.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleToggleDay = (dayId: DayOfWeek) => {
    if (dayId === 'all') {
      setAvailableDays(['all']);
      return;
    }

    let updated = availableDays.filter((d) => d !== 'all');
    if (updated.includes(dayId)) {
      updated = updated.filter((d) => d !== dayId);
    } else {
      updated = [...updated, dayId];
    }

    if (updated.length === 0) {
      updated = ['all'];
    }
    setAvailableDays(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const dishItem: DishItem = {
      id: initialDish ? initialDish.id : `dish-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      unit: unit.trim(),
      category,
      availableDays: availableDays.length > 0 ? availableDays : ['all'],
      image: image.trim() || IMAGE_PRESETS[0].url,
      isAvailableToday,
      tags,
      prepTime: prepTime.trim() || 'Có sẵn',
    };

    onSave(dishItem);
    onClose();
  };

  const isEditing = !!initialDish;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-2xl bg-[#FDFCFB] text-[#1A1A1A] rounded-lg shadow-2xl overflow-hidden border border-black/10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#F4F1EA] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🪷</span>
            <h3 className="font-serif font-bold text-xl uppercase tracking-tight text-[#1A1A1A]">
              {isEditing ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới Vào Menu'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] transition-colors text-[#1A1A1A] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Tên món */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
              Tên món ăn chay *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cơm tấm chay sườn lúa mạch / Xôi gấc..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-serif font-bold"
            />
          </div>

          {/* Danh mục & Đơn vị / Giá */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Danh mục món
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DishCategory)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
              >
                {CATEGORIES.filter((c) => c.id !== 'all_categories').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Giá món (VD: 45.000đ)
              </label>
              <input
                type="text"
                placeholder="45.000đ"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-serif font-bold text-[#C05A3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Đơn vị (Phần/Hũ/Ổ)
              </label>
              <input
                type="text"
                placeholder="Phần / Hũ 200g / Ổ"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
              />
            </div>
          </div>

          {/* Ngày áp dụng (Cố định cả tuần vs Ngày cụ thể) */}
          <div className="p-4 rounded-sm bg-[#F4F1EA] border border-black/10">
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              Ngày áp dụng (Món bán cả tuần hay Món chính thay đổi theo ngày?)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleDay('all')}
                className={`px-3 py-1.5 rounded-sm text-xs font-sans uppercase tracking-wider font-bold border transition-all cursor-pointer ${
                  availableDays.includes('all')
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                    : 'bg-[#FDFCFB] text-[#1A1A1A]/70 border-black/10 hover:bg-[#E5E1D8]'
                }`}
              >
                Cố định cả tuần (Tất cả ngày)
              </button>

              {DAYS_OF_WEEK.filter((d) => d.id !== 'all').map((day) => {
                const isChecked = availableDays.includes(day.id) && !availableDays.includes('all');
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-sans uppercase tracking-wider font-bold border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#2D463E] text-white border-[#2D463E] shadow-xs'
                        : 'bg-[#FDFCFB] text-[#1A1A1A]/70 border-black/10 hover:bg-[#E5E1D8]'
                    }`}
                  >
                    {day.shortLabel}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#1A1A1A]/60 font-sans mt-2">
              • Món làm sẵn như Chà Bông, Nấm, Xôi Bánh chọn <b>"Cố định cả tuần"</b>.
              <br />• Món cơm/bún/phở theo ngày thì chọn cụ thể ngày (VD: Thứ 2, Thứ 5).
            </p>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
              Mô tả thành phần / hương vị
            </label>
            <textarea
              rows={3}
              placeholder="VD: Làm từ 100% chân nấm hương rừng Tây Bắc / Nước dùng hầm rau củ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-sans"
            />
          </div>

          {/* Hình ảnh: Tải lên tự động nén WEBP hoặc nhập URL / chọn mẫu */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Hình ảnh món ăn (Tải lên PNG/JPG ➔ Tự động nén .WEBP)
              </label>
              {webpStats && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D463E] text-white font-sans text-xs font-bold shadow-xs border border-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    ⚡ Đã nén .WEBP: {(webpStats.orig / 1024).toFixed(0)} KB ➔ {(webpStats.comp / 1024).toFixed(0)} KB
                    ({Math.round((1 - webpStats.comp / webpStats.orig) * 100)}% tiết kiệm)
                  </span>
                </span>
              )}
            </div>

            {/* Drag and Drop / Click Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('dish-image-file-input')?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#C05A3D] bg-[#C05A3D]/5'
                  : 'border-black/20 bg-[#F4F1EA]/80 hover:bg-[#F4F1EA] hover:border-[#C05A3D]/60'
              }`}
            >
              <input
                id="dish-image-file-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {image ? (
                  <div className="relative shrink-0">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-16 h-16 rounded-md object-cover border border-black/15 shadow-xs"
                    />
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-[#C05A3D] text-white text-[9px] font-sans font-extrabold rounded uppercase tracking-wider shadow-xs">
                      WEBP
                    </span>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
                    <Upload className="w-5 h-5 text-[#C05A3D]" />
                  </div>
                )}
                <div className="text-left">
                  <p className="font-sans text-xs font-bold text-[#1A1A1A]">
                    {isUploadingImage ? (
                      <span className="inline-flex items-center gap-1.5 text-[#C05A3D]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tự động nén PNG/JPG sang định dạng .WEBP...
                      </span>
                    ) : (
                      'Chọn hoặc kéo thả ảnh món ăn (.png, .jpg) từ thiết bị'
                    )}
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/70 font-sans mt-0.5">
                    Hệ thống sẽ tự động chuyển đổi mọi ảnh (.png, .jpg) thành <b>.WEBP</b> siêu nhẹ, giúp tải menu tức thì.
                  </p>
                </div>
              </div>
            </div>

            {/* Manual URL Input & Presets */}
            <div className="mt-2.5">
              <input
                type="url"
                placeholder="Hoặc nhập đường dẫn URL hình ảnh (https://images.unsplash.com/...)"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setWebpStats(null);
                }}
                className="w-full px-4 py-2 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-xs focus:outline-none focus:ring-1 focus:ring-[#C05A3D] font-mono"
              />

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-[#1A1A1A]/60 font-medium mr-1">
                  Hoặc chọn mẫu ảnh nhanh:
                </span>
                {IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImage(preset.url);
                      setWebpStats(null);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-[#F4F1EA] hover:bg-[#E5E1D8] text-[#1A1A1A] text-xs font-sans font-semibold border border-black/10 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags & Thời gian chuẩn bị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Thẻ món (cách nhau bởi dấu phẩy)
              </label>
              <input
                type="text"
                placeholder="VD: Đặc sản Tây Bắc, Ít béo, Chay thuần"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Thời gian chuẩn bị / Tình trạng
              </label>
              <input
                type="text"
                placeholder="VD: Có sẵn liền / 5 - 10 phút"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4F1EA] border border-black/10 text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 focus:ring-[#C05A3D]"
              />
            </div>
          </div>

          {/* Trạng thái sẵn có hôm nay */}
          <div className="flex items-center justify-between p-4 rounded-sm bg-[#F4F1EA] border border-black/10">
            <span className="text-sm font-sans font-bold text-[#1A1A1A]">
              Trạng thái phục vụ hôm nay
            </span>
            <button
              type="button"
              onClick={() => setIsAvailableToday(!isAvailableToday)}
              className={`px-4 py-1.5 rounded-sm text-xs font-sans uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAvailableToday
                  ? 'bg-[#2D463E] text-white'
                  : 'bg-[#C05A3D] text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAvailableToday ? 'Đang Sẵn Có' : 'Tạm Hết Món'}</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-black/10 flex items-center justify-between gap-3">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xoá món chay này khỏi menu?')) {
                    onDelete(initialDish.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-sm bg-red-50 hover:bg-red-100 text-red-700 font-sans uppercase tracking-wider font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xoá Món</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-sm bg-[#E5E1D8] hover:bg-[#D9D1C2] text-[#1A1A1A] text-xs sm:text-sm font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white text-xs sm:text-sm font-sans uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Lưu Thay Đổi' : 'Thêm Vào Menu'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
