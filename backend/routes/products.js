import express from 'express';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { poolPromise } from '../db.js'; // Assuming you have a db.js file that exports your
// configured mssql pool
import executeQuery from '../utils/helper.js'; // Import the helper function
const router = express.Router();


// Products Endpoints
router.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Products WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND name LIKE @search';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }
    const products = await executeQuery(query, params);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json([]); // Return empty array on error
  }
});

router.post('/api/products', async (req, res) => {
  try {
    const {
      name, cycleTime, material, partWeight, runnerWeight, cavities, packingMethod, packingQty, status
    } = req.body;
    const query = `
      INSERT INTO Products (name, cycleTime, material, partWeight, runnerWeight, cavities, packingMethod, packingQty, status)
      VALUES (@name, @cycleTime, @material, @partWeight, @runnerWeight, @cavities, @packingMethod, @packingQty, @status)
    `;
    await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'cycleTime', type: sql.Int, value: cycleTime },
      { name: 'material', type: sql.VarChar, value: material },
      { name: 'partWeight', type: sql.Decimal(5,1), value: partWeight },
      { name: 'runnerWeight', type: sql.Decimal(5,1), value: runnerWeight },
      { name: 'cavities', type: sql.Int, value: cavities },
      { name: 'packingMethod', type: sql.VarChar, value: packingMethod },
      { name: 'packingQty', type: sql.Int, value: packingQty },
      { name: 'status', type: sql.VarChar, value: status }
    ]);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update Product
router.put('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name, cycleTime, material, partWeight, runnerWeight, cavities, packingMethod, packingQty, status
    } = req.body;

    const query = `
      UPDATE Products
      SET name = @name,
          cycleTime = @cycleTime,
          material = @material,
          partWeight = @partWeight,
          runnerWeight = @runnerWeight,
          cavities = @cavities,
          packingMethod = @packingMethod,
          packingQty = @packingQty,
          status = @status
      WHERE productId = @productId
    `;

    await executeQuery(query, [
      { name: 'productId', type: sql.UniqueIdentifier, value: productId },
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'cycleTime', type: sql.Int, value: cycleTime },
      { name: 'material', type: sql.VarChar, value: material },
      { name: 'partWeight', type: sql.Decimal(10, 2), value: partWeight },
      { name: 'runnerWeight', type: sql.Decimal(10, 2), value: runnerWeight },
      { name: 'cavities', type: sql.Int, value: cavities },
      { name: 'packingMethod', type: sql.VarChar, value: packingMethod },
      { name: 'packingQty', type: sql.Int, value: packingQty },
      { name: 'status', type: sql.VarChar, value: status }
    ]);

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete Product
router.delete('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const query = `DELETE FROM Products WHERE productId = @productId`;

    await executeQuery(query, [
      { name: 'productId', type: sql.UniqueIdentifier, value: productId }
    ]);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


export default router; // Export the router to use in your main app file