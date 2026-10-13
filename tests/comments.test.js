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
  db.prepare("INSERT INTO tasks (id, title) VALUES (1, 'Task')").run();
});

describe('GET /tasks/:id/comments', () => {
  test('returns comments with the author name, oldest first', async () => {
    db.prepare("INSERT INTO comments (task_id, user_id, body, created_at) VALUES (1, 1, 'first', '2024-01-01 00:00:00')").run();
    db.prepare("INSERT INTO comments (task_id, user_id, body, created_at) VALUES (1, 1, 'second', '2024-01-02 00:00:00')").run();
    const res = await request(app).get('/tasks/1/comments');
    expect(res.status).toBe(200);
    expect(res.body.map(c => c.body)).toEqual(['first', 'second']);
    expect(res.body[0].user_name).toBe('Test User');
  });

  test('returns 404 when the task does not exist', async () => {
    const res = await request(app).get('/tasks/999/comments');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  test('returns an empty list when the task has no comments', async () => {
    const res = await request(app).get('/tasks/1/comments');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /tasks/:id/comments', () => {
  test('creates a comment on a task', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ user_id: 1, body: 'Hello' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ task_id: 1, user_id: 1, body: 'Hello', user_name: 'Test User' });
  });

  test('returns 404 when the task does not exist', async () => {
    const res = await request(app).post('/tasks/999/comments').send({ user_id: 1, body: 'Hello' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  test('returns 400 when body is missing', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ user_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'body is required' });
  });

  test('returns 400 when user_id is missing', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ body: 'Hello' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'user_id is required' });
  });

  test('returns 400 when the user does not exist', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ user_id: 999, body: 'Hello' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'user not found' });
  });
});
