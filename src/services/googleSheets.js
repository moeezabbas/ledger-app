// Google Sheets API Integration

export const GoogleSheetsAPI = {
  // Initialize with your Google Sheets Web App URL
  WEB_APP_URL: process.env.REACT_APP_GOOGLE_SHEETS_URL || '',

  // Fetch all customers from Google Sheets
  async fetchCustomers() {
    try {
      const response = await fetch(`${this.WEB_APP_URL}?action=getCustomers`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch customers error:', error);
      throw error;
    }
  },

  // Fetch transactions for a specific customer
  async fetchTransactions(customerId) {
    try {
      const response = await fetch(
        `${this.WEB_APP_URL}?action=getTransactions&customerId=${customerId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch transactions error:', error);
      throw error;
    }
  },

  // Submit new transaction
  async submitTransaction(transactionData) {
    try {
      const response = await fetch(this.WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submitTransaction',
          data: transactionData
        })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Submit transaction error:', error);
      throw error;
    }
  },

  // Fetch balance sheet
  async fetchBalanceSheet() {
    try {
      const response = await fetch(`${this.WEB_APP_URL}?action=getBalanceSheet`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch balance sheet error:', error);
      throw error;
    }
  },

  // Batch sync multiple transactions
  async batchSync(transactions) {
    try {
      const response = await fetch(this.WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batchSync',
          data: transactions
        })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Batch sync error:', error);
      throw error;
    }
  }
};
