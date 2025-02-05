import { env } from '@latitude-data/env'

import {
  DEFAULT_PROVIDER_MAX_FREE_RUNS,
  ProviderApiKey,
  RunErrorCodes,
  Workspace,
} from '../../../browser'
import { Result } from '../../../lib'
import { DEFAULT_PROVIDER_UNSUPPORTED_MODELS } from '../../ai/providers/models'
import { incrFreeRuns } from '../../freeRunsManager'
import { ChainError } from '../ChainErrors'

export async function checkFreeProviderQuota({
  workspace,
  provider,
  model,
  defaultProviderApiKey = env.DEFAULT_PROVIDER_API_KEY,
}: {
  workspace: Workspace
  provider: ProviderApiKey
  model?: string
  defaultProviderApiKey?: string
}) {
  if (provider.token !== defaultProviderApiKey) return Result.ok(true)
  if (DEFAULT_PROVIDER_UNSUPPORTED_MODELS.includes(model ?? '')) {
    return Result.error(
      new ChainError({
        code: RunErrorCodes.DefaultProviderInvalidModel,
        message:
          'The default provider does not support the gpt-4o model, except 4o-mini.',
      }),
    )
  }

  const value = await incrFreeRuns(workspace.id)
  if (value <= DEFAULT_PROVIDER_MAX_FREE_RUNS) return Result.ok(true)

  return Result.error(
    new ChainError({
      code: RunErrorCodes.DefaultProviderExceededQuota,
      message: 'You have exceeded your maximum number of free runs for today',
    }),
  )
}
