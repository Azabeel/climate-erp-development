import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Calendar, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface License {
  id: string;
  product: string;
  plan: string;
  status: 'active' | 'expiring' | 'expired';
  users: number;
  maxUsers: number;
  validUntil: string;
  features: string[];
  price: number;
}

const LICENSES: License[] = [
  {
    id: 'lic-1',
    product: 'АСУ СЦ «Сервис Климат»',
    plan: 'Enterprise',
    status: 'active',
    users: 12,
    maxUsers: 50,
    validUntil: '2027-01-01',
    features: ['FSM полный', 'CRM', 'Склад', 'HR', 'Финансы', 'ИИ-агенты', 'Мобильное приложение', 'Интеграции 1С'],
    price: 45000,
  },
  {
    id: 'lic-2',
    product: 'Модуль "Портал клиента"',
    plan: 'Professional',
    status: 'expiring',
    users: 3,
    maxUsers: 10,
    validUntil: '2026-06-01',
    features: ['Отслеживание заявок', 'Онлайн-оплата', 'История обслуживания'],
    price: 8000,
  },
  {
    id: 'lic-3',
    product: 'Интеграция Telegram Bot',
    plan: 'Basic',
    status: 'active',
    users: 1,
    maxUsers: 1,
    validUntil: '2027-01-01',
    features: ['Входящие заявки', 'Уведомления клиентам', 'Уведомления сотрудникам'],
    price: 3000,
  },
];

const MODULE_USAGE = [
  { module: 'Заявки', usagePercent: 95, description: 'FSM-модуль нарядов' },
  { module: 'CRM', usagePercent: 72, description: 'Воронка продаж' },
  { module: 'Склад', usagePercent: 88, description: 'Управление складом' },
  { module: 'HR', usagePercent: 60, description: 'Кадровый учёт' },
  { module: 'Финансы', usagePercent: 78, description: 'Финансовый модуль' },
  { module: 'Аналитика', usagePercent: 45, description: 'Отчёты и дашборды' },
];

const getStatusIcon = (status: License['status']) => {
  switch (status) {
    case 'active': return <CheckCircle size={18} className="text-green-600" />;
    case 'expiring': return <AlertTriangle size={18} className="text-yellow-600" />;
    case 'expired': return <XCircle size={18} className="text-red-600" />;
  }
};

const getStatusLabel = (status: License['status']) => {
  switch (status) {
    case 'active': return { label: 'Активна', cls: 'bg-green-100 text-green-700' };
    case 'expiring': return { label: 'Истекает', cls: 'bg-yellow-100 text-yellow-700' };
    case 'expired': return { label: 'Истекла', cls: 'bg-red-100 text-red-700' };
  }
};

const LicensingModule = () => {
  const [activeLicenses] = useState(LICENSES);

  const totalCost = activeLicenses.reduce((sum, l) => sum + l.price, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Лицензирование</h2>
          <p className="text-gray-600 mt-1">Управление лицензиями и модулями системы</p>
        </div>
        <Button onClick={() => toast.info('Связь с менеджером по продукту')}>
          Связаться с поддержкой
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={24} className="text-blue-600" />
            <span className="font-semibold text-blue-900">Активных лицензий</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">{activeLicenses.filter(l => l.status === 'active').length}</p>
          <p className="text-sm text-blue-600 mt-1">из {activeLicenses.length} всего</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={24} className="text-green-600" />
            <span className="font-semibold text-green-900">Пользователей</span>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {activeLicenses.reduce((s, l) => s + l.users, 0)}
          </p>
          <p className="text-sm text-green-600 mt-1">из {activeLicenses.reduce((s, l) => s + l.maxUsers, 0)} максимум</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw size={24} className="text-purple-600" />
            <span className="font-semibold text-purple-900">Ежемесячно</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{totalCost.toLocaleString('ru-RU')} ₽</p>
          <p className="text-sm text-purple-600 mt-1">стоимость подписок</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Активные лицензии</h3>
          <div className="space-y-4">
            {activeLicenses.map(lic => {
              const statusInfo = getStatusLabel(lic.status);
              return (
                <div key={lic.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lic.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{lic.product}</h4>
                        <p className="text-sm text-gray-500">Тариф: {lic.plan}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Пользователи: {lic.users}/{lic.maxUsers}</span>
                      <span>{Math.round(lic.users / lic.maxUsers * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lic.users / lic.maxUsers * 100}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={12} />
                    <span>До {new Date(lic.validUntil).toLocaleDateString('ru-RU')}</span>
                    <span className="ml-auto font-semibold text-gray-700">{lic.price.toLocaleString('ru-RU')} ₽/мес</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {lic.features.map(f => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success('Счёт отправлен на email')}>
                      <Download size={14} className="mr-1" /> Счёт
                    </Button>
                    {lic.status === 'expiring' && (
                      <Button size="sm" className="flex-1" onClick={() => toast.success('Заявка на продление отправлена')}>
                        Продлить
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Использование модулей</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="space-y-4">
              {MODULE_USAGE.map(m => (
                <div key={m.module}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{m.module}</span>
                      <span className="text-xs text-gray-500 ml-2">{m.description}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{m.usagePercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.usagePercent >= 80 ? 'bg-green-500' : m.usagePercent >= 50 ? 'bg-blue-500' : 'bg-gray-400'}`}
                      style={{ width: `${m.usagePercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Лицензия истекает через 18 дней</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Модуль «Портал клиента» — подписка заканчивается 01.06.2026.
                  Продлите лицензию для продолжения работы.
                </p>
                <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700" onClick={() => toast.success('Заявка на продление отправлена')}>
                  Продлить сейчас
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensingModule;
