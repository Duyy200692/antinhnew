import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DishItem, DayOfWeek, DishCategory, ShopInfo } from './types';
import { INITIAL_DISHES, SHOP_INFO as DEFAULT_SHOP_INFO } from './data/mockDishes';
import {
  filterDishes,
  getDishesCountByDay,
  getCategoryCounts,
  getDayLabel,
  getTodayDayOfWeek,
} from './utils/dayUtils';
import { Header } from './components/Header';
import { DaySelector } from './components/DaySelector';
import { CategoryFilter } from './components/CategoryFilter';
import { DishCard } from './components/DishCard';
import { DishDetailModal } from './components/DishDetailModal';
import { AddEditDishModal } from './components/AddEditDishModal';
import { ShopInfoModal } from './components/ShopInfoModal';
import { WeeklyOverviewModal } from './components/WeeklyOverviewModal';
import { AdminModal } from './components/AdminModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { useShopInfo, saveStoredShopInfo } from './utils/shopInfoStorage';
import {
  loadDishesFromFirestore,
  syncDishesToFirestore,
  subscribeDishesFromFirestore,
  loadShopInfoFromFirestore,
  syncShopInfoToFirestore,
  subscribeShopInfoFromFirestore,
  loadAdminPasswordFromFirestore,
  syncAdminPasswordToFirestore,
} from './lib/firebase';
import { Sparkles, UtensilsCrossed, PlusCircle, RotateCcw, Calendar, PhoneCall, ShieldCheck, Lock, LogOut, CheckCircle2, X } from 'lucide-react';

const STORAGE_KEY = 'tam_chay_internal_menu_dishes_v1';
const ADMIN_AUTH_SESSION_KEY = 'tam_chay_admin_logged_in_v1';
const ADMIN_PASSWORD_KEY = 'tam_chay_admin_password_v1';
const DEFAULT_ADMIN_PASSWORD = 'antinh123';

export default function App() {
  const { shopInfo, saveShopInfo, resetShopInfo } = useShopInfo();

  // Admin Auth States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return (
      localStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true' ||
      sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true'
    );
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pendingSuccessCallbackRef = useRef<(() => void) | null>(null);

  // Auto dismiss toast message
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Dishes state with local persistence
  const [dishes, setDishes] = useState<DishItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load dishes from localStorage', e);
    }
    return INITIAL_DISHES;
  });

  // Load cloud data from Firestore on mount & subscribe to real-time updates
  useEffect(() => {
    async function initFirestoreData() {
      const cloudPass = await loadAdminPasswordFromFirestore();
      if (cloudPass) {
        setAdminPassword(cloudPass);
        localStorage.setItem(ADMIN_PASSWORD_KEY, cloudPass);
      }

      const cloudDishes = await loadDishesFromFirestore();
      if (cloudDishes && cloudDishes.length > 0) {
        setDishes(cloudDishes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudDishes));
      } else {
        // Nếu Firestore chưa có, ưu tiên lấy dữ liệu đã chỉnh sửa từ localStorage
        const savedLocal = localStorage.getItem(STORAGE_KEY);
        let dishesToInitialSync = INITIAL_DISHES;
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              dishesToInitialSync = parsed;
            }
          } catch (e) {
            console.error('Error parsing savedLocal:', e);
          }
        }
        await syncDishesToFirestore(dishesToInitialSync);
      }

      const cloudShopInfo = await loadShopInfoFromFirestore();
      if (cloudShopInfo) {
        saveStoredShopInfo(cloudShopInfo, false);
      } else {
        await syncShopInfoToFirestore(shopInfo);
      }
    }
    initFirestoreData();

    // Real-time listener: when any device adds or edits a dish or image, update state instantly
    const unsubscribeDishes = subscribeDishesFromFirestore((updatedDishes) => {
      if (updatedDishes && updatedDishes.length > 0) {
        setDishes((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(updatedDishes)) {
            return prev;
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDishes));
          return updatedDishes;
        });
      }
    });

    // Real-time listener: when any device edits shop info, update state instantly
    const unsubscribeShop = subscribeShopInfoFromFirestore((updatedShopInfo) => {
      if (updatedShopInfo) {
        saveStoredShopInfo(updatedShopInfo, false);
      }
    });

    return () => {
      unsubscribeDishes();
      unsubscribeShop();
    };
  }, []);

  // Filter States
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'today'>('today');
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all_categories'>('all_categories');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [selectedDishForDetail, setSelectedDishForDetail] = useState<DishItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<DishItem | null>(null);
  const [isShopInfoModalOpen, setIsShopInfoModalOpen] = useState<boolean>(false);
  const [isWeeklyOverviewModalOpen, setIsWeeklyOverviewModalOpen] = useState<boolean>(false);
  const [adminModalTab, setAdminModalTab] = useState<'dishes' | 'shop' | 'password'>('dishes');

  // Admin Auth Handlers
  const handleAdminLogin = useCallback((inputPassword: string): boolean => {
    if (inputPassword === adminPassword) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
      sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
      return true;
    }
    return false;
  }, [adminPassword]);

  const handleAdminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
    setIsAdminModalOpen(false);
    setToastMessage('Đã đăng xuất khỏi quyền Admin. Chuyển sang Chế độ Khách xem.');
  }, []);

  const handleChangeAdminPassword = useCallback((oldPass: string, newPass: string) => {
    if (oldPass !== adminPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại!' };
    }
    setAdminPassword(newPass);
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPass);
    syncAdminPasswordToFirestore(newPass);
    return { success: true, message: 'Đổi mật khẩu Admin thành công! Mật khẩu mới đã được cập nhật.' };
  }, [adminPassword]);

  const requireAdminLogin = useCallback((onSuccess?: () => void) => {
    if (isAdminLoggedIn) {
      if (onSuccess) onSuccess();
    } else {
      pendingSuccessCallbackRef.current = onSuccess || null;
      setIsAdminLoginModalOpen(true);
    }
  }, [isAdminLoggedIn]);

  const handleOpenAdminModal = useCallback((tab: 'dishes' | 'shop' | 'password' = 'dishes') => {
    setAdminModalTab(tab);
    requireAdminLogin(() => {
      setIsAdminModalOpen(true);
    });
  }, [requireAdminLogin]);

  // Reset category filter when switching days
  const handleSelectDay = (day: DayOfWeek | 'today') => {
    setSelectedDay(day);
  };

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return filterDishes(dishes, selectedDay, selectedCategory, searchQuery, onlyAvailable);
  }, [dishes, selectedDay, selectedCategory, searchQuery, onlyAvailable]);

  // Counts
  const dishesCountByDay = useMemo(() => {
    return getDishesCountByDay(dishes);
  }, [dishes]);

  const categoryCounts = useMemo(() => {
    return getCategoryCounts(dishes, selectedDay);
  }, [dishes, selectedDay]);

  // Handlers for dish CRUD & stock toggle
  const handleToggleStock = async (dishId: string, note?: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updatedList = dishes.map((dish) => {
      if (dish.id === dishId) {
        const isAvailableToday = note !== undefined ? false : !dish.isAvailableToday;
        const soldOutNote = note !== undefined ? note : isAvailableToday ? undefined : dish.soldOutNote;
        const updated = { ...dish, isAvailableToday, soldOutNote };
        if (selectedDishForDetail?.id === dishId) {
          setSelectedDishForDetail(updated);
        }
        return updated;
      }
      return dish;
    });
    setDishes(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    const synced = await syncDishesToFirestore(updatedList);
    if (!synced) {
      setToastMessage('⚠️ Đã cập nhật thiết bị này, nhưng chưa đồng bộ được Firebase.');
    }
  };

  const handleSaveDish = async (savedDish: DishItem) => {
    const exists = dishes.some((d) => d.id === savedDish.id);
    let updatedList: DishItem[];
    if (exists) {
      updatedList = dishes.map((d) => (d.id === savedDish.id ? savedDish : d));
    } else {
      updatedList = [savedDish, ...dishes];
    }
    setDishes(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    const synced = await syncDishesToFirestore(updatedList);
    if (synced) {
      setToastMessage(`Đã lưu & đồng bộ món "${savedDish.name}" thành công lên Firebase!`);
    } else {
      setToastMessage(`⚠️ Đã lưu món "${savedDish.name}", nhưng chưa đồng bộ Firebase.`);
    }
  };

  const handleDeleteDish = async (dishId: string) => {
    const targetDish = dishes.find((d) => d.id === dishId);
    const updatedList = dishes.filter((d) => d.id !== dishId);
    setDishes(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (selectedDishForDetail?.id === dishId) {
      setSelectedDishForDetail(null);
    }

    const synced = await syncDishesToFirestore(updatedList);
    if (synced) {
      setToastMessage(`Đã xoá món "${targetDish?.name || ''}" & đồng bộ Firebase!`);
    } else {
      setToastMessage(`⚠️ Đã xoá trên máy, nhưng chưa đồng bộ Firebase.`);
    }
  };

  const handleResetToDefault = () => {
    requireAdminLogin(async () => {
      if (confirm('Khôi phục danh sách món ăn gốc ban đầu của quán An Tịnh?')) {
        setDishes(INITIAL_DISHES);
        localStorage.removeItem(STORAGE_KEY);
        const synced = await syncDishesToFirestore(INITIAL_DISHES);
        if (synced) {
          setToastMessage('Đã khôi phục menu gốc & đồng bộ Firebase!');
        }
      }
    });
  };

  const handleResetAllToAvailable = async () => {
    if (confirm('Khôi phục tất cả các món thành "Sẵn có" hôm nay?')) {
      const updatedList = dishes.map((d) => ({ ...d, isAvailableToday: true, soldOutNote: undefined }));
      setDishes(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      const synced = await syncDishesToFirestore(updatedList);
      if (synced) {
        setToastMessage('Đã mở bếp ngày mới & đồng bộ tất cả món thành "Sẵn có"!');
      }
    }
  };

  const handleSaveShopInfoAndSync = async (newInfo: ShopInfo) => {
    saveShopInfo(newInfo);
    const synced = await syncShopInfoToFirestore(newInfo);
    if (synced) {
      setToastMessage('Đã cập nhật thông tin quán & đồng bộ Firebase!');
    } else {
      setToastMessage('⚠️ Đã lưu thông tin quán trên máy này, nhưng chưa đồng bộ Firebase.');
    }
  };

  // Computed Featured Dishes for Today (Nổi bật hôm nay)
  const todayFeaturedDishes = useMemo(() => {
    const today = getTodayDayOfWeek();
    return dishes.filter((dish) => {
      // Must be available today
      const matchesDay = dish.availableDays.includes('all') || dish.availableDays.includes(today);
      if (!matchesDay) return false;
      if (onlyAvailable && !dish.isAvailableToday) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(q);
        const matchesDesc = dish.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      // Featured if marked as featured or if it's today's main dish
      return dish.isFeatured || (dish.category === 'daily_main' && dish.availableDays.includes(today));
    });
  }, [dishes, onlyAvailable, searchQuery]);

  // Computed Fixed Dishes (Danh mục món cố định bán cả tuần)
  const fixedDishes = useMemo(() => {
    return filterDishes(dishes, 'all', selectedCategory, searchQuery, onlyAvailable);
  }, [dishes, selectedCategory, searchQuery, onlyAvailable]);

  // Get current heading label for active day
  const currentDayHeading = useMemo(() => {
    if (selectedDay === 'today') {
      const today = getTodayDayOfWeek();
      return `Thực Đơn Hôm Nay (${getDayLabel(today)})`;
    }
    if (selectedDay === 'all') {
      return 'Danh Mục Món Cố Định (Bán Cả Tuần)';
    }
    return `Thực Đơn Áp Dụng: ${getDayLabel(selectedDay)}`;
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#C05A3D]/20 selection:text-[#C05A3D]">
      {/* Editorial Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDay={selectedDay}
        setSelectedDay={handleSelectDay}
        onOpenAddModal={() => {
          requireAdminLogin(() => {
            setEditingDish(null);
            setIsAddModalOpen(true);
          });
        }}
        onOpenShopInfoModal={() => setIsShopInfoModalOpen(true)}
        onOpenWeeklyOverviewModal={() => setIsWeeklyOverviewModalOpen(true)}
        onOpenAdminModal={(tab) => handleOpenAdminModal(tab || 'dishes')}
        isAdminLoggedIn={isAdminLoggedIn}
        onRequireAdminLogin={requireAdminLogin}
        onLogoutAdmin={handleAdminLogout}
        shopInfo={shopInfo}
        totalDishesCount={dishes.length}
      />

      {/* Editorial Day Selector */}
      <DaySelector
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
        dishesCountByDay={dishesCountByDay}
      />

      {/* Editorial Category Pill Bar */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onlyAvailable={onlyAvailable}
        onToggleOnlyAvailable={() => setOnlyAvailable(!onlyAvailable)}
        categoryCounts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        {/* Section Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4 pb-3 sm:mb-6 sm:pb-4 border-b border-black/10">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
              <span className="w-2 h-2 rounded-full bg-[#C05A3D] animate-pulse" />
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#C05A3D] font-bold">
                Thực Đơn Chay An Tịnh • Mobile Menu
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
              {currentDayHeading}
            </h2>
            <p className="font-sans text-xs text-[#1A1A1A]/70 mt-1">
              {selectedDay === 'today'
                ? 'Tổng hợp món chính nổi bật hôm nay và các danh mục món chay làm sẵn cố định cả tuần.'
                : 'Menu chọn lọc món chay, xôi nếp cái hoa vàng & bánh mì chuẩn vị.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsWeeklyOverviewModalOpen(true)}
              className="px-4 py-2 rounded-sm bg-[#F4F1EA] hover:bg-[#E5E1D8] text-[#1A1A1A] font-sans text-xs uppercase tracking-wider font-bold border border-black/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#C05A3D]" />
              <span>Lịch Thực Đơn Tuần</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            PHẦN 1: 🔥 DANH MỤC MÓN NỔI BẬT HÔM NAY
            ======================================================== */}
        {(selectedDay === 'today' || selectedCategory === 'all_categories') && !searchQuery && (
          <section className="mb-8 bg-[#F4F1EA]/80 rounded-xl p-3.5 sm:p-5 border border-[#C05A3D]/20 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 pb-2 border-b border-[#C05A3D]/15">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#C05A3D] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  🔥
                </span>
                <div>
                  <h3 className="font-serif font-black text-lg sm:text-2xl text-[#1A1A1A] uppercase tracking-tight">
                    Món Nổi Bật Hôm Nay ({getDayLabel(getTodayDayOfWeek())})
                  </h3>
                  <p className="font-sans text-[11px] sm:text-xs text-[#1A1A1A]/70">
                    Món chính đặc sắc trong ngày & các món chay bán chạy nhất tại bếp
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#C05A3D] text-white font-sans text-[10px] uppercase font-bold tracking-wider hidden sm:inline-block">
                Hôm nay ăn gì?
              </span>
            </div>

            {todayFeaturedDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {todayFeaturedDishes.map((dish) => (
                  <DishCard
                    key={`featured-${dish.id}`}
                    dish={dish}
                    onSelectDish={(d) => setSelectedDishForDetail(d)}
                    onToggleStock={handleToggleStock}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onRequireAdminLogin={requireAdminLogin}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#1A1A1A]/60 italic py-2">
                Hôm nay chưa có đánh dấu món nổi bật. Vui lòng xem danh sách các món bên dưới.
              </p>
            )}
          </section>
        )}

        {/* ========================================================
            PHẦN 2: 📌 DANH MỤC MÓN CỐ ĐỊNH & TOÀN BỘ MENU
            ======================================================== */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/10">
            <span className="w-7 h-7 rounded-full bg-[#2D463E] text-white flex items-center justify-center text-sm font-bold shadow-xs">
              📌
            </span>
            <div>
              <h3 className="font-serif font-black text-lg sm:text-2xl text-[#1A1A1A] uppercase tracking-tight">
                {selectedDay === 'all'
                  ? 'Danh Mục Món Cố Định (Phục Vụ Cả Tuần)'
                  : 'Danh Sách Món Ăn'}
              </h3>
              <p className="font-sans text-[11px] sm:text-xs text-[#1A1A1A]/70">
                Chà bông nấm Tây Bắc, Sườn non lúa mạch, Xôi bắp nếp cái hoa vàng, Bánh mì chay & Bánh ngũ cốc
              </p>
            </div>
          </div>

          {/* Main Filtered Dishes Grid */}
          {filteredDishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onSelectDish={(d) => setSelectedDishForDetail(d)}
                  onToggleStock={handleToggleStock}
                  isAdminLoggedIn={isAdminLoggedIn}
                  onRequireAdminLogin={requireAdminLogin}
                />
              ))}
            </div>
          ) : (
            /* Editorial Empty State */
            <div className="bg-[#F4F1EA] rounded-lg border border-black/10 p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#E5E1D8] flex items-center justify-center mx-auto mb-3 text-[#C05A3D]">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2 uppercase tracking-tight">
                Không tìm thấy món ăn nào
              </h3>
              <p className="font-sans text-xs text-[#1A1A1A]/70 mb-5 leading-relaxed">
                {searchQuery
                  ? `Không có món chay nào khớp với từ khoá "${searchQuery}".`
                  : 'Thực đơn trong danh mục hoặc ngày được chọn hiện đang trống hoặc tạm hết món.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {(searchQuery || selectedCategory !== 'all_categories' || onlyAvailable) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all_categories');
                      setOnlyAvailable(false);
                    }}
                    className="px-4 py-2 rounded-sm bg-[#1A1A1A] hover:bg-[#2D463E] text-white font-sans text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    Xoá bộ lọc & tìm kiếm
                  </button>
                )}

                <button
                  onClick={() => {
                    requireAdminLogin(() => {
                      setEditingDish(null);
                      setIsAddModalOpen(true);
                    });
                  }}
                  className="px-4 py-2 rounded-sm bg-[#C05A3D] hover:bg-[#A0452C] text-white font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {!isAdminLoggedIn && <Lock className="w-3.5 h-3.5 text-white/80" />}
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Thêm món mới</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Action Bar for Mobile App Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] text-white py-2 px-3 border-t border-white/10 shadow-2xl flex items-center justify-around">
        <a
          href={`tel:${shopInfo.phone.replace(/[^0-9]/g, '')}`}
          className="flex flex-col items-center gap-0.5 text-[#E5E1D8] hover:text-[#C05A3D] active:scale-95 transition-transform"
        >
          <PhoneCall className="w-4 h-4 text-[#C05A3D]" />
          <span className="text-[10px] font-sans font-bold uppercase">Gọi điện</span>
        </a>

        <a
          href={shopInfo.zaloUrl || `https://zalo.me/${shopInfo.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-[#E5E1D8] hover:text-[#C05A3D] active:scale-95 transition-transform"
        >
          <span className="w-4 h-4 rounded-full bg-blue-500 text-white font-black text-[9px] flex items-center justify-center">Z</span>
          <span className="text-[10px] font-sans font-bold uppercase">Chat Zalo</span>
        </a>

        <button
          onClick={() => setIsWeeklyOverviewModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[#E5E1D8] hover:text-[#C05A3D] active:scale-95 transition-transform cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#C05A3D]" />
          <span className="text-[10px] font-sans font-bold uppercase">Lịch tuần</span>
        </button>

        <button
          onClick={() => setIsShopInfoModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[#E5E1D8] hover:text-[#C05A3D] active:scale-95 transition-transform cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#C05A3D]" />
          <span className="text-[10px] font-sans font-bold uppercase">Bếp An Tịnh</span>
        </button>
      </div>

      {/* Editorial Footer */}
      <footer className="mt-auto bg-[#F4F1EA] border-t border-black/10 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-black/10">
            {/* Col 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🪷</span>
                <span className="font-serif font-black text-xl uppercase tracking-tighter text-[#1A1A1A]">
                  {shopInfo.name}
                </span>
              </div>
              <p className="text-xs text-[#1A1A1A]/70 font-sans leading-relaxed max-w-md">
                {shopInfo.notice || shopInfo.slogan || 'Hệ thống thực đơn chay & xôi nếp cái hoa vàng cho nhân viên.'}
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#C05A3D] mb-3">
                Thời Gian Mở Cửa & Đặt Món
              </h4>
              <ul className="space-y-2 text-xs font-sans text-[#1A1A1A]/80">
                <li>
                  <span className="font-bold">Giờ mở cửa:</span> {shopInfo.openHours}
                </li>
                <li>
                  <span className="font-bold">Thời gian đặt món:</span> {shopInfo.orderHours || 'Báo suất món chính trước 09h00 sáng hàng ngày'}
                </li>
                <li>
                  <span className="font-bold">Người phụ trách:</span> {shopInfo.contactPerson} ({shopInfo.phone})
                </li>
                <li>
                  <span className="font-bold">Địa chỉ:</span> {shopInfo.address}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#1A1A1A]/50">
            <p>© {new Date().getFullYear()} {shopInfo.name} • Internal Kitchen Staff Menu System.</p>
            <p className="font-serif italic">Thanh Tịnh • An Nhiên • Dinh Dưỡng</p>
          </div>
        </div>
      </footer>

      {/* Dish Detail Modal */}
      <DishDetailModal
        dish={selectedDishForDetail}
        onClose={() => setSelectedDishForDetail(null)}
        onToggleStock={(id) => handleToggleStock(id)}
        onEditDish={(dish) => {
          setSelectedDishForDetail(null);
          setEditingDish(dish);
          setIsAddModalOpen(true);
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onRequireAdminLogin={requireAdminLogin}
      />

      {/* Add / Edit Dish Modal */}
      <AddEditDishModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDish(null);
        }}
        onSave={handleSaveDish}
        onDelete={handleDeleteDish}
        initialDish={editingDish}
      />

      {/* Shop Info Modal */}
      <ShopInfoModal
        isOpen={isShopInfoModalOpen}
        onClose={() => setIsShopInfoModalOpen(false)}
        shopInfo={shopInfo}
        onOpenAdminModal={(tab) => handleOpenAdminModal(tab || 'shop')}
      />

      {/* Weekly Overview Modal */}
      <WeeklyOverviewModal
        isOpen={isWeeklyOverviewModalOpen}
        onClose={() => setIsWeeklyOverviewModalOpen(false)}
        dishes={dishes}
        onSelectDay={(day) => handleSelectDay(day)}
      />

      {/* Admin Central Management Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialTab={adminModalTab}
        dishes={dishes}
        onToggleStock={handleToggleStock}
        onEditDish={(dish) => {
          setIsAdminModalOpen(false);
          setEditingDish(dish);
          setIsAddModalOpen(true);
        }}
        onAddNewDish={() => {
          setIsAdminModalOpen(false);
          setEditingDish(null);
          setIsAddModalOpen(true);
        }}
        onDeleteDish={handleDeleteDish}
        onResetAllToAvailable={handleResetAllToAvailable}
        shopInfo={shopInfo}
        onSaveShopInfo={handleSaveShopInfoAndSync}
        onResetShopInfo={resetShopInfo}
        onLogoutAdmin={handleAdminLogout}
        onChangeAdminPassword={handleChangeAdminPassword}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => {
          setIsAdminLoginModalOpen(false);
          pendingSuccessCallbackRef.current = null;
        }}
        onLogin={handleAdminLogin}
        onSuccess={() => {
          setIsAdminLoginModalOpen(false);
          setToastMessage('Đăng nhập Admin thành công! Đã bật quyền quản lý bếp.');
          if (pendingSuccessCallbackRef.current) {
            const cb = pendingSuccessCallbackRef.current;
            pendingSuccessCallbackRef.current = null;
            cb();
          }
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#2D463E] text-white px-4 py-3 rounded-sm shadow-2xl border border-[#C05A3D]/40 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#C05A3D] shrink-0" />
          <span className="text-xs sm:text-sm font-sans font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
