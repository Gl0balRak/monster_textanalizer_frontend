import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  target: number;
  showDifference?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  target,
  showDifference = false,
  className
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const difference = current - target;
  const isComplete = current >= target;
  const isEmpty = current === 0;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Progress bar */}
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            isComplete ? 'bg-green-500' : isEmpty ? 'bg-red-500' : 'bg-yellow-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Percentage */}
      <span className={cn(
        'text-xs font-medium',
        isComplete ? 'text-green-600' : isEmpty ? 'text-red-600' : 'text-yellow-600'
      )}>
        {Math.round(percentage)}%
      </span>

      {/* Difference */}
      {showDifference && (
        <span className={cn(
          'text-xs',
          difference >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {difference >= 0 ? '+' : ''}{difference}
        </span>
      )}
    </div>
  );
};
