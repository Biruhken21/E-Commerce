const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/usedcom');
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} products in database:`);

    if (products.length === 0) {
      console.log('❌ No products found in database!');
      console.log('💡 You need to add some products first.');
      return;
    }

    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title} - $${product.price}`);
      console.log(`   Images:`, product.images);
      console.log(`   ImageUrl:`, product.imageUrl);
      console.log(`   Has images array:`, !!product.images);
      console.log(`   Images length:`, product.images ? product.images.length : 0);
      if (product.images && product.images.length > 0) {
        console.log(`   First image URL:`, product.images[0].url);
      }
    });

    console.log('\n🎯 Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase(); 