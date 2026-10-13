const { db } = require('../connection');

const SELECT_WITH_AUTHOR = 'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id';

function listCommentsByTask(taskId) {
  return db.prepare(`${SELECT_WITH_AUTHOR} WHERE c.task_id = ? ORDER BY c.created_at ASC`).all(taskId);
}

function findCommentById(id) {
  return db.prepare(`${SELECT_WITH_AUTHOR} WHERE c.id = ?`).get(id);
}

function insertComment(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findCommentById(result.lastInsertRowid);
}

module.exports = { listCommentsByTask, findCommentById, insertComment };
