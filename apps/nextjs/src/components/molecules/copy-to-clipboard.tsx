import React, { useEffect } from "react";
import clsx from "clsx";
import { toast } from "sonner";

import useClipboard from "~/hooks/use-clipboard";
import { Button } from "../atoms/button";
import { Icons } from "../atoms/icons";

interface CopyToClipboardProps {
  value: string;
  displayValue?: string;
  successDuration?: number;
  showValue?: boolean;
  iconSize?: number;
  onCopy?: () => void;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  value,
  displayValue,
  successDuration = 3000,
  showValue = true,
  iconSize = 20,
  onCopy,
}) => {
  const [isCopied, handleCopy] = useClipboard(value, {
    ...(onCopy && { onCopied: onCopy }),
    successDuration: successDuration,
  });

  useEffect(() => {
    if (isCopied) {
      toast.message("Copied!");
    }
  }, [isCopied]);

  return (
    <div className="inter-small-regular text-grey-50 gap-x-xsmall flex items-center">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className={clsx("text-grey-50 p-0", {
          ["text-violet-60"]: isCopied,
        })}
        onClick={handleCopy}
      >
        <Icons.copy size={iconSize} />
      </Button>
      {showValue && (
        <span className="w-full truncate">
          {displayValue ? displayValue : value}
        </span>
      )}
    </div>
  );
};

export default CopyToClipboard;
