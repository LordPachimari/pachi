import { useCallback, useEffect, useState } from "react";
import copy from "copy-to-clipboard";

interface UseClipboardOptions {
  successDuration?: number;
  onCopied?: () => void;
}

const useClipboard = (
  text: string,
  options: UseClipboardOptions = {},
): [boolean, () => void] => {
  const [isCopied, setIsCopied] = useState(false);
  const { successDuration, onCopied } = options;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isCopied && successDuration) {
      timeout = setTimeout(() => {
        setIsCopied(false);
      }, successDuration);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isCopied, successDuration]);

  const handleCopy = useCallback(() => {
    copy(text);
    setIsCopied(true);
    if (onCopied) onCopied();
  }, [text, onCopied]);

  return [isCopied, handleCopy];
};

export default useClipboard;
