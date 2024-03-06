import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

type CustomTooltipProps = {
  children: React.ReactNode
  textContent: string
}
export function CustomTooltip({ children, textContent }: CustomTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{textContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
