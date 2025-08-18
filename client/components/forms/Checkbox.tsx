import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  caption?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  onChange,
  label,
  caption,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded border transition-colors cursor-pointer',
              {
                'bg-red-9 border-red-9': checked && !disabled,
                'bg-white border-gray-5': !checked && !disabled,
                'bg-gray-1 border-gray-2 cursor-not-allowed': disabled,
              }
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            {checked && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.8047 4.19526C14.0651 4.45561 14.0651 4.87772 13.8047 5.13807L7.13808 11.8047C6.87773 12.0651 6.45562 12.0651 6.19527 11.8047L2.86193 8.4714C2.60158 8.21106 2.60158 7.78894 2.86193 7.5286C3.12228 7.26825 3.54439 7.26825 3.80474 7.5286L6.66667 10.3905L12.8619 4.19526C13.1223 3.93491 13.5444 3.93491 13.8047 4.19526Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-base font-normal text-black cursor-pointer',
              'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
              {
                'cursor-not-allowed text-gray-5': disabled,
              }
            )}
          >
            {label}
          </label>
        )}
      </div>
      {caption && (
        <div className="ml-8">
          <span className="text-xs text-[#868E96] font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};
