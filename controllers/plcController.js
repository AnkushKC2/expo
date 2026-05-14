const fetch    = require('node-fetch');
const plcCfg   = require('../config/plc');
const AuditLog = require('../models/AuditLog');

/* ── Helper: write a single coil to the PLC ──────────────────────────────── */
async function writeCoil(address, value) {
  const body = {
    thing_name: plcCfg.PLC_THING_NAME,
    address,
    value,
  };
  console.log('PLC WRITE →', JSON.stringify(body));
  const upstream = await fetch(plcCfg.WRITE_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const text = await upstream.text();
  console.log('PLC WRITE ← status:', upstream.status, '| body:', text);
  if (!upstream.ok) throw new Error(`Upstream ${upstream.status} → ${text}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

/* ── GET /api/plc/read ──────────────────────────────────────────────────────
   Forwards upstream PLC read response unchanged.
─────────────────────────────────────────────────────────────────────────── */
exports.readPLC = async (req, res) => {
  try {
    const upstream = await fetch(plcCfg.READ_API);
    if (!upstream.ok) throw new Error(`Upstream HTTP ${upstream.status}`);
    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { raw }; }
    res.json({ success: true, data });
  } catch (err) {
    console.error('PLC READ error:', err.message);
    res.status(502).json({ success: false, message: 'PLC read failed', error: err.message });
  }
};

/* ── POST /api/plc/write ─────────────────────────────────────────────────────
   cmd: 'FORWARD' | 'REVERSE' | 'STOP' | 'STOP_RESET'

   Modbus coil map:
     M1 Forward → Coil 8257   (ADDR_FORWARD)
     M2 Reverse → Coil 8258   (ADDR_REVERSE)
     M3 Stop    → Coil 8259   (ADDR_STOP)

   Write sequence (pulse logic — "01" then auto-"00" from frontend):
     FORWARD    : clear reverse (8258=0), set forward (8257=1)
     REVERSE    : clear forward (8257=0), set reverse (8258=1)
     STOP       : set stop coil (8259=1), clear forward & reverse
     STOP_RESET : clear all three coils (8257=0, 8258=0, 8259=0)
─────────────────────────────────────────────────────────────────────────── */
exports.writePLC = async (req, res) => {
  const { cmd } = req.body;

  const VALID_CMDS = ['FORWARD', 'REVERSE', 'STOP', 'STOP_RESET', 'START'];
  if (!VALID_CMDS.includes(cmd)) {
    return res.status(400).json({ success: false, message: 'Invalid command. Use FORWARD, REVERSE, STOP, or STOP_RESET.' });
  }

  const label = (cmd === 'START') ? 'FORWARD' : cmd;

  try {
    let writes = [];

    if (label === 'FORWARD') {
      // 1. Clear reverse coil first (interlock)
      await writeCoil(plcCfg.ADDR_REVERSE, 0);
      // 2. Clear stop coil
      await writeCoil(plcCfg.ADDR_STOP, 0);
      // 3. Energise forward coil (value=1, i.e. "01")
      await writeCoil(plcCfg.ADDR_FORWARD, 1);
      writes = [`${plcCfg.ADDR_REVERSE}=0`, `${plcCfg.ADDR_STOP}=0`, `${plcCfg.ADDR_FORWARD}=1`];

    } else if (label === 'REVERSE') {
      // 1. Clear forward coil first (interlock)
      await writeCoil(plcCfg.ADDR_FORWARD, 0);
      // 2. Clear stop coil
      await writeCoil(plcCfg.ADDR_STOP, 0);
      // 3. Energise reverse coil (value=1, i.e. "01")
      await writeCoil(plcCfg.ADDR_REVERSE, 1);
      writes = [`${plcCfg.ADDR_FORWARD}=0`, `${plcCfg.ADDR_STOP}=0`, `${plcCfg.ADDR_REVERSE}=1`];

    } else if (label === 'STOP') {
      // 1. Clear forward and reverse coils (interlock)
      await writeCoil(plcCfg.ADDR_FORWARD, 0);
      await writeCoil(plcCfg.ADDR_REVERSE, 0);
      // 2. Pulse stop coil at 8259 (value=1, i.e. "01")
      await writeCoil(plcCfg.ADDR_STOP, 1);
      writes = [`${plcCfg.ADDR_FORWARD}=0`, `${plcCfg.ADDR_REVERSE}=0`, `${plcCfg.ADDR_STOP}=1`];

    } else if (label === 'STOP_RESET') {
      // Auto-reset: clear ALL coils (value=0, i.e. "00")
      // This is sent automatically 2s after any command from the frontend
      await writeCoil(plcCfg.ADDR_FORWARD, 0);
      await writeCoil(plcCfg.ADDR_REVERSE, 0);
      await writeCoil(plcCfg.ADDR_STOP, 0);
      writes = [`${plcCfg.ADDR_FORWARD}=0`, `${plcCfg.ADDR_REVERSE}=0`, `${plcCfg.ADDR_STOP}=0`];
    }

    await AuditLog.create({
      user:    req.user.id,
      email:   req.user.email,
      action:  `MOTOR_${label}`,
      detail:  writes.join(', '),
      ip:      req.ip,
      success: true,
    });

    res.json({ success: true, cmd: label, writes });

  } catch (err) {
    console.error('PLC WRITE error:', err.message);
    await AuditLog.create({
      user:    req.user.id,
      email:   req.user.email,
      action:  `MOTOR_${label}_FAILED`,
      detail:  err.message,
      ip:      req.ip,
      success: false,
    });
    res.status(502).json({ success: false, message: 'PLC write failed', error: err.message });
  }
};
