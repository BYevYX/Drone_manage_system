/**
 * Компонент выпадающего списка
 */

import { ChevronDown, Check, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onChange?: (value: string | number | (string | number)[]) => void;
  onSearch?: (query: string) => void;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder = 'Выберите опцию',
  disabled = false,
  error,
  label,
  required = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'md',
  className = '',
  onChange,
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value !== undefined ? [value] : defaultValue !== undefined ? [defaultValue] : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Размеры компонента
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  // Обновление отфильтрованных опций
  useEffect(() => {
    if (searchable && searchQuery) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
      onSearch?.(searchQuery);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options, searchable, onSearch]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фокус на поиске при открытии
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    let newValues: (string | number)[];

    if (multiple) {
      if (selectedValues.includes(option.value)) {
        newValues = selectedValues.filter(v => v !== option.value);
      } else {
        newValues = [...selectedValues, option.value];
      }
    } else {
      newValues = [option.value];
      setIsOpen(false);
      setSearchQuery('');
    }

    setSelectedValues(newValues);
    onChange?.(multiple ? newValues : newValues[0]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    onChange?.(multiple ? [] : '');
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map(val => options.find(opt => opt.value === val)?.label)
      .filter(Boolean);
  };

  const displayValue = () => {
    const labels = getSelectedLabels();
    if (labels.length === 0) return placeholder;
    if (multiple) {
      return labels.length === 1 ? labels[0] : `Выбрано: ${labels.length}`;
    }
    return labels[0];
  };

  const isSelected = (option: SelectOption) => selectedValues.includes(option.value);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Основное поле выбора */}
      <div
        className={`
          relative w-full border rounded-lg cursor-pointer transition-all duration-200
          ${sizeClasses[size]}
          ${disabled 
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-500' : ''}
          ${isOpen ? 'border-green-500 ring-2 ring-green-500 ring-opacity-20' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
            {displayValue()}
          </span>
          <div className="flex items-center space-x-2">
            {clearable && selectedValues.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? 'Ничего не найдено' : 'Нет доступных опций'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    flex items-center px-4 py-3 cursor-pointer transition-colors
                    ${option.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-900 hover:bg-gray-50'
                    }
                    ${isSelected(option) ? 'bg-green-50 text-green-700' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                >
                  {option.icon && (
                    <span className="mr-3 flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {multiple && isSelected(option) && (
                    <Check size={16} className="ml-2 text-green-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Выбранные значения для множественного выбора */}
      {multiple && selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map((value) => {
            const option = options.find(opt => opt.value === value);
            if (!option) return null;

            return (
              <span
                key={value}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {option.icon && <span className="mr-1">{option.icon}</span>}
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                  className="ml-1.5 text-green-600 hover:text-green-800"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;