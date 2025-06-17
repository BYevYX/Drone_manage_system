import { ChevronDown } from 'lucide-react';
import {
  ChangeEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface Step2Data {
  type: 'company' | 'individual' | 'person';
  inn: string;
  kpp: string;
  okpo: string;
  urAddres: string;
  factAddres: string;
  contactPerson: boolean;
  contact: {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
  };
}

// Новый массив ролей с нужными подписями:
const roles = [
  { value: 'manager', label: 'Менеджер' },
  { value: 'customer', label: 'Заказчик услуг' },
  { value: 'drone_supplier', label: 'Поставщиков дронов и оборудования' },
  { value: 'material_supplier', label: 'Поставщиков материалов' },
];

export function RoleSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<null | HTMLDivElement>(null);

  // Закрытие меню при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel =
    roles.find((r) => r.value === value)?.label || 'Выберите роль';

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block font-nekstlight text-black mb-1">Роль</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
            w-full flex items-center justify-between px-4 py-3 rounded-xl
            bg-gray-100 hover:bg-green-50 transition-all duration-200
            text-[18px] font-nekstmedium text-black shadow border
            ${error ? 'border-red-400' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-green-400
          `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? '' : 'text-gray-400'}>{selectedLabel}</span>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      {/* Выпадающее меню */}
      <div
        className={`
            absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg
            max-h-60 overflow-auto border-[1px] border-solid border-[#c9c9c9]
            transition-all duration-300 origin-top scale-y-0 opacity-0
            ${open ? 'scale-y-100 opacity-100' : ''}
            z-50
          `}
        style={{ transformOrigin: 'top' }}
        role="listbox"
      >
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => {
              onChange(role.value);
              setOpen(false);
            }}
            className={`
                w-full text-left px-4 py-3 hover:bg-green-100 transition-colors duration-150
                font-nekstregular
                ${value === role.value ? 'bg-green-200 font-semibold' : 'font-normal'}
              `}
            role="option"
            aria-selected={value === role.value}
          >
            {role.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-xs mt-1">
          Пожалуйста, выберите роль
        </div>
      )}
    </div>
  );
}

interface InputProps {
  label: string;
  id: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  error: boolean;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  id,
  placeholder,
  type = 'text',
  icon,
  value,
  onChange,
  error,
  rightIcon,
}: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block font-nekstlight text-black mb-1">
        {label}
      </label>
      <div
        className={`flex items-center border-b ${
          error ? 'border-red-400' : 'border-gray-500'
        } bg-transparent px-2 py-2`}
      >
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent outline-none text-[18px] text-black font-nekstmedium"
          required
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
      {error && (
        <div id={`${id}-error`} className="text-red-500 text-xs mt-1">
          Некорректное значение
        </div>
      )}
    </div>
  );
}
