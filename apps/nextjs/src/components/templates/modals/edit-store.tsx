import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { FolderClosed } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Textarea } from "~/components/ui/textarea"

interface EditStoreModalProps {
  closeModal: () => void
  isOpen: boolean
}
export default function EditStoreModal({
  closeModal,
  isOpen,
}: EditStoreModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative h-[600px] w-full  transform overflow-hidden rounded-2xl bg-component p-6 text-left align-middle shadow-xl transition-all md:w-[600px] ">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">My Cart</p>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close edit modal"
                    className="border-none"
                    onClick={closeModal}
                  >
                    <FolderClosed />
                  </Button>
                </div>
                <div className="mt-2 h-[200px] w-full rounded-t-xl bg-red-100"></div>
                <Avatar className="absolute left-1/2 right-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 transform   md:h-48 md:w-48 ">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="h-[120px]"></div>

                <ScrollArea className="h-[200px]">
                  <section className="flex flex-col gap-2 p-2">
                    <Input placeholder="Store name" />
                    <Textarea placeholder="About" />
                  </section>
                  <section className="mt-2 flex w-full justify-end p-2">
                    <Button>Save</Button>
                  </section>
                </ScrollArea>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
