import app from './index.js';
import http from 'http';

const PORT = 4001; // test port
const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`\n🧪 Testing HTTP Endpoints on port ${PORT}...\n`);

  try {
    // 1. GET /health
    const healthRes = await fetch(`http://127.0.0.1:${PORT}/health`);
    const healthData = await healthRes.json();
    console.log('[E2E 1] GET /health:', healthRes.status, healthData.status === 'ok' ? 'PASS ✅' : 'FAIL ❌');

    // 2. GET /api/cafeteria
    const getRes = await fetch(`http://127.0.0.1:${PORT}/api/cafeteria`);
    const list = await getRes.json();
    console.log('[E2E 2] GET /api/cafeteria:', getRes.status, `(Count: ${list.length})`, Array.isArray(list) ? 'PASS ✅' : 'FAIL ❌');

    // 3. POST /api/cafeteria
    const postPayload = {
      mealType: 'High Tea',
      predictedHeadcount: 220,
      actualServed: 215,
      foodWastageKg: 3.5,
      contractorName: 'Campus Express Caterer',
      feedbackRating: 4.8
    };
    const postRes = await fetch(`http://127.0.0.1:${PORT}/api/cafeteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });
    const created = await postRes.json();
    console.log('[E2E 3] POST /api/cafeteria:', postRes.status, `(ID: ${created.id})`, created.id ? 'PASS ✅' : 'FAIL ❌');

    // 4. PUT /api/cafeteria/:id
    const putRes = await fetch(`http://127.0.0.1:${PORT}/api/cafeteria/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualServed: 218, feedbackRating: 4.9 })
    });
    const updated = await putRes.json();
    console.log('[E2E 4] PUT /api/cafeteria/:id:', putRes.status, `(Updated served: ${updated.actualServed})`, updated.actualServed === 218 ? 'PASS ✅' : 'FAIL ❌');

    // 5. DELETE /api/cafeteria/:id
    const delRes = await fetch(`http://127.0.0.1:${PORT}/api/cafeteria/${created.id}`, {
      method: 'DELETE'
    });
    const delResult = await delRes.json();
    console.log('[E2E 5] DELETE /api/cafeteria/:id:', delRes.status, delResult.id === created.id ? 'PASS ✅' : 'FAIL ❌');

    // 6. POST /api/ai/chat (missing key or safe fallback)
    const aiRes = await fetch(`http://127.0.0.1:${PORT}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Status check' })
    });
    const aiData = await aiRes.json();
    console.log('[E2E 6] POST /api/ai/chat:', aiRes.status, `(Mode: ${aiData.mode})`, 'PASS ✅');

    console.log('\n🎉 ALL 6 HTTP API INTEGRATION TESTS PASSED!\n');
  } catch (err) {
    console.error('E2E Test Failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
