import React from 'react'

import type { User } from '@pachi/db'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Card, CardContent, CardHeader } from '~/components/ui/card'

type CustomerSummaryProps = {
  customer: User
}

const CustomerSummary: React.FC<CustomerSummaryProps> = ({ customer }) => {
  // const [, handleCopyEmail] = useClipboard(customer.email, {
  //   successDuration: 5500,
  //   onCopied: () => toast.message("Email copied!"),
  // });
  return (
    <Card className=" flex w-full flex-col  rounded-xl ">
      <CardHeader className="flex w-full flex-row items-start justify-between">
        <div className="flex ">
          <Avatar
            // user={order.customer}
            // font="inter-large-semibold"
            color="bg-fuschia-40"
          >
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col pl-4">
            <h2 className="text-lg font-bold">
              {customer.username ?? 'Anonymous'}
            </h2>

            <p>{customer.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex w-full flex-col ">
        <div className="mt-2 flex ">
          <div className=" flex flex-col border-r-[1px] pr-4">
            <p className=" text-grey-50 mb-1">Last ordered</p>
            <div className=" flex flex-col">
              {/* <p>{customer.orders[0].createdAt || "1231232"}</p> */}
            </div>
          </div>
          <div className=" flex flex-col border-r-[1px] px-4">
            <p className=" text-grey-50 mb-1">Phone</p>
            <div className=" flex flex-col">
              <p>{customer.phone ?? '1231232'}</p>
            </div>
          </div>

          <div className=" flex flex-col px-4">
            <p className=" text-grey-50 mb-1">Orders</p>
            <div className=" flex flex-col">
              {/* <p>{customer.orders.length}</p> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerSummary
