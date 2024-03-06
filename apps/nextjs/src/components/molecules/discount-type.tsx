import { Label } from '~/components/ui/label'
import { RadioGroup } from '~/components/ui/radio-group'

const DiscountType = () => {
  return (
    <RadioGroup>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="1" id="radio_1" />
        <Label htmlFor="radio_1">Radio 1</Label>
      </div>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="2" id="radio_2" />
        <Label htmlFor="radio_2">Radio 2</Label>
      </div>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="3" id="radio_3" />
        <Label htmlFor="radio_3">Radio 3</Label>
      </div>
    </RadioGroup>
  )
}

export default DiscountType
