"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { PageHeaderHeading } from "~/components/molecules/page-header"
import { Shell } from "~/components/ui/shell"
import { ProductsTable } from "./_components/product-table"

const Page = () => {
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId")
  const router = useRouter()

  useEffect(() => {
    if (!storeId) router.push("/")
  }, [router, storeId])

  if (!storeId) return <></>

  return (
    <Shell>
      <PageHeaderHeading size="sm" className="mt-2 flex-1">
        Products
      </PageHeaderHeading>
      <ProductsTable storeId={storeId} />
    </Shell>
  )
}

export default Page
