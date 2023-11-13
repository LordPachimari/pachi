// import { Pool } from "@neondatabase/serverless";
// import { eq } from "drizzle-orm";
// import { MySqlTimestampStringBuilder } from "drizzle-orm/mysql-core";
// import { drizzle } from "drizzle-orm/neon-serverless";
// import { afterAll, describe, expect, test } from "vitest";

// import { push } from "@pachi/api";
// import {
//   products,
//   replicache_clients,
//   schema,
//   type Product,
//   type ProductUpdates,
// } from "@pachi/db";

// import { type Bindings } from "../../../src";
// import { DashboardMutators } from "./mutators";

// describe("dashboard space", () => {
//   const userId = "user1";
//   const spaceId = "dashboard";
//   const requestHeaders = {
//     ip: "whatever",
//     userAgent: "whatever",
//   };

//   const env = getMiniflareBindings() as Bindings;
//   const ctx = new ExecutionContext();
//   const clientID = "client1";
//   const clientGroupID = "clientGroupId";

//   const client = new MomentoFetcher(
//     env.MOMENTO_AUTH_KEY,
//     env.MOMENTO_REST_ENDPOINT,
//   );

//   const pool = new Pool({ connectionString: env.DATABASE_URL });

//   const db = drizzle(pool, { schema });
//   const dashboardMutators = new DashboardMutators({
//     client,
//     clientGroupID,
//     clientID,
//     db,
//     env,
//     requestHeaders,
//     userId,
//     spaceId,
//   });
//   afterAll(async () => {
//     await dashboardMutators.flush();
//   });

//   test("create product mutation", async () => {
//     const product: Product = {
//       id: "product1",
//       created_at: "today",
//       seller_id: userId,
//     };
//     await dashboardMutators.createProduct(product);
//     const newProduct = await db.query.products.findFirst({
//       columns: {
//         id: true,
//         created_at: true,
//         seller_id: true,
//       },
//       where: () => eq(products.id, product.id),
//     });

//     const clientGroupObject = await client.get(
//       env.MOMENTO_CACHE_NAME,
//       clientGroupID,
//     );
//     expect.hasAssertions();

//     expect(newProduct).toEqual(product);
//     expect(clientGroupObject).toBeDefined();
//   });

//   test("update product mutation", async () => {
//     const product_id = "product1";
//     const updates: ProductUpdates = {
//       description: "new description",
//       title: "new title",
//     };
//     const product = await db.query.products.findFirst({
//       columns: {
//         description: true,
//         title: true,
//       },
//       where: () => eq(products.id, product_id),
//     });
//     console.log("product", product);
//     expect.hasAssertions();
//     expect(product).toEqual(updates);
//   });

//   test("delete product mutation", async () => {
//     const product_id = "product1";
//     await dashboardMutators.deleteProduct(product_id);
//     const product = await db.query.products.findFirst({
//       columns: {
//         id: true,
//       },
//       where: () => eq(products.id, product_id),
//     });

//     expect.hasAssertions();
//     expect(product).toBeUndefined();
//   });
// });
