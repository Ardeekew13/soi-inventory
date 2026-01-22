const fs = require('fs');
const { ObjectId } = require('mongodb');

// Read the products and items files
const products = JSON.parse(fs.readFileSync('./soi-inventory.products.json', 'utf8'));
const items = JSON.parse(fs.readFileSync('./soi-inventory.items.json', 'utf8'));

// Create a map of item names to ObjectIds for quick lookup
const itemNameToId = {};
items.forEach(item => {
  itemNameToId[item.name] = item._id.$oid;
});

// Generate productingredients array
const productIngredients = [];

products.forEach(product => {
  const productId = product._id.$oid;
  
  // Check if product has ingredients array
  if (product.ingredients && Array.isArray(product.ingredients)) {
    product.ingredients.forEach(ingredient => {
      const itemId = itemNameToId[ingredient.itemName];
      
      if (itemId) {
        // Create productingredient document matching your sample structure
        const productIngredient = {
          _id: {
            $oid: new ObjectId().toString()
          },
          productId: {
            $oid: productId
          },
          itemId: {
            $oid: itemId
          },
          quantityUsed: ingredient.quantity,
          isActive: true,
          __v: 0,
          createdAt: {
            $date: new Date().toISOString()
          },
          updatedAt: {
            $date: new Date().toISOString()
          }
        };
        
        productIngredients.push(productIngredient);
        console.log(`✓ Added: ${product.name} → ${ingredient.itemName} (${ingredient.quantity})`);
      } else {
        console.warn(`⚠ Warning: Item "${ingredient.itemName}" not found for product "${product.name}"`);
      }
    });
  }
});

// Write to file
fs.writeFileSync(
  './productingredients-generated.json',
  JSON.stringify(productIngredients, null, 2),
  'utf8'
);

console.log(`\n✅ Generated ${productIngredients.length} productingredient documents`);
console.log(`📄 Saved to: productingredients-generated.json`);
