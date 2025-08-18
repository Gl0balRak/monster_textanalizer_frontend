import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { commonClasses } from '@/lib/design-system';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  allowCustomValue?: boolean;
}

export const Select: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'Выберите...',
  value,
  onChange,
  options,
  className,
  labelClassName,
  inputClassName,
  dropdownClassName,
  optionClassName,
  allowCustomValue = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Находим label для текущего значения
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : value;

  // Фильтрация опций при изменении поискового запроса
  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchValue, options]);

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка открытия dropdown
  const handleInputClick = () => {
    setIsOpen(true);
    setSearchValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Обработка выбора опции
  const handleSelectOption = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchValue('');
  };

  // Обработка ввода в поле поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    // Если разрешены произвольные значения, обновляем значение
    if (allowCustomValue) {
      onChange(newValue);
    }
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Если есть отфильтрованные опции, выбираем первую
      if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0]);
      } else if (allowCustomValue && searchValue) {
        // Если разрешены произвольные значения, используем введенный текст
        onChange(searchValue);
        setIsOpen(false);
        setSearchValue('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchValue('');
    }
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label
          className={cn(
            'block text-sm font-medium text-gray-700 mb-2',
            commonClasses.font,
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Поле ввода / отображения */}
        {!isOpen ? (
          <div
            onClick={handleInputClick}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md',
              'bg-white cursor-pointer hover:border-gray-400',
              'transition-colors duration-200',
              'flex items-center justify-between',
              'text-sm',
              'focus:outline-none focus:ring-2 focus:ring-red-500',
              commonClasses.font,
              inputClassName
            )}
          >
            <span className={cn(
              displayValue ? 'text-gray-900' : 'text-gray-400'
            )}>
              {displayValue || placeholder}
            </span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md',
              'bg-white focus:outline-none focus:ring-2 focus:ring-red-500',
              'transition-all duration-200',
              'text-sm text-gray-900',
              commonClasses.font,
              inputClassName
            )}
          />
        )}

        {/* Dropdown с опциями */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1 bg-white border border-gray-200',
              'rounded-md shadow-lg max-h-60 overflow-auto',
              dropdownClassName
            )}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    'px-3 py-2 cursor-pointer hover:bg-gray-50',
                    'transition-colors duration-150',
                    'text-sm text-gray-900',
                    option.value === value && 'bg-red-50 text-red-600 font-medium',
                    commonClasses.font,
                    optionClassName
                  )}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-400 text-sm">
                {allowCustomValue ?
                  'Нет совпадений. Нажмите Enter для использования введенного значения' :
                  'Ничего не найдено'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};