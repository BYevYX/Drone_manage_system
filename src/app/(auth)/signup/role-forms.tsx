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

// Менеджер (manager)
export function ManagerForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: {
    company: string;
    phone: string;
    region: string;
    about: string;
  };
  setData: (data: any) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const required = (v: string) => v.trim().length > 1;
  const allOk =
    required(data.company) && required(data.phone) && required(data.region);

  return (
    <>
      <Input
        label="Компания"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        error={isSubmitted && !required(data.company)}
        id="company_manager"
        icon={<Building size={20} />}
      />
      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        error={isSubmitted && !required(data.phone)}
        id="phone_manager"
        icon={<Phone size={20} />}
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) => setData({ ...data, region: e.target.value })}
        error={isSubmitted && !required(data.region)}
        id="region_manager"
        icon={<MapPin size={20} />}
      />
      <Input
        label="О себе (необязательно)"
        value={data.about}
        onChange={(e) => setData({ ...data, about: e.target.value })}
        id="about_manager"
        icon={<Info size={20} />}
      />
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
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 1000);
          }}
        >
          Далее
        </button>
      </div>
    </>
  );
}

// Заказчик услуг (customer) — как Step2 (юридические данные)
export function CustomerForm(props: {
  data: Step2Data;
  setData: (data: Partial<Step2Data>) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  // Просто используем Step2
  return <Step2 {...props} />;
}

// Поставщик дронов и оборудования
export function DroneSupplierForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: {
    company: string;
    supplyType: string;
    phone: string;
    region: string;
    fleetSize: string;
    experience: string;
    equipment: string;
    notes: string;
  };
  setData: (data: any) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const required = (v: string) => v.trim().length > 1;
  const allOk =
    required(data.company) &&
    required(data.phone) &&
    required(data.region) &&
    required(data.supplyType);

  return (
    <>
      <Input
        label="Компания"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        error={isSubmitted && !required(data.company)}
        id="company_drone_supplier"
        icon={<Building size={20} />}
      />
      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        error={isSubmitted && !required(data.phone)}
        id="phone_drone_supplier"
        icon={<Phone size={20} />}
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) => setData({ ...data, region: e.target.value })}
        error={isSubmitted && !required(data.region)}
        id="region_drone_supplier"
        icon={<MapPin size={20} />}
      />
      <Input
        label="Тип деятельности (дроны, оборудование, сервис и др.)"
        value={data.supplyType}
        onChange={(e) => setData({ ...data, supplyType: e.target.value })}
        error={isSubmitted && !required(data.supplyType)}
        id="supply_type_drone_supplier"
        icon={<Package size={20} />}
      />
      <Input
        label="Размер парка дронов (необязательно)"
        value={data.fleetSize}
        onChange={(e) => setData({ ...data, fleetSize: e.target.value })}
        id="fleet_size_drone_supplier"
        icon={<Info size={20} />}
      />
      <Input
        label="Опыт работы (необязательно)"
        value={data.experience}
        onChange={(e) => setData({ ...data, experience: e.target.value })}
        id="experience_drone_supplier"
        icon={<Info size={20} />}
      />
      <Input
        label="Оборудование (необязательно)"
        value={data.equipment}
        onChange={(e) => setData({ ...data, equipment: e.target.value })}
        id="equipment_drone_supplier"
        icon={<Info size={20} />}
      />
      <Input
        label="Комментарий (необязательно)"
        value={data.notes}
        onChange={(e) => setData({ ...data, notes: e.target.value })}
        id="notes_drone_supplier"
        icon={<Info size={20} />}
      />
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
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 1000);
          }}
        >
          Далее
        </button>
      </div>
    </>
  );
}

// Поставщик материалов
export function MaterialSupplierForm({
  data,
  setData,
  handleNext,
  handleBack,
}: {
  data: {
    company: string;
    materialType: string;
    phone: string;
    region: string;
    experience: string;
    notes: string;
  };
  setData: (data: any) => void;
  handleNext: (ok: boolean) => void;
  handleBack: () => void;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const required = (v: string) => v.trim().length > 1;
  const allOk =
    required(data.company) &&
    required(data.phone) &&
    required(data.region) &&
    required(data.materialType);

  return (
    <>
      <Input
        label="Компания"
        value={data.company}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        error={isSubmitted && !required(data.company)}
        id="company_material_supplier"
        icon={<Building size={20} />}
      />
      <Input
        label="Телефон"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        error={isSubmitted && !required(data.phone)}
        id="phone_material_supplier"
        icon={<Phone size={20} />}
      />
      <Input
        label="Регион"
        value={data.region}
        onChange={(e) => setData({ ...data, region: e.target.value })}
        error={isSubmitted && !required(data.region)}
        id="region_material_supplier"
        icon={<MapPin size={20} />}
      />
      <Input
        label="Тип материалов"
        value={data.materialType}
        onChange={(e) => setData({ ...data, materialType: e.target.value })}
        error={isSubmitted && !required(data.materialType)}
        id="material_type_material_supplier"
        icon={<Package size={20} />}
      />
      <Input
        label="Опыт работы (необязательно)"
        value={data.experience}
        onChange={(e) => setData({ ...data, experience: e.target.value })}
        id="experience_material_supplier"
        icon={<Info size={20} />}
      />
      <Input
        label="Комментарий (необязательно)"
        value={data.notes}
        onChange={(e) => setData({ ...data, notes: e.target.value })}
        id="notes_material_supplier"
        icon={<Info size={20} />}
      />
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
          className="flex items-center gap-2 px-10 py-3 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition-transform hover:scale-105 duration-300 shadow-lg text-[18px]"
          onClick={() => {
            setIsSubmitted(true);
            handleNext(allOk);
            setTimeout(() => setIsSubmitted(false), 1000);
          }}
        >
          Далее
        </button>
      </div>
    </>
  );
}
