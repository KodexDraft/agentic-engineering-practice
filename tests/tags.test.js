process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');
const { db } = require('../src/db/connection');
const { createSchema } = require('../src/db/schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  db.prepare("INSERT INTO tasks (id, title) VALUES (1, 'Task')").run();
});

describe('GET /tags', () => {
  test('returns tags ordered by name', async () => {
    db.prepare("INSERT INTO tags (name) VALUES ('zeta'), ('alpha')").run();
    const res = await request(app).get('/tags');
    expect(res.status).toBe(200);
    expect(res.body.map(t => t.name)).toEqual(['alpha', 'zeta']);
  });

  test('returns an empty list when there are no tags', async () => {
    const res = await request(app).get('/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /tags', () => {
  test('creates a tag with a lowercased, trimmed name', async () => {
    const res = await request(app).post('/tags').send({ name: '  Urgent ' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('urgent');
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app).post('/tags').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'name is required' });
  });

  test('returns 409 when the tag already exists', async () => {
    await request(app).post('/tags').send({ name: 'bug' });
    const res = await request(app).post('/tags').send({ name: 'BUG' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'tag already exists' });
  });
});

describe('POST /tasks/:id/tags', () => {
  test('applies a tag to a task', async () => {
    db.prepare("INSERT INTO tags (id, name) VALUES (1, 'bug')").run();
    const res = await request(app).post('/tasks/1/tags').send({ tag_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ task_id: 1, tag_id: 1 });
  });

  test('returns 404 when the task does not exist', async () => {
    const res = await request(app).post('/tasks/999/tags').send({ tag_id: 1 });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  test('returns 400 when tag_id is missing', async () => {
    const res = await request(app).post('/tasks/1/tags').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'tag_id is required' });
  });

  test('returns 404 when the tag does not exist', async () => {
    const res = await request(app).post('/tasks/1/tags').send({ tag_id: 999 });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tag not found' });
  });

  test('returns 409 when the tag is already applied', async () => {
    db.prepare("INSERT INTO tags (id, name) VALUES (1, 'bug')").run();
    await request(app).post('/tasks/1/tags').send({ tag_id: 1 });
    const res = await request(app).post('/tasks/1/tags').send({ tag_id: 1 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'tag already applied to this task' });
  });
});

describe('DELETE /tasks/:id/tags/:tagId', () => {
  test('removes a tag from a task', async () => {
    db.prepare("INSERT INTO tags (id, name) VALUES (1, 'bug')").run();
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (1, 1)').run();
    const res = await request(app).delete('/tasks/1/tags/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });

  test('returns 404 when the tag is not applied to the task', async () => {
    const res = await request(app).delete('/tasks/1/tags/1');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tag not applied to this task' });
  });
});
