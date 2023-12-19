import { Separator } from "~/components/atoms/separator";
import InputField from "~/components/molecules/input-field";
import { Info } from "../info";

export default function Advanced() {
  return (
    <div className="flex w-full flex-col  px-4 py-2">
      <Info
        title="Shipping"
        description="
        Configure to calculate the most accurate shipping rate
      "
      />

      <div className="grid w-full grid-cols-4 gap-2">
        <InputField label="width (cm)" placeholder="width" />
        <InputField label="length (cm)" placeholder="length" />
        <InputField label="height (cm)" placeholder="height" />
        <InputField label="weight (kg)" placeholder="weight" />
      </div>
      <Separator className="my-4" />

      <Info
        title="Customs"
        description="Configure if you are shipping internationally"
      />

      <div className="grid w-full grid-cols-2 gap-2">
        <InputField label="MID code" />
        <InputField label="HS code" />
        <InputField label="Country of origin" />
      </div>

      <Separator className="my-4" />
      <Info title="Sales channels" description="Configure sales channels" />
    </div>
  );
}
