require('dotenv').config();
const express       = require('express');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const morgan        = require('morgan');
const ejsLayouts    = require('express-ejs-layouts');
const session       = require('express-session');

const { connectDB }    = require('./config/db');
const { setLocals }    = require('./middleware/auth');

/* ── Routes ── */
const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const plcRoutes       = require('./routes/plcRoutes');
const adminRoutes     = require('./routes/adminRoutes');

/* ── Connect DB ── */
connectDB();

const app = express();

app.use(session({
    secret: 'cloudscada_secret_key',
    resave: false,
    saveUninitialized: false
}));

/* ── View engine ── */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layouts/main');         // default layout

/* ── Middleware ── */
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(setLocals);                         // makes currentUser available in all EJS templates

/* ── Routes ── */
app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/auth',      authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/plc',   plcRoutes);
app.use('/admin',     adminRoutes);

/* ── 404 ── */
app.use((req, res) => {
  res.status(404).send(`
    <h2 style="font-family:sans-serif;text-align:center;margin-top:80px">
      404 – Page not found<br>
      <a href="/dashboard" style="font-size:14px;color:#e60000">Back to Dashboard</a>
    </h2>
  `);
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  CloudSCADA running at http://localhost:${PORT}`);
  console.log(`    ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`    Auth: hardcoded user store\n`);
});
