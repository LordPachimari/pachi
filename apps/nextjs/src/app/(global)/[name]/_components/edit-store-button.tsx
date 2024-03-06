"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Edit3Icon } from "lucide-react"

import EditStoreModal from "~/components/templates/modals/edit-store"
import { Button } from "~/components/ui/button"
import { createUrl } from "~/libs/create-url"

export function EditStoreButton({ storeName }: { storeName: string }) {
  const searchParams = useSearchParams()
  const q = searchParams.get("q")

  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (q === "edit") {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [q])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete("q")
    router.push(createUrl(storeName, newParams))
  }, [storeName, router, searchParams])

  const openModal = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("q", "edit")
    router.push(createUrl(storeName, newParams))
    setIsOpen(true)
  }, [storeName, router, searchParams])
  return (
    <>
      <EditStoreModal closeModal={closeModal} isOpen={isOpen} />
      <Button
        variant="ghost"
        size={window.innerWidth > 768 ? "sm" : "icon"}
        className="absolute right-3 top-3 rounded-xl border border-slate-8 bg-slate-6 hover:bg-slate-7"
        onClick={openModal}
      >
        {window.innerWidth > 768 ? "Edit store" : <Edit3Icon />}
      </Button>
    </>
  )
}
