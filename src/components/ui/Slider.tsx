import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, defaultValue, onValueChange, ...props }, ref) => {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider",
          className
        )}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        ref={ref}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };