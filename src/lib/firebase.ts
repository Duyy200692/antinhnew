import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { DishItem, ShopInfo } from '../types';

// Khởi tạo Firebase App & Services từ cấu hình Firebase JSON
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Firestore và Firebase Storage an toàn
let firestoreDb;
try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  if (dbId && dbId !== '(default)') {
    firestoreDb = getFirestore(app, dbId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (e) {
  console.warn('Error initializing named Firestore database, falling back to default:', e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const storage = getStorage(app);

// Các vị trí lưu trữ Firestore (hỗ trợ cả settings collection và root collections)
const DISHES_DOC_REF = () => doc(db, 'settings', 'menu_dishes_list');
const DISHES_ALT_DOC_REF = () => doc(db, 'menu_dishes_list', 'list');

const SHOP_INFO_DOC_REF = () => doc(db, 'settings', 'shop_info');
const SHOP_INFO_ALT_DOC_REF = () => doc(db, 'shop_info', 'main');

const ADMIN_AUTH_DOC_REF = () => doc(db, 'settings', 'admin_auth');
const ADMIN_AUTH_ALT_DOC_REF = () => doc(db, 'admin_auth', 'main');

/**
 * Helper: Trích xuất danh sách dishes từ dữ liệu Firestore snapshot
 * Hỗ trợ cả { list: [...] }, mảng trực tiếp, hoặc object có key dạng chỉ số "0", "1"...
 */
export function parseDishesFromSnapData(data: any): DishItem[] | null {
  if (!data) return null;
  if (Array.isArray(data.list) && data.list.length > 0) {
    return data.list as DishItem[];
  }
  if (Array.isArray(data) && data.length > 0) {
    return data as DishItem[];
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data).filter((k) => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) {
      const items = keys
        .map((k) => data[k])
        .filter((item) => item && typeof item === 'object' && item.id && item.name);
      if (items.length > 0) {
        return items as DishItem[];
      }
    }
  }
  return null;
}

/**
 * Real-time subscriber cho danh sách món ăn từ Firestore
 * Lắng nghe biến động đồng thời ở cả 2 đường dẫn để đảm bảo mọi thiết bị đều nhận dữ liệu ngay lập tức
 */
export function subscribeDishesFromFirestore(callback: (dishes: DishItem[]) => void) {
  const unsub1 = onSnapshot(
    DISHES_DOC_REF(),
    (snap) => {
      if (snap.exists()) {
        const dishes = parseDishesFromSnapData(snap.data());
        if (dishes && dishes.length > 0) {
          callback(dishes);
        }
      }
    },
    (err) => console.error('Error listening DISHES_DOC_REF:', err)
  );

  const unsub2 = onSnapshot(
    DISHES_ALT_DOC_REF(),
    (snap) => {
      if (snap.exists()) {
        const dishes = parseDishesFromSnapData(snap.data());
        if (dishes && dishes.length > 0) {
          callback(dishes);
        }
      }
    },
    (err) => console.error('Error listening DISHES_ALT_DOC_REF:', err)
  );

  return () => {
    unsub1();
    unsub2();
  };
}

/**
 * Load mật khẩu Admin từ Firestore
 */
export async function loadAdminPasswordFromFirestore(): Promise<string | null> {
  try {
    const snap = await getDoc(ADMIN_AUTH_DOC_REF());
    if (snap.exists() && snap.data()?.password) {
      return snap.data().password as string;
    }
    const altSnap = await getDoc(ADMIN_AUTH_ALT_DOC_REF());
    if (altSnap.exists() && altSnap.data()?.password) {
      return altSnap.data().password as string;
    }
  } catch (err) {
    console.error('Error loading admin password from Firestore:', err);
  }
  return null;
}

/**
 * Đồng bộ mật khẩu Admin lên Firestore
 */
export async function syncAdminPasswordToFirestore(password: string): Promise<void> {
  try {
    const payload = {
      password,
      updatedAt: new Date().toISOString(),
    };
    await Promise.allSettled([
      setDoc(ADMIN_AUTH_DOC_REF(), payload),
      setDoc(ADMIN_AUTH_ALT_DOC_REF(), payload),
    ]);
  } catch (err) {
    console.error('Error syncing admin password to Firestore:', err);
  }
}

/**
 * Tải toàn bộ danh sách món từ Firestore
 */
export async function loadDishesFromFirestore(): Promise<DishItem[] | null> {
  try {
    const snap = await getDoc(DISHES_DOC_REF());
    if (snap.exists()) {
      const dishes = parseDishesFromSnapData(snap.data());
      if (dishes && dishes.length > 0) return dishes;
    }
    const altSnap = await getDoc(DISHES_ALT_DOC_REF());
    if (altSnap.exists()) {
      const dishes = parseDishesFromSnapData(altSnap.data());
      if (dishes && dishes.length > 0) return dishes;
    }
  } catch (err) {
    console.error('Error loading dishes from Firestore:', err);
  }
  return null;
}

/**
 * Đồng bộ toàn bộ danh sách món ăn lên Firestore
 * Ghi đồng thời lên cả 2 vị trí để tất cả các phiên bản web/thiết bị đều cập nhật tức thì
 */
export async function syncDishesToFirestore(dishes: DishItem[]): Promise<boolean> {
  try {
    const sanitizedDishes = JSON.parse(JSON.stringify(dishes));
    const payload = {
      list: sanitizedDishes,
      updatedAt: new Date().toISOString(),
    };
    await Promise.allSettled([
      setDoc(DISHES_DOC_REF(), payload),
      setDoc(DISHES_ALT_DOC_REF(), payload),
    ]);
    console.log('Successfully synced dishes to Firestore:', sanitizedDishes.length);
    return true;
  } catch (err) {
    console.error('Error syncing dishes to Firestore:', err);
    return false;
  }
}

/**
 * Helper: Parse shop info từ snapshot
 */
export function parseShopInfoFromSnapData(data: any): ShopInfo | null {
  if (!data) return null;
  if (data.shopInfo && typeof data.shopInfo === 'object') {
    return data.shopInfo as ShopInfo;
  }
  if (data.name && data.phone) {
    return data as ShopInfo;
  }
  return null;
}

/**
 * Tải thông tin quán từ Firestore
 */
export async function loadShopInfoFromFirestore(): Promise<ShopInfo | null> {
  try {
    const snap = await getDoc(SHOP_INFO_DOC_REF());
    if (snap.exists()) {
      const info = parseShopInfoFromSnapData(snap.data());
      if (info) return info;
    }
    const altSnap = await getDoc(SHOP_INFO_ALT_DOC_REF());
    if (altSnap.exists()) {
      const info = parseShopInfoFromSnapData(altSnap.data());
      if (info) return info;
    }
  } catch (err) {
    console.error('Error loading shop info from Firestore:', err);
  }
  return null;
}

/**
 * Đồng bộ thông tin quán lên Firestore
 */
export async function syncShopInfoToFirestore(shopInfo: ShopInfo): Promise<boolean> {
  try {
    const sanitizedInfo = JSON.parse(JSON.stringify(shopInfo));
    const payload = {
      shopInfo: sanitizedInfo,
      updatedAt: new Date().toISOString(),
    };
    await Promise.allSettled([
      setDoc(SHOP_INFO_DOC_REF(), payload),
      setDoc(SHOP_INFO_ALT_DOC_REF(), payload),
    ]);
    console.log('Successfully synced shop info to Firestore');
    return true;
  } catch (err) {
    console.error('Error syncing shop info to Firestore:', err);
    return false;
  }
}

/**
 * Real-time subscriber cho thông tin quán từ Firestore
 */
export function subscribeShopInfoFromFirestore(callback: (info: ShopInfo) => void) {
  const unsub1 = onSnapshot(
    SHOP_INFO_DOC_REF(),
    (snap) => {
      if (snap.exists()) {
        const info = parseShopInfoFromSnapData(snap.data());
        if (info) callback(info);
      }
    },
    (err) => console.error('Error listening SHOP_INFO_DOC_REF:', err)
  );

  const unsub2 = onSnapshot(
    SHOP_INFO_ALT_DOC_REF(),
    (snap) => {
      if (snap.exists()) {
        const info = parseShopInfoFromSnapData(snap.data());
        if (info) callback(info);
      }
    },
    (err) => console.error('Error listening SHOP_INFO_ALT_DOC_REF:', err)
  );

  return () => {
    unsub1();
    unsub2();
  };
}

