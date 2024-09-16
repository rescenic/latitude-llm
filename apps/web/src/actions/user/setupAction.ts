'use server'

import { setSession } from '$/services/auth/setSession'
import { ROUTES } from '$/services/routes'
import setupService from '$/services/user/setupService'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { errorHandlingProcedure } from '../procedures'

export const setupAction = errorHandlingProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string().min(1, { message: 'Name is a required field' }),
      email: z.string().email(),
      companyName: z
        .string()
        .min(1, { message: 'Workspace name is a required field' }),
    }),
    { type: 'formData' },
  )
  .handler(async ({ input }) => {
    const result = await setupService(input)
    const sessionData = result.unwrap()

    await setSession({ sessionData })

    redirect(ROUTES.root)
  })
