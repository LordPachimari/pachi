import { type User } from "@pachi/db";
import { users } from "@pachi/db/schema";

import { RepositoryBase } from "../base/repository";

export class UserRepository extends RepositoryBase {
  async insertUser({ user }: { user: User }) {
    //@ts-ignore
    return await this.manager.insert(users).values(user);
  }
}
