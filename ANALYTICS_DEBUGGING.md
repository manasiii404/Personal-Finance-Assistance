## 🔍 Analytics Data Not Showing - Debugging Guide

### **Quick Checks:**

1. **Open Browser Console** (Press F12)
   - Go to Analytics page
   - Check Console tab for errors
   - Look for API calls in Network tab

2. **Check if data is being fetched:**
   - Look for console logs like: `"Analytics Data Loaded:"` 
   - Check if `monthlyTrends` array has data

3. **Verify you have transactions:**
   - Go to Transactions page
   - Make sure you have at least a few transactions
   - Note the dates of your transactions

---

### **Common Issues & Solutions:**

#### **Issue 1: No transactions in database**
**Symptom:** All charts show empty or zeros  
**Solution:** Add some test transactions first

#### **Issue 2: Transactions outside timeframe**
**Symptom:** Charts empty even though you have transactions  
**Solution:** 
- Change timeframe dropdown to "This Year" instead of "This Month"
- Your transactions might be from previous months

#### **Issue 3: API not returning data**
**Symptom:** Console shows errors or empty arrays  
**Solution:**
- Check backend terminal for errors
- Verify backend is running (`npm run dev` in backend folder)
- Check if MongoDB is connected

#### **Issue 4: Frontend not refreshing**
**Symptom:** Old data still showing  
**Solution:**
- Hard refresh browser (Ctrl + Shift + R)
- Clear browser cache
- Check if `useEffect` dependency array is correct

---

### **Test the API Directly:**

Open your browser and go to:
```
http://localhost:3000/api/analytics/monthly-trends?months=6
```

**Expected response:**
```json
{
  "success": true,
  "message": "Monthly trends retrieved successfully",
  "data": [
    {
      "month": "Jul 2024",
      "income": 1234.56,
      "expenses": 567.89,
      "savings": 666.67,
      "savingsRate": 54.0
    },
    ...
  ]
}
```

**If you see empty arrays `[]`:**
- You don't have transactions in those months
- Try adding transactions and refresh

**If you see an error:**
- Check backend console for error details
- Verify MongoDB connection

---

### **Debug Steps:**

1. **Check Backend Logs:**
   ```
   Look in the terminal where "npm run dev" is running (backend)
   You should see: "Monthly trends calculated for user <userId>: 6 months"
   ```

2. **Check Frontend Console:**
   ```javascript
   // Should see this in browser console:
   Analytics Data Loaded: {
     monthlyTrends: [...],  // Should have data
     spendingByCategory: [...],
     incomeByCategory: [...]
   }
   ```

3. **Verify Transactions Exist:**
   - Go to Transactions page
   - Count how many transactions you have
   - Note their dates

4. **Check Chart Component:**
   - If data exists but charts don't show
   - Check browser console for Chart rendering errors

---

### **Quick Fix - Add Test Data:**

If you don't have transactions, add a few:

1. Go to Transactions page
2. Click "Add Transaction"
3. Add 2-3 income transactions (different months)
4. Add 2-3 expense transactions (different months)
5. Go back to Analytics
6. Select "This Year" timeframe
7. Charts should now show data!

---

### **Still Not Working?**

Share the following info:
1. Screenshot of browser console (F12 → Console tab)
2. Number of transactions you have
3. Date range of your transactions
4. Which timeframe you selected in Analytics
