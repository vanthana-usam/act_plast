import { poolPromise } from "../db";


const pmexecuteQuery = async (query, params = [], transaction = null) => {
  try {
    const pool = await poolPromise;
    let request = transaction ? transaction.request() : pool.request();

    // Bind parameters
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    return {
      recordset: result.recordset || [], // Rows returned by SELECT queries
      rowsAffected: result.rowsAffected || [0], // Number of rows affected by INSERT/UPDATE/DELETE
    };
  } catch (err) {
    console.error('❌ executeQuery error:', err);
    throw err;
  }
};

export default pmexecuteQuery;