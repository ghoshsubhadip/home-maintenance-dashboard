const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// ISSUES API Endpoints
// ============================================

// GET all issues
app.get('/api/issues', (req, res) => {
    try {
        const issues = db.getAllIssues();
        res.json({ success: true, data: issues });
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET issue by ID
app.get('/api/issues/:id', (req, res) => {
    try {
        const issue = db.getIssueById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, error: 'Issue not found' });
        }
        res.json({ success: true, data: issue });
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create new issue
app.post('/api/issues', (req, res) => {
    try {
        const issue = req.body;
        
        // Add default values if not provided
        if (!issue.issue_id) {
            issue.issue_id = db.getNextIssueId();
        }
        if (!issue.created_date) {
            issue.created_date = new Date().toISOString().split('T')[0];
        }
        issue.actual_labour_cost = 0;
        issue.actual_material_cost = 0;
        issue.actual_total_cost = 0;
        issue.variance = issue.estimated_cost || 0;
        
        const success = db.createIssue(issue);
        
        if (success) {
            res.json({ success: true, data: issue });
        } else {
            res.status(400).json({ success: false, error: 'Failed to create issue' });
        }
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT update issue
app.put('/api/issues/:id', (req, res) => {
    try {
        const issueId = req.params.id;
        const issue = req.body;
        
        const success = db.updateIssue(issueId, issue);
        
        if (success) {
            const updatedIssue = db.getIssueById(issueId);
            res.json({ success: true, data: updatedIssue });
        } else {
            res.status(404).json({ success: false, error: 'Issue not found' });
        }
    } catch (error) {
        console.error('Error updating issue:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE issue
app.delete('/api/issues/:id', (req, res) => {
    try {
        const success = db.deleteIssue(req.params.id);
        
        if (success) {
            res.json({ success: true, message: 'Issue deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Issue not found' });
        }
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// LABOUR API Endpoints
// ============================================

// GET all labour entries
app.get('/api/labour', (req, res) => {
    try {
        const labour = db.getAllLabour();
        res.json({ success: true, data: labour });
    } catch (error) {
        console.error('Error fetching labour:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET labour entries by issue ID
app.get('/api/labour/issue/:issueId', (req, res) => {
    try {
        const labour = db.getLabourByIssueId(req.params.issueId);
        res.json({ success: true, data: labour });
    } catch (error) {
        console.error('Error fetching labour:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create labour entry
app.post('/api/labour', (req, res) => {
    try {
        const labour = req.body;
        
        if (!labour.labour_id) {
            labour.labour_id = db.getNextLabourId();
        }
        
        const success = db.createLabour(labour);
        
        if (success) {
            res.json({ success: true, data: labour });
        } else {
            res.status(400).json({ success: false, error: 'Failed to create labour entry' });
        }
    } catch (error) {
        console.error('Error creating labour:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MATERIALS API Endpoints
// ============================================

// GET all materials
app.get('/api/materials', (req, res) => {
    try {
        const materials = db.getAllMaterials();
        res.json({ success: true, data: materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET materials by issue ID
app.get('/api/materials/issue/:issueId', (req, res) => {
    try {
        const materials = db.getMaterialsByIssueId(req.params.issueId);
        res.json({ success: true, data: materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create material entry
app.post('/api/materials', (req, res) => {
    try {
        const material = req.body;
        
        if (!material.material_id) {
            material.material_id = db.getNextMaterialId();
        }
        
        const success = db.createMaterial(material);
        
        if (success) {
            res.json({ success: true, data: material });
        } else {
            res.status(400).json({ success: false, error: 'Failed to create material entry' });
        }
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// KPIs API Endpoint
// ============================================

// GET KPIs
app.get('/api/kpis', (req, res) => {
    try {
        const kpis = db.getKPIs();
        res.json({ success: true, data: kpis });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// HELPERS API Endpoints
// ============================================

// GET next issue ID
app.get('/api/helpers/next-issue-id', (req, res) => {
    try {
        const nextId = db.getNextIssueId();
        res.json({ success: true, data: nextId });
    } catch (error) {
        console.error('Error getting next issue ID:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET next labour ID
app.get('/api/helpers/next-labour-id', (req, res) => {
    try {
        const nextId = db.getNextLabourId();
        res.json({ success: true, data: nextId });
    } catch (error) {
        console.error('Error getting next labour ID:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET next material ID
app.get('/api/helpers/next-material-id', (req, res) => {
    try {
        const nextId = db.getNextMaterialId();
        res.json({ success: true, data: nextId });
    } catch (error) {
        console.error('Error getting next material ID:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Health Check
// ============================================

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Home Maintenance API is running'
    });
});

// ============================================
// Error Handling
// ============================================

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log('========================================');
    console.log(`Home Maintenance API Server`);
    console.log(`Running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('========================================');
});

module.exports = app;
