"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

interface ChartContextProps {
  config: Record<string, { label?: string; color?: string; icon?: React.ElementType }>
}

type ChartProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartContextProps["config"]
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(({ config, className, children, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} className={cn("flex h-full w-full flex-col", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    minHeight?: number
    children: React.ReactNode
  }
>(({ minHeight, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center justify-center w-full overflow-hidden", className)}
    style={minHeight ? { minHeight } : {}}
    {...props}
  >
    {children}
  </div>
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ ...props }: React.ComponentProps<typeof ChartTooltipContent>) => (
  <ChartTooltipContent
    className="font-semibold text-sm"
    formatter={(value: number, name: string) => {
      return (
        <span className="flex items-center">
          {name}: <span className="font-bold ml-1">{value}</span>
        </span>
      )
    }}
    {...props}
  />
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideIndicator?: boolean
    indicator?: "dot" | "dashed" | "line"
    nameKey?: string
    labelKey?: string
    valueKey?: string
    formatter?: (value: number, name: string, item: any, index: number) => React.ReactNode
  }
>(({ className, hideIndicator = false, indicator = "dot", nameKey, labelKey, valueKey, formatter, ...props }, ref) => {
  const { config } = useChart()

  return (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md", className)}
      {...props}
    >
      {/* This is a placeholder. In a real implementation, you'd use a charting library's tooltip component. */}
      <p>Tooltip Content</p>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    content?: React.ComponentProps<typeof ChartLegendContent>["content"]
    nameKey?: string
  }
>(({ className, content, nameKey, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
    {/* This is a placeholder. In a real implementation, you'd use a charting library's legend component. */}
    <p>Legend</p>
  </div>
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    content?: (props: { payload?: Array<{ value: string; payload: { name: string } }> }) => React.ReactNode
    nameKey?: string
  }
>(({ className, content, nameKey, ...props }, ref) => {
  const { config } = useChart()

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
      {/* This is a placeholder. In a real implementation, you'd use a charting library's legend content. */}
      <p>Legend Content</p>
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartCrosshair = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical" | "both"
  }
>(({ className, orientation = "both", ...props }, ref) => (
  <div ref={ref} className={cn("absolute inset-0 pointer-events-none", className)} {...props}>
    {/* This is a placeholder. In a real implementation, you'd use a charting library's crosshair. */}
  </div>
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div ref={ref} className={cn("absolute inset-0 pointer-events-none", className)} {...props}>
    {/* This is a placeholder. In a real implementation, you'd use a charting library's grid. */}
  </div>
))
ChartGrid.displayName = "ChartGrid"

const ChartAxis = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "left" | "right" | "top" | "bottom"
  }
>(({ className, orientation = "bottom", ...props }, ref) => (
  <div ref={ref} className={cn("absolute pointer-events-none", className)} {...props}>
    {/* This is a placeholder. In a real implementation, you'd use a charting library's axis. */}
  </div>
))
ChartAxis.displayName = "ChartAxis"

const ChartLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return <Comp ref={ref} className={cn("text-sm font-medium text-muted-foreground", className)} {...props} />
})
ChartLabel.displayName = "ChartLabel"

const ChartGradient = React.forwardRef<
  SVGLinearGradientElement,
  React.SVGProps<SVGLinearGradientElement> & {
    id: string
    color: string
    fromOpacity?: number
    toOpacity?: number
  }
>(({ id, color, fromOpacity = 0.8, toOpacity = 0, ...props }, ref) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1" {...props}>
    <stop offset="5%" stopColor={color} stopOpacity={fromOpacity} />
    <stop offset="95%" stopColor={color} stopOpacity={toOpacity} />
  </linearGradient>
))
ChartGradient.displayName = "ChartGradient"

const ChartStyle = React.forwardRef<HTMLStyleElement, React.HTMLAttributes<HTMLStyleElement>>(
  ({ className, ...props }, ref) => <style ref={ref} className={cn(className)} {...props} />,
)
ChartStyle.displayName = "ChartStyle"

const ChartCrosshairContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    label?: string
  }
>(({ className, value, label, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md", className)} {...props}>
    {label && <p className="font-semibold">{label}</p>}
    {value !== undefined && <p>{value}</p>}
  </div>
))
ChartCrosshairContent.displayName = "ChartCrosshairContent"

const ChartLegendIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & {
    icon?: React.ElementType
  }
>(({ icon: Icon, className, ...props }, ref) => {
  if (Icon) {
    return <Icon ref={ref} className={cn("h-3 w-3", className)} {...props} />
  }
  return null
})
ChartLegendIcon.displayName = "ChartLegendIcon"

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartCrosshair,
  ChartGrid,
  ChartAxis,
  ChartLabel,
  ChartGradient,
  ChartStyle,
  ChartCrosshairContent,
  ChartLegendIcon,
  useChart,
}
