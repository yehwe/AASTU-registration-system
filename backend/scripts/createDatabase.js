const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1q2w3e4r5t6y7u8i9o0p' // Your MySQL password
  });

  try {
    console.log('Reading SQL file...');
    const sqlFile = path.join(__dirname, '../migrations/create_student_registration_db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing SQL commands...');
    const statements = sql.split(';').filter(statement => statement.trim());
    
    for (const statement of statements) {
      try {
        if (statement.trim().toLowerCase().startsWith('create index')) {
          // Skip index creation if it already exists
          const indexName = statement.match(/CREATE INDEX (\w+)/i)[1];
          try {
            await connection.query(statement);
            console.log('✅ Created index:', indexName);
          } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
              console.log('⚠️ Index already exists:', indexName);
            } else {
              throw error;
            }
          }
        } else {
          await connection.query(statement);
          console.log('✅ Executed:', statement.split('\n')[0] + '...');
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
          console.log('⚠️ Skipped (already exists):', statement.split('\n')[0] + '...');
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Database and tables created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createDatabase(); 