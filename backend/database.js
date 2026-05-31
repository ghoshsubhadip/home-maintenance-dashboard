const Database = require('better-sqlite3');
const path = require('path');

// Create or open the database
const db = new Database(path.join(__dirname, 'home_maintenance.db'), { verbose: console.log });

// Initialize database schema
function initializeDatabase() {
    // Create Issues table
    db.exec(`
        CREATE TABLE IF NOT EXISTS issues (
            issue_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            estimated_cost REAL DEFAULT 0,
            actual_labour_cost REAL DEFAULT 0,
            actual_material_cost REAL DEFAULT 0,
            actual_total_cost REAL DEFAULT 0,
            variance REAL DEFAULT 0,
            created_date TEXT NOT NULL
        )
    `);

    // Create Labour table
    db.exec(`
        CREATE TABLE IF NOT EXISTS labour (
            labour_id TEXT PRIMARY KEY,
            issue_id TEXT NOT NULL,
            worker_name TEXT NOT NULL,
            hours REAL NOT NULL,
            rate_per_hour REAL NOT NULL,
            total_cost REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE
        )
    `);

    // Create Materials table
    db.exec(`
        CREATE TABLE IF NOT EXISTS materials (
            material_id TEXT PRIMARY KEY,
            issue_id TEXT NOT NULL,
            material_name TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            unit_cost REAL NOT NULL,
            total_cost REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE
        )
    `);

    console.log('Database initialized successfully');
}

// ============================================
// ISSUES CRUD Operations
// ============================================

function getAllIssues() {
    const stmt = db.prepare('SELECT * FROM issues ORDER BY created_date DESC');
    return stmt.all();
}

function getIssueById(issueId) {
    const stmt = db.prepare('SELECT * FROM issues WHERE issue_id = ?');
    return stmt.get(issueId);
}

function createIssue(issue) {
    const stmt = db.prepare(`
        INSERT INTO issues (
            issue_id, title, description, category, location, 
            priority, status, estimated_cost, actual_labour_cost, 
            actual_material_cost, actual_total_cost, variance, created_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
        issue.issue_id,
        issue.title,
        issue.description,
        issue.category,
        issue.location,
        issue.priority,
        issue.status,
        issue.estimated_cost || 0,
        issue.actual_labour_cost || 0,
        issue.actual_material_cost || 0,
        issue.actual_total_cost || 0,
        issue.variance || 0,
        issue.created_date
    );
    
    return info.changes > 0;
}

function updateIssue(issueId, issue) {
    const stmt = db.prepare(`
        UPDATE issues 
        SET title = ?, description = ?, category = ?, location = ?, 
            priority = ?, status = ?, estimated_cost = ?,
            actual_labour_cost = ?, actual_material_cost = ?,
            actual_total_cost = ?, variance = ?
        WHERE issue_id = ?
    `);
    
    const info = stmt.run(
        issue.title,
        issue.description,
        issue.category,
        issue.location,
        issue.priority,
        issue.status,
        issue.estimated_cost || 0,
        issue.actual_labour_cost || 0,
        issue.actual_material_cost || 0,
        issue.actual_total_cost || 0,
        issue.variance || 0,
        issueId
    );
    
    return info.changes > 0;
}

function deleteIssue(issueId) {
    // Delete related labour and materials first
    deleteLabourByIssueId(issueId);
    deleteMaterialsByIssueId(issueId);
    
    const stmt = db.prepare('DELETE FROM issues WHERE issue_id = ?');
    const info = stmt.run(issueId);
    return info.changes > 0;
}

// ============================================
// LABOUR CRUD Operations
// ============================================

function getAllLabour() {
    const stmt = db.prepare('SELECT * FROM labour ORDER BY date DESC');
    return stmt.all();
}

function getLabourByIssueId(issueId) {
    const stmt = db.prepare('SELECT * FROM labour WHERE issue_id = ? ORDER BY date DESC');
    return stmt.all(issueId);
}

function createLabour(labour) {
    const stmt = db.prepare(`
        INSERT INTO labour (
            labour_id, issue_id, worker_name, hours, 
            rate_per_hour, total_cost, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
        labour.labour_id,
        labour.issue_id,
        labour.worker_name,
        labour.hours,
        labour.rate_per_hour,
        labour.total_cost,
        labour.date
    );
    
    // Update issue costs
    if (info.changes > 0) {
        updateIssueCosts(labour.issue_id);
    }
    
    return info.changes > 0;
}

function deleteLabourByIssueId(issueId) {
    const stmt = db.prepare('DELETE FROM labour WHERE issue_id = ?');
    return stmt.run(issueId);
}

// ============================================
// MATERIALS CRUD Operations
// ============================================

function getAllMaterials() {
    const stmt = db.prepare('SELECT * FROM materials ORDER BY date DESC');
    return stmt.all();
}

function getMaterialsByIssueId(issueId) {
    const stmt = db.prepare('SELECT * FROM materials WHERE issue_id = ? ORDER BY date DESC');
    return stmt.all(issueId);
}

function createMaterial(material) {
    const stmt = db.prepare(`
        INSERT INTO materials (
            material_id, issue_id, material_name, quantity, 
            unit, unit_cost, total_cost, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
        material.material_id,
        material.issue_id,
        material.material_name,
        material.quantity,
        material.unit,
        material.unit_cost,
        material.total_cost,
        material.date
    );
    
    // Update issue costs
    if (info.changes > 0) {
        updateIssueCosts(material.issue_id);
    }
    
    return info.changes > 0;
}

function deleteMaterialsByIssueId(issueId) {
    const stmt = db.prepare('DELETE FROM materials WHERE issue_id = ?');
    return stmt.run(issueId);
}

// ============================================
// Helper Functions
// ============================================

function updateIssueCosts(issueId) {
    // Calculate labour costs
    const labourStmt = db.prepare('SELECT SUM(total_cost) as labour_cost FROM labour WHERE issue_id = ?');
    const labourResult = labourStmt.get(issueId);
    const labourCost = labourResult.labour_cost || 0;
    
    // Calculate material costs
    const materialStmt = db.prepare('SELECT SUM(total_cost) as material_cost FROM materials WHERE issue_id = ?');
    const materialResult = materialStmt.get(issueId);
    const materialCost = materialResult.material_cost || 0;
    
    // Get estimated cost
    const issueStmt = db.prepare('SELECT estimated_cost FROM issues WHERE issue_id = ?');
    const issue = issueStmt.get(issueId);
    const estimatedCost = issue ? issue.estimated_cost : 0;
    
    // Calculate totals
    const totalCost = labourCost + materialCost;
    const variance = estimatedCost - totalCost;
    
    // Update issue
    const updateStmt = db.prepare(`
        UPDATE issues 
        SET actual_labour_cost = ?, 
            actual_material_cost = ?,
            actual_total_cost = ?,
            variance = ?
        WHERE issue_id = ?
    `);
    
    updateStmt.run(labourCost, materialCost, totalCost, variance, issueId);
}

function getKPIs() {
    const issues = getAllIssues();
    
    return {
        totalIssues: issues.length,
        openIssues: issues.filter(i => i.status === 'Open').length,
        inProgressIssues: issues.filter(i => i.status === 'InProgress').length,
        completedIssues: issues.filter(i => i.status === 'Completed').length,
        totalEstimatedCost: issues.reduce((sum, i) => sum + i.estimated_cost, 0),
        totalActualCost: issues.reduce((sum, i) => sum + i.actual_total_cost, 0),
        totalVariance: issues.reduce((sum, i) => sum + i.variance, 0)
    };
}

function getNextIssueId() {
    const stmt = db.prepare(`
        SELECT issue_id FROM issues 
        WHERE issue_id LIKE 'ISS%' 
        ORDER BY issue_id DESC 
        LIMIT 1
    `);
    const lastIssue = stmt.get();
    
    if (!lastIssue) {
        return 'ISS001';
    }
    
    const lastNum = parseInt(lastIssue.issue_id.replace('ISS', ''));
    return 'ISS' + String(lastNum + 1).padStart(3, '0');
}

function getNextLabourId() {
    const stmt = db.prepare(`
        SELECT labour_id FROM labour 
        WHERE labour_id LIKE 'LAB%' 
        ORDER BY labour_id DESC 
        LIMIT 1
    `);
    const lastLabour = stmt.get();
    
    if (!lastLabour) {
        return 'LAB001';
    }
    
    const lastNum = parseInt(lastLabour.labour_id.replace('LAB', ''));
    return 'LAB' + String(lastNum + 1).padStart(3, '0');
}

function getNextMaterialId() {
    const stmt = db.prepare(`
        SELECT material_id FROM materials 
        WHERE material_id LIKE 'MAT%' 
        ORDER BY material_id DESC 
        LIMIT 1
    `);
    const lastMaterial = stmt.get();
    
    if (!lastMaterial) {
        return 'MAT001';
    }
    
    const lastNum = parseInt(lastMaterial.material_id.replace('MAT', ''));
    return 'MAT' + String(lastNum + 1).padStart(3, '0');
}

// Initialize database on module load
initializeDatabase();

module.exports = {
    db,
    // Issues
    getAllIssues,
    getIssueById,
    createIssue,
    updateIssue,
    deleteIssue,
    // Labour
    getAllLabour,
    getLabourByIssueId,
    createLabour,
    // Materials
    getAllMaterials,
    getMaterialsByIssueId,
    createMaterial,
    // Helpers
    getKPIs,
    getNextIssueId,
    getNextLabourId,
    getNextMaterialId
};
