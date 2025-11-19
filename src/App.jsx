import React, { useState, useEffect } from 'react';
import { Search, Plus, Menu, X, RefreshCw, Wifi, WifiOff, Users, DollarSign, TrendingUp, TrendingDown, ChevronRight, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { StorageService } from './services/storage';
import { GoogleSheetsAPI } from './services/googleSheets';
import { calculateAmount, calculateBalance, getDrCrStatus, calculateStats } from './utils/calculations';
import { formatCurrency, formatDate } from './utils/formatters';
import './App.css';

function App() {
  // State Management
  const [view, setView] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [stats, setStats] = useState({ totalCustomers: 0, totalDR: 0, totalCR: 0, netPosition: 0 });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    item: '',
    weight: '',
    rate: '',
    drCr: 'Debit',
    amount: ''
  });

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Back online! Syncing...', 'success');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Offline mode - changes saved locally', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    saveToLocalStorage();
    const newStats = calculateStats(customers);
    setStats(newStats);
  }, [customers, transactions, syncQueue]);

  const loadFromLocalStorage = () => {
    const savedCustomers = StorageService.loadCustomers();
    const savedTransactions = StorageService.loadTransactions();
    const savedQueue = StorageService.loadSyncQueue();

    if (savedCustomers.length > 0) setCustomers(savedCustomers);
    if (savedTransactions.length > 0) setTransactions(savedTransactions);
    if (savedQueue.length > 0) setSyncQueue(savedQueue);
  };

  const saveToLocalStorage = () => {
    StorageService.saveCustomers(customers);
    StorageService.saveTransactions(transactions);
    StorageService.saveSyncQueue(syncQueue);
  };

  const syncOfflineData = async () => {
    if (!isOnline || syncQueue.length === 0) return;

    setLoading(true);
    try {
      await GoogleSheetsAPI.batchSync(syncQueue);
      setSyncQueue([]);
      StorageService.setLastSync();
      showNotification('All changes synced!', 'success');
    } catch (error) {
      showNotification('Sync failed. Will retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDataFromSheets = async () => {
    setLoading(true);
    try {
      const customersData = await GoogleSheetsAPI.fetchCustomers();
      setCustomers(customersData);
      showNotification('Data loaded successfully!', 'success');
    } catch (error) {
      showNotification('Using local data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if ((field === 'weight' || field === 'rate' || field === 'item') && 
        newFormData.weight && newFormData.rate && newFormData.item) {
      const calculated = calculateAmount(newFormData.weight, newFormData.rate, newFormData.item);
      newFormData.amount = calculated.toFixed(2);
    }
    
    setFormData(newFormData);
  };

  const submitTransaction = async () => {
    if (!selectedCustomer || !formData.description || !formData.amount) {
      showNotification('Please fill required fields', 'error');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      ...formData,
      timestamp: new Date().toISOString(),
      synced: false
    };

    setTransactions(prev => [newTransaction, ...prev]);
    updateCustomerBalance(selectedCustomer.id, parseFloat(formData.amount), formData.drCr);

    if (isOnline) {
      try {
        await GoogleSheetsAPI.submitTransaction(newTransaction);
        showNotification('Transaction saved!', 'success');
      } catch (error) {
        setSyncQueue(prev => [...prev, newTransaction]);
        showNotification('Saved locally', 'warning');
      }
    } else {
      setSyncQueue(prev => [...prev, newTransaction]);
      showNotification('Saved offline', 'warning');
    }

    resetForm();
  };

  const updateCustomerBalance = (customerId, amount, drCr) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId) {
        let newBalance = cust.balance || 0;
        newBalance += drCr === 'Debit' ? amount : -amount;
        
        return {
          ...cust,
          balance: newBalance,
          drCr: getDrCrStatus(newBalance),
          lastTransaction: new Date().toISOString().split('T')[0]
        };
      }
      return cust;
    }));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      item: '',
      weight: '',
      rate: '',
      drCr: 'Debit',
      amount: ''
    });
    setShowTransactionForm(false);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || c.drCr.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getCustomerTransactions = (customerId) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="stats-grid">
        <div className="stat-card blue">
          <Users className="stat-icon" />
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-label">Customers</div>
        </div>
        <div className="stat-card red">
          <TrendingUp className="stat-icon" />
          <div className="stat-value">{formatCurrency(stats.totalDR)}</div>
          <div className="stat-label">Total DR</div>
        </div>
        <div className="stat-card green">
          <TrendingDown className="stat-icon" />
          <div className="stat-value">{formatCurrency(stats.totalCR)}</div>
          <div className="stat-label">Total CR</div>
        </div>
        <div className="stat-card purple">
          <DollarSign className="stat-icon" />
          <div className="stat-value">{formatCurrency(stats.netPosition)}</div>
          <div className="stat-label">Net Position</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="quick-actions">
          <button onClick={() => setView('transactions')} className="quick-btn">
            <Plus />
            <span>New Entry</span>
          </button>
          <button onClick={() => setView('customers')} className="quick-btn">
            <Users />
            <span>Customers</span>
          </button>
          <button onClick={fetchDataFromSheets} className="quick-btn">
            <RefreshCw />
            <span>Sync</span>
          </button>
          <button onClick={() => setView('balance-sheet')} className="quick-btn">
            <DollarSign />
            <span>Balance</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recent Transactions</h2>
        <div className="transaction-list">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-customer">{t.customerName}</div>
                <div className="transaction-desc">{t.description}</div>
                <div className="transaction-date">{formatDate(t.date)}</div>
              </div>
              <div className="transaction-amount">
                <div className={`amount ${t.drCr.toLowerCase()}`}>
                  {formatCurrency(t.amount)}
                </div>
                <div className="amount-type">{t.drCr}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="card">
        <div className="search-filter-row">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="dr">DR</option>
            <option value="cr">CR</option>
            <option value="nill">Nill</option>
          </select>
        </div>
      </div>

      <div className="customer-list">
        {filteredCustomers.map(customer => (
          <div 
            key={customer.id}
            onClick={() => {
              setSelectedCustomer(customer);
              setView('transactions');
            }}
            className="customer-card"
          >
            <div className="customer-info">
              <div className="customer-name">{customer.name}</div>
              <div className="customer-date">Last: {formatDate(customer.lastTransaction)}</div>
            </div>
            <div className="customer-balance">
              <div className="balance-amount">{formatCurrency(customer.balance)}</div>
              <span className={`badge ${customer.drCr.toLowerCase()}`}>
                {customer.drCr}
              </span>
            </div>
            <ChevronRight className="chevron" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactions = () => {
    const customerTransactions = selectedCustomer ? getCustomerTransactions(selectedCustomer.id) : [];

    return (
      <div className="space-y-4">
        {selectedCustomer && (
          <div className="card customer-header">
            <div className="customer-header-info">
              <h2>{selectedCustomer.name}</h2>
              <div className="header-subtitle">Current Balance</div>
            </div>
            <div className="customer-header-balance">
              <div className="header-amount">{formatCurrency(selectedCustomer.balance)}</div>
              <span className={`badge ${selectedCustomer.drCr.toLowerCase()}`}>
                {selectedCustomer.drCr}
              </span>
            </div>
          </div>
        )}

        <button onClick={() => setShowTransactionForm(true)} className="btn-primary full-width">
          <Plus />
          <span>Add Transaction</span>
        </button>

        {showTransactionForm && (
          <div className="card">
            <h3 className="form-title">New Transaction</h3>
            <div className="form-grid">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Description *"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="form-input"
              />
              <select
                value={formData.item}
                onChange={(e) => handleFormChange('item', e.target.value)}
                className="form-input"
              >
                <option value="">Select Item</option>
                <option value="Chilled Gots">Chilled Gots</option>
                <option value="Chilled Scrape">Chilled Scrape</option>
                <option value="H Oil">H Oil</option>
                <option value="Black Scrape">Black Scrape</option>
                <option value="White Scrape">White Scrape</option>
              </select>
              <input
                type="number"
                placeholder="Weight/Qty"
                value={formData.weight}
                onChange={(e) => handleFormChange('weight', e.target.value)}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Rate (PKR)"
                value={formData.rate}
                onChange={(e) => handleFormChange('rate', e.target.value)}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Amount *"
                value={formData.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                className="form-input"
              />
              <select
                value={formData.drCr}
                onChange={(e) => handleFormChange('drCr', e.target.value)}
                className="form-input"
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div className="form-actions">
              <button onClick={submitTransaction} className="btn-primary">
                <Save />
                <span>Save</span>
              </button>
              <button onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="transaction-detail-list">
          {customerTransactions.map((t, index) => (
            <div key={t.id} className="transaction-detail-card">
              <div className="detail-header">
                <span className="serial">#{index + 1}</span>
                <span className="date">{formatDate(t.date)}</span>
              </div>
              <div className="detail-body">
                <div className="detail-description">{t.description}</div>
                {t.item && <div className="detail-item">Item: {t.item}</div>}
              </div>
              <div className="detail-footer">
                <span className={`type-badge ${t.drCr.toLowerCase()}`}>{t.drCr}</span>
                <span className={`detail-amount ${t.drCr.toLowerCase()}`}>
                  {formatCurrency(t.amount)}
                </span>
              </div>
              {!t.synced && (
                <div className="sync-pending">
                  <AlertCircle size={12} />
                  <span>Pending sync</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => (
    <div className="space-y-4">
      <div className="card">
        <h2 className="card-title">Balance Summary</h2>
        <div className="balance-summary">
          <div className="summary-item">
            <div className="summary-value red">{formatCurrency(stats.totalDR)}</div>
            <div className="summary-label">Total DR</div>
          </div>
          <div className="summary-item">
            <div className="summary-value green">{formatCurrency(stats.totalCR)}</div>
            <div className="summary-label">Total CR</div>
          </div>
          <div className="summary-item">
            <div className="summary-value blue">{formatCurrency(stats.netPosition)}</div>
            <div className="summary-label">Net</div>
          </div>
        </div>
      </div>

      <div className="balance-list">
        {customers.map(customer => (
          <div key={customer.id} className="balance-row">
            <div className="balance-info">
              <div className="balance-name">{customer.name}</div>
              <div className="balance-date">Last: {formatDate(customer.lastTransaction)}</div>
            </div>
            <div className="balance-amount-group">
              <div className="balance-value">{formatCurrency(customer.balance)}</div>
              <div className={`balance-type ${customer.drCr.toLowerCase()}`}>
                {customer.drCr}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <button onClick={() => setShowMenu(!showMenu)} className="menu-toggle">
          {showMenu ? <X /> : <Menu />}
        </button>
        <h1 className="app-title">Abbas Sons</h1>
        <div className="header-status">
          {isOnline ? <Wifi className="online" /> : <WifiOff className="offline" />}
          {syncQueue.length > 0 && <span className="sync-count">{syncQueue.length}</span>}
        </div>
      </header>

      {showMenu && (
        <div className="mobile-menu">
          <button onClick={() => { setView('dashboard'); setShowMenu(false); }}>Dashboard</button>
          <button onClick={() => { setView('customers'); setShowMenu(false); }}>Customers</button>
          <button onClick={() => { setView('balance-sheet'); setShowMenu(false); }}>Balance Sheet</button>
          <button onClick={fetchDataFromSheets}>Sync Data</button>
        </div>
      )}

      <nav className="bottom-nav">
        <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>
          <DollarSign />
          <span>Dashboard</span>
        </button>
        <button onClick={() => setView('customers')} className={view === 'customers' ? 'active' : ''}>
          <Users />
          <span>Customers</span>
        </button>
        <button onClick={() => setView('transactions')} className={view === 'transactions' ? 'active' : ''}>
          <Plus />
          <span>Add</span>
        </button>
        <button onClick={() => setView('balance-sheet')} className={view === 'balance-sheet' ? 'active' : ''}>
          <TrendingUp />
          <span>Balance</span>
        </button>
      </nav>

      <main className="main">
        {loading && (
          <div className="loading">
            <RefreshCw className="spin" />
            <span>Loading...</span>
          </div>
        )}
        {view === 'dashboard' && renderDashboard()}
        {view === 'customers' && renderCustomers()}
        {view === 'transactions' && renderTransactions()}
        {view === 'balance-sheet' && renderBalanceSheet()}
      </main>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' && <CheckCircle />}
          {notification.type === 'error' && <AlertCircle />}
          {notification.type === 'warning' && <AlertCircle />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
