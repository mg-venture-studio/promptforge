import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'promptforge_encryption_key';

function getOrCreateKey(): string {
  if (typeof window === 'undefined') return '';
  let key: string = localStorage.getItem(STORAGE_KEY) || '';
  if (!key) {
    key = CryptoJS.lib.WordArray.random(256 / 8).toString();
    localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

export function encrypt(text: string): { encrypted: string; iv: string } {
  const key = getOrCreateKey();
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv });
  return {
    encrypted: encrypted.toString(),
    iv: iv.toString(),
  };
}

export function decrypt(encrypted: string, ivStr: string): string {
  const key = getOrCreateKey();
  const iv = CryptoJS.enc.Hex.parse(ivStr);
  const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
