'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { User, Mail, Phone, Archive } from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

/* --------------------
 Types
-------------------- */
type ContractorProfile = {
  organization?: 'COMPANY' | 'INDIVIDUAL' | string;
  organizationName?: string;
  organizationType?: 'LEGAL_ENTITY' | 'INDIVIDUAL_ENTITY' | string;
  inn?: string;
  kpp?: string;
  okpoCode?: string;
  addressUr?: string;
  addressFact?: string;
};

type MeResponse = {
  id?: string;
  email?: string;
  phone?: string;
  userRole?: string;
  firstName?: string;
  lastName?: string;
  surname?: string;
  createdAt?: string;
  contractorProfile?: ContractorProfile;
};

const API_BASE = 'https://api.droneagro.xyz';

export default function ProfileModernPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [form, setForm] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const client = axios.create({ baseURL: API_BASE });

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('accessToken')
      : null;

  const setLS = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value ?? '');
    } catch {}
  };

  const syncLocalStorageFromMe = (m: MeResponse | null) => {
    if (!m) return;
    setLS('id', String(m.id ?? ''));
    setLS('email', m.email ?? '');
    setLS('phone', m.phone ?? '');
    setLS('userRole', m.userRole ?? '');
    setLS('firstName', m.firstName ?? '');
    setLS('lastName', m.lastName ?? '');
    setLS('surname', m.surname ?? '');
    if (m.contractorProfile) {
      setLS('contractorProfile', JSON.stringify(m.contractorProfile));
    } else {
      setLS('contractorProfile', '');
    }
  };

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await client.get<MeResponse>('/api/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setMe(res.data);
      setForm(res.data);
      // sync localStorage on load
      syncLocalStorageFromMe(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Ошибка получения профиля');
    } finally {
      setLoading(false);
    }
  }

  const fmtPhone = (p?: string) => {
    if (!p) return '';
    const d = p.replace(/\D/g, '');
    if (!d) return p;
    if (d.length === 11)
      return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
    return p;
  };

  const InfoField = ({ label, value }: { label: string; value?: string }) => (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-gray-900 font-medium">
        {value || <span className="text-gray-400">Не указано</span>}
      </div>
    </div>
  );

  return (
    <div className="wrapper bg-gradient-to-br from-[#eefaf5] to-[#e6f3ff] min-h-screen flex flex-col font-nekstregular text-black">
      <Header />

      {/* Hero */}
      <section className="container py-10 px-4 mt-8 max-w-4xl">
        <h1 className="text-4xl font-nekstmedium mb-2 text-black">
          Профиль пользователя
        </h1>
      </section>

      {/* Content */}
      <main className="container pb-12 px-4 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left column: summary + QR */}
        <aside className="lg:w-1/3 bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl">
              <User size={28} />
            </div>
            <div>
              <div className="text-lg font-nekstmedium">
                {me ? `${me.firstName || ''} ${me.lastName || ''}` : '—'}
              </div>
              <div className="text-sm text-gray-600">{me?.userRole || '—'}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Mail size={14} /> {me?.email || '—'}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} /> {fmtPhone(me?.phone)}
            </div>
            <div className="flex items-center gap-2">
              <Archive size={14} />{' '}
              {me?.createdAt
                ? new Date(me.createdAt).toLocaleDateString()
                : '—'}
            </div>
          </div>

          {/* QR for quick share */}
          <div className="mt-6 border border-gray-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">
              Поделиться профилем
            </div>
            <div className="p-3 bg-white rounded-md shadow">
              <QRCode
                value={JSON.stringify({
                  name: `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim(),
                  email: me?.email,
                  phone: me?.phone,
                })}
                size={120}
                fgColor="#059669"
                bgColor="#ffffff"
                level="M"
              />
            </div>
          </div>
        </aside>

        {/* Right column: details / contractor */}
        <section className="lg:flex-1 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-nekstmedium mb-6 pb-3 border-b border-gray-100">
              Личная информация
            </h2>

            {loading ? (
              <div className="py-10 text-center text-gray-600">Загрузка...</div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 mb-4">
                {error}
              </div>
            ) : me ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Имя" value={me.firstName} />
                <InfoField label="Фамилия" value={me.lastName} />
                <InfoField label="Отчество" value={me.surname} />
                <InfoField label="Email" value={me.email} />
                <InfoField label="Телефон" value={fmtPhone(me.phone)} />
                <InfoField
                  label="Дата регистрации"
                  value={
                    me.createdAt
                      ? new Date(me.createdAt).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="text-gray-500">Профиль отсутствует</div>
            )}
          </div>

          {/* Contractor Information Card */}
          {me?.contractorProfile && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-nekstmedium mb-6 pb-3 border-b border-gray-100">
                Данные организации
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  label="Тип организации"
                  value={
                    me.contractorProfile.organization === 'COMPANY'
                      ? 'Компания'
                      : me.contractorProfile.organization === 'INDIVIDUAL'
                        ? 'ИП'
                        : me.contractorProfile.organization
                  }
                />
                <InfoField
                  label="Название организации"
                  value={me.contractorProfile.organizationName}
                />
                <InfoField
                  label="Организационно-правовая форма"
                  value={
                    me.contractorProfile.organizationType === 'LEGAL_ENTITY'
                      ? 'Юридическое лицо'
                      : me.contractorProfile.organizationType ===
                          'INDIVIDUAL_ENTITY'
                        ? 'Индивидуальный предприниматель'
                        : me.contractorProfile.organizationType
                  }
                />
                <InfoField label="ИНН" value={me.contractorProfile.inn} />
                <InfoField label="КПП" value={me.contractorProfile.kpp} />
                <InfoField label="ОКПО" value={me.contractorProfile.okpoCode} />
                <div className="md:col-span-2">
                  <InfoField
                    label="Юридический адрес"
                    value={me.contractorProfile.addressUr}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoField
                    label="Фактический адрес"
                    value={me.contractorProfile.addressFact}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
