import { useState, useEffect } from 'react';
import { ShopInfo } from '../types';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '../data/mockDishes';

const STORAGE_KEY = 'tam_chay_shop_info_v1';
const EVENT_NAME = 'tam_chay_shop_info_updated';

export function getStoredShopInfo(): ShopInfo {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load shop info from localStorage', e);
  }
  return DEFAULT_SHOP_INFO;
}

export function saveStoredShopInfo(newInfo: ShopInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newInfo));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error('Failed to save shop info to localStorage', e);
  }
}

export function resetShopInfoToDefault(): ShopInfo {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error('Failed to reset shop info', e);
  }
  return DEFAULT_SHOP_INFO;
}

export function useShopInfo(): {
  shopInfo: ShopInfo;
  saveShopInfo: (info: ShopInfo) => void;
  resetShopInfo: () => void;
} {
  const [shopInfo, setShopInfoState] = useState<ShopInfo>(getStoredShopInfo);

  useEffect(() => {
    const handleUpdate = () => {
      setShopInfoState(getStoredShopInfo());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  const saveShopInfo = (newInfo: ShopInfo) => {
    saveStoredShopInfo(newInfo);
  };

  const resetShopInfo = () => {
    resetShopInfoToDefault();
  };

  return { shopInfo, saveShopInfo, resetShopInfo };
}
