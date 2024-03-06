'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'

import { generateId } from '@pachi/utils'

interface DashboardButtonProps {
  username: string | undefined
}
export function DashboardButton({ username }: DashboardButtonProps) {
  const router = useRouter()
  const onClick = useCallback(() => {
    if (!username) {
      return router.push(`/login`)
    }

    const storeId = localStorage?.getItem('storeId')
    router.push(
      `/dashboard/products?storeId=${
        storeId ?? generateId({ id: username, prefix: 'store' })
      }`,
    )
  }, [username, router])

  return (
    <button
      onClick={onClick}
      className="h-18 w-18 group flex flex-col items-center justify-center text-sm   "
    >
      <LayoutDashboard className="text-slate-11 group-hover:text-slate-9" />
      <p className="text-[10px] text-slate-11 group-hover:text-slate-9">
        Dashboard
      </p>
    </button>
  )
}
