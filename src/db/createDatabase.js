const sql = require('mssql');

const createDatabase = async (dbName) => {
  const dbConfig = {
    server: '192.168.50.41',
    user: 'QCdbadmin',
    password: 'C0ntrol9rint',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
      BEGIN
        CREATE DATABASE [${dbName}];
      END`);
    console.log(`✅ Database ${dbName} ensured.`);
    await sql.close();
  } catch (err) {
    console.error(`❌ Error creating database:`, err);
    throw err;
  }
};

module.exports = createDatabase;