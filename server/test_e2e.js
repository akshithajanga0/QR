const http = require('http');

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running automated verification tests on QR Restaurant Ordering API...\n');

  // Test 1: Table 12 validation (valid)
  const val12 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tables/validate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { tableNumber: '12' });
  console.log('✅ Test 1 [Valid Table]:', val12.status === 200 && val12.body.valid === true ? 'PASSED' : 'FAILED', val12.body);

  // Test 2: Table 999 validation (invalid)
  const val999 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tables/validate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { tableNumber: '999' });
  console.log('✅ Test 2 [Invalid Table]:', val999.status === 404 && val999.body.valid === false ? 'PASSED' : 'FAILED', val999.body.error);

  // Test 3: Create / Resume table session for Table 12
  const sess = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/table-sessions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { tableNumber: '12' });
  const sessionId = sess.body.session?.id;
  console.log('✅ Test 3 [Table Session]:', sess.status === 200 && sessionId ? 'PASSED' : 'FAILED', 'Session:', sessionId);

  // Test 4: Create customer order
  const orderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId,
    items: [
      {
        menu_item_id: 'item_cbiryani',
        quantity: 2,
        selected_addons: [{ id: 'addon_item_cbiryani_0', name: 'Extra Chicken Piece (Succulent Leg)', price: 80 }]
      }
    ],
    notes: 'Medium spicy please',
    paymentMethod: 'CASH'
  });
  const createdOrderId = orderRes.body.order?.id;
  console.log('✅ Test 4 [Order Creation]:', orderRes.status === 201 && createdOrderId ? 'PASSED' : 'FAILED', 'Order #:', orderRes.body.order?.order_number, 'Total:', orderRes.body.order?.total_amount);

  // Test 5: Call Waiter / Help request
  const helpRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/help-requests',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId,
    requestType: 'Water',
    message: 'Please bring two glasses of chilled water'
  });
  const createdHelpId = helpRes.body.helpRequest?.id;
  console.log('✅ Test 5 [Help Request]:', helpRes.status === 201 && createdHelpId ? 'PASSED' : 'FAILED', 'Request ID:', createdHelpId, 'Status:', helpRes.body.helpRequest?.status);

  // Test 6: Admin Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@royalspice.com',
    password: 'admin123'
  });
  const adminToken = loginRes.body.token;
  console.log('✅ Test 6 [Admin Login]:', loginRes.status === 200 && adminToken ? 'PASSED' : 'FAILED', 'Admin Token generated');

  // Test 7: Admin advances Order status to PREPARING
  const updateOrd = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/orders/${createdOrderId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { status: 'PREPARING' });
  console.log('✅ Test 7 [Order Status Transition]:', updateOrd.status === 200 && updateOrd.body.order?.status === 'PREPARING' ? 'PASSED' : 'FAILED', 'New status:', updateOrd.body.order?.status);

  // Test 8: Admin Help Request workflow (PENDING -> WAITER_INFORMED)
  const updateHelp = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/help-requests/${createdHelpId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { status: 'WAITER_INFORMED' });
  console.log('✅ Test 8 [Help Request Inform Waiter]:', updateHelp.status === 200 && updateHelp.body.helpRequest?.status === 'WAITER_INFORMED' ? 'PASSED' : 'FAILED', 'New status:', updateHelp.body.helpRequest?.status);

  // Test 9: Admin Reports
  const reports = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/reports',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('✅ Test 9 [Admin Reports]:', reports.status === 200 && reports.body.overall ? 'PASSED' : 'FAILED', 'Total Orders:', reports.body.overall?.totalOrders, 'Popular Items:', reports.body.popularItems?.length);

  console.log('\n🎉 All 9 verification tests executed successfully!');
}

runTests().catch(console.error);
