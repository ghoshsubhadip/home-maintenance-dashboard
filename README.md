# Home Maintenance Dashboard with SQLite Backend

A complete SAPUI5 application for managing home maintenance issues, labour, and materials with a Node.js + SQLite backend.

## 📋 Features

- **Issue Management**: Create, edit, delete, and track home maintenance issues
- **Labour Tracking**: Record worker hours and costs per issue
- **Material Tracking**: Track materials used for each issue
- **Cost Analysis**: Real-time KPIs showing estimated vs actual costs
- **SQLite Database**: Persistent data storage with automatic cost calculations
- **RESTful API**: Complete backend API for all operations

## 🏗️ Architecture

```
Frontend: SAPUI5 (JavaScript)
Backend: Node.js + Express
Database: SQLite
Communication: REST API
```

## 📦 Prerequisites

- Node.js (v14 or higher)
- npm
- A modern web browser
- A simple HTTP server for the frontend (e.g., VS Code Live Server, http-server)

## 🚀 Installation & Setup

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```powershell
cd backend
npm install
```

### 2. Start the Backend Server

```powershell
npm start
```

The backend server will start on `http://localhost:3000`

For development with auto-reload:
```powershell
npm run dev
```

### 3. Frontend Setup

The frontend is a static SAPUI5 application. You need to serve it using any HTTP server.

**Option A: Using VS Code Live Server**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Option B: Using http-server (npm)**
```powershell
# Install http-server globally
npm install -g http-server

# From the root directory (not backend folder)
cd ..
http-server -p 8080
```

**Option C: Using Python**
```powershell
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

(Adjust the port if you used a different one)

## 📊 Database Schema

### Issues Table
- `issue_id` (TEXT, PRIMARY KEY) - Unique identifier (ISS001, ISS002, ...)
- `title` (TEXT) - Issue title
- `description` (TEXT) - Detailed description
- `category` (TEXT) - Civil, Painting, Plumbing, Electrical, Carpentry, Cleaning
- `location` (TEXT) - Bedroom, Kitchen, Bathroom, Living Room, Outside, Terrace
- `priority` (TEXT) - Low, Medium, High, Critical
- `status` (TEXT) - Open, InProgress, OnHold, Completed, Cancelled
- `estimated_cost` (REAL) - Estimated cost for the issue
- `actual_labour_cost` (REAL) - Calculated from labour entries
- `actual_material_cost` (REAL) - Calculated from material entries
- `actual_total_cost` (REAL) - Sum of labour and material costs
- `variance` (REAL) - Difference between estimated and actual
- `created_date` (TEXT) - Date created (YYYY-MM-DD)

### Labour Table
- `labour_id` (TEXT, PRIMARY KEY) - Unique identifier (LAB001, LAB002, ...)
- `issue_id` (TEXT, FOREIGN KEY) - Reference to issue
- `worker_name` (TEXT) - Worker's name
- `hours` (REAL) - Hours worked
- `rate_per_hour` (REAL) - Hourly rate
- `total_cost` (REAL) - hours × rate_per_hour
- `date` (TEXT) - Date of work (YYYY-MM-DD)

### Materials Table
- `material_id` (TEXT, PRIMARY KEY) - Unique identifier (MAT001, MAT002, ...)
- `issue_id` (TEXT, FOREIGN KEY) - Reference to issue
- `material_name` (TEXT) - Name of material
- `quantity` (REAL) - Quantity used
- `unit` (TEXT) - Unit of measurement
- `unit_cost` (REAL) - Cost per unit
- `total_cost` (REAL) - quantity × unit_cost
- `date` (TEXT) - Date of purchase (YYYY-MM-DD)

## 🔌 API Endpoints

### Issues
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get specific issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Labour
- `GET /api/labour` - Get all labour entries
- `GET /api/labour/issue/:issueId` - Get labour for specific issue
- `POST /api/labour` - Create labour entry

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/issue/:issueId` - Get materials for specific issue
- `POST /api/materials` - Create material entry

### KPIs
- `GET /api/kpis` - Get dashboard KPIs (totals, counts, costs)

### Helpers
- `GET /api/helpers/next-issue-id` - Get next available issue ID
- `GET /api/helpers/next-labour-id` - Get next available labour ID
- `GET /api/helpers/next-material-id` - Get next available material ID

### Health Check
- `GET /health` - Server health check

## 🔄 How It Works

1. **Frontend loads** → SAPUI5 app initializes with empty data model
2. **Controller calls backend** → `DataService.loadAllData()` fetches from API
3. **Backend queries SQLite** → Returns issues, labour, materials, and KPIs
4. **Frontend displays** → Data is bound to UI controls

### Data Flow for Creating an Issue:
```
User fills form → Controller validates → 
DataService.createIssue() → POST /api/issues → 
Database.createIssue() → SQLite INSERT → 
Response → Frontend refreshes data
```

### Automatic Cost Calculation:
When labour or material is added:
```
POST /api/labour or /api/materials → 
Database creates entry → 
Database.updateIssueCosts() → 
SQLite calculates totals → 
Updates issue record automatically
```

## 📁 Project Structure

```
home-maintenance-dashboard/
├── backend/
│   ├── database.js         # SQLite operations
│   ├── server.js           # Express server & API routes
│   ├── package.json        # Backend dependencies
│   ├── README.md           # Backend documentation
│   └── .gitignore
├── service/
│   └── DataService.js      # Frontend API client
├── controller/
│   └── Main.controller.js  # Updated to use backend
├── view/
│   └── Main.view.xml
├── fragment/
│   ├── CreateIssueDialog.fragment.xml
│   ├── LabourEntryDialog.fragment.xml
│   └── MaterialEntryDialog.fragment.xml
├── css/
│   └── style.css
├── Component.js            # Updated to initialize empty model
├── manifest.json
├── index.html
└── README.md               # This file
```

## 🧪 Testing the API

You can test the API using curl, Postman, or any REST client:

```powershell
# Health check
curl http://localhost:3000/health

# Get all issues
curl http://localhost:3000/api/issues

# Get KPIs
curl http://localhost:3000/api/kpis

# Create an issue
curl -X POST http://localhost:3000/api/issues `
  -H "Content-Type: application/json" `
  -d '{"title":"Test Issue","category":"Plumbing","location":"Kitchen","priority":"High","status":"Open","estimated_cost":100}'
```

## 🐛 Troubleshooting

### Backend won't start
- Check if Node.js is installed: `node --version`
- Ensure you're in the `backend` directory
- Delete `node_modules` and run `npm install` again

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify the API_BASE_URL in `service/DataService.js` is correct

### Database errors
- The SQLite database file is created automatically
- If corrupted, delete `backend/home_maintenance.db` and restart the server
- Check backend console for detailed error messages

### No data displayed
- Open browser DevTools (F12) and check Console tab
- Verify backend is running: visit `http://localhost:3000/health`
- Check Network tab for failed API calls

## 🔒 Security Notes

⚠️ **This is a development setup. For production:**
- Add authentication/authorization
- Implement input validation
- Add rate limiting
- Use HTTPS
- Configure CORS properly (currently allows all origins)
- Add database backups
- Implement proper error handling

## 📝 Future Enhancements

- [ ] User authentication
- [ ] Multiple users/roles
- [ ] File attachments for issues
- [ ] Email notifications
- [ ] Export reports (PDF/Excel)
- [ ] Charts and analytics
- [ ] Mobile responsive improvements
- [ ] Docker containerization

## 📄 License

This is a sample project for educational purposes.

## 👤 Author

Created for home maintenance management

---

**Need Help?** Check the backend README at `backend/README.md` for more details.
- Web server (optional) or open directly in browser

### Installation & Running

#### Option 1: Direct Browser Access (Recommended)
1. Simply open `index.html` in your web browser
2. The application will load with sample data

#### Option 2: Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Application opens at `http://127.0.0.1:5500/`

#### Option 3: Using Python HTTP Server
```bash
# Navigate to project directory
cd home-maintenance-dashboard

# Python 3
python -m http.server 8000

# Access at http://localhost:8000
```

#### Option 4: Using Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Run in project directory
http-server -p 8000

# Access at http://localhost:8000
```

## 🎨 Application Namespace

Following SAPUI5 best practices, the application uses the namespace **`app`**:

```
app.view.Main
app.controller.Main
app.fragment.CreateIssueDialog
app.fragment.LabourEntryDialog
app.fragment.MaterialEntryDialog
app.model (JSONModel)
```

## 💻 Usage Guide

### Creating an Issue
1. Click **"Create Issue"** button in the header
2. Fill in required fields:
   - Title
   - Description
   - Category
   - Location
   - Priority
   - Status
   - Estimated Cost
3. Click **"Save"**

### Editing an Issue
1. Click the **Edit icon** (pencil) in the Actions column
2. Modify fields as needed
3. Click **"Save"**

### Adding Labour Entry
1. Click the **Labour icon** (person) in the Actions column
2. Enter:
   - Worker Name
   - Hours Worked
   - Rate per Hour
   - Date
3. Click **"Save"**
4. Issue costs automatically update

### Adding Material Entry
1. Click the **Material icon** (box) in the Actions column
2. Enter:
   - Material Name
   - Quantity
   - Unit (Liters, Pieces, Bags, etc.)
   - Unit Cost
   - Date
3. Click **"Save"**
4. Issue costs automatically update

### Deleting an Issue
1. Click the **Delete icon** (trash) in the Actions column
2. Confirm deletion
3. Related labour and material entries are also removed

### Searching Issues
1. Use the search field in the table header
2. Searches across: Issue ID, Title, Description, Category, Location, Status

## 📊 Data Model Structure

### Issues (db_issue_task)
```javascript
{
    issue_id: "ISS001",
    title: "Leaking Kitchen Faucet",
    description: "Kitchen faucet has been leaking...",
    category: "Plumbing",
    location: "Kitchen",
    priority: "High",
    status: "Open",
    estimated_cost: 150.00,
    actual_labour_cost: 0,
    actual_material_cost: 0,
    actual_total_cost: 0,
    variance: 0,
    created_date: "2026-05-28"
}
```

### Labour (db_issue_labour)
```javascript
{
    labour_id: "LAB001",
    issue_id: "ISS002",
    worker_name: "John Smith",
    hours: 10,
    rate_per_hour: 25.00,
    total_cost: 250.00,
    date: "2026-05-26"
}
```

### Materials (db_issue_material)
```javascript
{
    material_id: "MAT001",
    issue_id: "ISS002",
    material_name: "Premium Wall Paint",
    quantity: 4,
    unit: "Liters",
    unit_cost: 45.00,
    total_cost: 180.00,
    date: "2026-05-26"
}
```

## 🎨 UI Components

### KPI Cards
- **Total Issues** - Count of all issues
- **Open Issues** - Issues awaiting action
- **In Progress** - Currently being worked on
- **Completed** - Finished tasks

### Cost Summary Cards
- **Estimated Cost** - Total estimated budget
- **Actual Cost** - Total spent (labour + materials)
- **Variance** - Budget difference (Estimated - Actual)

### Issues Table
Responsive table with:
- Sort and filter capabilities
- Status indicators with color coding
- Priority levels with visual states
- Action buttons for each issue
- Mobile-friendly pop-in columns

## 🎨 Styling & Theming

- **Theme**: SAP Horizon (modern, clean design)
- **Gradient Cards**: Eye-catching KPI cards with gradient backgrounds
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Custom CSS**: Professional styling with hover effects and animations
- **Color-coded States**: 
  - Priority: Critical (Red), High (Orange), Medium (Blue), Low (Green)
  - Status: Open (Orange), In Progress (Blue), Completed (Green)

## 🔧 Technical Details

### Technologies
- **Framework**: SAPUI5 (OpenUI5 1.96+)
- **Libraries**: sap.m, sap.ui.layout, sap.ui.core
- **Data Binding**: Two-way binding with JSONModel
- **Pattern**: MVC (Model-View-Controller)
- **Responsive**: Grid layout with responsive breakpoints

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## 📱 Responsive Breakpoints

- **Desktop (XL)**: 1200px+
- **Laptop (L)**: 1024px - 1199px
- **Tablet (M)**: 600px - 1023px
- **Phone (S)**: < 600px

## 🔐 Sample Data

The application comes pre-loaded with 5 sample issues:
1. Leaking Kitchen Faucet (Plumbing)
2. Bedroom Wall Painting (Painting)
3. Replace Electrical Outlet (Electrical)
4. Door Hinge Repair (Carpentry)
5. Terrace Waterproofing (Civil)

## 🚀 Production Deployment

### For GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch / root
4. Access at `https://yourusername.github.io/home-maintenance-dashboard/`

### For SAP Cloud Platform
1. Build the application
2. Deploy to SAP BTP
3. Configure app router if needed

### For Standard Web Server
1. Upload all files to web server
2. Ensure MIME types are configured correctly
3. Access via server URL

## 🛠️ Customization

### Adding New Categories
Edit [Component.js](Component.js) - `categories` array:
```javascript
categories: [
    { key: "YourCategory", text: "Your Category" }
]
```

### Adding New Locations
Edit [Component.js](Component.js) - `locations` array:
```javascript
locations: [
    { key: "YourLocation", text: "Your Location" }
]
```

### Modifying Styles
Edit [css/style.css](css/style.css) to customize colors, fonts, and layouts

## 📝 Best Practices Followed

✅ **MVC Pattern** - Clean separation of concerns  
✅ **Namespace Convention** - Consistent `app.*` namespace  
✅ **Fragment Usage** - Reusable dialog components  
✅ **Two-way Data Binding** - Reactive UI updates  
✅ **Responsive Design** - Mobile-first approach  
✅ **Accessibility** - Proper ARIA labels and keyboard navigation  
✅ **Performance** - Optimized rendering and data handling  
✅ **Code Quality** - Clean, documented, production-ready code  

## 🐛 Troubleshooting

### Application doesn't load
- Check browser console for errors
- Verify internet connection (loads SAPUI5 from CDN)
- Try clearing browser cache

### Data not saving
- Data is stored in-memory (resets on page refresh)
- For persistent storage, integrate with backend API

### Layout issues
- Ensure browser zoom is 100%
- Try different browser
- Check browser compatibility

## 📄 File Descriptions

| File | Purpose |
|------|---------|
| **index.html** | Entry point, loads SAPUI5 and component |
| **manifest.json** | App descriptor with routing and model config |
| **Component.js** | Component initialization, data model setup |
| **Main.view.xml** | Main dashboard UI layout |
| **Main.controller.js** | Business logic, event handlers, CRUD operations |
| **CreateIssueDialog.fragment.xml** | Issue creation/edit form |
| **LabourEntryDialog.fragment.xml** | Labour entry form |
| **MaterialEntryDialog.fragment.xml** | Material entry form |
| **style.css** | Custom styles and theming |
| **i18n.properties** | Internationalization texts |

## 🤝 Contributing

To extend this application:
1. Follow the existing namespace pattern (`app.*`)
2. Maintain MVC structure
3. Update i18n properties for new texts
4. Test on multiple devices and browsers

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify file paths and namespaces
- Ensure all files are in correct directories

## 📜 License

This project is provided as-is for educational and development purposes.

## 🎓 Learning Resources

- [SAPUI5 Documentation](https://sapui5.hana.ondemand.com/)
- [OpenUI5 Documentation](https://openui5.org/)
- [SAP Fiori Design Guidelines](https://experience.sap.com/fiori-design/)

---

**Version**: 1.0.0  
**Last Updated**: May 30, 2026  
**Built with**: SAPUI5 Framework

🏠 Happy Home Maintenance Management! 🔧
