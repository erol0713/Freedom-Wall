import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Clearing all posts...');
    
    // We just drop the whole Post collection or deleteMany
    const db = mongoose.connection.db;
    await db.collection('posts').deleteMany({});
    
    console.log('All posts have been successfully deleted!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing DB:', error);
    process.exit(1);
  }
}

clearDB();
