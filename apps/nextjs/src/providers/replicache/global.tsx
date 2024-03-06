'use client'

import { useEffect } from 'react'
import { Replicache, type PullResponseOKV1 } from 'replicache'

import { ClientGlobalMutators } from '@pachi/core'

import { env } from '~/env.mjs'
import { useReplicache } from '~/zustand/replicache'

function GlobalReplicacheProvider({ children }: { children: React.ReactNode }) {
  const userId = 'user1'
  const { globalRep, setGlobalRep } = useReplicache()
  const token = localStorage?.getItem('auth_session')
  useEffect(() => {
    if (globalRep) {
      return
    }

    if (!userId) return
    const r = new Replicache({
      name: userId,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/global?userId=${userId}`,
      // pullURL: `${env.NEXT_PUBLIC_WORKER_DEV_URL}/pull/global?userId=${userId}`,
      mutators: ClientGlobalMutators,
      pullInterval: null,
      puller: async (req) => {
        const result = await fetch(
          `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/global?userId=${userId}`,
          {
            headers: {
              'content-type': 'application/json',
              Origin: env.NEXT_PUBLIC_APP_URL,
              Authorization: `Bearer ${token ?? ''}`,
            },
            body: JSON.stringify(req),
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
          },
        )
        return {
          response:
            result.status === 200
              ? ((await result.json()) as PullResponseOKV1)
              : undefined,
          httpRequestInfo: {
            httpStatusCode: result.status,
            errorMessage: result.statusText,
          },
        }
      },
    })
    setGlobalRep(r)
  }, [userId, globalRep, setGlobalRep])
  return <>{children}</>
}

export { GlobalReplicacheProvider }
