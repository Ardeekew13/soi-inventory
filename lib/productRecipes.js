// Mapping of product ingredients
// Run this after importing items and products to generate productingredients
// Usage: node lib/generateProductIngredients.js

const productRecipes = {
  "Classic Burger": [
    { itemName: "Ground Beef", quantityUsed: 0.15 },
    { itemName: "Bread Flour", quantityUsed: 0.08 },
    { itemName: "Lettuce", quantityUsed: 0.02 },
    { itemName: "Tomatoes", quantityUsed: 0.03 },
    { itemName: "Onions", quantityUsed: 0.02 },
    { itemName: "Cheese (Cheddar)", quantityUsed: 0.03 },
    { itemName: "Mayonnaise", quantityUsed: 0.02 },
    { itemName: "Ketchup", quantityUsed: 0.02 }
  ],
  "Cheeseburger": [
    { itemName: "Ground Beef", quantityUsed: 0.15 },
    { itemName: "Bread Flour", quantityUsed: 0.08 },
    { itemName: "Lettuce", quantityUsed: 0.02 },
    { itemName: "Tomatoes", quantityUsed: 0.03 },
    { itemName: "Onions", quantityUsed: 0.02 },
    { itemName: "Cheese (Cheddar)", quantityUsed: 0.06 },
    { itemName: "Mayonnaise", quantityUsed: 0.02 },
    { itemName: "Ketchup", quantityUsed: 0.02 }
  ],
  "Bacon Burger": [
    { itemName: "Ground Beef", quantityUsed: 0.15 },
    { itemName: "Bacon", quantityUsed: 0.05 },
    { itemName: "Bread Flour", quantityUsed: 0.08 },
    { itemName: "Lettuce", quantityUsed: 0.02 },
    { itemName: "Tomatoes", quantityUsed: 0.03 },
    { itemName: "Onions", quantityUsed: 0.02 },
    { itemName: "Cheese (Cheddar)", quantityUsed: 0.03 },
    { itemName: "Mayonnaise", quantityUsed: 0.02 }
  ],
  "Chicken Burger": [
    { itemName: "Chicken Breast", quantityUsed: 0.15 },
    { itemName: "Bread Flour", quantityUsed: 0.08 },
    { itemName: "Lettuce", quantityUsed: 0.02 },
    { itemName: "Tomatoes", quantityUsed: 0.03 },
    { itemName: "Onions", quantityUsed: 0.02 },
    { itemName: "Mayonnaise", quantityUsed: 0.03 }
  ],
  "Fish Burger": [
    { itemName: "Fish Fillet (Tilapia)", quantityUsed: 0.15 },
    { itemName: "Bread Flour", quantityUsed: 0.08 },
    { itemName: "Lettuce", quantityUsed: 0.02 },
    { itemName: "Tomatoes", quantityUsed: 0.03 },
    { itemName: "Mayonnaise", quantityUsed: 0.03 }
  ],
  "Margherita Pizza": [
    { itemName: "All-Purpose Flour", quantityUsed: 0.25 },
    { itemName: "Mozzarella Cheese", quantityUsed: 0.15 },
    { itemName: "Tomatoes", quantityUsed: 0.1 },
    { itemName: "Olive Oil", quantityUsed: 0.03 },
    { itemName: "Basil (Dried)", quantityUsed: 0.005 },
    { itemName: "Yeast", quantityUsed: 0.01 }
  ],
  "Pepperoni Pizza": [
    { itemName: "All-Purpose Flour", quantityUsed: 0.25 },
    { itemName: "Mozzarella Cheese", quantityUsed: 0.15 },
    { itemName: "Tomatoes", quantityUsed: 0.1 },
    { itemName: "Sausages", quantityUsed: 0.1 },
    { itemName: "Olive Oil", quantityUsed: 0.03 },
    { itemName: "Oregano", quantityUsed: 0.005 },
    { itemName: "Yeast", quantityUsed: 0.01 }
  ],
  "Vegetarian Pizza": [
    { itemName: "All-Purpose Flour", quantityUsed: 0.25 },
    { itemName: "Mozzarella Cheese", quantityUsed: 0.15 },
    { itemName: "Tomatoes", quantityUsed: 0.08 },
    { itemName: "Bell Peppers", quantityUsed: 0.05 },
    { itemName: "Onions", quantityUsed: 0.05 },
    { itemName: "Olive Oil", quantityUsed: 0.03 },
    { itemName: "Basil (Dried)", quantityUsed: 0.005 },
    { itemName: "Yeast", quantityUsed: 0.01 }
  ],
  "Spaghetti Carbonara": [
    { itemName: "Pasta (Spaghetti)", quantityUsed: 0.2 },
    { itemName: "Bacon", quantityUsed: 0.1 },
    { itemName: "Eggs", quantityUsed: 0.17 },
    { itemName: "Cheese (Cheddar)", quantityUsed: 0.05 },
    { itemName: "Fresh Cream", quantityUsed: 0.1 },
    { itemName: "Black Pepper", quantityUsed: 0.005 },
    { itemName: "Garlic", quantityUsed: 0.01 }
  ],
  "Spaghetti Bolognese": [
    { itemName: "Pasta (Spaghetti)", quantityUsed: 0.2 },
    { itemName: "Ground Beef", quantityUsed: 0.15 },
    { itemName: "Tomatoes", quantityUsed: 0.15 },
    { itemName: "Onions", quantityUsed: 0.05 },
    { itemName: "Garlic", quantityUsed: 0.01 },
    { itemName: "Olive Oil", quantityUsed: 0.02 },
    { itemName: "Oregano", quantityUsed: 0.005 }
  ],
  "Penne Alfredo": [
    { itemName: "Pasta (Penne)", quantityUsed: 0.2 },
    { itemName: "Fresh Cream", quantityUsed: 0.15 },
    { itemName: "Butter", quantityUsed: 0.05 },
    { itemName: "Cheese (Cheddar)", quantityUsed: 0.08 },
    { itemName: "Garlic", quantityUsed: 0.01 },
    { itemName: "Black Pepper", quantityUsed: 0.005 }
  ],
  "Grilled Chicken": [
    { itemName: "Chicken Breast", quantityUsed: 0.25 },
    { itemName: "Olive Oil", quantityUsed: 0.02 },
    { itemName: "Garlic", quantityUsed: 0.01 },
    { itemName: "Paprika", quantityUsed: 0.005 },
    { itemName: "Black Pepper", quantityUsed: 0.005 },
    { itemName: "Salt", quantityUsed: 0.01 }
  ],
  "Fried Chicken": [
    { itemName: "Chicken Thighs", quantityUsed: 0.3 },
    { itemName: "All-Purpose Flour", quantityUsed: 0.1 },
    { itemName: "Eggs", quantityUsed: 0.17 },
    { itemName: "Cooking Oil", quantityUsed: 0.2 },
    { itemName: "Paprika", quantityUsed: 0.01 },
    { itemName: "Black Pepper", quantityUsed: 0.005 },
    { itemName: "Salt", quantityUsed: 0.01 }
  ],
  "Fish and Chips": [
    { itemName: "Fish Fillet (Tilapia)", quantityUsed: 0.2 },
    { itemName: "Potatoes", quantityUsed: 0.3 },
    { itemName: "All-Purpose Flour", quantityUsed: 0.08 },
    { itemName: "Cooking Oil", quantityUsed: 0.25 },
    { itemName: "Salt", quantityUsed: 0.01 },
    { itemName: "Vinegar", quantityUsed: 0.02 }
  ],
  "Pork Chops with Rice": [
    { itemName: "Pork Chops", quantityUsed: 0.25 },
    { itemName: "Rice", quantityUsed: 0.15 },
    { itemName: "Soy Sauce", quantityUsed: 0.03 },
    { itemName: "Garlic", quantityUsed: 0.01 },
    { itemName: "Onions", quantityUsed: 0.05 },
    { itemName: "Cooking Oil", quantityUsed: 0.03 }
  ],
  "Beef Steak": [
    { itemName: "Ground Beef", quantityUsed: 0.3 },
    { itemName: "Butter", quantityUsed: 0.03 },
    { itemName: "Garlic", quantityUsed: 0.02 },
    { itemName: "Black Pepper", quantityUsed: 0.01 },
    { itemName: "Salt", quantityUsed: 0.01 },
    { itemName: "Thyme", quantityUsed: 0.005 }
  ],
  "Shrimp Pasta": [
    { itemName: "Pasta (Penne)", quantityUsed: 0.2 },
    { itemName: "Shrimp", quantityUsed: 0.15 },
    { itemName: "Olive Oil", quantityUsed: 0.03 },
    { itemName: "Garlic", quantityUsed: 0.02 },
    { itemName: "Tomatoes", quantityUsed: 0.1 },
    { itemName: "Basil (Dried)", quantityUsed: 0.005 }
  ],
  "Caesar Salad": [
    { itemName: "Lettuce", quantityUsed: 0.15 },
    { itemName: "Cheese (Cheddar)", quantityUsed: 0.05 },
    { itemName: "Bread Flour", quantityUsed: 0.05 },
    { itemName: "Mayonnaise", quantityUsed: 0.05 },
    { itemName: "Garlic", quantityUsed: 0.01 },
    { itemName: "Black Pepper", quantityUsed: 0.005 }
  ],
  "French Fries": [
    { itemName: "Potatoes", quantityUsed: 0.25 },
    { itemName: "Cooking Oil", quantityUsed: 0.15 },
    { itemName: "Salt", quantityUsed: 0.01 }
  ],
  "Onion Rings": [
    { itemName: "Onions", quantityUsed: 0.2 },
    { itemName: "All-Purpose Flour", quantityUsed: 0.1 },
    { itemName: "Eggs", quantityUsed: 0.17 },
    { itemName: "Cooking Oil", quantityUsed: 0.15 },
    { itemName: "Salt", quantityUsed: 0.01 }
  ]
};

console.log(JSON.stringify(productRecipes, null, 2));
