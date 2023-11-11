import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@pachi/utils";

import { Icons } from "../atoms/icons";

type Props = {
  path?: string;
  label?: string;
  className?: string;
};

const BackButton = ({ path, label = "Go back", className }: Props) => {
  const router = useRouter();
  if (path)
    return (
      <Link
        href={path}
        className={cn(
          "text-grey-50 inter-grey-40 inter-small-semibold flex items-center gap-x-2 px-2 py-2",
          className,
        )}
      >
        <Icons.arrowLeft size={20} />
        <span className="ml-1">{label}</span>
      </Link>
    );
  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "text-grey-50 inter-grey-40 inter-small-semibold flex items-center gap-x-2 px-2 py-2",
        className,
      )}
    >
      <Icons.arrowLeft size={20} />
      <span className="ml-1">{label}</span>
    </button>
  );
};

export default BackButton;
