import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.DB_USER,process.env.DB_SERVER , process.env.DB_NAME)
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Export a pool promise
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Connected to MS SQL Server 192.168.1.158");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    throw err;
  });

export { sql, poolPromise };
