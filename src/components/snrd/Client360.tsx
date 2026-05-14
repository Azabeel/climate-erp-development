import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface Client360Props {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Demo data (same for any clientId)
// ─────────────────────────────────────────────

const CLIENT_INFO = {
  name: 'ТЦ «Мега»',
  inn: '7701234567',
  type: 'Юридическое лицо',
  contactPerson: 'Смирнова Ольга Владимировна',
  phone: '+7 (495) 123-45-67',
  email: 'o.smirnova@mega-tc.ru',
  address: 'г. Москва, ул. Ленина, 45',
  healthScore: 82,
  contract: '№ ДО-2024-0042 от 01.03.2024',
  sla: 'Корпоративный SLA — TTR 4ч, TTO 2ч',
  totalOrders: 47,
  avgRating: 4.8,
  totalRevenue: '1 240 500 ₽',
};

const EQUIPMENT = [
  { id: 'eq1', brand: 'Daikin',      model: 'PUHY-P300YNW', serial: 'SN2021030401', installed: '15.03.2021', lastService: '10.02.2026', nextService: '10.05.2026', status: 'ok' },
  { id: 'eq2', brand: 'Mitsubishi',  model: 'FDT224KXZE6',  serial: 'SN2020110201', installed: '20.11.2020', lastService: '05.01.2026', nextService: '05.04.2026', status: 'warning' },
  { id: 'eq3', brand: 'Daikin',      model: 'RZQSG71L3V1',  serial: 'SN2022060103', installed: '10.06.2022', lastService: '18.03.2026', nextService: '18.06.2026', status: 'ok' },
  { id: 'eq4', brand: 'LG',          model: 'ARUN100GSS4',  serial: 'SN2019040501', installed: '05.04.2019', lastService: '22.12.2025', nextService: '22.03.2026', status: 'overdue' },
  { id: 'eq5', brand: 'Gree',        model: 'GMV-1000WM/B', serial: 'SN2023020201', installed: '14.02.2023', lastService: '01.04.2026', nextService: '01.07.2026', status: 'ok' },
  { id: 'eq6', brand: 'Carrier',     model: '30HXC-200',    serial: 'SN2018091501', installed: '20.09.2018', lastService: '30.11.2025', nextService: '28.02.2026', status: 'overdue' },
];

const WORK_ORDER_HISTORY = [
  { id: 'woh1', number: 'WO-2026-000121', date: '11.05.2026', type: 'Ремонт',      engineer: 'Иванов А.В.',  status: 'in_progress', amount: '18 500 ₽' },
  { id: 'woh2', number: 'WO-2026-000108', date: '10.04.2026', type: 'ТО',          engineer: 'Петров С.М.', status: 'completed',   amount: '8 200 ₽' },
  { id: 'woh3', number: 'WO-2026-000095', date: '22.03.2026', type: 'Диагностика', engineer: 'Козлов Д.Р.', status: 'completed',   amount: '3 800 ₽' },
  { id: 'woh4', number: 'WO-2026-000081', date: '05.03.2026', type: 'Ремонт',      engineer: 'Иванов А.В.',  status: 'completed',   amount: '24 700 ₽' },
  { id: 'woh5', number: 'WO-2026-000067', date: '14.02.2026', type: 'ТО',          engineer: 'Новиков П.А.', status: 'completed',   amount: '8 200 ₽' },
  { id: 'woh6', number: 'WO-2026-000053', date: '28.01.2026', type: 'Установка',   engineer: 'Волков А.С.',  status: 'completed',   amount: '45 000 ₽' },
  { id: 'woh7', number: 'WO-2026-000039', date: '10.01.2026', type: 'Ремонт',      engineer: 'Петров С.М.', status: 'completed',   amount: '12 300 ₽' },
  { id: 'woh8', number: 'WO-2025-000412', date: '18.12.2025', type: 'Диагностика', engineer: 'Козлов Д.Р.', status: 'completed',   amount: '3 800 ₽' },
];

const MONTHLY_REVENUE = [
  { month: 'Дек', value: 38000 },
  { month: 'Янв', value: 12300 },
  { month: 'Фев', value: 8200 },
  { month: 'Мар', value: 28500 },
  { month: 'Апр', value: 8200 },
  { month: 'Май', value: 18500 },
];

const INVOICES = [
  { id: 'inv1', number: 'СЧ-2026-0085', date: '11.05.2026', amount: '18 500 ₽', status: 'unpaid' },
  { id: 'inv2', number: 'СЧ-2026-0061', date: '10.04.2026', amount: '8 200 ₽',  status: 'paid' },
  { id: 'inv3', number: 'СЧ-2026-0042', date: '05.03.2026', amount: '24 700 ₽', status: 'paid' },
  { id: 'inv4', number: 'СЧ-2026-0018', date: '28.01.2026', amount: '45 000 ₽', status: 'overdue' },
];

const CONTACTS = [
  { id: 'c1', name: 'Смирнова Ольга Владимировна', role: 'Главный инженер',    phone: '+7 (495) 123-45-67', email: 'o.smirnova@mega-tc.ru',    telegram: '@o_smirnova' },
  { id: 'c2', name: 'Беляев Андрей Сергеевич',     role: 'Директор по АХЧ',  phone: '+7 (495) 123-45-68', email: 'a.belyaev@mega-tc.ru',     telegram: '@belyaev_as' },
  { id: 'c3', name: 'Круглова Наталья Петровна',   role: 'Бухгалтер',         phone: '+7 (495) 123-45-69', email: 'n.kruglova@mega-tc.ru',    telegram: '' },
  { id: 'c4', name: 'Охрана (дежурный)',            role: 'Пропуск',           phone: '+7 (495) 123-45-00', email: '',                         telegram: '' },
];

const DOCUMENTS = [
  { id: 'd1', name: 'Договор на обслуживание № ДО-2024-0042', type: 'PDF', size: '342 КБ', date: '01.03.2024' },
  { id: 'd2', name: 'Приложение к договору — перечень оборудования', type: 'PDF', size: '128 КБ', date: '01.03.2024' },
  { id: 'd3', name: 'SLA-соглашение № СЛА-2024-0042', type: 'PDF', size: '215 КБ', date: '01.03.2024' },
  { id: 'd4', name: 'Акт № АКТ-2026-0081 от 05.03.2026', type: 'PDF', size: '98 КБ', date: '05.03.2026' },
  { id: 'd5', name: 'Акт № АКТ-2026-0053 от 28.01.2026', type: 'PDF', size: '104 КБ', date: '28.01.2026' },
  { id: 'd6', name: 'Счёт № СЧ-2026-0085 от 11.05.2026', type: 'PDF', size: '67 КБ', date: '11.05.2026' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function HealthScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = score >= 70 ? 'bg-green-100' : score >= 40 ? 'bg-yellow-100' : 'bg-red-100';
  const label = score >= 70 ? 'Хорошо' : score >= 40 ? 'Внимание' : 'Критично';
  const strokeColor = score >= 70 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#dc2626';

  // Simple SVG arc gauge
  const radius = 36;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;

  return (
    <div className={`rounded-xl p-4 ${bgColor} flex flex-col items-center`}>
      <svg width="100" height="60" viewBox="0 0 100 60">
        {/* Background arc */}
        <path
          d="M 8 54 A 42 42 0 0 1 92 54"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 8 54 A 42 42 0 0 1 92 54"
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 131} 131`}
        />
        <text x="50" y="54" textAnchor="middle" className="text-lg font-bold" style={{ fontSize: 18, fontWeight: 700, fill: strokeColor }}>
          {score}
        </text>
      </svg>
      <div className={`text-sm font-semibold ${color}`}>{label}</div>
      <div className="text-xs text-gray-500">Индекс здоровья клиента</div>
    </div>
  );
}

function MiniBarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map(d => (
        <div key={d.month} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-blue-400 rounded-t"
            style={{ height: `${(d.value / max) * 72}px` }}
            title={`${d.month}: ${d.value.toLocaleString('ru-RU')} ₽`}
          />
          <div className="text-[10px] text-gray-500 mt-1">{d.month}</div>
        </div>
      ))}
    </div>
  );
}

const WO_STATUS_LABELS: Record<string, string> = {
  in_progress: 'Выполняется',
  completed:   'Завершён',
  assigned:    'Назначен',
  cancelled:   'Отменён',
};

const WO_STATUS_VARIANTS: Record<string, string> = {
  in_progress: 'bg-green-100 text-green-700',
  completed:   'bg-gray-100 text-gray-600',
  assigned:    'bg-blue-100 text-blue-700',
  cancelled:   'bg-red-100 text-red-600',
};

const EQ_STATUS_LABELS: Record<string, string> = {
  ok:      'В норме',
  warning: 'Внимание',
  overdue: 'Просрочено',
};

const EQ_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ok:      'default',
  warning: 'secondary',
  overdue: 'destructive',
};

const INV_STATUS_LABELS: Record<string, string> = {
  paid:    'Оплачен',
  unpaid:  'К оплате',
  overdue: 'Просрочен',
};

const INV_STATUS_COLORS: Record<string, string> = {
  paid:    'bg-green-100 text-green-700',
  unpaid:  'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function Client360({ clientName, onClose }: Client360Props) {
  const [activeTab, setActiveTab] = useState('overview');

  // Use clientName if available, fall back to demo
  const displayName = clientName || CLIENT_INFO.name;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {displayName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <div className="text-sm text-gray-500">{CLIENT_INFO.inn} · {CLIENT_INFO.type}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Icon name="Edit" size={14} className="mr-1" />
              Редактировать
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={18} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 mb-0 flex-shrink-0 w-auto justify-start">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="equipment">Оборудование</TabsTrigger>
            <TabsTrigger value="history">История нарядов</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto px-6 py-4">
            {/* ── ОБЗОР ── */}
            <TabsContent value="overview" className="m-0">
              <div className="grid grid-cols-3 gap-4">
                {/* Left: client card */}
                <div className="col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon name="Building2" size={16} />
                        Реквизиты и контакт
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div><span className="text-gray-500">Контактное лицо: </span><span className="font-medium">{CLIENT_INFO.contactPerson}</span></div>
                      <div><span className="text-gray-500">Телефон: </span><span className="font-medium">{CLIENT_INFO.phone}</span></div>
                      <div><span className="text-gray-500">Email: </span><span className="font-medium">{CLIENT_INFO.email}</span></div>
                      <div><span className="text-gray-500">ИНН: </span><span className="font-medium">{CLIENT_INFO.inn}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Адрес: </span><span className="font-medium">{CLIENT_INFO.address}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Договор: </span><span className="font-medium">{CLIENT_INFO.contract}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">SLA: </span><span className="font-medium">{CLIENT_INFO.sla}</span></div>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="text-center py-3">
                      <div className="text-2xl font-bold text-blue-600">{CLIENT_INFO.totalOrders}</div>
                      <div className="text-xs text-gray-500">Нарядов всего</div>
                    </Card>
                    <Card className="text-center py-3">
                      <div className="text-2xl font-bold text-yellow-500">★ {CLIENT_INFO.avgRating}</div>
                      <div className="text-xs text-gray-500">Средняя оценка</div>
                    </Card>
                    <Card className="text-center py-3">
                      <div className="text-xl font-bold text-green-600">{CLIENT_INFO.totalRevenue}</div>
                      <div className="text-xs text-gray-500">Выручка</div>
                    </Card>
                  </div>
                </div>

                {/* Right: health score */}
                <div className="space-y-4">
                  <HealthScoreGauge score={CLIENT_INFO.healthScore} />
                  <Card className="p-3">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Факторы здоровья</div>
                    {[
                      { label: 'Регулярность оплаты', value: 90 },
                      { label: 'Наличие договора', value: 100 },
                      { label: 'Активность', value: 75 },
                      { label: 'Оценки', value: 96 },
                    ].map(f => (
                      <div key={f.label} className="mb-1.5">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{f.label}</span>
                          <span className="font-medium">{f.value}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              f.value >= 80 ? 'bg-green-400' : f.value >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${f.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ── ОБОРУДОВАНИЕ ── */}
            <TabsContent value="equipment" className="m-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Wrench" size={16} />
                    Оборудование клиента ({EQUIPMENT.length} ед.)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Бренд / Модель</TableHead>
                        <TableHead>Серийный №</TableHead>
                        <TableHead>Установлен</TableHead>
                        <TableHead>Последнее ТО</TableHead>
                        <TableHead>Следующее ТО</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {EQUIPMENT.map(eq => (
                        <TableRow key={eq.id}>
                          <TableCell>
                            <div className="font-medium">{eq.brand}</div>
                            <div className="text-xs text-gray-500">{eq.model}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{eq.serial}</TableCell>
                          <TableCell className="text-sm">{eq.installed}</TableCell>
                          <TableCell className="text-sm">{eq.lastService}</TableCell>
                          <TableCell className="text-sm">{eq.nextService}</TableCell>
                          <TableCell>
                            <Badge variant={EQ_STATUS_VARIANTS[eq.status]}>
                              {EQ_STATUS_LABELS[eq.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ИСТОРИЯ НАРЯДОВ ── */}
            <TabsContent value="history" className="m-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="History" size={16} />
                    Последние наряды
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номер</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Инженер</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {WORK_ORDER_HISTORY.map(wo => (
                        <TableRow key={wo.id}>
                          <TableCell className="font-mono text-xs">{wo.number}</TableCell>
                          <TableCell className="text-sm">{wo.date}</TableCell>
                          <TableCell className="text-sm">{wo.type}</TableCell>
                          <TableCell className="text-sm">{wo.engineer}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WO_STATUS_COLORS[wo.status] ?? ''}`}>
                              {WO_STATUS_LABELS[wo.status] ?? wo.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{wo.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ФИНАНСЫ ── */}
            <TabsContent value="finance" className="m-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 grid grid-cols-3 gap-3">
                  <Card className="text-center py-3">
                    <div className="text-xl font-bold text-green-600">1 124 900 ₽</div>
                    <div className="text-xs text-gray-500">Оплачено всего</div>
                  </Card>
                  <Card className="text-center py-3">
                    <div className="text-xl font-bold text-red-500">63 500 ₽</div>
                    <div className="text-xs text-gray-500">Дебиторская задолженность</div>
                  </Card>
                  <Card className="text-center py-3">
                    <div className="text-xl font-bold text-blue-600">26 дней</div>
                    <div className="text-xs text-gray-500">Ср. срок оплаты</div>
                  </Card>
                </div>

                <Card className="col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon name="BarChart2" size={16} />
                      Выручка по месяцам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MiniBarChart data={MONTHLY_REVENUE} />
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon name="Receipt" size={16} />
                      Счета
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Номер счёта</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead className="text-right">Сумма</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {INVOICES.map(inv => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-xs">{inv.number}</TableCell>
                            <TableCell className="text-sm">{inv.date}</TableCell>
                            <TableCell className="text-right font-medium">{inv.amount}</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INV_STATUS_COLORS[inv.status]}`}>
                                {INV_STATUS_LABELS[inv.status]}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                <Icon name="Download" size={12} className="mr-1" />
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── КОНТАКТЫ ── */}
            <TabsContent value="contacts" className="m-0">
              <div className="grid grid-cols-2 gap-3">
                {CONTACTS.map(c => (
                  <Card key={c.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{c.name}</div>
                        <div className="text-xs text-gray-500 mb-2">{c.role}</div>
                        {c.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <Icon name="Phone" size={12} />
                            {c.phone}
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <Icon name="Mail" size={12} />
                            {c.email}
                          </div>
                        )}
                        {c.telegram && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Icon name="MessageCircle" size={12} />
                            {c.telegram}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── ДОКУМЕНТЫ ── */}
            <TabsContent value="documents" className="m-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="FolderOpen" size={16} />
                    Документы клиента
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {DOCUMENTS.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="FileText" size={16} className="text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                          <div className="text-xs text-gray-400">{doc.type} · {doc.size} · {doc.date}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Icon name="Download" size={12} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Fix missing reference
const WO_STATUS_COLORS: Record<string, string> = WO_STATUS_VARIANTS;
