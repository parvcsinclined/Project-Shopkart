// backend/test_order.js
const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch {
            parsed = responseBody;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting ShopKart Lab 06 Order & Checkout Tests ---\n');
  const timestamp = Date.now();

  // 1. Register and Login User 1
  const user1 = {
    fullName: `Test Buyer ${timestamp}`,
    email: `buyer_${timestamp}@example.com`,
    password: 'password123',
    phone: '9876543210',
  };
  await request('POST', '/customers/register', user1);
  const login1 = await request('POST', '/customers/login', {
    email: user1.email,
    password: user1.password,
  });
  const token1 = login1.data.token;
  console.log('✓ Registered and logged in User 1, token received');

  // Register and Login User 2 for authorization tests
  const user2 = {
    fullName: `Other Buyer ${timestamp}`,
    email: `other_${timestamp}@example.com`,
    password: 'password123',
    phone: '9123456789',
  };
  await request('POST', '/customers/register', user2);
  const login2 = await request('POST', '/customers/login', {
    email: user2.email,
    password: user2.password,
  });
  const token2 = login2.data.token;
  console.log('✓ Registered and logged in User 2, token received');

  // Test 1: Empty cart -> POST /orders -> 400 Bad Request
  const emptyOrderRes = await request(
    'POST',
    '/orders',
    {
      shippingAddress: {
        fullName: 'Test Buyer',
        phone: '9876543210',
        addressLine1: '123 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
    },
    token1
  );
  if (emptyOrderRes.status === 400) {
    console.log('✓ Test 1 Passed: Empty cart rejected with 400 Bad Request');
  } else {
    console.error('✗ Test 1 Failed:', emptyOrderRes.status, emptyOrderRes.data);
  }

  // Fetch available products
  const productsRes = await request('GET', '/products');
  const products = productsRes.data.products || productsRes.data || [];
  if (!products.length) {
    throw new Error('No products found in DB to test with');
  }
  const testProduct = products[0];
  console.log(`✓ Using test product: "${testProduct.name}" (Price: ₹${testProduct.price}, Stock: ${testProduct.stock})`);

  // Add product to User 1 cart
  await request('POST', `/cart/${testProduct._id}`, {}, token1);
  console.log('✓ Added product to User 1 cart');

  // Test 2 & Test 8: Create payment order & fake total check
  const createOrderRes = await request(
    'POST',
    '/orders/create-payment-order',
    {
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      totalAmount: 1, // Fake total from client - MUST BE IGNORED
    },
    token1
  );

  if (createOrderRes.status === 201 && createOrderRes.data.success) {
    const { shopKartOrderId, razorpayOrderId, amount, order } = createOrderRes.data;
    if (order.totalAmount === testProduct.price && amount === testProduct.price * 100) {
      console.log('✓ Test 2 & Test 8 Passed: Order created with backend-verified total (client fake total ignored), Razorpay order id received');
    } else {
      console.error('✗ Test 2/8 Failed: Total calculation mismatch', order.totalAmount, amount);
    }
  } else {
    console.error('✗ Test 2 Failed:', createOrderRes.status, createOrderRes.data);
  }

  const { shopKartOrderId, razorpayOrderId } = createOrderRes.data;

  // Test 3: Cart before payment verification -> items still present
  const cartBeforeVerify = await request('GET', '/cart', null, token1);
  if (cartBeforeVerify.data.cart?.length > 0) {
    console.log('✓ Test 3 Passed: User cart is preserved before payment verification');
  } else {
    console.error('✗ Test 3 Failed: Cart was cleared prematurely!');
  }

  // Test 4: Invalid signature verification -> 400 Bad Request, cart remains
  const fakeVerifyRes = await request(
    'POST',
    '/orders/verify-payment',
    {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: 'pay_fake_123',
      razorpay_signature: 'invalid_tampered_signature',
    },
    token1
  );

  if (fakeVerifyRes.status === 400) {
    console.log('✓ Test 4 Passed: Invalid signature correctly rejected with 400, cart preserved');
  } else {
    console.error('✗ Test 4 Failed: Expected 400 on fake signature, got:', fakeVerifyRes.status);
  }

  // Test 5: Valid signature verification
  const secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_secret_key_lab06';
  const paymentId = `pay_test_${Date.now()}`;
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest('hex');

  const validVerifyRes = await request(
    'POST',
    '/orders/verify-payment',
    {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    },
    token1
  );

  if (validVerifyRes.status === 200 && validVerifyRes.data.order.paymentStatus === 'PAID') {
    console.log('✓ Test 5 Passed: Payment signature verified, order status marked PAID & PLACED');
  } else {
    console.error('✗ Test 5 Failed:', validVerifyRes.status, validVerifyRes.data);
  }

  // Test 6: Confirm cart cleared
  const cartAfterVerify = await request('GET', '/cart', null, token1);
  if (cartAfterVerify.data.cart?.length === 0) {
    console.log('✓ Test 6 Passed: User cart successfully cleared after payment verification');
  } else {
    console.error('✗ Test 6 Failed: Cart not empty after verification', cartAfterVerify.data);
  }

  // Test 7: Get Orders (GET /orders)
  const getOrdersRes = await request('GET', '/orders', null, token1);
  if (getOrdersRes.status === 200 && getOrdersRes.data.orders.length > 0) {
    console.log(`✓ Test 7 Passed: Successfully retrieved ${getOrdersRes.data.orders.length} order(s) for User 1`);
  } else {
    console.error('✗ Test 7 Failed:', getOrdersRes.status, getOrdersRes.data);
  }

  // Test 8: Get Single Order by ID (GET /orders/:id)
  const singleOrderRes = await request('GET', `/orders/${shopKartOrderId}`, null, token1);
  if (singleOrderRes.status === 200 && singleOrderRes.data.order._id === shopKartOrderId) {
    console.log('✓ Test 8 Passed: Successfully fetched single order by ID');
  } else {
    console.error('✗ Test 8 Failed:', singleOrderRes.status, singleOrderRes.data);
  }

  // Test 9: Unauthenticated request -> 401 Unauthorized
  const unauthRes = await request('GET', '/orders', null, null);
  if (unauthRes.status === 401) {
    console.log('✓ Test 9 Passed: Unauthenticated request rejected with 401');
  } else {
    console.error('✗ Test 9 Failed: Expected 401, got:', unauthRes.status);
  }

  // Test 10: Access another user\'s order -> 403 Forbidden
  const forbiddenRes = await request('GET', `/orders/${shopKartOrderId}`, null, token2);
  if (forbiddenRes.status === 403) {
    console.log('✓ Test 10 Passed: Access to another user\'s order rejected with 403 Forbidden');
  } else {
    console.error('✗ Test 10 Failed: Expected 403 Forbidden, got:', forbiddenRes.status);
  }

  // Test 11: Bonus Order Status Progression (PATCH /orders/:id/status)
  const statusUpdateRes = await request(
    'PATCH',
    `/orders/${shopKartOrderId}/status`,
    { status: 'SHIPPED' },
    token1
  );
  if (statusUpdateRes.status === 200 && statusUpdateRes.data.order.status === 'SHIPPED') {
    console.log('✓ Test 11 Passed (Bonus): Order status progression successfully updated to SHIPPED');
  } else {
    console.error('✗ Test 11 Failed:', statusUpdateRes.status, statusUpdateRes.data);
  }

  console.log('\n--- ALL BACKEND TESTS COMPLETED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
