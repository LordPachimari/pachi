import type { UpdateProduct } from "@pachi/validators";

import TitleField from "~/components/molecules/title-field";
import { Textarea } from "~/components/ui/textarea";
import type { DebouncedFunc } from "~/types";

interface TitleAndDescriptionProps {
  title: string | null | undefined;
  description: string | null | undefined;

  onInputChange: DebouncedFunc<
    (props: UpdateProduct["updates"]) => Promise<void>
  >;
}

export default function TitleAndDescription({
  description,
  title,
  onInputChange,
}: TitleAndDescriptionProps) {
  const isGiftCard = false;

  return (
    <div>
      <TitleField value={title ?? ""} onChange={onInputChange} />
      <Textarea
        placeholder={
          isGiftCard ? "The gift card is..." : "A warm and cozy jacket..."
        }
        rows={3}
        defaultValue={description ?? ""}
        onChange={async (e) =>
          await onInputChange({ description: e.currentTarget.value })
        }
      />
    </div>
  );
}
