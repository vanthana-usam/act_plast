import { poolPromise } from '../db.js'; // Ensure this exports a connected sql.ConnectionPool

// ========================= Helper Functions =========================

// ✅ Basic query executor
const executeQuery = async (query, params = []) => {
  try {
    const conn = await poolPromise; // Wait for resolved pool connection
    const request = conn.request();

    // Bind parameters
    params.forEach(param => request.input(param.name, param.type, param.value));

    const result = await request.query(query);

    return Array.isArray(result.recordset) ? result.recordset : [];
  } catch (err) {
    console.error('❌ Query execution failed:', err);
    throw err;
  }
};

// ✅ PM-specific executor with optional transaction support
const pmexecuteQuery = async (query, params = [], transaction = null) => {
  try {
    const pool = await poolPromise;
    const request = transaction ? transaction.request() : pool.request();

    // Bind parameters
    params.forEach(param => request.input(param.name, param.type, param.value));

    const result = await request.query(query);

    return {
      recordset: result.recordset || [],
      rowsAffected: result.rowsAffected || [0],
    };
  } catch (err) {
    console.error('❌ pmexecuteQuery error:', err);
    throw err;
  }
};

// ✅ Correct export
export { executeQuery, pmexecuteQuery };
