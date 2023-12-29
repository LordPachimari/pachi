// import { eq } from "drizzle-orm";

// import { push } from "@pachi/api";
// import {
//   products,
//   replicache_clients,
//   type Db,
//   type Product,
//   type ProductUpdates,
// } from "@pachi/db";
// import type { SpaceId } from "@pachi/types";

// import type { Bindings } from "~/index";

// export class DashboardMutators {
//   private readonly clientGroupID: string;
//   private readonly clientID: string;
//   private readonly db: Db;
//   private readonly env: Bindings;
//   private readonly userId: string;
//   private readonly spaceId: SpaceId;
//   private readonly requestHeaders: {
//     ip: string | null;
//     userAgent: string | null;
//   };
//   constructor({
//     clientGroupID,
//     clientID,
//     db,
//     client,
//     env,
//     userId,
//     requestHeaders,
//     spaceId,
//   }: {
//     clientGroupID: string;
//     clientID: string;
//     db: Db;
//     env: Bindings;
//     userId: string;
//     requestHeaders: {
//       ip: string | null;
//       userAgent: string | null;
//     };
//     spaceId: SpaceId;
//   }) {
//     this.clientGroupID = clientGroupID;
//     this.clientID = clientID;
//     this.db = db;
//     this.env = env;
//     this.userId = userId;
//     this.requestHeaders = requestHeaders;
//     this.spaceId = spaceId;
//   }
//   async createProduct(product: Product) {
//     return await push({
//       body: {
//         clientGroupID: "clientGroupId",
//         mutations: [
//           {
//             id: 1,
//             args: {
//               product: {
//                 id: "product1",
//                 createdAt: "2023-10-06T03:48:05.047Z",
//                 seller_id: "user1",
//               },
//             },
//             clientID: "client1",
//             name: "createProduct",
//           },
//         ],
//       },
//       db: this.db,
//       storage: {
//         cacheName: this.env.MOMENTO_CACHE_NAME,
//         client: this.client,
//       },
//       spaceId: this.spaceId,
//       userId: this.userId,
//       requestHeaders: this.requestHeaders,
//     });
//   }

//   async updateProduct(updates: ProductUpdates, id: string) {
//     return await push({
//       body: {
//         clientGroupID: this.clientGroupID,
//         mutations: [
//           {
//             id: 1,
//             args: {
//               updates,
//               id,
//             },
//             clientID: "client1",
//             name: "updateProduct",
//           },
//         ],
//       },
//       db: this.db,
//       storage: {
//         cacheName: this.env.MOMENTO_CACHE_NAME,
//         client: this.client,
//       },
//       spaceId: this.spaceId,
//       userId: this.userId,
//       requestHeaders: this.requestHeaders,
//     });
//   }
//   async deleteProduct(id: string) {
//     return await push({
//       body: {
//         clientGroupID: this.clientGroupID,
//         mutations: [
//           {
//             id: 3,
//             args: {
//               id,
//             },
//             clientID: this.clientID,
//             name: "deleteProduct",
//           },
//         ],
//       },
//       db: this.db,
//       storage: {
//         cacheName: this.env.MOMENTO_CACHE_NAME,
//         client: this.client,
//       },
//       spaceId: this.spaceId,
//       userId: this.userId,
//       requestHeaders: this.requestHeaders,
//     });
//   }
//   async flush() {
//     console.log("flushing");
//     await Promise.all([
//       await this.client.delete(this.env.MOMENTO_CACHE_NAME, this.clientGroupID),
//       await this.db
//         .delete(replicache_clients)
//         .where(eq(replicache_clients.id, this.clientID)),
//     ]);
//   }
// }
