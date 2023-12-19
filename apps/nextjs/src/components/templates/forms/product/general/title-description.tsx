import type { ProductUpdates } from "@pachi/db";

import { Textarea } from "~/components/atoms/textarea";
import TitleField from "~/components/molecules/title-field";
import type { DebouncedFunc } from "~/types";

interface TitleAndDescriptionProps {
  title: string | null | undefined;
  description: string | null | undefined;

  onInputChange: DebouncedFunc<
    ({ updates }: { updates: ProductUpdates }) => Promise<void>
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
      <TitleField
        error={{ error: false }}
        value={title ?? ""}
        onChange={onInputChange}
      />
      <Textarea
        placeholder={
          isGiftCard ? "The gift card is..." : "A warm and cozy jacket..."
        }
        rows={3}
        defaultValue={description ?? ""}
        onChange={async (e) =>
          await onInputChange({
            updates: { description: e.currentTarget.value },
          })
        }
      />
    </div>
  );
}
