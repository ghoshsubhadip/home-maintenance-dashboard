const db = require('./database');

console.log('===========================================');
console.log('Database Viewer - Current Data');
console.log('===========================================\n');

try {
    // Get all data
    const issues = db.getAllIssues();
    const labour = db.getAllLabour();
    const materials = db.getAllMaterials();
    const kpis = db.getKPIs();

    // Display Issues
    console.log('📋 ISSUES:');
    console.log('─'.repeat(80));
    if (issues.length === 0) {
        console.log('  No issues found.');
    } else {
        issues.forEach(issue => {
            console.log(`  ${issue.issue_id} - ${issue.title}`);
            console.log(`    Status: ${issue.status} | Priority: ${issue.priority} | Category: ${issue.category}`);
            console.log(`    Location: ${issue.location}`);
            console.log(`    Estimated Cost: $${issue.estimated_cost.toFixed(2)} | Actual: $${issue.actual_total_cost.toFixed(2)}`);
            console.log(`    Created: ${issue.created_date}`);
            console.log('');
        });
    }

    // Display Labour
    console.log('\n👷 LABOUR ENTRIES:');
    console.log('─'.repeat(80));
    if (labour.length === 0) {
        console.log('  No labour entries found.');
    } else {
        labour.forEach(lab => {
            console.log(`  ${lab.labour_id} - ${lab.worker_name}`);
            console.log(`    Issue: ${lab.issue_id} | Hours: ${lab.hours} @ $${lab.rate_per_hour}/hr`);
            console.log(`    Total Cost: $${lab.total_cost.toFixed(2)} | Date: ${lab.date}`);
            console.log('');
        });
    }

    // Display Materials
    console.log('\n🔧 MATERIAL ENTRIES:');
    console.log('─'.repeat(80));
    if (materials.length === 0) {
        console.log('  No material entries found.');
    } else {
        materials.forEach(mat => {
            console.log(`  ${mat.material_id} - ${mat.material_name}`);
            console.log(`    Issue: ${mat.issue_id} | Qty: ${mat.quantity} ${mat.unit} @ $${mat.unit_cost}/unit`);
            console.log(`    Total Cost: $${mat.total_cost.toFixed(2)} | Date: ${mat.date}`);
            console.log('');
        });
    }

    // Display KPIs
    console.log('\n📊 KPIs (Summary):');
    console.log('─'.repeat(80));
    console.log(`  Total Issues: ${kpis.totalIssues}`);
    console.log(`  Open Issues: ${kpis.openIssues}`);
    console.log(`  In Progress: ${kpis.inProgressIssues}`);
    console.log(`  Completed: ${kpis.completedIssues}`);
    console.log(`  Total Estimated Cost: $${kpis.totalEstimatedCost.toFixed(2)}`);
    console.log(`  Total Actual Cost: $${kpis.totalActualCost.toFixed(2)}`);
    console.log(`  Variance: $${kpis.totalVariance.toFixed(2)}`);
    console.log('');

} catch (error) {
    console.error('Error viewing database:', error);
}

process.exit(0);
