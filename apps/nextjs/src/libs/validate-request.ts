import { cache } from 'react'
import { cookies } from 'next/headers'

import { lucia } from '@pachi/auth'

export const validateRequest = cache(async () => {
  const sessionId = cookies().get('auth_session')?.value ?? null

  if (!sessionId) {
    return {
      user: null,
      session: null,
    }
  }

  const result = await lucia.validateSession(sessionId)
  return result
})
