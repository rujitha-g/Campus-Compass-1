import { cn } from "@/lib/utils";

interface OccupancyBadgeProps {
  level: string; // 'low', 'moderate', 'high', 'critical'
  percentage: number;
  className?: string;
  showLabel?: boolean;
}

export function OccupancyBadge({ level, percentage, className, showLabel = true }: OccupancyBadgeProps) {
  const getColors = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case 'moderate':
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case 'high':
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case 'critical':
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return "Quiet";
      case 'moderate': return "Busy";
      case 'high': return "Very Busy";
      case 'critical': return "Full";
      default: return "Unknown";
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold transition-colors",
      getColors(level),
      className
    )}>
      <div className="relative flex items-center justify-center w-2 h-2">
        <span className={cn(
          "absolute w-full h-full rounded-full opacity-75 animate-ping", 
          level === 'low' ? 'bg-green-500' : 
          level === 'moderate' ? 'bg-yellow-500' :
          level === 'high' ? 'bg-orange-500' : 'bg-red-500'
        )} />
        <span className={cn(
          "relative inline-flex rounded-full w-2 h-2",
          level === 'low' ? 'bg-green-500' : 
          level === 'moderate' ? 'bg-yellow-500' :
          level === 'high' ? 'bg-orange-500' : 'bg-red-500'
        )} />
      </div>
      {showLabel && (
        <span>{getLabel(level)} • {percentage}%</span>
      )}
    </div>
  );
}
