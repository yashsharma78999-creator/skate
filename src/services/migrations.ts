import { productService } from "./database";
import productJersey from "@/assets/product-jersey.jpg";
import productBoots from "@/assets/product-boots.jpg";
import productBall from "@/assets/product-ball.jpg";
import productGloves from "@/assets/product-gloves.jpg";

const INITIAL_PRODUCTS = [
  {
    name: "Pro Performance Jacket",
    price: 129.99,
    original_price: 179.99,
    image_url: productJersey,
    category: "Apparel",
    description:
      "Professional skating jacket with moisture-wicking fabric and thermal insulation. Perfect for training sessions and casual skating.",
    stock_quantity: 50,
    sku: "JACKET-001",
    is_active: true,
  },
  {
    name: "Elite Figure Skates",
    price: 349.99,
    original_price: 449.99,
    image_url: productBoots,
    category: "Ice Skates",
    description:
      "Professional-grade figure skates with premium leather boots and precision-ground blades. Designed for optimal performance and comfort.",
    stock_quantity: 30,
    sku: "SKATES-001",
    is_active: true,
  },
  {
    name: "Training Blade Guards",
    price: 49.99,
    original_price: 69.99,
    image_url: productBall,
    category: "Accessories",
    description:
      "High-quality blade guards to protect your skate blades when walking off the ice. Essential for maintaining blade sharpness.",
    stock_quantity: 100,
    sku: "GUARDS-001",
    is_active: true,
  },
  {
    name: "Pro Skating Gloves",
    price: 39.99,
    original_price: 59.99,
    image_url: productGloves,
    category: "Protective Gear",
    description:
      "Insulated skating gloves with grip enhancement. Keep your hands warm while maintaining dexterity for spins and jumps.",
    stock_quantity: 75,
    sku: "GLOVES-001",
    is_active: true,
  },
];

export const migrationService = {
  async seedInitialProducts() {
    try {
      // Add timeout to prevent blocking app initialization
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Migration timeout")), 8000)
      );

      // Check if products already exist
      const existingProductsPromise = productService.getAll();
      const existingProducts = await Promise.race([
        existingProductsPromise,
        timeoutPromise,
      ]);

      if (existingProducts.length > 0) {
        console.log("Products already exist in database. Skipping migration.");
        return;
      }

      console.log("Seeding initial products...");

      for (const product of INITIAL_PRODUCTS) {
        await productService.create(product);
      }

      console.log("Initial products seeded successfully");
    } catch (error) {
      console.debug("Error seeding products (non-blocking):", error instanceof Error ? error.message : String(error));
    }
  },
};
