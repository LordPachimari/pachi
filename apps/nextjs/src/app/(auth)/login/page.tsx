import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { cn } from '@pachi/utils'

import { buttonVariants } from '~/components/ui/button'
import { Icons } from '~/components/ui/icons'
import { UserAuthForm } from '../_components/use-auth-form'
import { validateRequest } from '../../../libs/validate-request'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default async function LoginPage() {
  const { user } = await validateRequest()
  if (user) {
    redirect('/home')
  }
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute left-4 top-4 md:left-8 md:top-8',
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="pb-4 text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <UserAuthForm isLogin={true} />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-brand"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
