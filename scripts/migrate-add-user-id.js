#!/usr/bin/env node
/**
 * Migration script to add userId field to existing prompts and evaluations
 *
 * Usage:
 * NODE_ENV=production node scripts/migrate-add-user-id.js --admin-user-id=<admin-user-id>
 *
 * This will set all existing prompts and evaluations to belong to the admin user,
 * which is required since we now need a userId for everything.
 */

const mongoose = require('mongoose');
const { exit } = require('process');

// Get the admin user ID from command line arguments
const args = process.argv.slice(2);
const adminUserIdArg = args.find(arg => arg.startsWith('--admin-user-id='));
if (!adminUserIdArg) {
  console.error('Error: --admin-user-id parameter is required');
  console.error(
    'Usage: NODE_ENV=production node scripts/migrate-add-user-id.js --admin-user-id=<admin-user-id>'
  );
  exit(1);
}

const adminUserId = adminUserIdArg.split('=')[1];
if (!adminUserId || !mongoose.Types.ObjectId.isValid(adminUserId)) {
  console.error('Error: Invalid admin user ID');
  exit(1);
}

// Load environment variables
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/model-eval';

// Define schemas (simplified versions of what's in the actual models)
const promptSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    tags: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const evaluationSchema = new mongoose.Schema(
  {
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
    },
    provider: String,
    model: String,
    response: String,
    metrics: Object,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Create models
const Prompt = mongoose.model('Prompt', promptSchema);
const Evaluation = mongoose.model('Evaluation', evaluationSchema);

async function migrateData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count prompts and evaluations without userId
    const promptCount = await Prompt.countDocuments({ userId: { $exists: false } });
    const evaluationCount = await Prompt.countDocuments({ userId: { $exists: false } });

    console.log(`Found ${promptCount} prompts and ${evaluationCount} evaluations without userId`);

    // Update all prompts
    console.log('Updating prompts...');
    const promptResult = await Prompt.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUserId } }
    );
    console.log(`Updated ${promptResult.modifiedCount} prompts`);

    // Update all evaluations
    console.log('Updating evaluations...');
    const evaluationResult = await Evaluation.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUserId } }
    );
    console.log(`Updated ${evaluationResult.modifiedCount} evaluations`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateData();
