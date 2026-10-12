// backend/test_cart.js
// Automated Postman test plan runner for Lab 05 Cart APIs

const http = require('http');

async function runCartTests() {
  console.log('Testing Shopping Cart Backend APIs...');

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
    // Test 7 — Unauthenticated Request (Expect 401)
    console.log('\n--- Test 7: Unauthenticated Request ---');
    const unauthRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/cart',
      method: 'GET',
    });
    console.log(`GET /cart without token: status=${unauthRes.status}`, unauthRes.body);
    if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated request');

    // Register & Login Test User
    console.log('\n--- Registering and Logging in Test User ---');
    const testEmail = `cartuser_${Date.now()}@example.com`;
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/customers/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { fullName: 'Cart Tester', email: testEmail, password: 'password123', phone: '9988776655' });

    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/customers/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: testEmail, password: 'password123' });

    const token = loginRes.body.token;
    console.log('User logged in. Received token:', !!token);
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Get product list
    const productsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/products',
      method: 'GET',
    });
    const product1 = productsRes.body.products[0];
    const product2 = productsRes.body.products[1];
    console.log(`Using product: "${product1.name}" (ID: ${product1._id}, Stock: ${product1.stock}, Price: ₹${product1.price})`);

    // Test 1 — Add new item
    console.log('\n--- Test 1: Add New Item to Cart ---');
    const add1Res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/cart/${product1._id}`,
      method: 'POST',
      headers: authHeaders,
    });
    console.log(`POST /cart/${product1._id}: status=${add1Res.status}`, add1Res.body.message);
    const itemAfterAdd1 = add1Res.body.cart.find((i) => i.product._id === product1._id);
    console.log('Item in cart:', itemAfterAdd1 ? { name: itemAfterAdd1.product.name, quantity: itemAfterAdd1.quantity } : null);
    if (!itemAfterAdd1 || itemAfterAdd1.quantity !== 1) {
      throw new Error(`Expected quantity 1, got ${itemAfterAdd1 ? itemAfterAdd1.quantity : 'null'}`);
    }

    // Test 2 — Add same item again
    console.log('\n--- Test 2: Add Same Item Again (Should Increment Quantity to 2) ---');
    const add2Res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/cart/${product1._id}`,
      method: 'POST',
      headers: authHeaders,
    });
    console.log(`POST /cart/${product1._id} again: status=${add2Res.status}`, add2Res.body.message);
    const itemAfterAdd2 = add2Res.body.cart.find((i) => i.product._id === product1._id);
    console.log('Item in cart:', itemAfterAdd2 ? { name: itemAfterAdd2.product.name, quantity: itemAfterAdd2.quantity } : null);
    if (!itemAfterAdd2 || itemAfterAdd2.quantity !== 2) {
      throw new Error(`Expected quantity 2, got ${itemAfterAdd2 ? itemAfterAdd2.quantity : 'null'}`);
    }

    // Test 3 — Get Cart
    console.log('\n--- Test 3: Get User Cart ---');
    const getCartRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/cart',
      method: 'GET',
      headers: authHeaders,
    });
    console.log(`GET /cart: status=${getCartRes.status}, items count=${getCartRes.body.cart.length}`);
    const fetchedItem = getCartRes.body.cart[0];
    console.log('Populated item:', {
      productId: fetchedItem.product._id,
      name: fetchedItem.product.name,
      price: fetchedItem.product.price,
      quantity: fetchedItem.quantity,
    });
    if (!fetchedItem.product.name || !fetchedItem.product.price) {
      throw new Error('Product should be populated in cart item');
    }

    // Test 4 — Update quantity
    console.log('\n--- Test 4: Update Product Quantity ---');
    const updateRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/cart/${product1._id}`,
      method: 'PATCH',
      headers: authHeaders,
    }, { quantity: 4 });
    console.log(`PATCH /cart/${product1._id} quantity=4: status=${updateRes.status}`, updateRes.body.message);
    const itemAfterUpdate = updateRes.body.cart.find((i) => i.product._id === product1._id);
    console.log('Item in cart after update:', itemAfterUpdate ? { name: itemAfterUpdate.product.name, quantity: itemAfterUpdate.quantity } : null);
    if (!itemAfterUpdate || itemAfterUpdate.quantity !== 4) {
      throw new Error(`Expected quantity 4, got ${itemAfterUpdate ? itemAfterUpdate.quantity : 'null'}`);
    }

    // Test 5 — Exceed stock
    console.log('\n--- Test 5: Exceed Stock Limit (Expect 400 Bad Request) ---');
    const exceedRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/cart/${product1._id}`,
      method: 'PATCH',
      headers: authHeaders,
    }, { quantity: 9999 });
    console.log(`PATCH /cart/${product1._id} quantity=9999: status=${exceedRes.status}`, exceedRes.body);
    if (exceedRes.status !== 400) {
      throw new Error(`Expected status 400 when exceeding stock, got ${exceedRes.status}`);
    }

    // Test 6 — Remove item
    console.log('\n--- Test 6: Remove Item from Cart ---');
    const removeRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/cart/${product1._id}`,
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log(`DELETE /cart/${product1._id}: status=${removeRes.status}`, removeRes.body.message);
    const itemAfterRemove = removeRes.body.cart.find((i) => i.product._id === product1._id);
    console.log('Cart count after removal:', removeRes.body.cart.length);
    if (itemAfterRemove) {
      throw new Error('Item should have been removed from cart');
    }

    console.log('\n🎉 ALL 7 POSTMAN TEST PLAN SCENARIOS PASSED WITH FLYING COLORS! 🛒\n');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

// Allow time for server to boot if needed
setTimeout(runCartTests, 4000);
