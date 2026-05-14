/**
 * In-memory user store – fully mutable at runtime.
 *
 * Admin can create, update role, toggle active, and delete users via /admin.
 * Changes persist while the server is running; restart resets to USERS below.
 *
 * To generate a new password hash:
 *   node -e "require('bcryptjs').hash('yourpassword', 12).then(console.log)"
 *
 * Default accounts:
 *   admin@cloudscada.com    / Admin@1234     (role: admin)
 *   operator@cloudscada.com / Operator@1234  (role: operator)
 *   viewer@cloudscada.com   / Viewer@1234    (role: viewer)
 */

const bcrypt = require('bcryptjs');

/* ─────────────────────────────────────────────
   SEED USERS  ←  edit here
───────────────────────────────────────────── */
let USERS = [
  {
    id:           '1',
    name:         'Administrator',
    email:        'admin@cloudscada.com',
    passwordHash: '$2a$12$2IZpPR4tgPSbGOLh971aheBezaObVSO7Aq0EpIsz4nk8D218PKqf2',
    role:         'admin',
    isActive:     true,
    lastLogin:    null,
    createdAt:    '2024-01-01T00:00:00.000Z',
  },
  {
    id:           '2',
    name:         'Operator',
    email:        'operator@cloudscada.com',
    passwordHash: '$2a$12$XWptOhHt8aKuqOMTfFzVjOHCnZc4tH4h2Pq3ONLtxiNBp0r.Kdpx6',
    role:         'operator',
    isActive:     true,
    lastLogin:    null,
    createdAt:    '2024-01-01T00:00:00.000Z',
  },
  {
    id:           '3',
    name:         'Viewer',
    email:        'viewer@cloudscada.com',
    passwordHash: '$2a$12$IWue.fZ1EIHH0kInoPY7SORS91MX2pVCv0q3o1FqgLCjLeaNf1aw6',
    role:         'viewer',
    isActive:     true,
    lastLogin:    null,
    createdAt:    '2024-01-01T00:00:00.000Z',
  },
];

let _nextId = 4;

/* ── helpers ── */
const safe = u => { const c = { ...u }; delete c.passwordHash; return c; };
const now  = () => new Date().toISOString();

async function findByEmail(email) {
  const u = USERS.find(u => u.email === email.toLowerCase().trim());
  return u ? safe(u) : null;
}

async function findById(id) {
  const u = USERS.find(u => u.id === String(id));
  return u ? safe(u) : null;
}

async function findAll() {
  return USERS.map(safe);
}

async function countAll() {
  return USERS.length;
}

async function matchPassword(email, entered) {
  const u = USERS.find(u => u.email === email.toLowerCase().trim());
  if (!u) return false;
  return bcrypt.compare(entered, u.passwordHash);
}

async function updateLastLogin(email) {
  const u = USERS.find(u => u.email === email.toLowerCase().trim());
  if (u) u.lastLogin = now();
}

async function create({ name, email, password, role = 'viewer' }) {
  const exists = USERS.find(u => u.email === email.toLowerCase().trim());
  if (exists) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id:        String(_nextId++),
    name,
    email:     email.toLowerCase().trim(),
    passwordHash,
    role,
    isActive:  true,
    lastLogin: null,
    createdAt: now(),
  };
  USERS.push(user);
  return safe(user);
}

async function updateRole(id, role) {
  const u = USERS.find(u => u.id === String(id));
  if (!u) return null;
  u.role = role;
  return safe(u);
}

async function toggleActive(id) {
  const u = USERS.find(u => u.id === String(id));
  if (!u) return null;
  u.isActive = !u.isActive;
  return safe(u);
}

async function deleteById(id) {
  const idx = USERS.findIndex(u => u.id === String(id));
  if (idx === -1) return null;
  const [removed] = USERS.splice(idx, 1);
  return safe(removed);
}

module.exports = {
  findByEmail, findById, findAll, countAll,
  matchPassword, updateLastLogin,
  create, updateRole, toggleActive, deleteById,
};
