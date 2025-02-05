import { asc, desc, eq, getTableColumns } from 'drizzle-orm'

import { ProviderLog } from '../browser'
import { NotFoundError, Result } from '../lib'
import {
  documentLogs,
  providerApiKeys,
  providerLogs,
  workspaces,
} from '../schema'
import { QueryOptions } from './repository'
import Repository from './repositoryV2'

const tt = getTableColumns(providerLogs)

export class ProviderLogsRepository extends Repository<ProviderLog> {
  get scope() {
    return this.db
      .select(tt)
      .from(providerLogs)
      .innerJoin(
        providerApiKeys,
        eq(providerApiKeys.id, providerLogs.providerId),
      )
      .innerJoin(workspaces, eq(workspaces.id, providerApiKeys.workspaceId))
      .$dynamic()
  }

  async findByUuid(uuid: string) {
    const result = await this.scope.where(eq(providerLogs.uuid, uuid)).limit(1)

    if (!result.length) {
      return Result.error(new NotFoundError('ProviderLog not found'))
    }

    return Result.ok(result[0]!)
  }

  async findByDocumentUuid(documentUuid: string, opts: QueryOptions = {}) {
    const query = this.scope
      .innerJoin(
        documentLogs,
        eq(documentLogs.uuid, providerLogs.documentLogUuid),
      )
      .where(eq(documentLogs.documentUuid, documentUuid))
      .orderBy(asc(providerLogs.generatedAt))

    if (opts.limit !== undefined) {
      query.limit(opts.limit)
    }
    if (opts.offset !== undefined) {
      query.offset(opts.offset)
    }

    const result = await query

    return Result.ok(result)
  }

  async findLastByDocumentLogUuid(documentLogUuid: string | undefined) {
    if (!documentLogUuid) {
      return Result.error(new NotFoundError('documentLogUuid is required'))
    }

    const result = await this.scope
      .where(eq(providerLogs.documentLogUuid, documentLogUuid))
      .orderBy(desc(providerLogs.generatedAt))
      .limit(1)

    if (!result.length) {
      return Result.error(new NotFoundError('ProviderLog not found'))
    }

    return Result.ok(result[0]!)
  }

  async findByDocumentLogUuid(
    documentLogUuid: string,
    opts: QueryOptions = {},
  ) {
    const query = this.scope
      .where(eq(providerLogs.documentLogUuid, documentLogUuid))
      .orderBy(asc(providerLogs.generatedAt))

    if (opts.limit !== undefined) {
      query.limit(opts.limit)
    }
    if (opts.offset !== undefined) {
      query.offset(opts.offset)
    }

    const result = await query

    return Result.ok(result)
  }
}
