import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const indices = [
  'ARVI',
  'DVI',
  'EVI',
  'GEMI',
  'IPVI',
  'NDVI',
  'PVI',
  'RVI',
  'SARVI',
  'SAVI',
  'TSAVI',
  'TVI',
  'WDVI',
];

export default function StyledDropdown({ selectedIndex, setSelectedIndex }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm w-64">
      <div className="text-sm font-medium mb-2">Параметры</div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>{selectedIndex || 'Выберите индекс'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {indices.map((item) => (
              <li
                key={item}
                onClick={() => {
                  setSelectedIndex(item);
                  setIsOpen(false);
                }}
                className={`p-2 cursor-pointer hover:bg-blue-100 ${
                  selectedIndex === item ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
