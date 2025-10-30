'use client';
import axios from 'axios';
import React from 'react';

const API_URL = 'http://51.250.43.77:8080/v1/auth/register';

export default function SimpleRegisterButton() {
  // Данные, которые нужно отправить
  const dataToSend = {
    email: 'str3ing@example.com',
    phone: '12345671901',
    password: 'password123',
    userRole: 'CONTRACTOR',
    firstName: 'Ivan',
    lastName: 'Ivanov',
    surname: 'Ivanovich',
    contractor: {
      organization: 'COMPANY',
      organizationName: 'ООО Ромашка',
      organizationType: 'LEGAL',
      inn: '1234567890',
      kpp: '0987654321',
      okpoCode: '11223344',
      addressUr: 'г. Москва, ул. Тверская, д.1',
      addressFact: 'г. Москва, ул. Тверская, д.1',
    },
  };

  const handleClick = async () => {
    try {
      const response = await axios.post(API_URL, dataToSend);
      alert('Регистрация успешна: ' + (response.data.message || 'OK'));
    } catch (error: any) {
      alert(
        'Ошибка при регистрации: ' +
          (error.response?.data?.message || error.message || 'Unknown error'),
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{ padding: '10px 20px', fontSize: '16px' }}
    >
      Зарегистрироваться
    </button>
  );
}
