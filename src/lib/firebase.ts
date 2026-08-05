import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { DishItem, ShopInfo } from '../types';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '../data/mockDishes';

// Khởi tạo Firebase App & Services từ cấu hình Firebase JSON
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Firestore và Firebase Storage an toàn
let primaryDb: any;
let defaultDb: any;

try {
  defaultDb = getFirestore(app);
} catch (e) {
  console.warn('Error initializing default Firestore:', e);
}

try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  if (dbId && dbId !== '(default)') {
    primaryDb = getFirestore(app, dbId);
  } else {
    primaryDb = defaultDb;
  }
} catch (e) {
  console.warn('Error initializing named Firestore database:', e);
  primaryDb = defaultDb;
}

export const db = primaryDb || defaultDb;
export const storage = getStorage(app);

// Helper function to clean object of undefined properties for Firestore safety
function cleanPayload<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

// Helper function to setDoc on both database instances (primary & default)
async function dualSetDoc(pathSegments: string[], data: any): Promise<void> {
  const safeData = cleanPayload(data);
  const tasks: Promise<any>[] = [];
  if (db) {
    tasks.push(setDoc(doc(db, pathSegments[0], ...pathSegments.slice(1)), safeData));
  }
  if (defaultDb && defaultDb !== db) {
    try {
      tasks.push(setDoc(doc(defaultDb, pathSegments[0], ...pathSegments.slice(1)), safeData));
    } catch (e) {
      // Ignore if defaultDb fails
    }
  }
  const results = await Promise.allSettled(tasks);
  const primaryRes = results[0];
  if (primaryRes && primaryRes.status === 'rejected') {
    console.error(`dualSetDoc failed on ${pathSegments.join('/')}:`, primaryRes.reason);
    throw primaryRes.reason;
  }
}

// Helper function to deleteDoc on both database instances
async function dualDeleteDoc(pathSegments: string[]): Promise<void> {
  const tasks: Promise<any>[] = [];
  if (db) {
    tasks.push(deleteDoc(doc(db, pathSegments[0], ...pathSegments.slice(1))));
  }
  if (defaultDb && defaultDb !== db) {
    try {
      tasks.push(deleteDoc(doc(defaultDb, pathSegments[0], ...pathSegments.slice(1))));
    } catch (e) {
      // Ignore
    }
  }
  await Promise.allSettled(tasks);
}

// Các vị trí lưu trữ Firestore (hỗ trợ cả settings collection và root collections)
const DISHES_DOC_REF = () => doc(db, 'settings', 'menu_dishes_list');
const DISHES_ALT_DOC_REF = () => doc(db, 'menu_dishes_list', 'list');

const SHOP_INFO_DOC_REF = () => doc(db, 'settings', 'shop_info');
const SHOP_INFO_ALT_DOC_REF = () => doc(db, 'shop_info', 'main');

const ADMIN_AUTH_DOC_REF = () => doc(db, 'settings', 'admin_auth');
const ADMIN_AUTH_ALT_DOC_REF = () => doc(db, 'admin_auth', 'main');

/**
 * Helper: Trích xuất danh sách dishes từ dữ liệu Firestore snapshot
 * Hỗ trợ cả { list: [...] }, mảng trực tiếp, object có key dạng chỉ số "0", "1"...,
 * hoặc document có món thứ 0 nằm ở root kèm các món 1, 2, 3...
 */
export function parseDishesFromSnapData(data: any): DishItem[] | null {
  if (!data || typeof data !== 'object') return null;

  // Case 1: data.list là mảng
  if (Array.isArray(data.list) && data.list.length > 0) {
    return data.list as DishItem[];
  }

  // Case 2: data.list là object chứa các món
  if (data.list && typeof data.list === 'object') {
    const listValues = Object.values(data.list).filter(
      (item: any) => item && typeof item === 'object' && item.id && item.name
    );
    if (listValues.length > 0) {
      return listValues as DishItem[];
    }
  }

  // Case 3: data trực tiếp là mảng
  if (Array.isArray(data) && data.length > 0) {
    return data as DishItem[];
  }

  // Case 4: Món thứ 0 bị flatten ở root + các món 1, 2, 3... hoặc các object món riêng
  const items: DishItem[] = [];

  // Món 0 nằm ở root nếu có id & name
  if (data.id && data.name && data.price) {
    const rootDish: any = { ...data };
    Object.keys(rootDish).forEach((key) => {
      if (!isNaN(Number(key)) || key === 'updatedAt' || key === 'list' || key === 'shopInfo') {
        delete rootDish[key];
      }
    });
    if (rootDish.id && rootDish.name) {
      items.push(rootDish as DishItem);
    }
  }

  // Lấy các món nằm trong các key con ("1", "2", "antinh-01", ...)
  Object.keys(data).forEach((key) => {
    if (key === 'list' || key === 'updatedAt' || key === 'shopInfo') return;
    const val = data[key];
    if (val && typeof val === 'object' && val.id && val.name && val.price) {
      if (!items.some((d) => d.id === val.id)) {
        items.push(val as DishItem);
      }
    }
  });

  if (items.length > 0) {
    return items;
  }

  return null;
}

/**
 * Real-time subscriber cho danh sách món ăn từ Firestore
 * Lắng nghe biến động đồng thời ở các vị trí chính để đảm bảo mọi thiết bị đều nhận dữ liệu ngay lập tức
 */
export function subscribeDishesFromFirestore(callback: (dishes: DishItem[]) => void) {
  const unsubs: (() => void)[] = [];

  const attachListenersToDb = (targetDb: any) => {
    if (!targetDb) return;
    unsubs.push(
      onSnapshot(
        doc(targetDb, 'settings', 'menu_dishes_list'),
        (snap) => {
          if (snap.exists()) {
            const dishes = parseDishesFromSnapData(snap.data());
            if (dishes && dishes.length > 0) callback(dishes);
          }
        },
        (err) => console.error('Error listening settings/menu_dishes_list:', err)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(targetDb, 'menu_dishes_list', 'list'),
        (snap) => {
          if (snap.exists()) {
            const dishes = parseDishesFromSnapData(snap.data());
            if (dishes && dishes.length > 0) callback(dishes);
          }
        },
        (err) => console.error('Error listening menu_dishes_list/list:', err)
      )
    );
  };

  attachListenersToDb(db);
  if (defaultDb && defaultDb !== db) {
    attachListenersToDb(defaultDb);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
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
      dualSetDoc(['settings', 'admin_auth'], payload),
      dualSetDoc(['admin_auth', 'main'], payload),
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

    const colSnap = await getDocs(collection(db, 'menu_dishes_list'));
    if (!colSnap.empty) {
      const collectedDishes: DishItem[] = [];
      colSnap.docs.forEach((docSnap) => {
        if (docSnap.id === 'list') return;
        const parsed = parseDishesFromSnapData(docSnap.data());
        if (parsed && parsed.length > 0) {
          parsed.forEach((d) => {
            if (!collectedDishes.some((item) => item.id === d.id)) {
              collectedDishes.push(d);
            }
          });
        }
      });
      if (collectedDishes.length > 0) return collectedDishes;
    }
  } catch (err) {
    console.error('Error loading dishes from Firestore:', err);
  }
  return null;
}

/**
 * Cập nhật danh sách món ăn trực tiếp bằng updateDoc / setDoc lên Firestore
 */
export async function updateDishesListToFirebase(updatedList: DishItem[]): Promise<boolean> {
  try {
    const sanitizedDishes = cleanPayload(updatedList);
    const payload = {
      list: sanitizedDishes,
      updatedAt: new Date().toISOString(),
    };

    // 1. Cập nhật menu_dishes_list/list
    const ref1 = doc(db, 'menu_dishes_list', 'list');
    try {
      await updateDoc(ref1, payload);
    } catch (e) {
      await setDoc(ref1, payload);
    }

    // 2. Cập nhật settings/menu_dishes_list
    const ref2 = doc(db, 'settings', 'menu_dishes_list');
    try {
      await updateDoc(ref2, payload);
    } catch (e) {
      await setDoc(ref2, payload);
    }

    // Nếu có defaultDb khác primaryDb, đẩy tiếp lên defaultDb
    if (defaultDb && defaultDb !== db) {
      const altRef1 = doc(defaultDb, 'menu_dishes_list', 'list');
      const altRef2 = doc(defaultDb, 'settings', 'menu_dishes_list');
      Promise.allSettled([
        updateDoc(altRef1, payload).catch(() => setDoc(altRef1, payload)),
        updateDoc(altRef2, payload).catch(() => setDoc(altRef2, payload)),
      ]).catch(() => {});
    }

    // 3. Cập nhật song song từng document món riêng lẻ
    const currentIds = new Set<string>();
    const itemPromises: Promise<any>[] = [];

    sanitizedDishes.forEach((dish: DishItem) => {
      if (dish && dish.id) {
        currentIds.add(dish.id);
        const itemPayload = cleanPayload({
          ...dish,
          updatedAt: new Date().toISOString(),
        });
        const itemRef = doc(db, 'menu_dishes_list', dish.id);
        itemPromises.push(
          updateDoc(itemRef, itemPayload).catch(() => setDoc(itemRef, itemPayload))
        );
      }
    });

    await Promise.allSettled(itemPromises);
    console.log('Successfully updated dishes list to Firebase via updateDoc:', sanitizedDishes.length);
    return true;
  } catch (err) {
    console.error('Error in updateDishesListToFirebase:', err);
    return false;
  }
}

/**
 * Đồng bộ toàn bộ danh sách món ăn lên Firestore
 * Ghi đồng thời lên tất cả các vị trí (settings/menu_dishes_list, menu_dishes_list/list, và từng document món)
 */
export async function syncDishesToFirestore(dishes: DishItem[]): Promise<boolean> {
  return await updateDishesListToFirebase(dishes);
}

/**
 * Helper: Parse shop info từ snapshot
 */
export function parseShopInfoFromSnapData(data: any): ShopInfo | null {
  if (!data || typeof data !== 'object') return null;
  let rawInfo: any = null;
  if (data.shopInfo && typeof data.shopInfo === 'object') {
    rawInfo = data.shopInfo;
  } else if (data.name || data.phone) {
    rawInfo = data;
  }
  if (rawInfo) {
    return {
      ...DEFAULT_SHOP_INFO,
      ...rawInfo,
    };
  }
  return null;
}

/**
 * Tải thông tin quán từ Firestore
 */
export async function loadShopInfoFromFirestore(): Promise<ShopInfo | null> {
  const docPaths = [
    ['settings', 'shop_info'],
    ['shop_info', 'shopInfo'],
    ['shop_info', 'shop_info'],
    ['shop_info', 'main'],
  ];

  for (const path of docPaths) {
    try {
      const snap = await getDoc(doc(db, path[0], path[1]));
      if (snap.exists()) {
        const info = parseShopInfoFromSnapData(snap.data());
        if (info) return info;
      }
    } catch (e) {
      // Ignore individual read errors
    }
  }

  try {
    const colSnap = await getDocs(collection(db, 'shop_info'));
    for (const d of colSnap.docs) {
      if (d.exists()) {
        const info = parseShopInfoFromSnapData(d.data());
        if (info) return info;
      }
    }
  } catch (e) {
    // Ignore
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
      ...sanitizedInfo,
      updatedAt: new Date().toISOString(),
    };
    await Promise.allSettled([
      dualSetDoc(['settings', 'shop_info'], payload),
      dualSetDoc(['shop_info', 'main'], payload),
      dualSetDoc(['shop_info', 'shopInfo'], payload),
      dualSetDoc(['shop_info', 'shop_info'], payload),
    ]);
    console.log('Successfully synced shop info to Firestore across all keys');
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
  const unsubs: (() => void)[] = [];

  const attachShopListeners = (targetDb: any) => {
    if (!targetDb) return;

    const docPaths = [
      ['settings', 'shop_info'],
      ['shop_info', 'shopInfo'],
      ['shop_info', 'shop_info'],
      ['shop_info', 'main'],
    ];

    docPaths.forEach(([col, docId]) => {
      unsubs.push(
        onSnapshot(
          doc(targetDb, col, docId),
          (snap) => {
            if (snap.exists()) {
              const info = parseShopInfoFromSnapData(snap.data());
              if (info) callback(info);
            }
          },
          (err) => console.error(`Error listening ${col}/${docId}:`, err)
        )
      );
    });

    unsubs.push(
      onSnapshot(
        collection(targetDb, 'shop_info'),
        (snap) => {
          snap.docs.forEach((d) => {
            if (d.exists()) {
              const info = parseShopInfoFromSnapData(d.data());
              if (info) callback(info);
            }
          });
        },
        (err) => console.error('Error listening shop_info collection:', err)
      )
    );
  };

  attachShopListeners(db);
  if (defaultDb && defaultDb !== db) {
    attachShopListeners(defaultDb);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}


