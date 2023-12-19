import React from "react";

import { cn } from "@pachi/utils";

interface Props {
  title?: string;
  description?: string;
}
const Info = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & Props
>(({ className, title, description, ...props }, ref) => (
  <div ref={ref} className={cn("w-full ", className)} {...props}>
    {title && <h2 className="prone text-md font-semibold">{title}</h2>}
    {description && <p className="text-sm text-slate-10">{description}</p>}
  </div>
));
Info.displayName = "Info";
export { Info };
