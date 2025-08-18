import React, { useState } from 'react';
import { UserProfileCard } from '@/components/cards/UserProfileCard';
import { StatsCards } from '@/components/cards/StatsCards';
import { CreditsPurchase } from '@/components/cards/CreditsPurchase';
import { TariffCards } from '@/components/cards/TariffCards';
import { TransactionHistory } from '@/components/ui//TransactionHistory';

interface PersonalAccountContentProps {
  user?: {
    username?: string;
    email?: string;
    created_at?: string | Date;
    is_admin?: boolean;
    invoice?: number;
  };
  onLogout?: () => void;
}

export const PersonalAccountContent: React.FC<PersonalAccountContentProps> = ({
  user,
  onLogout
}) => {
  const [credits, setCredits] = useState(user?.invoice || 1000);
  const [selectedTariff, setSelectedTariff] = useState('novice');
  const [transactions] = useState([
    { id: 1, amount: 100, date: new Date(), type: 'purchase' },
    { id: 2, amount: 100, date: new Date(Date.now() - 86400000), type: 'purchase' },
    { id: 3, amount: 100, date: new Date(Date.now() - 172800000), type: 'purchase' },
  ]);

  const handleSettings = () => {
    console.log('Открыть настройки');
  };

  const handleHelp = () => {
    console.log('Открыть помощь');
  };

  const handlePurchase = (amount: number) => {
    setCredits(prev => prev + amount);
    console.log(`Покупка ${amount} кредитов`);
  };

  const handleTariffChange = (tariffId: string) => {
    setSelectedTariff(tariffId);
    console.log(`Выбран тариф: ${tariffId}`);
  };

  const handleChangeTariff = () => {
    console.log('Смена тарифа');
  };

  const handleViewAllTransactions = () => {
    console.log('Просмотр всех транзакций');
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Личный кабинет</h1>
          <p className="text-gray-600">
            В данном разделе вы можете управлять своими кредитами, подписками и покупать новые услуги.
          </p>
        </div>

        {/* Карточка пользователя */}
        <UserProfileCard
          user={user}
          onLogout={onLogout}
          onSettings={handleSettings}
          onHelp={handleHelp}
          formatDate={formatDate}
          className="mb-8"
        />

        {/* Статистика */}
        <StatsCards
          credits={credits}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Покупка кредитов */}
          <div className="lg:col-span-1">
            <CreditsPurchase
              onPurchase={handlePurchase}
            />
          </div>

          {/* Тарифы и журнал */}
          <div className="lg:col-span-2 space-y-8">
            <TariffCards
              selectedTariff={selectedTariff}
              onTariffChange={handleTariffChange}
              onChangeTariff={handleChangeTariff}
            />

            <TransactionHistory
              transactions={transactions}
              onViewAll={handleViewAllTransactions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};