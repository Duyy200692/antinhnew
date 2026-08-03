import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { DishItem, ShopInfo } from '../types';

// Khởi tạo Firebase App & Services từ cấu hình Firebase JSON
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Firestore và Firebase Storage
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const storage = getStorage(app);

const DISHES_DOC_REF = () => doc(db, 'settings', 'menu_dishes_list');
const SHOP_INFO_DOC_REF = () => doc(db, 'settings', 'shop_info');
const ADMIN_AUTH_DOC_REF = () => doc(db, 'settings', 'admin_auth');

/**
 * Real-time subscriber for dishes from Firestore
 */
export function subscribeDishesFromFirestore(callback: (dishes: DishItem[]) => void) {
  return onSnapshot(DISHES_DOC_REF(), (snap) => {
    // Skip local write snapshots to prevent flickering feedback loop
    if (snap.metadata.hasPendingWrites) {
      return;
    }
    if (snap.exists() && snap.data()?.list) {
      callback(snap.data().list as DishItem[]);
    }
  }, (err) => {
    console.error('Error listening to dishes from Firestore:', err);
  });
}

/**
 * Load admin password from Firestore
 */
export async function loadAdminPasswordFromFirestore(): Promise<string | null> {
  try {
    const snap = await getDoc(ADMIN_AUTH_DOC_REF());
    if (snap.exists() && snap.data()?.password) {
      return snap.data().password as string;
    }
  } catch (err) {
    console.error('Error loading admin password from Firestore:', err);
  }
  return null;
}

/**
 * Sync admin password to Firestore
 */
export async function syncAdminPasswordToFirestore(password: string): Promise<void> {
  try {
    await setDoc(ADMIN_AUTH_DOC_REF(), {
      password,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error syncing admin password to Firestore:', err);
  }
}

/**
 * Load all dishes from Firestore
 */
export async function loadDishesFromFirestore(): Promise<DishItem[] | null> {
  try {
    const snap = await getDoc(DISHES_DOC_REF());
    if (snap.exists() && snap.data()?.list) {
      return snap.data().list as DishItem[];
    }
  } catch (err) {
    console.error('Error loading dishes from Firestore:', err);
  }
  return null;
}

/**
 * Sync all dishes to Firestore
 */
export async function syncDishesToFirestore(dishes: DishItem[]): Promise<void> {
  try {
    await setDoc(DISHES_DOC_REF(), {
      list: dishes,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error syncing dishes to Firestore:', err);
  }
}

/**
 * Load shop info from Firestore
 */
export async function loadShopInfoFromFirestore(): Promise<ShopInfo | null> {
  try {
    const snap = await getDoc(SHOP_INFO_DOC_REF());
    if (snap.exists() && snap.data()?.shopInfo) {
      return snap.data().shopInfo as ShopInfo;
    }
  } catch (err) {
    console.error('Error loading shop info from Firestore:', err);
  }
  return null;
}

/**
 * Sync shop info to Firestore
 */
export async function syncShopInfoToFirestore(shopInfo: ShopInfo): Promise<void> {
  try {
    await setDoc(SHOP_INFO_DOC_REF(), {
      shopInfo,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error syncing shop info to Firestore:', err);
  }
}

/**
 * Real-time subscriber for shop info from Firestore
 */
export function subscribeShopInfoFromFirestore(callback: (info: ShopInfo) => void) {
  return onSnapshot(
    SHOP_INFO_DOC_REF(),
    (snap) => {
      if (snap.metadata.hasPendingWrites) {
        return;
      }
      if (snap.exists() && snap.data()?.shopInfo) {
        callback(snap.data().shopInfo as ShopInfo);
      }
    },
    (err) => {
      console.error('Error listening to shop info from Firestore:', err);
    }
  );
}
