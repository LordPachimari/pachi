import { Context } from 'effect'

import type { Db, Transaction } from '@pachi/db'
import type { RequestHeaders } from '@pachi/types'

import type { RepositoriesType, ServicesType } from '.'
import type { ReplicacheTransaction } from '../replicache'

export class ServerContext extends Context.Tag('ServerContext')<
  ServerContext,
  {
    manager: Transaction | Db
    userId: string | undefined
    requestHeaders: RequestHeaders | undefined
    services: ServicesType
    repositories: RepositoriesType
    replicacheTransaction: ReplicacheTransaction
  }
>() {}
