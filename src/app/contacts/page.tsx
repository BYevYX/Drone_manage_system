import { Mail, Phone, MapPin } from 'lucide-react';
import Header from '@/src/shared/ui/Header';
import Footer from '@/src/shared/ui/Footer';

export default function ContactsPage() {
  return (
    <div className="wrapper bg-gradient-to-br from-[#e6e6e6] to-[#cfe9e5]">
      <Header />
      {/* Hero Section */}

      {/* Contact Information */}
      <div className="container py-16 px-4 font-nekstregular">
        <div className="flex flex-col md:flex-row justify-between space-y-10 md:space-y-0">
          {/* Company Info */}
          <div className="w-full md:w-[48%] bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-3xl mb-6 font-semibold">Свяжитесь с нами</h3>
            <p className="text-lg mb-4">
              Для всех вопросов, предложений и сотрудничества, пожалуйста,
              используйте нижеуказанные способы связи.
            </p>

            <div className="mb-4">
              <p className="font-medium text-lg">Адрес</p>
              <p>12345, Москва, ул. Дронная, 15</p>
            </div>
            <div className="mb-4">
              <p className="font-medium text-lg">Телефон</p>
              <p>+7 800 123 45 67</p>
            </div>
            <div className="mb-4">
              <p className="font-medium text-lg">Email</p>
              <p>
                <a
                  href="mailto:info@droneagro.com"
                  className="text-blue-500 hover:underline"
                >
                  info@droneagro.com
                </a>
              </p>
            </div>
            <div className="mb-4">
              <p className="font-medium text-lg">Социальные сети</p>
              <div className="flex space-x-6">
                <a href="#" className="text-blue-500 hover:underline">
                  Facebook
                </a>
                <a href="#" className="text-blue-500 hover:underline">
                  Instagram
                </a>
                <a href="#" className="text-blue-500 hover:underline">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full md:w-[48%] bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-3xl font-nekstmedium mb-6">Обратная связь</h3>
            <p className="text-lg mb-4">
              Мы будем рады услышать от вас! Заполните форму ниже, и мы свяжемся
              с вами в ближайшее время.
            </p>

            <form action="#" method="POST">
              <div className="mb-4">
                <label htmlFor="name" className="block text-lg font-medium">
                  Ваше имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-lg font-medium">
                  Ваш email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Введите ваш email"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-lg font-medium">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Введите ваше сообщение"
                  //   rows="4"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300"
              >
                Отправить сообщение
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer></Footer>
    </div>
  );
}
