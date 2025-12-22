import { ChevronDown } from 'lucide-react';
import {
  ChangeEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

// Типы для фильтрации ввода
export type InputFilter = 'digits' | 'letters' | 'none';

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
  { value: 'customer', label: 'Заказчик услуг' },
  { value: 'drone_supplier', label: 'Поставщик дронов и оборудования' },
  { value: 'material_supplier', label: 'Поставщик материалов' },
];

export function RoleSelect({ value, onChange, error }: any) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<null | HTMLDivElement>(null);

  // Закрытие меню при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: any) {
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
        <span className="text-black">{selectedLabel}</span>
        <ChevronDown
          size={20}
          className={`text-black transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {/* Выпадающее меню */}
      <div
        className={`
          absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg
          max-h-60 overflow-auto border-[1px] border-solid border-[#c9c9c9]
          transition-all duration-200 origin-top transform scale-y-0 opacity-0
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
              w-full font-nekstregular text-left px-4 py-3 hover:bg-green-100 transition-colors duration-150
              ${value === role.value ? 'bg-green-200 font-semibold' : 'font-normal'}
            `}
            role="option"
            aria-selected={value === role.value}
          >
            <span className="text-black">{role.label}</span>
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
  label: string | ReactNode;
  id: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  error: boolean;
  rightIcon?: ReactNode;
  filter?: InputFilter; // Фильтр ввода: 'digits' | 'letters' | 'none'
  maxLength?: number; // Максимальная длина
  errorMessage?: string; // Кастомное сообщение об ошибке
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
  filter = 'none',
  maxLength,
  errorMessage,
  onFocus, // Добавлено
  onBlur, // Добавлено
}: InputProps) {
  // Обработчик с фильтрацией
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Применяем фильтр
    if (filter === 'digits') {
      newValue = newValue.replace(/\D/g, '');
    } else if (filter === 'letters') {
      newValue = newValue.replace(/[^а-яА-ЯёЁa-zA-Z\s\-]/g, '');
    }

    // Применяем ограничение длины
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    // Создаём новое событие с отфильтрованным значением
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: newValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div>
      <label htmlFor={id} className="block font-nekstlight text-black mb-1">
        {label}
      </label>
      <div
        className={`flex items-center border-b ${error ? 'border-red-400' : 'border-gray-500'} bg-transparent px-2 py-2`}
      >
        {icon && <span className="mr-2 text-black">{icon}</span>}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={onFocus} // Исправлено
          onBlur={onBlur} // Исправлено
          maxLength={maxLength}
          className="flex-1 bg-transparent outline-none text-[18px] text-black font-nekstmedium"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {rightIcon && <span className="ml-2 text-black">{rightIcon}</span>}
      </div>
      {error && errorMessage && (
        <div id={`${id}-error`} className="text-red-500 text-xs mt-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export function ManagerStep2({ data, setData, isSubmitted }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-nekstlight text-black mb-1">
          Тип организации
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setData({ ...data, type: 'company' })}
            className={`
              flex-1 px-4 py-2 rounded-xl font-nekstmedium transition-all duration-200
              ${data.type === 'company' ? 'bg-green-200' : 'bg-gray-100 hover:bg-green-50'}
            `}
          >
            Юридическое лицо
          </button>
          <button
            type="button"
            onClick={() => setData({ ...data, type: 'individual' })}
            className={`
              flex-1 px-4 py-2 rounded-xl font-nekstmedium transition-all duration-200
              ${data.type === 'individual' ? 'bg-green-200' : 'bg-gray-100 hover:bg-green-50'}
            `}
          >
            Индивидуальный предприниматель
          </button>
          <button
            type="button"
            onClick={() => setData({ ...data, type: 'person' })}
            className={`
              flex-1 px-4 py-2 rounded-xl font-nekstmedium transition-all duration-200
              ${data.type === 'person' ? 'bg-green-200' : 'bg-gray-100 hover:bg-green-50'}
            `}
          >
            Физическое лицо
          </button>
        </div>
      </div>

      <Input
        label={`ИНН ${data.type === 'company' ? '*' : ''}`}
        id="inn_manager"
        value={data.inn}
        onChange={(e: any) => setData({ ...data, inn: e.target.value })}
        maxLength={data.type === 'company' ? 10 : 12}
        error={isSubmitted && data.type === 'company' && !required(data.inn)}
      />

      <Input
        label={`КПП ${data.type === 'company' ? '*' : ''}`}
        id="kpp_manager"
        value={data.kpp}
        onChange={(e: any) => setData({ ...data, kpp: e.target.value })}
        maxLength={9}
        error={isSubmitted && data.type === 'company' && !required(data.kpp)}
      />

      <Input
        label={`ОКПО ${data.type === 'company' ? '*' : ''}`}
        id="okpo_manager"
        value={data.okpo}
        onChange={(e: any) => setData({ ...data, okpo: e.target.value })}
        maxLength={data.type === 'company' ? 8 : 10}
        error={isSubmitted && data.type === 'company' && !required(data.okpo)}
      />

      <Input
        label={`Юридический адрес ${data.type === 'company' ? '*' : ''}`}
        id="ur_address_manager"
        value={data.urAddres}
        onChange={(e: any) => setData({ ...data, urAddres: e.target.value })}
        error={
          isSubmitted && data.type === 'company' && !required(data.urAddres)
        }
      />

      <Input
        label={`Фактический адрес ${data.type === 'company' ? '*' : ''}`}
        id="fact_address_manager"
        value={data.factAddres}
        onChange={(e: any) => setData({ ...data, factAddres: e.target.value })}
        error={
          isSubmitted && data.type === 'company' && !required(data.factAddres)
        }
      />

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="contact_person_manager"
          checked={data.contactPerson}
          onChange={(e: any) =>
            setData({ ...data, contactPerson: e.target.checked })
          }
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label
          htmlFor="contact_person_manager"
          className="ml-2 block text-black font-nekstmedium"
        >
          Контактное лицо
        </label>
      </div>

      {data.contactPerson && (
        <div className="bg-gray-50 p-4 rounded-xl shadow-md">
          <h3 className="text-black font-nekstmedium mb-3">
            Данные контактного лица
          </h3>
          <Input
            label="Фамилия"
            id="last_name_manager"
            value={data.contact.lastName}
            onChange={(e: any) =>
              setData({
                ...data,
                contact: { ...data.contact, lastName: e.target.value },
              })
            }
            error={isSubmitted && !required(data.contact.lastName)}
          />
          <Input
            label="Имя"
            id="first_name_manager"
            value={data.contact.firstName}
            onChange={(e: any) =>
              setData({
                ...data,
                contact: { ...data.contact, firstName: e.target.value },
              })
            }
            error={isSubmitted && !required(data.contact.firstName)}
          />
          <Input
            label="Отчество"
            id="middle_name_manager"
            value={data.contact.middleName}
            onChange={(e: any) =>
              setData({
                ...data,
                contact: { ...data.contact, middleName: e.target.value },
              })
            }
            error={isSubmitted && !required(data.contact.middleName)}
          />
          <Input
            label="Телефон"
            id="phone_manager"
            placeholder="+7 (999) 999-99-99"
            value={data.contact.phone}
            onChange={(e: any) =>
              setData({
                ...data,
                contact: { ...data.contact, phone: e.target.value },
              })
            }
            filter="digits"
            maxLength={10}
            error={isSubmitted && !required(data.contact.phone)}
          />
          <Input
            label="Email"
            id="email_manager"
            value={data.contact.email}
            onChange={(e: any) =>
              setData({
                ...data,
                contact: { ...data.contact, email: e.target.value },
              })
            }
            error={isSubmitted && !required(data.contact.email)}
          />
        </div>
      )}
    </div>
  );
}

// Функция для проверки обязательных полей
function required(value: any) {
  return value && value.trim() !== '';
}
