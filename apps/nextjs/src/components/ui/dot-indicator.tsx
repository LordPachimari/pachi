import React from "react"

import { cn } from "@pachi/utils"

type StatusIndicatorProps = {
  title?: string
  variant: "primary" | "danger" | "warning" | "success" | "active" | "default"
} & React.HTMLAttributes<HTMLDivElement>

const DotIndicator: React.FC<StatusIndicatorProps> = ({
  title,
  variant = "success",
  className,
  ...props
}) => {
  const dotClass = cn({
    "bg-teal-500": variant === "success",
    "bg-rose-500": variant === "danger",
    "bg-yellow-500": variant === "warning",
    "bg-violet-600": variant === "primary",
    "bg-emerald-400": variant === "active",
    "bg-grey-400": variant === "default",
  })
  return (
    <div
      className={cn("inter-small-regular flex items-center", className, {
        "hover:bg-grey-5 cursor-pointer": !!props.onClick,
      })}
      {...props}
    >
      <div className={cn("h-1.5 w-1.5 self-center rounded-full", dotClass)} />
      {title && <span className="ml-2">{title}</span>}
    </div>
  )
}

export default DotIndicator
