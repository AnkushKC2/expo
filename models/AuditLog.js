/**
 * AuditLog – in-memory only (resets on restart).
 * No DynamoDB connection needed.
 */

const logs = [];

async function create({ user, email, action, ip, success = true }) {
  logs.unshift({
    id:        Math.random().toString(36).slice(2),
    user:      user || null,
    email:     email || '',
    action,
    ip:        ip || '',
    success,
    createdAt: new Date().toISOString(),
  });
  if (logs.length > 500) logs.length = 500; // cap memory
}

async function findRecent(limit = 100) {
  return logs.slice(0, limit);
}

module.exports = { create, findRecent };
