/**
 * Migration script to add isActive field to existing records
 * Run this once after deploying the soft delete feature
 * 
 * Usage: npx tsx lib/migrate-add-isActive.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your .env.local file');
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Update Products
    console.log('\nUpdating Products collection...');
    const productsResult = await db.collection('products').updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✓ Updated ${productsResult.modifiedCount} products`);

    // Update Items
    console.log('\nUpdating Items collection...');
    const itemsResult = await db.collection('items').updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✓ Updated ${itemsResult.modifiedCount} items`);

    // Update ProductIngredients
    console.log('\nUpdating ProductIngredients collection...');
    const ingredientsResult = await db.collection('productingredients').updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✓ Updated ${ingredientsResult.modifiedCount} product ingredients`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Products: ${productsResult.modifiedCount} updated`);
    console.log(`- Items: ${itemsResult.modifiedCount} updated`);
    console.log(`- ProductIngredients: ${ingredientsResult.modifiedCount} updated`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

migrate();
