import { Effect } from "effect";
import { isObject, isString } from "remeda";
import type { ReadonlyJSONObject } from "replicache";

import { type TableName, type Transaction } from "@pachi/db";

import { deleteItems, setItems, updateItems } from "./data/data";

const DELETE = "DELETE" as const;
const SET = "set" as const;
const UPDATE = "UPDATE" as const;

interface CustomWriteTransaction {
  set(key: string, value: ReadonlyJSONObject, tableName: TableName): void;
  update(key: string, value: ReadonlyJSONObject, tableName: TableName): void;
  del(key: string, tableName: TableName): void;
}

export class ReplicacheTransaction implements CustomWriteTransaction {
  private readonly _transaction: Transaction;
  private readonly _cache = new Map<
    string,
    {
      method: typeof SET | typeof UPDATE | typeof DELETE;
      value?: ReadonlyJSONObject;
      tableName?: TableName;
    }
  >();

  private readonly _userId: string | undefined;

  constructor(userId: string | undefined, transaction: Transaction) {
    this._userId = userId;
    this._transaction = transaction;
  }

  set(
    key: string | Record<string, string>,
    value: ReadonlyJSONObject,
    tableName: TableName,
  ) {
    if (isString(key)) this._cache.set(key, { method: SET, value, tableName });
    else if (isObject(key))
      this._cache.set(Object.values(key).join(), {
        method: SET,
        value,
        tableName,
      });
  }
  update(key: string, value: ReadonlyJSONObject, tableName: TableName) {
    const prevUpdate = this._cache.get(key);

    if (prevUpdate) {
      this._cache.set(key, {
        method: UPDATE,
        value: prevUpdate.value ? { ...prevUpdate.value, ...value } : value,
        tableName,
      });
    } else {
      this._cache.set(key, {
        method: UPDATE,
        value,
        tableName,
      });
    }
  }

  del(key: string, tableName: TableName) {
    this._cache.set(key, { method: DELETE, tableName });
  }

  /* --------------------- */
  /* not implemented */
  has(key: string) {
    return this._cache.has(key);
  }
  isEmpty() {
    return true;
  }
  /* --------------------- */

  flush() {
    const items = [...this._cache.entries()].map((item) => item);

    if (items.length === 0) {
      return Effect.succeed(1);
    }

    const itemsToSet = new Map<
      TableName,
      { id: string; value: ReadonlyJSONObject }[]
    >();
    const itemsToUpdate = new Map<
      TableName,
      { id: string; value: ReadonlyJSONObject }[]
    >();

    const itemsToDel = new Map<TableName, string[]>();

    for (const item of items) {
      if (item[1].method === SET && item[1].value && item[1].tableName) {
        const tableItems = itemsToSet.get(item[1].tableName) ?? [];

        tableItems.push({
          id: item[0],
          value: item[1].value,
        });
        itemsToSet.set(item[1].tableName, tableItems);
      } else if (
        item[1].method === UPDATE &&
        item[1].value &&
        item[1].tableName
      ) {
        const tableItems = itemsToUpdate.get(item[1].tableName) ?? [];

        tableItems.push({
          id: item[0],
          value: item[1].value,
        });
        itemsToUpdate.set(item[1].tableName, tableItems);
      } else if (item[1].method === DELETE && item[1].tableName) {
        const tableItems = itemsToDel.get(item[1].tableName) ?? [];
        tableItems.push(item[0]);
        itemsToDel.set(item[1].tableName, tableItems);
      }
    }

    Effect.all(
      [
        deleteItems(itemsToDel, this._userId, this._transaction),
        setItems(itemsToSet, this._userId, this._transaction),
        updateItems(itemsToUpdate, this._userId, this._transaction),
      ],
      { concurrency: "unbounded" },
    );
    this._cache.clear();

    return Effect.succeed(1);
  }
}
