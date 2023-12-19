import { users, type User } from "@pachi/db";

import { RepositoryBase } from "./base";

export class UserRepository extends RepositoryBase {
  async insertUser(user: User) {
    //@ts-ignore
    return await this.manager.insert(users).values(user).execute();
  }
}
