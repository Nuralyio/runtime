/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotStorage } from '../core/types.js';

/**
 * In-memory storage (data lost on page refresh)
 */
export class MemoryStorage implements ChatbotStorage {
  private store: Map<string, any> = new Map();

  async save(key: string, data: any): Promise<void> {
    this.store.set(key, JSON.parse(JSON.stringify(data))); // Deep clone
  }

  async load(key: string): Promise<any> {
    const data = this.store.get(key);
    return data ? JSON.parse(JSON.stringify(data)) : null; // Deep clone
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

/**
 * LocalStorage-based storage (persists across page refreshes)
 */
export class LocalStorageAdapter implements ChatbotStorage {
  async save(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[LocalStorage] Save error:', error);
      throw new Error(`Failed to save to localStorage: ${error}`);
    }
  }

  async load(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('[LocalStorage] Load error:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    // Only clear chatbot-related keys
    const keys = Object.keys(localStorage);
    keys.filter(k => k.startsWith('chatbot-')).forEach(k => {
      localStorage.removeItem(k);
    });
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * IndexedDB storage (for larger data, better performance)
 */
export class IndexedDBStorage implements ChatbotStorage {
  private dbName: string;
  private storeName: string;
  private db?: IDBDatabase;

  constructor(dbName: string = 'chatbot-db', storeName: string = 'chatbot-store') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async save(key: string, data: any): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async load(key: string): Promise<any> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async has(key: string): Promise<boolean> {
    const data = await this.load(key);
    return data !== null;
  }
}
