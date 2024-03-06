import Link from "next/link"
import { redirect } from "next/navigation"

import { cn } from "@pachi/utils"

import { buttonVariants } from "~/components/ui/button"
import { Icons } from "~/components/ui/icons"
import { UserAuthForm } from "../../../components/use-auth-form"
import { validateRequest } from "../../../libs/validate-request"

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
}

export default async function RegisterPage() {
  const { user } = await validateRequest()
  if (user) {
    redirect("/home")
  }
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:px-0">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8",
        )}
      >
        Login
      </Link>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.logo className="mx-auto h-6 w-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="pb-4 text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <UserAuthForm isLogin={false} />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-brand"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-brand"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
