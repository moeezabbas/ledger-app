// Calculation utilities

export const calculateAmount = (weight, rate, item) => {
  const scrapeItems = ['Black Scrape', 'White Scrape', 'Toka Scrape', 'Pig Scrape'];
  const isScrape = scrapeItems.includes(item);
  
  const weightNum = parseFloat(weight) || 0;
  const rateNum = parseFloat(rate) || 0;
  
  if (isScrape) {
    return (weightNum / 37.324) * rateNum;
  }
  return weightNum * rateNum;
};

export const calculateBalance = (transactions) => {
  return transactions.reduce((balance, t) => {
    const amount = parseFloat(t.amount) || 0;
    if (t.drCr === 'Debit') {
      return balance + amount;
    }
    return balance - amount;
  }, 0);
};

export const getDrCrStatus = (balance) => {
  if (balance === 0) return 'Nill';
  return balance > 0 ? 'DR' : 'CR';
};

export const calculateStats = (customers) => {
  const stats = {
    totalCustomers: customers.length,
    totalDR: 0,
    totalCR: 0,
    netPosition: 0
  };

  customers.forEach(customer => {
    const balance = Math.abs(customer.balance);
    if (customer.drCr === 'DR') {
      stats.totalDR += balance;
    } else if (customer.drCr === 'CR') {
      stats.totalCR += balance;
    }
  });

  stats.netPosition = stats.totalDR - stats.totalCR;
  return stats;
};
