import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.NODE_ENV !== 'production',
  },
};

// Export a pool promise
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log(`✅ Connected to MS SQL Server ${dbConfig.server}:${dbConfig.port}`);
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    throw err;
  });

export { sql, poolPromise };
