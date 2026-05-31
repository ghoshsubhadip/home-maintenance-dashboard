# Quick Start Guide

## Start the Application in 3 Steps

### Step 1: Install Backend Dependencies
```powershell
cd backend
npm install
```

### Step 2: Start Backend Server
```powershell
npm start
```
✅ Backend running on http://localhost:3000

### Step 3: Start Frontend
Open a new terminal in the project root:

**Using VS Code Live Server:**
- Right-click `index.html` → "Open with Live Server"

**Using http-server:**
```powershell
npm install -g http-server
http-server -p 8080
```

✅ Frontend running on http://localhost:8080

## That's it! 🎉

Open your browser and go to **http://localhost:8080**

## First Time Use

The database starts empty. Try creating your first issue:
1. Click "Create Issue" button
2. Fill in the form
3. Click "Save"

## Troubleshooting

**Problem:** "Failed to load data from server"
- **Solution:** Make sure backend is running on port 3000

**Problem:** Backend won't start
- **Solution:** Check if Node.js is installed: `node --version`

**Problem:** Port already in use
- **Solution:** Change port in backend/server.js or kill the process using the port

## Next Steps

- Read the full README.md for detailed information
- Check backend/README.md for API documentation
- Test the API endpoints using the examples provided

---

Happy tracking! 🏠🔧
