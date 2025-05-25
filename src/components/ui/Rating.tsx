import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ 
    value = 0, 
    max = 5, 
    size = "md", 
    readonly = false, 
    onRatingChange, 
    className 
  }, ref) => {
    const [hoverRating, setHoverRating] = React.useState(0);
    const [currentRating, setCurrentRating] = React.useState(value);

    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const handleClick = (rating: number) => {
      if (readonly) return;
      setCurrentRating(rating);
      onRatingChange?.(rating);
    };

    const handleMouseEnter = (rating: number) => {
      if (readonly) return;
      setHoverRating(rating);
    };

    const handleMouseLeave = () => {
      if (readonly) return;
      setHoverRating(0);
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-1", className)}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: max }, (_, index) => {
          const rating = index + 1;
          const isActive = rating <= (hoverRating || currentRating);
          
          return (
            <Star
              key={rating}
              className={cn(
                sizeClasses[size],
                "cursor-pointer transition-colors",
                isActive 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-400",
                readonly && "cursor-default"
              )}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
            />
          );
        })}
        {!readonly && (
          <span className="ml-2 text-sm text-gray-600">
            {currentRating}/{max}
          </span>
        )}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export default Rating;