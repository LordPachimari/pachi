/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react"
import type { Replicache } from "replicache"

export class Store<Item> {
  public build() {
    const result = {
      get: (rep: Replicache | null, key: string) => createGet<Item>(key, rep),
      scan: (rep: Replicache | null, prefix: string) =>
        createScan<Item>(prefix, rep),
    }
    return result
  }
}

function createGet<T>(key: string, rep: Replicache | null): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined)
  useEffect(() => {
    if (rep)
      rep.experimentalWatch(
        (diffs) => {
          for (const diff of diffs) {
            if (diff.op === "add") {
              setData(structuredClone(diff.newValue) as T)
            }
            if (diff.op === "change") {
              setData(structuredClone(diff.newValue) as T)
            }
            if (diff.op === "del") setData(undefined)
          }
        },
        { prefix: key, initialValuesInFirstDiff: true },
      )
  }, [rep, key])
  return data
}
function createScan<T>(prefix: string, rep: Replicache | null) {
  const [data, setData] = useState<T[]>([])
  useEffect(() => {
    if (rep)
      rep.experimentalWatch(
        (diffs) => {
          for (const diff of diffs) {
            if (diff.op === "add") {
              setData((prev) => [...prev, structuredClone(diff.newValue) as T])
            }
            if (diff.op === "change") {
              setData((prev) => [
                ...prev.filter(
                  (item) => (item as { id: string }).id !== diff.key,
                ),
                structuredClone(diff.newValue) as T,
              ])
            }
            if (diff.op === "del") {
              setData((prev) =>
                prev.filter((item) => (item as { id: string }).id !== diff.key),
              )
            }
          }
        },
        { prefix, initialValuesInFirstDiff: true },
      )
  }, [rep, prefix])
  return data
}
