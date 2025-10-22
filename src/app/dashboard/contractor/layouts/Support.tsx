'use client';
import React, { useState, useEffect } from 'react';
import {
  Mail,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  BookOpen,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import { apiClient } from '../../../services/api';
import { useGlobalContext } from '../../../GlobalContext';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const defaultFaqList: FAQ[] = [
  {
    question: 'Как создать новый отчёт?',
    answer:
      'Перейдите на страницу "Мои отчёты" и нажмите кнопку "Создать отчёт". Заполните все необходимые поля и нажмите "Сохранить".',
  },
  {
    question: 'Как экспортировать данные в Excel?',
    answer:
      'В таблице отчётов нажмите на иконку экспорта в нужной строке или используйте кнопку "Экспортировать всё" над таблицей.',
  },
  {
    question: 'Что делать, если не работает фильтр по дате?',
    answer:
      'Проверьте корректность указанного диапазона дат. Если проблема сохраняется — обновите страницу или обратитесь в поддержку.',
  },
  {
    question: 'Как восстановить забытый пароль?',
    answer:
      'На странице входа нажмите "Забыли пароль?", следуйте инструкциям для восстановления доступа.',
  },
  {
    question: 'Как связаться с технической поддержкой?',
    answer:
      'Используйте форму обратной связи на этой странице или напишите на support@agroapp.ru. Мы отвечаем в течение рабочего дня.',
  },
  {
    question: 'Как обновить профиль пользователя?',
    answer:
      'Перейдите в настройки профиля через меню пользователя в правом верхнем углу. Внесите изменения и сохраните.',
  },
];

export default function SupportPage() {
  const { user } = useGlobalContext();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [faqList, setFaqList] = useState<FAQ[]>(defaultFaqList);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
    loadSupportData();
  }, [user]);

  const loadSupportData = async () => {
    try {
      // In a real app, you would load FAQ from API
      // For now, we'll use the default FAQ list
      setFaqList(defaultFaqList);
      
      // Load user's support tickets (mock implementation)
      // In real app: const userTickets = await apiClient.getSupportTickets();
      setTickets([]);
    } catch (err) {
      console.error('Error loading support data:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would send this to your support API
      // await apiClient.createSupportTicket(form);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock ticket
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        message: form.message,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        message: ''
      });
    } catch (err) {
      setError('Ошибка отправки обращения. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-0 sm:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-8">
        {/* Header */}
        <header className="flex flex-col items-center justify-center gap-4 py-10">
          <div className="flex items-center gap-3">
            <HelpCircle size={44} className="text-emerald-500 drop-shadow" />
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Центр поддержки
            </h1>
          </div>
          <p className="text-lg text-gray-600 text-center max-w-2xl">
            Мы всегда готовы помочь! Найдите ответ ниже или отправьте обращение
            — поддержка ответит в течение рабочего дня.
          </p>
          {user && (
            <div className="text-sm text-gray-500">
              Добро пожаловать, {user.name || user.email}!
            </div>
          )}
        </header>

        {/* FAQ */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={24} className="text-emerald-400" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Частые вопросы
            </h2>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/80 shadow-md backdrop-blur-lg">
            <ul className="divide-y divide-emerald-100">
              {faqList.map((faq, idx) => (
                <li
                  key={idx}
                  className="py-4 px-6 transition-colors hover:bg-emerald-50/60"
                >
                  <details className="group peer select-none">
                    <summary className="cursor-pointer flex items-center gap-2 font-medium text-gray-800 transition group-open:text-emerald-700 text-lg">
                      <span className="text-emerald-400 font-bold">Q:</span>{' '}
                      {faq.question}
                    </summary>
                    <div className="ml-7 mt-3 text-gray-600 flex items-start gap-2 text-base">
                      <span className="text-emerald-500 font-bold">A:</span>
                      <span>{faq.answer}</span>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Mail size={24} className="text-emerald-400" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Написать в поддержку
            </h2>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/95 shadow-lg backdrop-blur-lg p-0 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center gap-2 text-emerald-700 font-semibold text-lg py-10">
                <CheckCircle size={32} className="mb-2" />
                Ваше обращение отправлено! Мы ответим на email в течение 1
                рабочего дня.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-8 max-w-lg mx-auto py-8"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm text-gray-700 mb-1 font-medium"
                      htmlFor="name"
                    >
                      Имя
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white text-gray-900 font-medium transition"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm text-gray-700 mb-1 font-medium"
                      htmlFor="email"
                    >
                      Email для ответа
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white text-gray-900 font-medium transition"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm text-gray-700 mb-1 font-medium"
                    htmlFor="message"
                  >
                    Сообщение
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-none bg-white text-gray-900 font-medium transition"
                    placeholder="Опишите вашу проблему или вопрос..."
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 font-medium mt-1">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-600 hover:to-lime-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl shadow transition text-lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Отправить
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* User's Support Tickets */}
        {tickets.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={24} className="text-emerald-400" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Мои обращения
              </h2>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/80 shadow-md backdrop-blur-lg">
              <div className="divide-y divide-emerald-100">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-800">
                        Обращение #{ticket.id.slice(-6)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status === 'open' ? 'Открыто' :
                         ticket.status === 'in_progress' ? 'В работе' : 'Решено'}
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                      {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="text-gray-700">
                      {ticket.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Контакты */}
        <footer className="py-8 flex flex-col items-center gap-2">
          <div className="text-gray-700 flex items-center gap-2">
            <span className="font-medium">Экстренная связь:</span>
            <a
              href="mailto:support@agroapp.ru"
              className="text-emerald-600 underline hover:text-emerald-700 transition"
            >
              support@agroapp.ru
            </a>
          </div>
          <div className="text-gray-700">
            <span className="font-medium">Документация:</span>{' '}
            <a
              href="/docs"
              className="text-emerald-600 underline hover:text-emerald-700 transition"
            >
              Руководство пользователя
            </a>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} AgroApp. Все права защищены.
          </div>
        </footer>
      </div>
    </div>
  );
}
