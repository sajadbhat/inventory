const http = require('node:http');
const { app, server } = require('./server');

const PORT = 5000;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:${PORT}${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } else {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Inventory API Verification Tests ---');
  let testProductId = null;

  try {
    // 1. Health Check
    console.log('\n1. Checking GET /api/health...');
    const health = await request('/api/health');
    console.log('Status:', health.status, 'Body:', health.body);
    if (health.status !== 200 || health.body.status !== 'online') throw new Error('Health check failed');

    // 2. Dashboard Stats
    console.log('\n2. Checking GET /api/dashboard/stats...');
    const stats = await request('/api/dashboard/stats');
    console.log('Status:', stats.status, 'KPI Summary:', stats.body.data.summary);
    if (stats.status !== 200 || !stats.body.success) throw new Error('Dashboard stats failed');

    // 3. Products List
    console.log('\n3. Checking GET /api/products...');
    const prods = await request('/api/products');
    console.log(`Found ${prods.body.count} products.`);
    if (prods.status !== 200 || prods.body.count === 0) throw new Error('Product list failed');

    // 4. Create Product
    console.log('\n4. Checking POST /api/products (Creating test product)...');
    const newProd = await request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Automated Test Mechanical Numpad',
        sku: 'TEST-NUM-99',
        category_id: 1,
        supplier_id: 1,
        cost_price: 25.0,
        selling_price: 49.99,
        quantity: 20,
        min_threshold: 5,
        location: 'Test Bin Z-99',
        unit: 'pcs'
      }
    });
    console.log('Created product response:', newProd.body);
    if (newProd.status !== 201 || !newProd.body.success) throw new Error('Create product failed');
    testProductId = newProd.body.data.id;

    // 5. Adjust Stock (Dispatch 5 units)
    console.log(`\n5. Checking POST /api/products/${testProductId}/adjust (Dispatching 5 units)...`);
    const adjustRes = await request(`/api/products/${testProductId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        type: 'OUT',
        quantity: 5,
        reason: 'Automated Test Customer Order Dispatch',
        reference_no: 'TEST-INV-001',
        performed_by: 'Test Runner'
      }
    });
    console.log('Adjust response:', adjustRes.body);
    if (adjustRes.status !== 200 || adjustRes.body.data.newQuantity !== 15) {
      throw new Error('Stock adjustment failed');
    }

    // 6. Movements list
    console.log('\n6. Checking GET /api/movements...');
    const movements = await request('/api/movements?limit=5');
    console.log(`Movements count: ${movements.body.count}, Recent item:`, movements.body.data[0]?.reason);
    if (movements.status !== 200 || !movements.body.success) throw new Error('Movements list failed');

    // 7. Categories list
    console.log('\n7. Checking GET /api/categories...');
    const cats = await request('/api/categories');
    console.log(`Categories count: ${cats.body.count}`);
    if (cats.status !== 200) throw new Error('Categories failed');

    // 8. Suppliers list
    console.log('\n8. Checking GET /api/suppliers...');
    const sups = await request('/api/suppliers');
    console.log(`Suppliers count: ${sups.body.count}`);
    if (sups.status !== 200) throw new Error('Suppliers failed');

    // 9. CSV Exports
    console.log('\n9. Checking CSV exports...');
    const csvProds = await request('/api/export/products/csv');
    const csvMoves = await request('/api/export/movements/csv');
    if (csvProds.status !== 200 || !csvProds.body.includes('SKU')) throw new Error('Products CSV failed');
    if (csvMoves.status !== 200 || !csvMoves.body.includes('Movement ID')) throw new Error('Movements CSV failed');
    console.log('CSV exports verified successfully.');

    // 10. Clean up test product
    console.log(`\n10. Cleaning up test product ${testProductId}...`);
    const delRes = await request(`/api/products/${testProductId}`, { method: 'DELETE' });
    console.log('Delete response:', delRes.body);

    console.log('\n✨ ALL TESTS PASSED! System is fully operational and healthy.');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      process.exit(process.exitCode || 0);
    });
  }
}

// Give server 500ms to bind then run
setTimeout(runTests, 500);
