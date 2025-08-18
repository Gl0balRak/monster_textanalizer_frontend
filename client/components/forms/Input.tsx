import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  caption?: string;
  error?: string;
  suffix?: string;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'url' | 'number';
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  caption,
  error,
  suffix,
  rightIcon,
  disabled = false,
  className,
  type = 'text',
}) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <div className="flex items-center">
          <label className="text-base font-medium text-black font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {label}
          </label>
          {required && (
            <span className="text-base font-bold text-red-7 ml-0.5">*</span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded bg-gray-1 border-0 text-base',
            'placeholder:text-gray-5 text-black',
            'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
            'focus:outline-none focus:ring-2 focus:ring-red-9 focus:ring-opacity-20',
            {
              'pr-20': suffix && rightIcon,
              'pr-12': rightIcon && !suffix,
              'pr-16': suffix && !rightIcon,
              'cursor-not-allowed opacity-50': disabled,
            }
          )}
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {suffix && (
            <span className="text-base text-gray-5 font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
              {suffix}
            </span>
          )}
          {rightIcon && <div className="text-gray-5">{rightIcon}</div>}
        </div>
      </div>
      
      {(caption || error) && (
        <div className="text-xs font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
          {error ? (
            <span className="text-red-7">{error}</span>
          ) : (
            <span className="text-[#868E96]">{caption}</span>
          )}
        </div>
      )}
    </div>
  );
};
