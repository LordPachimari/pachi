import type { Effect } from "effect";
import type { PatchOperation } from "replicache";

import type { TableName, Transaction } from "@pachi/db";
import type { ExtractEffectValue } from "@pachi/utils";
import type {
  ClientGroupObject,
  ClientViewRecord,
  ReplicacheClient,
  ReplicacheSubspaceRecord,
  RowsWTableName,
  SpaceID,
  SpaceRecord,
} from "@pachi/validators";

import {
  createSpacePatch,
  createSpaceResetPatch,
  deleteSpaceRecord,
  diffClientRecords,
  diffSpaceRecords,
  getClientGroupObject,
  getCurrentClientRecord,
  getCurrentSpaceRecord,
  getPrevClientRecord,
  getPrevSpaceRecord,
  setClientGroupObject,
  setSpaceRecord,
} from "./data";

interface SpaceRecordDiff {
  newIDs: Map<TableName, Set<string>>;
  deletedIDs: Map<TableName, Set<string>>;
}

type SubspaceRecord = Omit<ReplicacheSubspaceRecord, "version">;

type ClientRecordDiff = Record<string, number>;

interface ReplicacheRecordManagerBase {
  getPrevClientRecord: (
    key: string,
  ) => Effect.Effect<ClientViewRecord | undefined, never, never>;
  getCurrentClientRecord: () => Effect.Effect<
    Pick<ReplicacheClient, "id" | "lastMutationID">[],
    never,
    never
  >;
  getPrevSpaceRecord: (
    key: string,
  ) => Effect.Effect<Array<SubspaceRecord> | undefined, never, never>;
  getCurrentSpaceRecord: () => Effect.Effect<
    Array<{
      rows: Array<RowsWTableName>;
      subspaceRecord: SubspaceRecord;
    }>,
    never,
    never
  >;
  getClientGroupObject: () => Effect.Effect<ClientGroupObject, never, never>;
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
  ) => Effect.Effect<PatchOperation[], never, never>;
  createSpaceResetPatch: (
    diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
  ) => Effect.Effect<PatchOperation[], never, never>;
  setSpaceRecord: (
    spaceRecord: Array<SubspaceRecord>,
  ) => Effect.Effect<void, never, never>;
  setClientGroupObject: (
    clientGroupObject: ClientGroupObject,
  ) => Effect.Effect<void, never, never>;

  deleteSpaceRecord: (keys: string[]) => Effect.Effect<void, never, never>;
}

class ReplicacheRecordManager implements ReplicacheRecordManagerBase {
  private readonly spaceID: SpaceID;
  private readonly subspaceIDs: Array<SpaceRecord[SpaceID][number]>;
  private readonly transaction: Transaction;
  private readonly clientGroupID: string;
  private readonly userID: string | undefined;
  constructor({
    spaceID,
    subspaceIDs,
    transaction,
    clientGroupID,
    userID,
  }: {
    spaceID: SpaceID;
    subspaceIDs: Array<SpaceRecord[SpaceID][number]>;
    transaction: Transaction;
    clientGroupID: string;
    userID: string | undefined;
  }) {
    this.spaceID = spaceID;
    this.transaction = transaction;
    this.subspaceIDs = subspaceIDs;
    this.clientGroupID = clientGroupID;
    this.userID = userID;
  }
  getPrevClientRecord(key: string | undefined) {
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
  getPrevSpaceRecord(key: string | undefined) {
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
      userID: this.userID,
    });
  }
  getClientGroupObject() {
    return getClientGroupObject({
      transaction: this.transaction,
      clientGroupID: this.clientGroupID,
    });
  }

  diffClientRecords(
    prevRecord: ExtractEffectValue<ReturnType<this["getPrevClientRecord"]>>,

    currentRecord: ExtractEffectValue<
      ReturnType<this["getCurrentClientRecord"]>
    >,
  ) {
    return diffClientRecords({ prevRecord, currentRecord });
  }

  diffSpaceRecords(
    prevRecord: ExtractEffectValue<ReturnType<this["getPrevSpaceRecord"]>>,
    currentRecord: ExtractEffectValue<
      ReturnType<this["getCurrentSpaceRecord"]>
    >,
  ) {
    return diffSpaceRecords({ prevRecord, currentRecord });
  }

  createSpacePatch(
    diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
  ) {
    return createSpacePatch({
      diff,
      transaction: this.transaction,
    });
  }

  createSpaceResetPatch() {
    return createSpaceResetPatch({
      transaction: this.transaction,
      spaceID: this.spaceID,
      userID: this.userID,
    });
  }
  setSpaceRecord(spaceRecord: Array<SubspaceRecord>) {
    return setSpaceRecord({
      spaceRecord,
      transaction: this.transaction,
    });
  }
  deleteSpaceRecord(keys: string[]) {
    return deleteSpaceRecord({
      keys,
      transaction: this.transaction,
    });
  }
  setClientGroupObject(clientGroupObject: ClientGroupObject) {
    return setClientGroupObject({
      clientGroupObject,
      transaction: this.transaction,
    });
  }
}

export { ReplicacheRecordManager };
export type {
  ClientRecordDiff,
  ReplicacheRecordManagerBase,
  SpaceRecordDiff,
  SubspaceRecord,
};