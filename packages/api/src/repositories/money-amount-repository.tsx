import { eq } from "drizzle-orm";

import { money_amount, type MoneyAmount } from "@pachi/db";

import { RepositoryBase } from "./base";

export class MoneyAmountRepository extends RepositoryBase {
  async getMoneyAmount(id: string) {
    return (await this.manager.query.money_amount.findFirst({
      where: (money_amount) => eq(money_amount.id, id),
    })) as MoneyAmount | undefined;
  }
  async insertMoneyAmount(money: MoneyAmount) {
    //@ts-ignore
    return await this.manager.insert(money_amount).values(money).execute();
  }
}
