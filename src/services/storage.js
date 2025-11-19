// Local Storage Service for Offline Support

const STORAGE_KEYS = {
  CUSTOMERS: 'ledger_customers',
  TRANSACTIONS: 'ledger_transactions',
  BALANCE_SHEET: 'ledger_balance',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync_timestamp'
};

export const StorageService = {
  // Save data to localStorage
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      return false;
    }
  },

  // Load data from localStorage
  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Storage load error:', error);
      return null;
    }
  },

  // Remove data from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // Clear all app data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  },

  // Get storage size
  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2) + ' KB';
  },

  // Customers
  saveCustomers(customers) {
    return this.save(STORAGE_KEYS.CUSTOMERS, customers);
  },

  loadCustomers() {
    return this.load(STORAGE_KEYS.CUSTOMERS) || [];
  },

  // Transactions
  saveTransactions(transactions) {
    return this.save(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  loadTransactions() {
    return this.load(STORAGE_KEYS.TRANSACTIONS) || [];
  },

  // Balance Sheet
  saveBalanceSheet(balanceSheet) {
    return this.save(STORAGE_KEYS.BALANCE_SHEET, balanceSheet);
  },

  loadBalanceSheet() {
    return this.load(STORAGE_KEYS.BALANCE_SHEET) || [];
  },

  // Sync Queue
  saveSyncQueue(queue) {
    return this.save(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  loadSyncQueue() {
    return this.load(STORAGE_KEYS.SYNC_QUEUE) || [];
  },

  // Last Sync Time
  setLastSync() {
    return this.save(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  },

  getLastSync() {
    return this.load(STORAGE_KEYS.LAST_SYNC);
  }
};
