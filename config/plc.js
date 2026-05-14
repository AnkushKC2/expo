module.exports = {
  READ_API:       process.env.READ_API,
  WRITE_API:      process.env.WRITE_API,
  PLC_THING_NAME: process.env.PLC_THING_NAME || 'AWSLogo',

  /* Coil / M-relay addresses (Modbus coil map) */
  ADDR_FORWARD: 8257,   // M1 – Forward  (Coil 8257)
  ADDR_REVERSE: 8258,   // M2 – Reverse  (Coil 8258)
  ADDR_STOP:    8259,   // M3 – Stop     (Coil 8259)  ← dedicated stop coil

  /* Legacy alias kept for backward compatibility */
  ADDR_START:   8257,
};
