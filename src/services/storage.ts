import { supabase } from "@/lib/supabase";

export const storageService = {
  async uploadProductImage(file: File): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const fileName = `${timestamp}-${randomStr}-${file.name}`;
      const filePath = `products/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image");
    }
  },

  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/storage/v1/object/public/product-images/");
      if (urlParts.length < 2) {
        return; // URL is not from our storage
      }

      const filePath = urlParts[1];

      // Delete file from storage
      const { error } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
      }
    } catch (error) {
      console.error("Image deletion error:", error);
    }
  },
};
