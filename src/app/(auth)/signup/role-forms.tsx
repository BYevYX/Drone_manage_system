// roleforms.tsx
import {
  ArrowLeft,
  Phone,
  Building,
  MapPin,
  Info,
  Package,
} from 'lucide-react';
import React, { useState } from 'react';

import { Input } from './Components';
import { Step2Data } from './steps';

/**
 * Утилитный тип для setData: принимаем либо Partial<T> (обновление),
 * либо функцию (prev => new) — но в упрощённом варианте здесь ожидаем
 * простую функцию setData(update: Partial<T>) потому что в месте использования
 * у вас setCustomerData/.. вызывается именно так.
 */
type Setter<T> = (update: Partial<T>) => void;

/* ================= ManagerForm (теперь поля как у заказчика) ================= */
export function ManagerForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: Step2Data;
  setData: Setter<Step2Data>;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const required = (v?: string) => (v ?? '').trim().length > 1;
  const allOk =
    required(data.nameCompany) &&
    (data.type !== 'COMPANY' || required(data.inn)); // если COMPANY, то ИНН обязателен

  return (
    <>
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { label: 'Компания', value: 'COMPANY' },
          { label: 'ИП', value: 'INDIVIDUAL' },
          { label: 'Физ лицо', value: 'PERSON' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setData({ type: value as Step2Data['type'] })}
            className={`px-4 py-2 rounded-full font-nekstmedium ${
              data.type === value
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                : 'bg-transparent border text-gray-600 border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Название компании *"
          id="name_company_manager"
          value={data.nameCompany}
          onChange={(e: any) =>
            setData({ ...data, nameCompany: e.target.value })
          }
          icon={<Building size={20} />}
          error={isSubmitted && !required(data.nameCompany)}
        />
        <Input
          label={`ИНН ${data.type === 'COMPANY' ? '*' : ''}`}
          id="inn_manager"
          value={data.inn}
          onChange={(e: any) => setData({ ...data, inn: e.target.value })}
          maxLength={data.type === 'COMPANY' ? 10 : 12}
          error={isSubmitted && data.type === 'COMPANY' && !required(data.inn)}
        />
        <Input
          label="КПП"
          id="kpp_manager"
          value={data.kpp}
          onChange={(e: any) => setData({ ...data, kpp: e.target.value })}
          error={false}
        />
        <Input
          label="Код по ОКПО"
          id="okpo_manager"
          value={data.okpo}
          onChange={(e: any) => setData({ ...data, okpo: e.target.value })}
          error={false}
        />
        <Input
          label="Юридический адрес"
          id="uraddr_manager"
          value={data.urAddres}
          onChange={(e: any) => setData({ ...data, urAddres: e.target.value })}
          error={false}
        />
        <Input
          label="Фактический адрес"
          id="factaddr_manager"
          value={data.factAddres}
          onChange={(e: any) =>
            setData({ ...data, factAddres: e.target.value })
          }
          error={false}
        />
      </div>

      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) =>
              setData({ ...data, contactPerson: e.target.checked })
            }
            className="accent-purple-600 hover:cursor-pointer"
          />
          Указать данные контактного лица (будет создано контактное лицо
          контрагента)
        </label>

        {data.contactPerson && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Фамилия"
              id="manager_contact_lastname"
              value={data.contact.lastName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, lastName: e.target.value },
                })
              }
              icon={<Building size={18} />}
              error={false}
            />
            <Input
              label="Имя"
              id="manager_contact_firstname"
              value={data.contact.firstName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, firstName: e.target.value },
                })
              }
              icon={<Building size={18} />}
              error={false}
            />
            <Input
              label="Отчество"
              id="manager_contact_mid"
              value={data.contact.middleName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, middleName: e.target.value },
                })
              }
              icon={<Building size={18} />}
              error={false}
            />
            <Input
              label="Телефон"
              id="manager_contact_phone"
              value={data.contact.phone}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, phone: e.target.value },
                })
              }
              icon={<Phone size={18} />}
              error={false}
            />
            <Input
              label="E-mail"
              id="manager_contact_email"
              value={data.contact.email}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, email: e.target.value },
                })
              }
              icon={<Info size={18} />}
              error={false}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 800);
          }}
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
        >
          Далее
        </button>
      </div>
    </>
  );
}

/* ================= CustomerForm (заказчик) =================
   Формат props аналогичен ManagerForm: data: Step2Data, setData: Setter<Step2Data>, handleNext/back
*/
export function CustomerForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: Step2Data;
  setData: Setter<Step2Data>;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const required = (v?: string) => (v ?? '').trim().length > 1;
  const allOk =
    required(data.nameCompany) &&
    (data.type !== 'COMPANY' || required(data.inn)); // if company, inn required

  return (
    <>
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { label: 'Компания', value: 'COMPANY' },
          { label: 'ИП', value: 'INDIVIDUAL' },
          { label: 'Физ лицо', value: 'PERSON' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setData({ type: value as Step2Data['type'] })}
            className={`px-4 py-2 rounded-full font-nekstmedium ${
              data.type === value
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                : 'bg-transparent border text-gray-600 border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Название компании *"
          id="cust_name_company"
          value={data.nameCompany}
          onChange={(e: any) =>
            setData({ ...data, nameCompany: e.target.value })
          }
          icon={<Building size={20} />}
          error={isSubmitted && !required(data.nameCompany)}
        />
        <Input
          label={`ИНН ${data.type === 'COMPANY' ? '*' : ''}`}
          id="cust_inn"
          value={data.inn}
          onChange={(e: any) => setData({ ...data, inn: e.target.value })}
          maxLength={data.type === 'COMPANY' ? 10 : 12}
          error={isSubmitted && data.type === 'COMPANY' && !required(data.inn)}
        />
        <Input
          label="КПП"
          id="cust_kpp"
          value={data.kpp}
          onChange={(e: any) => setData({ ...data, kpp: e.target.value })}
        />
        <Input
          label="Код по ОКПО"
          id="cust_okpo"
          value={data.okpo}
          onChange={(e: any) => setData({ ...data, okpo: e.target.value })}
        />
        <Input
          label="Юридический адрес"
          id="cust_uraddr"
          value={data.urAddres}
          onChange={(e: any) => setData({ ...data, urAddres: e.target.value })}
        />
        <Input
          label="Фактический адрес"
          id="cust_factaddr"
          value={data.factAddres}
          onChange={(e: any) =>
            setData({ ...data, factAddres: e.target.value })
          }
        />
      </div>

      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) =>
              setData({ ...data, contactPerson: e.target.checked })
            }
            className="accent-purple-600 hover:cursor-pointer"
          />
          Указать данные контактного лица (будет создано контактное лицо
          контрагента)
        </label>

        {data.contactPerson && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Фамилия"
              id="cust_contact_lastname"
              value={data.contact.lastName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, lastName: e.target.value },
                })
              }
              icon={<Building size={18} />}
            />
            <Input
              label="Имя"
              id="cust_contact_firstname"
              value={data.contact.firstName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, firstName: e.target.value },
                })
              }
              icon={<Building size={18} />}
            />
            <Input
              label="Отчество"
              id="cust_contact_mid"
              value={data.contact.middleName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, middleName: e.target.value },
                })
              }
              icon={<Building size={18} />}
            />
            <Input
              label="Телефон"
              id="cust_contact_phone"
              value={data.contact.phone}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, phone: e.target.value },
                })
              }
              icon={<Phone size={18} />}
            />
            <Input
              label="E-mail"
              id="cust_contact_email"
              value={data.contact.email}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, email: e.target.value },
                })
              }
              icon={<Info size={18} />}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 800);
          }}
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
        >
          Далее
        </button>
      </div>
    </>
  );
}

/* ================= DroneSupplierForm ================= */
export function DroneSupplierForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: Step2Data;
  setData: Setter<Step2Data>;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const required = (v?: string) => (v ?? '').trim().length > 1;
  const allOk =
    required(data.nameCompany) &&
    (data.type !== 'COMPANY' || required(data.inn));

  return (
    <>
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { label: 'Компания', value: 'COMPANY' },
          { label: 'ИП', value: 'INDIVIDUAL' },
          { label: 'Физ лицо', value: 'PERSON' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setData({ type: value as Step2Data['type'] })}
            className={`px-4 py-2 rounded-full font-nekstmedium ${
              data.type === value
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                : 'bg-transparent border text-gray-600 border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Название компании *"
          id="ds_name_company"
          value={data.nameCompany}
          onChange={(e: any) =>
            setData({ ...data, nameCompany: e.target.value })
          }
          icon={<Building size={20} />}
          error={isSubmitted && !required(data.nameCompany)}
        />
        <Input
          label={`ИНН ${data.type === 'COMPANY' ? '*' : ''}`}
          id="ds_inn"
          value={data.inn}
          onChange={(e: any) => setData({ ...data, inn: e.target.value })}
          maxLength={data.type === 'COMPANY' ? 10 : 12}
          error={isSubmitted && data.type === 'COMPANY' && !required(data.inn)}
        />
        <Input
          label="КПП"
          id="ds_kpp"
          value={data.kpp}
          onChange={(e: any) => setData({ ...data, kpp: e.target.value })}
        />
        <Input
          label="Код по ОКПО"
          id="ds_okpo"
          value={data.okpo}
          onChange={(e: any) => setData({ ...data, okpo: e.target.value })}
        />
        <Input
          label="Юридический адрес"
          id="ds_uraddr"
          value={data.urAddres}
          onChange={(e: any) => setData({ ...data, urAddres: e.target.value })}
        />
        <Input
          label="Фактический адрес"
          id="ds_factaddr"
          value={data.factAddres}
          onChange={(e: any) =>
            setData({ ...data, factAddres: e.target.value })
          }
        />
      </div>

      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) =>
              setData({ ...data, contactPerson: e.target.checked })
            }
            className="accent-purple-600 hover:cursor-pointer"
          />
          Указать данные контактного лица (будет создано контактное лицо
          контрагента)
        </label>

        {data.contactPerson && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Фамилия"
              id="ds_contact_lastname"
              value={data.contact.lastName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, lastName: e.target.value },
                })
              }
            />
            <Input
              label="Имя"
              id="ds_contact_firstname"
              value={data.contact.firstName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, firstName: e.target.value },
                })
              }
            />
            <Input
              label="Отчество"
              id="ds_contact_mid"
              value={data.contact.middleName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, middleName: e.target.value },
                })
              }
            />
            <Input
              label="Телефон"
              id="ds_contact_phone"
              value={data.contact.phone}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, phone: e.target.value },
                })
              }
              icon={<Phone size={18} />}
            />
            <Input
              label="E-mail"
              id="ds_contact_email"
              value={data.contact.email}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, email: e.target.value },
                })
              }
              icon={<Info size={18} />}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 800);
          }}
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
        >
          Далее
        </button>
      </div>
    </>
  );
}

/* ================= MaterialSupplierForm ================= */
export function MaterialSupplierForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: Step2Data;
  setData: Setter<Step2Data>;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const required = (v?: string) => (v ?? '').trim().length > 1;
  const allOk =
    required(data.nameCompany) &&
    (data.type !== 'COMPANY' || required(data.inn));

  return (
    <>
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { label: 'Компания', value: 'COMPANY' },
          { label: 'ИП', value: 'INDIVIDUAL' },
          { label: 'Физ лицо', value: 'PERSON' },
        ].map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setData({ type: value as Step2Data['type'] })}
            className={`px-4 py-2 rounded-full font-nekstmedium ${
              data.type === value
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
                : 'bg-transparent border text-gray-600 border-gray-600 '
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Название компании *"
          id="ms_name_company"
          value={data.nameCompany}
          onChange={(e: any) =>
            setData({ ...data, nameCompany: e.target.value })
          }
          icon={<Building size={20} />}
          error={isSubmitted && !required(data.nameCompany)}
        />
        <Input
          label={`ИНН ${data.type === 'COMPANY' ? '*' : ''}`}
          id="ms_inn"
          value={data.inn}
          onChange={(e: any) => setData({ ...data, inn: e.target.value })}
          maxLength={data.type === 'COMPANY' ? 10 : 12}
          error={isSubmitted && data.type === 'COMPANY' && !required(data.inn)}
        />
        <Input
          label="КПП"
          id="ms_kpp"
          value={data.kpp}
          onChange={(e: any) => setData({ ...data, kpp: e.target.value })}
        />
        <Input
          label="Код по ОКПО"
          id="ms_okpo"
          value={data.okpo}
          onChange={(e: any) => setData({ ...data, okpo: e.target.value })}
        />
        <Input
          label="Юридический адрес"
          id="ms_uraddr"
          value={data.urAddres}
          onChange={(e: any) => setData({ ...data, urAddres: e.target.value })}
        />
        <Input
          label="Фактический адрес"
          id="ms_factaddr"
          value={data.factAddres}
          onChange={(e: any) =>
            setData({ ...data, factAddres: e.target.value })
          }
        />
      </div>

      <div className="mt-6 border border-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-2 font-nekstmedium text-sm mb-4">
          <input
            type="checkbox"
            checked={data.contactPerson}
            onChange={(e) =>
              setData({ ...data, contactPerson: e.target.checked })
            }
            className="accent-purple-600 hover:cursor-pointer"
          />
          Указать данные контактного лица (будет создано контактное лицо
          контрагента)
        </label>

        {data.contactPerson && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Фамилия"
              id="ms_contact_lastname"
              value={data.contact.lastName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, lastName: e.target.value },
                })
              }
            />
            <Input
              label="Имя"
              id="ms_contact_firstname"
              value={data.contact.firstName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, firstName: e.target.value },
                })
              }
            />
            <Input
              label="Отчество"
              id="ms_contact_mid"
              value={data.contact.middleName}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, middleName: e.target.value },
                })
              }
            />
            <Input
              label="Телефон"
              id="ms_contact_phone"
              value={data.contact.phone}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, phone: e.target.value },
                })
              }
              icon={<Phone size={18} />}
            />
            <Input
              label="E-mail"
              id="ms_contact_email"
              value={data.contact.email}
              onChange={(e: any) =>
                setData({
                  ...data,
                  contact: { ...data.contact, email: e.target.value },
                })
              }
              icon={<Info size={18} />}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] border border-gray-400 text-gray-700 font-nekstmedium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 800);
          }}
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
        >
          Далее
        </button>
      </div>
    </>
  );
}
