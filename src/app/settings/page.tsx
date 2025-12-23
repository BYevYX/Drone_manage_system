'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, Send, Check, User } from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

const API_BASE = 'https://droneagro.duckdns.org';

export default function SettingsPage() {
  const [tab, setTab] = useState<'main' | 'security'>('main');

  // profile state
  const [form, setForm] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // password reset state
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const client = axios.create({ baseURL: API_BASE });

  // read email and id from localStorage (user requested)
  const getEmailFromLS = () =>
    typeof window !== 'undefined' ? localStorage.getItem('email') || '' : '';
  const getIdFromLS = () =>
    typeof window !== 'undefined' ? localStorage.getItem('id') || '' : '';

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('accessToken')
      : null;

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    setLoadingProfile(true);
    try {
      const token = getToken();
      // try /api/me first (safer) then fallback to localStorage values
      if (token) {
        const res = await client.get('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data || {});
        // sync certain fields to localStorage so email remains consistent
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('email', res.data?.email ?? '');
            localStorage.setItem('firstName', res.data?.firstName ?? '');
            localStorage.setItem('lastName', res.data?.lastName ?? '');
            localStorage.setItem('phone', res.data?.phone ?? '');
            localStorage.setItem('id', String(res.data?.id ?? ''));
            if (res.data?.contractorProfile)
              localStorage.setItem(
                'contractorProfile',
                JSON.stringify(res.data.contractorProfile),
              );
          }
        } catch (e) {
          // ignore localStorage errors
        }
      } else {
        // no token — reconstruct from localStorage
        const id = getIdFromLS();
        const contractorRaw =
          typeof window !== 'undefined'
            ? localStorage.getItem('contractorProfile')
            : null;
        let contractor = null;
        try {
          contractor = contractorRaw ? JSON.parse(contractorRaw) : null;
        } catch (e) {
          contractor = null;
        }
        setForm({
          id: id || undefined,
          email: getEmailFromLS() || undefined,
          firstName:
            typeof window !== 'undefined'
              ? localStorage.getItem('firstName') || ''
              : '',
          lastName:
            typeof window !== 'undefined'
              ? localStorage.getItem('lastName') || ''
              : '',
          phone:
            typeof window !== 'undefined'
              ? localStorage.getItem('phone') || ''
              : '',
          contractorProfile: contractor,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Не удалось загрузить профиль');
    } finally {
      setLoadingProfile(false);
    }
  }

  const validatePassword = (p: string) => {
    if (p.length < 8) return 'Минимум 8 символов';
    if (!/[A-Za-z]/.test(p) || !/\d/.test(p))
      return 'Пароль должен содержать буквы и цифры';
    return null;
  };

  const INPUT_CLASS =
    'w-full h-12 rounded-lg border border-gray-200 px-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition';

  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (path: string, value: any) => {
    if (!form) return;
    if (path.startsWith('contractor.')) {
      const key = path.replace('contractor.', '');
      const nextContractor = {
        ...(form.contractorProfile || {}),
        [key]: value,
      };
      const next = { ...form, contractorProfile: nextContractor };
      setForm(next);
      setIsChanged(true);
      try {
        if (typeof window !== 'undefined')
          localStorage.setItem(
            'contractorProfile',
            JSON.stringify(nextContractor),
          );
      } catch {}
      return;
    }
    const next = { ...form, [path]: value };
    setForm(next);
    setIsChanged(true);
    // persist some common fields locally for convenience
    if (['firstName', 'lastName', 'phone'].includes(path)) {
      try {
        if (typeof window !== 'undefined')
          localStorage.setItem(path, String(value ?? ''));
      } catch {}
    }
  };

  const handleSaveProfile = async () => {
    if (!form) return;
    setSavingProfile(true);
    setError(null);
    setMessage(null);
    try {
      const token = getToken();
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        surname: form.surname,
        phone: form.phone,
        contractorProfile: form.contractorProfile,
      };

      let res;
      if (token) {
        // prefer PUT to /api/users/{id} if id known
        const id = form.id || getIdFromLS();
        if (id) {
          res = await client.put(`/api/users/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // fallback to /api/me if server supports it
          res = await client.put('/api/me', payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        throw new Error('Требуется авторизация для сохранения профиля');
      }

      const updated = res?.data || payload;
      setForm(updated);
      // sync to localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('firstName', updated.firstName ?? '');
          localStorage.setItem('lastName', updated.lastName ?? '');
          localStorage.setItem('phone', updated.phone ?? '');
          if (updated.id) localStorage.setItem('id', String(updated.id));
          if (updated.contractorProfile)
            localStorage.setItem(
              'contractorProfile',
              JSON.stringify(updated.contractorProfile),
            );
        }
      } catch (e) {}

      setMessage('Профиль успешно сохранён');
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || err.message || 'Ошибка при сохранении',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Password reset handlers (security tab)
  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const email = getEmailFromLS();
      if (!email) throw new Error('Email не найден в localStorage');
      const res = await client.post('/api/auth/forgot-password', { email });
      setMessage('Код отправлен на почту');
      setStep('reset');
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Ошибка при отправке кода',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const validation = validatePassword(newPassword);
    if (validation) {
      setPasswordError(validation);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const email = getEmailFromLS();
      if (!email) throw new Error('Email не найден в localStorage');
      await client.post('/api/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      setMessage('Пароль успешно изменён!');
      setStep('email');
      setCode('');
      setNewPassword('');
      setPasswordError(null);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Ошибка при смене пароля',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper bg-gradient-to-br from-[#eefaf5] to-[#e6f3ff] min-h-screen flex flex-col font-nekstregular text-black">
      <Header />

      <section className="container py-10 px-4 mt-8 max-w-4xl">
        <h1 className="text-4xl font-nekstmedium mb-2 text-black">Настройки</h1>
        <p className="text-lg text-gray-700">
          Управление основной информацией и безопасностью
        </p>
      </section>

      <main className="container px-4 max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        <div className="bg-white rounded-2xl p-4 shadow-md flex gap-2">
          <button
            onClick={() => setTab('main')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'main' ? ' bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-gray-50 text-gray-700'}`}
          >
            Основная информация
          </button>
          <button
            onClick={() => setTab('security')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'security' ? ' bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-gray-50 text-gray-700'}`}
          >
            Безопасность
          </button>
        </div>

        {/* Tab content */}
        {tab === 'main' && (
          <section className="bg-white rounded-2xl p-6 shadow-md animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-nekstmedium">Основная информация</h2>
            </div>

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700">
                {error}
              </div>
            )}

            {loadingProfile ? (
              <div className="py-10 text-center text-gray-600">Загрузка...</div>
            ) : form ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-xs text-gray-600">
                    Имя
                  </label>
                  <input
                    value={form.firstName ?? ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="Имя"
                  />

                  <label className="block mb-2 text-xs text-gray-600">
                    Фамилия
                  </label>
                  <input
                    value={form.lastName ?? ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="Фамилия"
                  />

                  <label className="block mb-2 text-xs text-gray-600">
                    Отчество
                  </label>
                  <input
                    value={form.surname ?? ''}
                    onChange={(e) => handleChange('surname', e.target.value)}
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="Отчество"
                  />

                  <label className="block mb-2 text-xs text-gray-600">
                    Телефон
                  </label>
                  <input
                    value={form.phone ?? ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="Телефон"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs text-gray-600">
                    Тип организации
                  </label>
                  <input
                    value={form.contractorProfile?.organization ?? ''}
                    onChange={(e) =>
                      handleChange('contractor.organization', e.target.value)
                    }
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="COMPANY / INDIVIDUAL"
                  />

                  <label className="block mb-2 text-xs text-gray-600">
                    Название организации
                  </label>
                  <input
                    value={form.contractorProfile?.organizationName ?? ''}
                    onChange={(e) =>
                      handleChange(
                        'contractor.organizationName',
                        e.target.value,
                      )
                    }
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="Название компании"
                  />

                  <label className="block mb-2 text-xs text-gray-600">
                    ИНН
                  </label>
                  <input
                    value={form.contractorProfile?.inn ?? ''}
                    onChange={(e) =>
                      handleChange('contractor.inn', e.target.value)
                    }
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="ИНН"
                  />

                  <label className="block mb-2 text-xs text-gray-600">
                    Юридический адрес
                  </label>
                  <input
                    value={form.contractorProfile?.addressUr ?? ''}
                    onChange={(e) =>
                      handleChange('contractor.addressUr', e.target.value)
                    }
                    className={INPUT_CLASS + ' mb-3'}
                    placeholder="Юридический адрес"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                  {isChanged && (
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className={`px-4 py-2 rounded-[20px]  bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-nekstmedium hover:from-indigo-600 hover:to-blue-700 transition ${savingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {savingProfile ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>Профиль отсутствует</div>
            )}
          </section>
        )}

        {tab === 'security' && (
          <section className="bg-white rounded-2xl p-6 shadow-md animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-nekstmedium">Безопасность</h2>
              <div className="text-sm text-gray-500">Сброс пароля</div>
            </div>

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700">
                {error}
              </div>
            )}

            {/* no email input — read from localStorage */}
            <div className="flex flex-col gap-4">
              <label className="block text-xs text-gray-600">Email</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center px-3 border border-gray-200 rounded-lg bg-gray-50">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  className={INPUT_CLASS + ' flex-1'}
                  value={getEmailFromLS()}
                  readOnly
                />
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className={`px-4 py-2 flex items-center justify-center gap-2 rounded-[20px]  bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-nekstmedium hover:from-indigo-600 hover:to-blue-700 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Send size={16} />{' '}
                  <p>{loading ? 'Отправка...' : 'Отправить код'}</p>
                </button>
              </div>

              {step === 'reset' && (
                <>
                  <label className="block text-xs text-gray-600">
                    Код из письма
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center px-3 border border-gray-200 rounded-lg bg-gray-50">
                      <Check size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className={INPUT_CLASS + ' flex-1'}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>

                  <label className="block text-xs text-gray-600">
                    Новый пароль
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center px-3 border border-gray-200 rounded-lg bg-gray-50">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      className={INPUT_CLASS + ' flex-1'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError(validatePassword(e.target.value));
                      }}
                    />
                  </div>
                  {passwordError && (
                    <p className="text-red-600 text-xs">{passwordError}</p>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleResetPassword}
                      disabled={
                        loading || !code || !newPassword || !!passwordError
                      }
                      className={`px-4 flex items-center justify-center py-2 rounded-[20px] bg-gradient-to-r from-green-500 to-green-700 text-white font-nekstmedium hover:from-green-600 hover:to-green-800 transition ${loading || !code || !newPassword || !!passwordError ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <Check size={20} className="pr-[5px]" />{' '}
                      {loading ? 'Сохраняем...' : 'Сменить пароль'}
                    </button>
                    <button
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setNewPassword('');
                        setPasswordError(null);
                      }}
                      className="px-4 py-2 rounded-[20px] bg-gray-50 text-gray-700 border border-gray-200"
                    >
                      Отмена
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
}
