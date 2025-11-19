📱 Abbas Sons Accounting Ledger

Professional accounting ledger web application with offline support, optimized for mobile and desktop.

## 🚀 Features

- ✅ **Offline-First**: Works without internet, auto-syncs when online
- 📱 **Mobile Optimized**: Responsive design for all devices
- 💾 **Local Storage**: Data persists across sessions
- 🔄 **Auto-Sync**: Automatic synchronization with Google Sheets
- 📊 **Real-Time Updates**: Live balance calculations
- 🎨 **Modern UI**: Clean, professional interface

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Icons**: Lucide React
- **Storage**: LocalStorage API
- **Backend**: Google Apps Script
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/abbas-sons-ledger.git
cd abbas-sons-ledger
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create `.env` file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Add your Google Sheets configuration to `.env`

5. Start development server:
\`\`\`bash
npm start
\`\`\`

## 🚀 Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📱 Usage

### Adding Transactions
1. Select customer from list
2. Click "Add New Transaction"
3. Fill in details (amount auto-calculates for scrape items)
4. Submit

### Viewing Balance Sheet
- Navigate to "Balance" tab
- See all customer balances with DR/CR status
- Filter by type (DR/CR/Nill)

### Offline Mode
- App works completely offline
- Changes sync automatically when back online
- Sync queue shows pending changes

## 🔗 Google Sheets Integration

Deploy the provided Google Apps Script code as a Web App:

1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Paste the integration code
4. Deploy as Web App
5. Copy the URL to `.env`

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Abbas Sons Roll Tech
## 🚀 Deployment Steps

### Option 1: Using GitHub (Recommended)

1. **Create a new repository on GitHub**
2. **Initialize and push**:
```bash
git init
git add .
git commit -m "Initial commit - Abbas Sons Ledger"
git branch -M main
git remote add origin https://github.com/yourusername/abbas-sons-ledger.git
git push -u origin main
```

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect React
   - Click "Deploy"

### Option 2: Using Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## 🔑 Environment Variables (Vercel Dashboard)

Add these in Vercel Project Settings → Environment Variables:

```
REACT_APP_GOOGLE_SHEETS_URL=your_webapp_url
REACT_APP_NAME=Abbas Sons Ledger
```

---

## ✅ Checklist

- [ ] Create all files in correct folders
- [ ] Run `npm install`
- [ ] Test locally with `npm start`
- [ ] Create GitHub repository
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables
- [ ] Deploy!

---

## 📞 Support

For issues or questions, create an issue on GitHub.
```
