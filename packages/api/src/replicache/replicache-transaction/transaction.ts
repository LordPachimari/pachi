/* eslint-disable @typescript-eslint/require-await */
import type {
  KeyTypeForScanOptions,
  ReadonlyJSONObject,
  ScanOptions,
  ScanResult,
} from "replicache";

import { type TableName, type Transaction } from "@pachi/db";
import { isObject, isString } from "@pachi/utils";

import { deleteItems, putItems, updateItems } from "../data/data";

const DELETE = "DELETE" as const;
const PUT = "PUT" as const;
const REDIS_PUT = "REDIS_PUT" as const;
const UPDATE = "UPDATE" as const;

interface CustomWriteTransaction {
  put(
    key: string,
    value: ReadonlyJSONObject,
    tableName: TableName,
  ): Promise<void>;
  update(
    key: string,
    value: ReadonlyJSONObject,
    tableName: TableName,
  ): Promise<void>;
  del(key: string, tableName: TableName): Promise<void>;
}

export class ReplicacheTransaction implements CustomWriteTransaction {
  private readonly _spaceId: string;
  private readonly _transaction: Transaction;
  private readonly _cache = new Map<
    string,
    {
      method: typeof PUT | typeof UPDATE | typeof REDIS_PUT | typeof DELETE;
      value?: ReadonlyJSONObject;
      tableName?: TableName;
    }
  >();

  private readonly _userId: string | undefined;

  constructor(
    spaceId: string,
    userId: string | undefined,
    transaction: Transaction,
  ) {
    this._spaceId = spaceId;
    this._userId = userId;
    this._transaction = transaction;
  }

  async put(
    key: string | Record<string, string>,
    value: ReadonlyJSONObject,
    tableName: TableName,
  ) {
    if (isString(key)) this._cache.set(key, { method: PUT, value, tableName });
    else if (isObject(key))
      this._cache.set(Object.values(key).join(), {
        method: PUT,
        value,
        tableName,
      });
  }
  async update(key: string, value: ReadonlyJSONObject, tableName: TableName) {
    const prevUpdate = this._cache.get(key);
    console.log("value", JSON.stringify(value));
    if (prevUpdate) {
      console.log("prev update", JSON.stringify(prevUpdate));
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

  async del(key: string, tableName: TableName) {
    this._cache.set(key, { method: DELETE, tableName });
  }

  /* --------------------- */
  /* not implemented */
  async has(key: string) {
    return this._cache.has(key);
  }
  async isEmpty() {
    return true;
  }
  scan(): ScanResult<string>;
  scan<Options extends ScanOptions>(
    _options?: Options,
  ): ScanResult<KeyTypeForScanOptions<Options>> {
    throw new Error("Method scan not implemented.");
  }
  /* --------------------- */

  async flush(): Promise<void> {
    const items = [...this._cache.entries()].map((item) => item);
    if (items.length === 0) {
      return;
    }

    const itemsToPut = new Map<
      TableName,
      { id: string; value: ReadonlyJSONObject }[]
    >();
    const itemsToUpdate = new Map<
      TableName,
      { id: string; value: ReadonlyJSONObject }[]
    >();

    const itemsToDel = new Map<TableName, string[]>();
    for (const item of items) {
      if (item[1].method === PUT && item[1].value && item[1].tableName) {
        const tableItems = itemsToPut.get(item[1].tableName) ?? [];
        tableItems.push({
          id: item[0],
          value: item[1].value,
        });
        itemsToPut.set(item[1].tableName, tableItems);
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

    await Promise.all([
      deleteItems(itemsToDel, this._userId, this._transaction),
      putItems(itemsToPut, this._userId, this._transaction),
      updateItems(itemsToUpdate, this._userId, this._transaction),
    ]);
    this._cache.clear();
  }
}
