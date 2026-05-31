const db = require('./database');

console.log('===========================================');
console.log('SQLite Database Seeder');
console.log('===========================================\n');

// Sample data to seed
const sampleIssues = [
    {
        issue_id: 'ISS001',
        title: 'Kitchen Faucet Leak',
        description: 'Kitchen faucet dripping constantly, wasting water',
        category: 'Plumbing',
        location: 'Kitchen',
        priority: 'High',
        status: 'Open',
        estimated_cost: 150.00,
        actual_labour_cost: 0,
        actual_material_cost: 0,
        actual_total_cost: 0,
        variance: 150.00,
        created_date: '2026-05-31'
    },
    {
        issue_id: 'ISS002',
        title: 'Bedroom Wall Painting',
        description: 'Repaint master bedroom walls with fresh coat',
        category: 'Painting',
        location: 'Bedroom',
        priority: 'Medium',
        status: 'InProgress',
        estimated_cost: 500.00,
        actual_labour_cost: 0,
        actual_material_cost: 0,
        actual_total_cost: 0,
        variance: 500.00,
        created_date: '2026-05-30'
    },
    {
        issue_id: 'ISS003',
        title: 'Electrical Outlet Replacement',
        description: 'Replace faulty outlet in living room',
        category: 'Electrical',
        location: 'LivingRoom',
        priority: 'Critical',
        status: 'Open',
        estimated_cost: 80.00,
        actual_labour_cost: 0,
        actual_material_cost: 0,
        actual_total_cost: 0,
        variance: 80.00,
        created_date: '2026-05-31'
    }
];

const sampleLabour = [
    {
        labour_id: 'LAB001',
        issue_id: 'ISS002',
        worker_name: 'John Smith',
        hours: 8,
        rate_per_hour: 25.00,
        total_cost: 200.00,
        date: '2026-05-30'
    }
];

const sampleMaterials = [
    {
        material_id: 'MAT001',
        issue_id: 'ISS002',
        material_name: 'Premium Wall Paint',
        quantity: 3,
        unit: 'Liters',
        unit_cost: 45.00,
        total_cost: 135.00,
        date: '2026-05-30'
    }
];

// Seed the database
console.log('Seeding database...\n');

try {
    // Insert issues
    console.log('Adding issues...');
    sampleIssues.forEach(issue => {
        try {
            db.createIssue(issue);
            console.log(`✓ Added: ${issue.issue_id} - ${issue.title}`);
        } catch (error) {
            console.log(`✗ Skipped: ${issue.issue_id} (already exists or error)`);
        }
    });

    // Insert labour
    console.log('\nAdding labour entries...');
    sampleLabour.forEach(labour => {
        try {
            db.createLabour(labour);
            console.log(`✓ Added: ${labour.labour_id} - ${labour.worker_name}`);
        } catch (error) {
            console.log(`✗ Skipped: ${labour.labour_id} (already exists or error)`);
        }
    });

    // Insert materials
    console.log('\nAdding material entries...');
    sampleMaterials.forEach(material => {
        try {
            db.createMaterial(material);
            console.log(`✓ Added: ${material.material_id} - ${material.material_name}`);
        } catch (error) {
            console.log(`✗ Skipped: ${material.material_id} (already exists or error)`);
        }
    });

    console.log('\n===========================================');
    console.log('Seeding complete!');
    console.log('===========================================\n');

    // Show summary
    const issues = db.getAllIssues();
    const labour = db.getAllLabour();
    const materials = db.getAllMaterials();
    const kpis = db.getKPIs();

    console.log('Database Summary:');
    console.log(`  Issues: ${issues.length}`);
    console.log(`  Labour entries: ${labour.length}`);
    console.log(`  Material entries: ${materials.length}`);
    console.log('\nKPIs:');
    console.log(`  Total Issues: ${kpis.totalIssues}`);
    console.log(`  Open Issues: ${kpis.openIssues}`);
    console.log(`  In Progress: ${kpis.inProgressIssues}`);
    console.log(`  Completed: ${kpis.completedIssues}`);
    console.log(`  Total Estimated Cost: $${kpis.totalEstimatedCost.toFixed(2)}`);
    console.log(`  Total Actual Cost: $${kpis.totalActualCost.toFixed(2)}`);

} catch (error) {
    console.error('Error seeding database:', error);
}

process.exit(0);
