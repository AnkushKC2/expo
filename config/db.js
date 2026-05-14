/**
 * Database config – replaced by hardcoded user store.
 * No AWS / DynamoDB connection needed.
 */

const connectDB = async () => {
  console.log('✅  Using hardcoded user store (no database required)');
};

module.exports = { connectDB };
