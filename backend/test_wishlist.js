// backend/test_wishlist.js
// Tests the full Wishlist API suite against the requirements

const http = require('http');

async function runTests() {
  console.log('Testing Wishlist Backend APIs...');

  const BASE_URL = 'http://localhost:5000';

  const makeRequest = (options, data = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body });
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
      req.end();
    });
  };

  try {
    // 1. Unauthenticated test (Test 5: Expect 401)
    console.log('\n--- Test 5: Unauthenticated Request ---');
    const unauthRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/wishlist',
      method: 'GET',
    });
    console.log(`GET /wishlist without token: status=${unauthRes.status}`, unauthRes.body);
    if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated request');

    // 2. Register/Login a test user
    console.log('\n--- Authenticating Test User ---');
    const testEmail = `testuser_${Date.now()}@example.com`;
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/customers/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { fullName: 'Wishlist Tester', email: testEmail, password: 'password123', phone: '9999999999' });

    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/customers/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: testEmail, password: 'password123' });

    const token = loginRes.body.token;
    console.log('Logged in successfully. Received token:', !!token);
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 3. Get all products to pick a product
    const productsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/products',
      method: 'GET',
    });
    const sampleProduct = productsRes.body.products[0];
    const sampleProduct2 = productsRes.body.products[1];
    console.log(`Using sample products: "${sampleProduct.name}" (${sampleProduct._id}), "${sampleProduct2.name}" (${sampleProduct2._id})`);

    // 4. Test 1: Add product to wishlist (Expect 200/201)
    console.log('\n--- Test 1: Add Product to Wishlist ---');
    const addRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct._id}`,
      method: 'POST',
      headers: authHeaders,
    });
    console.log(`POST /wishlist/${sampleProduct._id}: status=${addRes.status}`, addRes.body);
    if (addRes.status !== 200 && addRes.status !== 201) throw new Error('Expected 200/201 for Add Product');

    // 5. Test 2: Duplicate Add (Expect 409)
    console.log('\n--- Test 2: Prevent Duplicate Add ---');
    const dupRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct._id}`,
      method: 'POST',
      headers: authHeaders,
    });
    console.log(`POST /wishlist/${sampleProduct._id} (duplicate): status=${dupRes.status}`, dupRes.body);
    if (dupRes.status !== 409) throw new Error('Expected 409 for duplicate add');

    // Add second product
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct2._id}`,
      method: 'POST',
      headers: authHeaders,
    });

    // 6. Test 3: Get Wishlist (Expect 200, count 2, populated products)
    console.log('\n--- Test 3: Get User Wishlist ---');
    const getRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/wishlist',
      method: 'GET',
      headers: authHeaders,
    });
    console.log(`GET /wishlist: status=${getRes.status}, count=${getRes.body.count}`);
    console.log('Populated items:', getRes.body.wishlist.map(p => ({ id: p._id, name: p.name, price: p.price })));
    if (getRes.status !== 200 || getRes.body.count !== 2) throw new Error('Expected 2 items in wishlist');
    if (!getRes.body.wishlist[0].name) throw new Error('Wishlist items should be populated Product objects');

    // 7. Bonus: Get Wishlist Count
    console.log('\n--- Bonus Test: Wishlist Count ---');
    const countRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/wishlist/count',
      method: 'GET',
      headers: authHeaders,
    });
    console.log('GET /wishlist/count:', countRes.body);
    if (countRes.body.count !== 2) throw new Error('Expected count 2');

    // 8. Test 4: Remove Product from Wishlist (Expect 200)
    console.log('\n--- Test 4: Remove Product from Wishlist ---');
    const removeRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct._id}`,
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log(`DELETE /wishlist/${sampleProduct._id}: status=${removeRes.status}`, removeRes.body);
    if (removeRes.status !== 200) throw new Error('Expected 200 for remove');

    // Try removing again (Expect 404: Product not in wishlist)
    const removeAgain = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct._id}`,
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log(`DELETE /wishlist/${sampleProduct._id} (again): status=${removeAgain.status}`, removeAgain.body);
    if (removeAgain.status !== 404) throw new Error('Expected 404 when removing non-wishlisted product');

    // 9. Bonus: Wishlist Toggle (Expect toggle on / toggle off)
    console.log('\n--- Bonus Test: Wishlist Toggle ---');
    const toggleOn = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct._id}/toggle`,
      method: 'PATCH',
      headers: authHeaders,
    });
    console.log('PATCH toggle (turn on):', toggleOn.body);
    if (!toggleOn.body.saved) throw new Error('Expected saved: true on toggle');

    const toggleOff = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/wishlist/${sampleProduct._id}/toggle`,
      method: 'PATCH',
      headers: authHeaders,
    });
    console.log('PATCH toggle (turn off):', toggleOff.body);
    if (toggleOff.body.saved !== false) throw new Error('Expected saved: false on toggle');

    console.log('\nALL BACKEND WISHLIST TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
