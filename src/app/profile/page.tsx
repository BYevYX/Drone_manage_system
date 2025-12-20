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

const API_BASE = 'https://droneagro.duckdns.org';

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

  // unified input class (same height)
  const INPUT_CLASS =
    'w-full h-12 rounded-lg border border-gray-200 px-3 text-sm placeholder-gray-400 bg-white';

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
        <section className="lg:flex-1 bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-nekstmedium">Данные профиля</h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-600">Загрузка...</div>
          ) : error ? (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 mb-4">
              {error}
            </div>
          ) : me ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal fields */}
              <div>
                <label className="block mb-2 text-xs text-gray-600">Имя</label>
                <input
                  value={form?.firstName ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="Имя"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Фамилия
                </label>
                <input
                  value={form?.lastName ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="Фамилия"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Отчество
                </label>
                <input
                  value={form?.surname ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="Отчество"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Email
                </label>
                <input
                  value={form?.email ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="example@domain.com"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Телефон
                </label>
                <input
                  value={form?.phone ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              {/* Contractor block */}
              <div>
                <label className="block mb-2 text-xs text-gray-600">
                  Тип организации
                </label>
                <input
                  value={form?.contractorProfile?.organization ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="COMPANY / INDIVIDUAL"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Название организации
                </label>
                <input
                  value={form?.contractorProfile?.organizationName ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="Название компании"
                />

                <label className="block mb-2 text-xs text-gray-600">Тип</label>
                <input
                  value={form?.contractorProfile?.organizationType ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="LEGAL_ENTITY / INDIVIDUAL_ENTITY"
                />

                <label className="block mb-2 text-xs text-gray-600">ИНН</label>
                <input
                  value={form?.contractorProfile?.inn ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="ИНН"
                />

                <label className="block mb-2 text-xs text-gray-600">КПП</label>
                <input
                  value={form?.contractorProfile?.kpp ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="КПП"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Юридический адрес
                </label>
                <input
                  value={form?.contractorProfile?.addressUr ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="Юридический адрес"
                />

                <label className="block mb-2 text-xs text-gray-600">
                  Фактический адрес
                </label>
                <input
                  value={form?.contractorProfile?.addressFact ?? ''}
                  readOnly
                  className={INPUT_CLASS + ' mb-3'}
                  placeholder="Фактический адрес"
                />
              </div>
            </div>
          ) : (
            <div>Профиль отсутствует</div>
          )}
        </section>
      </main>

      <Footer />

      {/* Small helpers / animations */}
      <style jsx>{`
        .placeholder-gray-400::placeholder {
          color: #9ca3af; /* consistent placeholder color */
        }
      `}</style>
    </div>
  );
}
