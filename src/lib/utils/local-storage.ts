
// @ts-nocheck
export class SafeLocalStorage {
  static getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${error}`);
      return null;
    }
  }

  static setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${error}`);
    }
  }

  static removeItem(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${error}`);
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Failed to clear localStorage: ${error}`);
    }
  }

  static key(index: number): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.key(index);
    } catch (error) {
      console.error(`Failed to get key from localStorage: ${error}`);
      return null;
    }
  }

  static get length(): number {
    if (typeof window === 'undefined') {
      return 0;
    }
    try {
      return localStorage.length;
    } catch (error) {
      console.error(`Failed to get localStorage length: ${error}`);
      return 0;
    }
  }
}