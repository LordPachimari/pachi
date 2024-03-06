import type { ProductUpdates } from "@pachi/db"

import { Switch } from "../../../../ui/switch"

export type DiscountableFormType = {
  value: boolean
}

type Props = {
  discountable: boolean | undefined
  updateProduct: ({ updates }: { updates: ProductUpdates }) => Promise<void>
}

const Discountable = ({ discountable = false, updateProduct }: Props) => {
  return (
    <div className=" my-2 flex items-center justify-between">
      <h2 className="text-sm font-semibold ">Discountable</h2>

      <Switch
        checked={discountable}
        onCheckedChange={async (checked) =>
          await updateProduct({ updates: { discountable: checked } })
        }
      />
    </div>
  )
}

export default Discountable
