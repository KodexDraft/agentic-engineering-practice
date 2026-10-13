process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../DB');
const { createSchema } = require('./schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare("INSERT INTO projects (id, name) VALUES (1, 'Project')").run();
});

describe('GET /health', () => {
  test('reports the service is ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /', () => {
  test('returns the API name and version', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
  });
});

describe('POST /webhooks/task-update', () => {
  test('acknowledges the payload', async () => {
    const res = await request(app).post('/webhooks/task-update').send({ task_id: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
  });
});

describe('protected routes', () => {
  test('DELETE /users/:id returns 401 without an API key', async () => {
    const res = await request(app).delete('/users/1');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('DELETE /users/:id returns 401 with a wrong API key', async () => {
    const res = await request(app).delete('/users/1').set('x-api-key', 'nope');
    expect(res.status).toBe(401);
  });

  test('DELETE /projects/:id returns 401 without an API key', async () => {
    const res = await request(app).delete('/projects/1');
    expect(res.status).toBe(401);
    expect(db.prepare('SELECT id FROM projects WHERE id = 1').get()).toBeTruthy();
  });

  test('DELETE /projects/:id succeeds with the API key', async () => {
    const res = await request(app).delete('/projects/1').set('x-api-key', 'dev-key');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });
});
