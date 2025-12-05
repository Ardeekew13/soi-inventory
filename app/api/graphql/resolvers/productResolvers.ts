import Product from "../models/Products";
import ProductIngredient from "../models/ProductIngredients";
import Item from "../models/Item";
import { applyPaginationArgs, PaginationListArgs } from "../utils/pagination";
import { errorResponse, successResponse } from "../utils/response";

export const productResolvers = {
  Query: {
    productsList: async (
      _: unknown,
      args: PaginationListArgs,
      context: any
    ) => {
      // Check authentication
      if (!context.user) {
        throw new Error("Authentication required");
      }

      // Check permissions
      const userPermissions = context.user.permissions || {};
      const userRole = context.user.role;

      if (
        userRole !== "SUPER_ADMIN" &&
        !userPermissions.product?.includes("view")
      ) {
        throw new Error("Insufficient permissions to view products");
      }

      const { limit, skip } = applyPaginationArgs(args);
      const filter = args.search
        ? { name: { $regex: args.search, $options: "i" }, isActive: true }
        : { isActive: true };
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .limit(limit)
          .skip(skip)
          .populate({
            path: "ingredientsUsed",
            match: { isActive: true }, // Only populate active ingredients
            populate: {
              path: "itemId",
              model: "Item",
              match: { isActive: true }, // Only populate active items
            },
          }),
        Product.countDocuments(filter),
      ]);

      const formattedProducts = products.map((product) => {
        const productObj = product.toObject();
        return {
          ...productObj,
          createdAt: new Date(product.createdAt).toISOString(),
          updatedAt: new Date(product.updatedAt).toISOString(),
          ingredientsUsed: (productObj.ingredientsUsed || []).map(
            (ing: any) => ({
              _id: ing._id,
              productId: ing.productId,
              itemId: ing.itemId?._id || ing.itemId,
              quantityUsed: ing.quantityUsed,
              item: ing.itemId,
            })
          ),
        };
      });

      return { products: formattedProducts, totalCount };
    },
    productsByIngredient: async (
      _: unknown,
      { itemId }: { itemId: string },
      context: any
    ) => {
      // Check authentication
      if (!context.user) {
        throw new Error("Authentication required");
      }

      // Check permissions
      const userPermissions = context.user.permissions || {};
      const userRole = context.user.role;

      if (
        userRole !== "SUPER_ADMIN" &&
        !userPermissions.product?.includes("view")
      ) {
        throw new Error("Insufficient permissions to view products");
      }

      // Find all product ingredients that use this item
      const productIngredients = await ProductIngredient.find({
        itemId: itemId,
      }).select("productId");

      // Extract unique product IDs
      const productIds = [...new Set(productIngredients.map(pi => pi.productId.toString()))];

      // Find all products with these IDs (only active products)
      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).populate({
        path: "ingredientsUsed",
        match: { isActive: true }, // Only populate active ingredients
        populate: {
          path: "itemId",
          model: "Item",
          match: { isActive: true }, // Only populate active items
        },
      });

      const formattedProducts = products.map((product) => {
        const productObj = product.toObject();
        return {
          ...productObj,
          createdAt: new Date(product.createdAt).toISOString(),
          updatedAt: new Date(product.updatedAt).toISOString(),
          ingredientsUsed: (productObj.ingredientsUsed || []).map(
            (ing: any) => ({
              _id: ing._id,
              productId: ing.productId,
              itemId: ing.itemId?._id || ing.itemId,
              quantityUsed: ing.quantityUsed,
              item: ing.itemId,
            })
          ),
        };
      });

      return formattedProducts;
    },
  },
  Product: {
    id: (parent: any) => parent._id.toString(),
    ingredientsUsed: async (parent: any) => {
      if (
        parent.ingredientsUsed &&
        Array.isArray(parent.ingredientsUsed) &&
        parent.ingredientsUsed.length > 0
      ) {
        return parent.ingredientsUsed;
      }

      const ingredients = await ProductIngredient.find({
        productId: parent._id,
      }).populate("itemId");

      return ingredients.map((ing: any) => ({
        _id: ing._id,
        productId: ing.productId,
        itemId: ing.itemId?._id || ing.itemId,
        quantityUsed: ing.quantityUsed,
        item: ing.itemId,
      }));
    },
  },
  ProductIngredient: {
    id: (parent: any) => {
      // The id field should always resolve from _id
      if (!parent._id) {
        console.error(
          "ProductIngredient missing _id:",
          JSON.stringify(parent, null, 2)
        );
        throw new Error("ProductIngredient must have _id");
      }
      return parent._id.toString();
    },
  },
  Mutation: {
    addProduct: async (
      _: unknown,
      {
        id,
        name,
        price,
        items,
      }: {
        id?: string;
        name: string;
        price: number;
        items: { itemId: string; quantityUsed: number }[];
      },
      context: any
    ) => {
      // Check authentication
      if (!context.user) {
        throw new Error("Authentication required");
      }

      // Check permissions
      const userPermissions = context.user.permissions || {};
      const userRole = context.user.role;

      if (
        userRole !== "SUPER_ADMIN" &&
        !userPermissions.product?.includes("addEdit")
      ) {
        throw new Error("Insufficient permissions to add/edit products");
      }

      try {
        // Check if product with same name exists (excluding current product if editing)
        const existingProduct = await Product.findOne({
          name,
          _id: { $ne: id },
        });

        if (existingProduct) {
          return errorResponse("A product with this name already exists.");
        }

        // Validate that all items exist
        const itemIds = items.map((item) => item.itemId);
        const existingItems = await Item.find({ _id: { $in: itemIds } });

        console.log(
          `Found ${existingItems.length} items out of ${itemIds.length} requested`
        );

        if (existingItems.length !== itemIds.length) {
          return errorResponse("One or more items not found.");
        }

        let product: any;

        if (id) {
          console.log("Updating product:", id);
          // Update existing product
          product = await Product.findByIdAndUpdate(
            id,
            { name, price, updatedAt: new Date() },
            { new: true }
          );

          if (!product) {
            console.log("Product not found for update");
            return errorResponse("Product not found.");
          }

          // Delete old ingredients
          await ProductIngredient.deleteMany({ productId: id });

          // Add new ingredients (no inventory deduction - only when sold)
          const ingredientDocs = items.map((item) => ({
            productId: id,
            itemId: item.itemId,
            quantityUsed: item.quantityUsed,
          }));
          await ProductIngredient.insertMany(ingredientDocs);

          // Populate ingredients
          product = await Product.findById(id).populate({
            path: "ingredientsUsed",
            populate: {
              path: "itemId",
              model: "Item",
            },
          });

          console.log("Product updated successfully");
          const productObj = product?.toObject();
          return {
            success: true,
            message: "Product updated successfully",
            data: {
              ...productObj,
              createdAt: new Date(product?.createdAt).toISOString(),
              updatedAt: new Date(product?.updatedAt).toISOString(),
              ingredientsUsed: (productObj?.ingredientsUsed || []).map(
                (ing: any) => ({
                  _id: ing._id,
                  productId: ing.productId,
                  itemId: ing.itemId?._id || ing.itemId,
                  quantityUsed: ing.quantityUsed,
                  item: ing.itemId,
                })
              ),
            },
          };
        } else {
          console.log("Creating new product");
          // Create new product
          product = await Product.create({ name, price });
          console.log("Product created with ID:", product._id);

          // Add ingredients (no inventory deduction - only when sold)
          const ingredientDocs = items.map((item) => ({
            productId: product._id,
            itemId: item.itemId,
            quantityUsed: item.quantityUsed,
          }));
          console.log("Inserting ingredients:", ingredientDocs.length);
          await ProductIngredient.insertMany(ingredientDocs);

          // Populate ingredients
          console.log("Populating product ingredients");
          product = await Product.findById(product._id).populate({
            path: "ingredientsUsed",
            populate: {
              path: "itemId",
              model: "Item",
            },
          });

          console.log("Product created successfully, populated:", !!product);
          const productObj = product?.toObject();
          const result = {
            success: true,
            message: "Product added successfully",
            data: {
              ...productObj,
              createdAt: new Date(product?.createdAt).toISOString(),
              updatedAt: new Date(product?.updatedAt).toISOString(),
              ingredientsUsed: (productObj?.ingredientsUsed || []).map(
                (ing: any) => ({
                  _id: ing._id,
                  productId: ing.productId,
                  itemId: ing.itemId?._id || ing.itemId,
                  quantityUsed: ing.quantityUsed,
                  item: ing.itemId,
                })
              ),
            },
          };
          console.log("Returning result with data:", !!result.data);
          return result;
        }
      } catch (err) {
        console.error("addProduct error:", err);
        return errorResponse("Failed to add/update product.");
      }
    },
    deleteProduct: async (_: unknown, { id }: { id: string }, context: any) => {
      // Check authentication
      if (!context.user) {
        throw new Error("Authentication required");
      }

      // Check permissions
      const userPermissions = context.user.permissions || {};
      const userRole = context.user.role;

      if (
        userRole !== "SUPER_ADMIN" &&
        !userPermissions.product?.includes("delete")
      ) {
        throw new Error("Insufficient permissions to delete products");
      }

      try {
        const product = await Product.findById(id);
        if (!product) {
          return errorResponse("Product not found");
        }

        // Soft delete: mark as inactive instead of deleting
        // This preserves historical data and prevents breaking references in parked sales
        await Product.findByIdAndUpdate(id, { isActive: false });
        
        // Also mark associated ingredients as inactive (soft delete)
        await ProductIngredient.updateMany(
          { productId: id },
          { isActive: false }
        );

        return successResponse("Product deleted successfully", null);
      } catch (err) {
        console.error("deleteProduct error:", err);
        return errorResponse("Failed to delete product");
      }
    },
  },
};
