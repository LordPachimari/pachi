"use server";

import { readFileSync } from "fs";
import { join } from "path";

// eslint-disable-next-line @typescript-eslint/require-await
export async function testApi(
  _: unknown,
  formData: FormData,
): Promise<{
  message: string;
  type: "SUCCESS" | "FAIL" | "NONE";
}> {
  // Define a type for the category structure
  type Category = {
    id: number;
    name: string;
    parent_id: number | null;
  };

  function parseCategories(filePath: string): Category[] {
    const content = readFileSync(filePath, { encoding: "utf8" });
    const lines = content.split("\n");

    const categories: Category[] = [];
    const categoryMap = new Map<string, number>(); // Map category name to id

    lines.forEach((line, index) => {
      if (line.trim() === "") return; // Skip empty lines

      const parts = line.split(" - ");
      if (parts.length < 2) return;
      const hierarchy = parts[1]!.split(" > ");
      const name = hierarchy[hierarchy.length - 1]!.trim();
      const parentName =
        hierarchy.length > 1 ? hierarchy[hierarchy.length - 2]!.trim() : null;
      const parentId = parentName ? categoryMap.get(parentName) ?? null : null;

      // const categoryId = ulid();
      const categoryId = index + 1;
      const category = {
        // id: categoryId,
        id: categoryId,
        name,
        parent_id: parentId,
      };
      categories.push(category);
      categoryMap.set(name, categoryId);
    });

    return categories;
  }

  // Example usage
  const filePath = join(process.cwd(), "public", "product-taxonomy.txt");
  try {
    const categories = parseCategories(filePath);
    console.log("categories", categories);
    return { message: "Success parsing categories", type: "SUCCESS" };
  } catch (error) {
    console.log(error);
    return { message: "Error parsing categories", type: "FAIL" };
  }
}
