const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/migrate_existing_database.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = migrationSQL
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement + ';');
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log('✅ Executed:', statement.split('\n')[0] + '...');
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
          console.log('⚠️ Skipped (already exists):', statement.split('\n')[0] + '...');
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

// Run the migration
runMigration();