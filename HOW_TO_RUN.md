# How to Run — Personal-Finance-Assistance

## Prerequisites

Make sure you have these installed on your PC:

| Tool | Required Version | Install Link |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10+ | https://python.org |
| npm | (comes with Node) | — |
| pip | (comes with Python) | — |
| Git | Any | https://git-scm.com |

> **Database**: MongoDB Atlas cloud is already configured. No local MongoDB needed.

---

## Step 1 — Clone / Copy the Project

If copying to mentor's PC, just paste the full `Personal-Finance-Assistance` folder. Then open a terminal inside it.

---

## Step 2 — Set Up the Backend

```powershell
cd Personal-Finance-Assistance\backend
npm install
```

### Configure Environment Variables

Copy the example env file and fill in your values:

```powershell
copy .env.example .env
```

Open `.env` and make sure these are set (check your `.env.example` for reference):

```env
DATABASE_URL="your-mongodb-connection-string"
JWT_SECRET="your-jwt-secret"
PORT=3000
FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY=your-gemini-api-key
ML_SERVICE_URL=http://localhost:8000
```

### Generate Prisma Client

```powershell
npx prisma generate
```

### (Optional) Seed the database with sample data

```powershell
node prisma/seed.js
```

### Start the Backend

```powershell
npm run dev
```

✅ Backend will run at: **http://localhost:3000**  
✅ Health check: **http://localhost:3000/health**

---

## Step 3 — Set Up the Frontend (Web Dashboard)

Open a **new terminal** in the project root:

```powershell
cd Personal-Finance-Assistance
npm install
```

### Start the Frontend

```powershell
npm run dev
```

✅ Web app will run at: **http://localhost:5174**

> The frontend connects to the backend at `http://localhost:3000` automatically.

---

## Step 4 — Set Up the ML Service (Python)

Open a **new terminal**:

```powershell
cd Personal-Finance-Assistance\ml-service
pip install -r requirements.txt
python main.py
```

✅ ML Service will run at: **http://localhost:8000**

> The backend automatically calls this when ML categorization or forecasting is triggered.

---

## Step 5 — (Optional) SMS Companion Android App

> This is needed only if you want SMS auto-parsing from a real Android phone.

```powershell
cd Personal-Finance-Assistance\finance-sms-companion
npm install
```

Edit `.env` to point to your PC's local IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
```

Run it:

```powershell
npx expo start
```

Scan the QR code with **Expo Go** on your Android phone.

---

## Running Order Summary

Start each in a separate terminal window, in this order:

| # | Terminal | Command | URL |
|---|---|---|---|
| 1 | Backend | `cd backend && npm run dev` | http://localhost:3000 |
| 2 | ML Service | `cd ml-service && python main.py` | http://localhost:8000 |
| 3 | Frontend | `cd .. && npm run dev` (from root) | http://localhost:5174 |
| 4 | SMS App (optional) | `cd finance-sms-companion && npx expo start` | Expo QR |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Cannot connect to database` | Check `DATABASE_URL` in `backend/.env`. MongoDB Atlas cloud must be reachable (internet needed). |
| `Port 3000 already in use` | Kill the process: `npx kill-port 3000` |
| `Port 5174 already in use` | Kill: `npx kill-port 5174` |
| ML not working | Make sure Python ML service is running on port 8000 |
| Frontend blank page | Check browser console for CORS errors. Ensure backend is running. |
| `npm install` fails | Delete `node_modules` and run again |

---

## Quick Test

After all services are running:

1. Open **http://localhost:5174** in browser
2. Click **Register** → create an account
3. The SMS setup modal will appear — you can skip it for now
4. Explore: Dashboard → Transactions → Budget → Goals → Analytics → Family Room

---

## Production Build (Optional)

To build the frontend for production:

```powershell
cd Personal-Finance-Assistance
npm run build
```

Build output will be in `dist/`. Serve with any static server.

For backend production:

```powershell
cd backend
npm run build
npm start
```
