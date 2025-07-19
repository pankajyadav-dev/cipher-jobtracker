require('dotenv').config();
const { connect } = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/job-tracking";

const connectToDatabase = async () => {
  try {
    await connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority'
    });
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connectToDatabase();

module.exports = { connectToDatabase };

