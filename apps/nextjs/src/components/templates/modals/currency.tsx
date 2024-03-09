"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { PlusIcon, SidebarClose } from "lucide-react"

import { Button } from "~/components/ui/button"

interface CurrencyModalProps {
  children: React.ReactNode
  open: () => void
  close: () => void
  isOpen: boolean
}
export default function CurrencyModal({
  children,
  close,
  isOpen,
  open,
}: CurrencyModalProps) {
  return (
    <>
      <Button
        aria-label="Open cart"
        onClick={open}
        size="icon"
        className="shadow-ruby-7 h-4 w-4 bg-brand"
      >
        <PlusIcon size={10} />
      </Button>
      <Transition show={isOpen}>
        <Dialog onClose={close} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-slate-6 bg-component p-6  backdrop-blur-xl   md:w-[390px]">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Currencies</p>

                <button aria-label="Close currency" onClick={close}>
                  <SidebarClose />
                </button>
              </div>

              {children}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}
