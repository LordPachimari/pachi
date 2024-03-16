import type { Effect } from "effect";
import type { PatchOperation } from "replicache";

import type { TableName, Transaction } from "@pachi/db";
import type { ExtractEffectValue } from "@pachi/utils";

import type {
  ClientViewRecord,
  ClientViewRecordWTableName,
  SpaceID,
  SpaceRecord,
} from "../schema-and-types";
import {
  diffClientRecords,
  diffSpaceRecords,
  getCurrentClientRecord,
  getCurrentSpaceRecord,
  getPrevClientRecord,
  getPrevSpaceRecord,
} from "./data";

interface SpaceRecordDiff {
  newIDs: Map<TableName, Set<string>>;
  deletedIDs: Map<TableName, Set<string>>;
}

type ClientRecordDiff = Record<string, number>;

interface ReplicacheRecordBase {
  getPrevClientRecord: (
    key: string,
  ) => Effect.Effect<ClientViewRecord, never, never>;
  getCurrentClientRecord: () => Effect.Effect<ClientViewRecord, never, never>;
  getPrevSpaceRecord: <T extends SpaceID>(
    key: string,
    spaceID: T,
  ) => Effect.Effect<
    Record<SpaceRecord[T][number], ClientViewRecordWTableName>,
    never,
    never
  >;
  getCurrentSpaceRecord: <T extends SpaceID>(
    spaceID: string,
  ) => Effect.Effect<
    Record<SpaceRecord[T][number], ClientViewRecordWTableName>,
    never,
    never
  >;
  diffSpaceRecords: (
    prevRecord: ExtractEffectValue<ReturnType<this["getPrevSpaceRecord"]>>,
    currentRecord: ExtractEffectValue<
      ReturnType<this["getCurrentSpaceRecord"]>
    >,
  ) => Effect.Effect<SpaceRecordDiff, never, never>;
  diffClientRecords: (
    prevRecord: ExtractEffectValue<ReturnType<this["getPrevClientRecord"]>>,
    currentRecord: ExtractEffectValue<
      ReturnType<this["getCurrentClientRecord"]>
    >,
  ) => Effect.Effect<ClientRecordDiff, never, never>;
  createSpacePatch: (
    diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
  ) => PatchOperation[];
}

class ReplicacheRecord implements ReplicacheRecordBase {
  spaceID: SpaceID;
  subspaceIDs: Array<SpaceRecord[SpaceID][number]>;
  transaction: Transaction;
  clientGroupID: string;
  userId: string | undefined;
  constructor(
    spaceID: SpaceID,
    subspaceIDs: Array<SpaceRecord[SpaceID][number]>,
    transaction: Transaction,
    clientGroupID: string,
    user: string | undefined,
  ) {
    this.spaceID = spaceID;
    this.transaction = transaction;
    this.subspaceIDs = subspaceIDs;
    this.clientGroupID = clientGroupID;
    this.userId = user;
  }
  getPrevClientRecord(key: string) {
    return getPrevClientRecord({
      key,
      transaction: this.transaction,
    });
  }
  getCurrentClientRecord() {
    return getCurrentClientRecord({
      clientGroupID: this.clientGroupID,
      transaction: this.transaction,
    });
  }
  getPrevSpaceRecord(key: string) {
    return getPrevSpaceRecord({
      key,
      spaceID: this.spaceID,
      transaction: this.transaction,
      subspaceIDs: this.subspaceIDs,
    });
  }
  getCurrentSpaceRecord() {
    return getCurrentSpaceRecord({
      spaceID: this.spaceID,
      transaction: this.transaction,
      subspaceIDs: this.subspaceIDs,
      userId: this.userId,
    });
  }

  diffClientRecords(
    prevRecord: ExtractEffectValue<ReturnType<this["getPrevClientRecord"]>>,

    currentRecord: ExtractEffectValue<
      ReturnType<this["getCurrentClientRecord"]>
    >,
  ) {
    return diffClientRecords(currentRecord, prevRecord);
  }

  diffSpaceRecords(
    prevRecord: ExtractEffectValue<ReturnType<this["getPrevSpaceRecord"]>>,
    currentRecord: ExtractEffectValue<
      ReturnType<this["getCurrentSpaceRecord"]>
    >,
  ) {
    return diffSpaceRecords(currentRecord, prevRecord, this.spaceID);
  }

  createSpacePatch(
    diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
  ) {
    return {
      spaceID: this.spaceID,
      diff,
    };
  }
  // diffSpaceRecords: () {

  // }
}

export { ReplicacheRecord };
export type { ReplicacheRecordBase, SpaceRecordDiff, ClientRecordDiff };
