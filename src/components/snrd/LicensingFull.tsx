import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleStatus = 'active' | 'trial' | 'inactive';
type PaymentStatus = 'paid' | 'pending';

interface Module {
  id: string;
  name: string;
  icon: string;
  status: ModuleStatus;
  trialDaysLeft?: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: PaymentStatus;
}

interface UsageDataPoint {
  day: string;
  users: number;
  apiCalls: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  { id: 'crm', name: 'CRM', icon: 'Users', status: 'active' },
  { id: 'eam', name: 'EAM', icon: 'Wrench', status: 'active' },
  { id: 'stock', name: 'Склад', icon: 'Package', status: 'active' },
  { id: 'hr', name: 'HR', icon: 'UserCheck', status: 'active' },
  { id: 'ai', name: 'ИИ-аналитик', icon: 'BrainCircuit', status: 'active' },
  { id: 'portal', name: 'Клиентский портал', icon: 'Globe', status: 'active' },
  { id: 'iot', name: 'IoT мониторинг', icon: 'Radio', status: 'trial', trialDaysLeft: 14 },
  { id: 'mobile', name: 'Мобильное приложение', icon: 'Smartphone', status: 'active' },
  { id: 'integrations', name: 'Интеграции', icon: 'Plug', status: 'active' },
  { id: 'analytics', name: 'Аналитика', icon: 'BarChart2', status: 'active' },
  { id: 'lms', name: 'LMS', icon: 'GraduationCap', status: 'inactive' },
  { id: 'automation', name: 'Автоматизации', icon: 'Zap', status: 'active' },
];

const PAYMENT_HISTORY: PaymentRecord[] = [
  {
    id: 'inv-001',
    date: '15.06.2026',
    description: 'Продление лицензии «Профессиональный» — 12 месяцев',
    amount: 430800,
    status: 'pending',
  },
  {
    id: 'inv-002',
    date: '15.06.2025',
    description: 'Продление лицензии «Профессиональный» — 12 месяцев',
    amount: 430800,
    status: 'paid',
  },
  {
    id: 'inv-003',
    date: '20.02.2025',
    description: 'Расширение лицензий (+5 пользователей)',
    amount: 71800,
    status: 'paid',
  },
  {
    id: 'inv-004',
    date: '15.06.2024',
    description: 'Первоначальная лицензия «Профессиональный» — 12 месяцев',
    amount: 395000,
    status: 'paid',
  },
  {
    id: 'inv-005',
    date: '01.05.2024',
    description: 'Пилотный период — 3 месяца',
    amount: 89700,
    status: 'paid',
  },
];

const generateUsageData = (): UsageDataPoint[] => {
  const data: UsageDataPoint[] = [];
  const baseUsers = 14;
  const baseApi = 8400;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(2026, 4, 16 - i);
    const dayLabel = `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    const userVariance = Math.floor(Math.random() * 8) - 2;
    const apiVariance = Math.floor(Math.random() * 3000) - 500;
    data.push({
      day: dayLabel,
      users: Math.max(8, Math.min(25, baseUsers + userVariance)),
      apiCalls: Math.max(4000, baseApi + apiVariance),
    });
  }
  return data;
};

const USAGE_DATA = generateUsageData();

const PLANS = [
  {
    id: 'basic',
    name: 'Базовый',
    price: '15 900',
    period: 'мес',
    users: '10 пользователей',
    features: ['CRM', 'Склад', 'HR', 'Аналитика', 'Мобильное приложение'],
    isCurrent: false,
    isEnterprise: false,
  },
  {
    id: 'professional',
    name: 'Профессиональный',
    price: '35 900',
    period: 'мес',
    users: '25 пользователей',
    features: [
      'Все модули Базового',
      'EAM',
      'ИИ-аналитик',
      'IoT мониторинг',
      'Интеграции',
      'Автоматизации',
      'Клиентский портал',
    ],
    isCurrent: true,
    isEnterprise: false,
  },
  {
    id: 'enterprise',
    name: 'Корпоративный',
    price: 'По запросу',
    period: '',
    users: 'Без ограничений',
    features: [
      'Все модули',
      'LMS',
      'Выделенный сервер',
      'SLA 99.9%',
      'Персональный менеджер',
      'Кастомная интеграция',
    ],
    isCurrent: false,
    isEnterprise: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ModuleStatusBadge = ({ module }: { module: Module }) => {
  if (module.status === 'active') {
    return (
      <span className="flex items-center gap-1 text-green-600">
        <Icon name="CheckCircle" size={14} className="shrink-0" />
        <span className="text-xs font-medium">Активен</span>
      </span>
    );
  }
  if (module.status === 'trial') {
    return (
      <span className="flex items-center gap-1 text-amber-600">
        <Icon name="Clock" size={14} className="shrink-0" />
        <span className="text-xs font-medium">Пробный {module.trialDaysLeft} дн.</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-slate-400">
      <Icon name="XCircle" size={14} className="shrink-0" />
      <span className="text-xs font-medium">Недоступен</span>
    </span>
  );
};

const ModuleCard = ({ module }: { module: Module }) => {
  const bgClass =
    module.status === 'active'
      ? 'bg-white border-slate-200'
      : module.status === 'trial'
        ? 'bg-amber-50 border-amber-200'
        : 'bg-slate-50 border-slate-200 opacity-60';

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${bgClass}`}>
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          module.status === 'active'
            ? 'bg-blue-100'
            : module.status === 'trial'
              ? 'bg-amber-100'
              : 'bg-slate-100'
        }`}
      >
        <Icon
          name={module.icon as any}
          size={18}
          className={
            module.status === 'active'
              ? 'text-blue-600'
              : module.status === 'trial'
                ? 'text-amber-600'
                : 'text-slate-400'
          }
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 truncate">{module.name}</p>
        <ModuleStatusBadge module={module} />
      </div>
    </div>
  );
};

const PlanCard = ({
  plan,
}: {
  plan: (typeof PLANS)[number];
}) => {
  const handleSelect = () => {
    if (plan.isCurrent) return;
    if (plan.isEnterprise) {
      toast.info('Свяжитесь с менеджером для оформления корпоративной лицензии');
    } else {
      toast.success(`Выбран тариф «${plan.name}»`);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 p-6 flex flex-col gap-4 transition-shadow ${
        plan.isCurrent
          ? 'border-blue-500 shadow-lg shadow-blue-100 bg-white'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-800 text-lg">{plan.name}</p>
          <p className="text-slate-500 text-sm">{plan.users}</p>
        </div>
        {plan.isCurrent && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 shrink-0">Текущий</Badge>
        )}
      </div>

      <div>
        {plan.isEnterprise ? (
          <p className="text-2xl font-bold text-slate-800">{plan.price}</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-slate-800">{plan.price} ₽</span>
            <span className="text-slate-500 text-sm mb-1">/{plan.period}</span>
          </div>
        )}
      </div>

      <ul className="space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
            <Icon name="Check" size={14} className="text-green-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        onClick={handleSelect}
        variant={plan.isCurrent ? 'outline' : 'default'}
        className={`w-full mt-auto ${plan.isCurrent ? 'cursor-default' : ''}`}
        disabled={plan.isCurrent}
      >
        {plan.isCurrent ? 'Текущий план' : plan.isEnterprise ? 'Связаться' : 'Выбрать'}
      </Button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LicensingFull = () => {
  const [licenseKey, setLicenseKey] = useState('');

  const totalUsers = 25;
  const activeUsers = 18;
  const usagePercent = Math.round((activeUsers / totalUsers) * 100);

  const licenseEndDate = new Date(2027, 5, 15); // 15 июня 2027
  const today = new Date(2026, 4, 16); // 16 мая 2026
  const daysLeft = Math.round(
    (licenseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const yearProgress = Math.round(((365 - daysLeft) / 365) * 100);

  const handleRenew = () => toast.success('Переход к продлению лицензии...');
  const handleExpand = () => toast.success('Переход к расширению лицензий...');
  const handleDownloadInvoice = (id: string) =>
    toast.success(`Счёт ${id} скачан`);
  const handleCheckUpdates = () =>
    toast.success('Версия 4.0.1 — актуальная. Обновлений нет.');
  const handleActivateKey = () => {
    if (!licenseKey.trim()) {
      toast.error('Введите ключ лицензии');
      return;
    }
    toast.success('Ключ лицензии активирован');
    setLicenseKey('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Лицензирование и подписка</h1>
          <p className="text-slate-500 text-sm mt-1">
            Управление лицензиями, модулями и тарифными планами
          </p>
        </div>
        <Icon name="ShieldCheck" size={32} className="text-blue-500" />
      </div>

      {/* Current License Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <Icon name="Star" size={22} className="text-yellow-300" />
              <span className="text-xl font-bold">Профессиональный</span>
              <span className="bg-green-400 text-green-900 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Активна
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-blue-200 text-xs mb-1">Активных пользователей</p>
                <p className="text-2xl font-bold">
                  {activeUsers}{' '}
                  <span className="text-base font-normal text-blue-200">/ {totalUsers}</span>
                </p>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-blue-200 text-xs mt-1">{usagePercent}% использовано</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-blue-200 text-xs mb-1">Действует до</p>
                <p className="text-2xl font-bold">15 июня 2027</p>
                <p className="text-blue-200 text-xs mt-1">Осталось {daysLeft} дней</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-blue-200 text-xs mb-1">Прогресс года</p>
                <p className="text-2xl font-bold">{100 - yearProgress}%</p>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${100 - yearProgress}%` }}
                  />
                </div>
                <p className="text-blue-200 text-xs mt-1">срока действия осталось</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={handleRenew}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Продлить
            </Button>
            <Button
              onClick={handleExpand}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              Расширить лицензии
            </Button>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Включённые модули</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Тарифные планы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">
          График использования (30 дней)
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Активные пользователи и нагрузка на API
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={USAGE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradApi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              yAxisId="users"
              orientation="left"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 25]}
              label={{
                value: 'Польз.',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 11, fill: '#94a3b8' },
              }}
            />
            <YAxis
              yAxisId="api"
              orientation="right"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              label={{
                value: 'API вызовов',
                angle: 90,
                position: 'insideRight',
                offset: 10,
                style: { fontSize: 11, fill: '#94a3b8' },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                if (name === 'users') return [`${value} польз.`, 'Активных пользователей'];
                return [`${value.toLocaleString('ru')}`, 'API вызовов'];
              }}
            />
            <Area
              yAxisId="users"
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradUsers)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              yAxisId="api"
              type="monotone"
              dataKey="apiCalls"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gradApi)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="text-xs text-slate-500">Активных пользователей</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
            <span className="text-xs text-slate-500">API вызовов в день</span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">История платежей</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">
                  Дата
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">
                  Описание
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-3 pr-4">
                  Сумма
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 pb-3 pr-4">
                  Статус
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-3">
                  Счёт
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PAYMENT_HISTORY.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">{record.date}</td>
                  <td className="py-3 pr-4 text-slate-700">{record.description}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                    {record.amount.toLocaleString('ru')} ₽
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {record.status === 'paid' ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Оплачено
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        Ожидает
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-slate-500 hover:text-blue-600"
                      onClick={() => handleDownloadInvoice(record.id)}
                    >
                      <Icon name="Download" size={14} className="mr-1" />
                      Скачать
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Technical Info + Activate Key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="Info" size={18} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Техническая информация</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Версия системы</dt>
              <dd className="font-mono font-semibold text-slate-800">4.0.1</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Идентификатор лицензии</dt>
              <dd className="font-mono text-slate-700 text-xs break-all text-right">
                HVAC-ERP-2024-PROF-18743
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Серийный номер</dt>
              <dd className="font-mono text-slate-700 text-xs">SN-20240615-X9K2M</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Дата активации</dt>
              <dd className="text-slate-700">15 июня 2024</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Тип лицензии</dt>
              <dd className="text-slate-700">Коммерческая, многопользовательская</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Регион использования</dt>
              <dd className="text-slate-700">Российская Федерация</dd>
            </div>
          </dl>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCheckUpdates}
            >
              <Icon name="RefreshCw" size={15} className="mr-2" />
              Проверить обновления
            </Button>
          </div>
        </div>

        {/* Activate License Key */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="Key" size={18} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Активация лицензии</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Введите ключ лицензии для активации нового тарифа или расширения функциональности.
          </p>
          <div className="space-y-3">
            <Input
              placeholder="HVAC-XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Button className="w-full" onClick={handleActivateKey}>
              <Icon name="Unlock" size={15} className="mr-2" />
              Активировать ключ
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3 font-medium">Быстрые ссылки</p>
            <div className="space-y-2">
              {[
                { icon: 'HeadphonesIcon', label: 'Связаться с поддержкой' },
                { icon: 'FileText', label: 'Лицензионное соглашение' },
                { icon: 'BookOpen', label: 'Документация' },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  onClick={() => toast.info(`${label}...`)}
                >
                  <Icon name={icon as any} size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensingFull;
