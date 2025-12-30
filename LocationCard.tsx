import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OccupancyBadge } from "./OccupancyBadge";
import { useOccupancy } from "@/hooks/use-locations";

interface LocationCardProps {
  id: number;
  name: string;
  type: string;
  description?: string | null;
  isActive: boolean;
  onClick: () => void;
}

export function LocationCard({ id, name, type, description, isActive, onClick }: LocationCardProps) {
  const { data: occupancy, isLoading } = useOccupancy(id);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left group flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300",
        isActive 
          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
          : "bg-white dark:bg-slate-900 border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <div className="flex justify-between items-start w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "p-1.5 rounded-lg text-primary",
              isActive ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10 transition-colors"
            )}>
              <MapPin className="w-4 h-4" />
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{type}</span>
          </div>
          <h3 className={cn(
            "text-base font-bold font-display leading-tight",
            isActive ? "text-primary" : "text-foreground"
          )}>
            {name}
          </h3>
        </div>
        
        {occupancy && (
          <OccupancyBadge 
            level={occupancy.level} 
            percentage={occupancy.percentage} 
            showLabel={false}
          />
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      <div className="flex items-center justify-between w-full pt-2 border-t border-border/50 mt-1">
        <span className="text-xs text-muted-foreground font-medium">
          {occupancy ? (
            <span className={cn(
              occupancy.level === 'low' ? 'text-green-600' :
              occupancy.level === 'moderate' ? 'text-yellow-600' :
              occupancy.level === 'high' ? 'text-orange-600' : 'text-red-600'
            )}>
              {occupancy.percentage}% Busy
            </span>
          ) : isLoading ? (
            <span className="animate-pulse">Checking status...</span>
          ) : (
            "No data available"
          )}
        </span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-semibold transition-transform duration-300",
          isActive ? "text-primary translate-x-0" : "text-muted-foreground -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
        )}>
          View details <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}
