import React from "react";

import { cn } from "@pachi/utils";

export interface InputHeaderProps {
  label?: string;
  required?: boolean;
  tooltipContent?: string | undefined;
  tooltip?: React.ReactNode;
  className?: string;
}

const InputHeader: React.FC<InputHeaderProps> = ({
  label,
  required = false,
  tooltipContent,
  tooltip,
  className,
}) => {
  return (
    <div className={cn(" flex w-full items-center", className)}>
      <label className="py-2 text-sm">{label}</label>
      {required && <div className="text-rose-50 "> *</div>}
      {tooltip ?? tooltipContent ? (
        <div className="ml-1.5 flex">
          {/* {tooltip || <IconTooltip content={tooltipContent} />} */}
        </div>
      ) : null}
    </div>
  );
};

export default InputHeader;
