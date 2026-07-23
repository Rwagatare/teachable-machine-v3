// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const DB_NAME = 'teachable-machine-db';
const DB_VERSION = 1;
const STORE_NAME = 'classifierState';
const CURRENT_SESSION_ID = 'current';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not available in this browser.'));

      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {keyPath: 'id'});
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Thin persistence layer over IndexedDB for the KNN classifier's dataset.
 * Every method fails soft: on any error (IndexedDB unavailable, quota
 * exceeded, private-browsing restrictions, etc.) it warns and resolves to
 * a safe default instead of throwing, so callers can always fall back to
 * in-memory-only behavior.
 */
class ClassifierStore {
  async save(payload) {
    try {
      const db = await openDatabase();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(Object.assign({id: CURRENT_SESSION_ID, savedAt: Date.now()}, payload));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();

      return true;
    } catch (error) {
      console.warn('ClassifierStore: could not save training data, continuing in-memory only.', error);

      return false;
    }
  }

  async load() {
    try {
      const db = await openDatabase();
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(CURRENT_SESSION_ID);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      db.close();

      return record;
    } catch (error) {
      console.warn('ClassifierStore: could not load saved training data, starting fresh.', error);

      return null;
    }
  }

  async clear() {
    try {
      const db = await openDatabase();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(CURRENT_SESSION_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();

      return true;
    } catch (error) {
      console.warn('ClassifierStore: could not clear saved training data.', error);

      return false;
    }
  }
}

export default ClassifierStore;
