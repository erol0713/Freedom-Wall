import mongoose from 'mongoose';

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Clearing all posts...');
    
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
