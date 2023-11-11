import InputField from "~/components/molecules/input-field";

interface OrganizeProps {
  product_id: string;
}
export default function Organize() {
  return (
    <div className="flex w-full flex-col gap-2 px-4 pb-2 pt-0">
      <InputField label="Product category" />
      <InputField label="Product type" />
      <InputField label="Product collection" />
      <InputField label="Product tags" />
    </div>
  );
}
