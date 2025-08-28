import { poolPromise } from '../db.js'; // Assuming you have a db.js file that

// ================================= Helper =====================================
const executeQuery = async (query, params = []) => {
  try {
    // const request = pool.request();
    const conn = await poolPromise; // ✅ wait for resolved connection pool
    const request = conn.request();
    params.forEach(param => request.input(param.name, param.type, param.value));
    const result = await request.query(query);
    return Array.isArray(result.recordset) ? result.recordset : [];
  } catch (err) {
    console.error('Query execution failed:', err);
    throw err;
  }
};

export default executeQuery;