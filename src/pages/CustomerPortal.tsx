import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type TabKey =
  | 'home'
  | 'orders'
  | 'equipment'
  | 'invoices'
  | 'documents'
  | 'contracts'
  | 'help';

interface MenuItem {
  key: TabKey;
  label: string;
  icon: string;
}

const MENU: MenuItem[] = [
  { key: 'home', label: 'Главная', icon: 'Home' },
  { key: 'orders', label: 'Мои заявки', icon: 'ClipboardList' },
  { key: 'equipment', label: 'Оборудование', icon: 'Wind' },
  { key: 'invoices', label: 'Счета и оплата', icon: 'CreditCard' },
  { key: 'documents', label: 'Документы', icon: 'FileText' },
  { key: 'contracts', label: 'Договоры', icon: 'FileCheck' },
  { key: 'help', label: 'Помощь', icon: 'HelpCircle' },
];

const ORDERS = [
  { id: 'WO-2026-001247', date: '12.05.2026', object: 'ТЦ Глобус, г. Москва', type: 'Аварийный ремонт', status: 'В работе' },
  { id: 'WO-2026-001198', date: '08.05.2026', object: 'Склад №3, Подольск', type: 'Плановое ТО', status: 'Назначен инженер' },
  { id: 'WO-2026-001102', date: '28.04.2026', object: 'Офис, Тверская 17', type: 'Диагностика', status: 'Завершён' },
  { id: 'WO-2026-001045', date: '15.04.2026', object: 'ТЦ Глобус, г. Москва', type: 'Замена компрессора', status: 'Завершён' },
  { id: 'WO-2026-000987', date: '02.04.2026', object: 'Склад №3, Подольск', type: 'Дозаправка хладагентом', status: 'Завершён' },
  { id: 'WO-2026-000912', date: '20.03.2026', object: 'Офис, Тверская 17', type: 'Чистка фильтров', status: 'Завершён' },
  { id: 'WO-2026-000854', date: '11.03.2026', object: 'ТЦ Глобус, г. Москва', type: 'Плановое ТО', status: 'Завершён' },
  { id: 'WO-2026-000789', date: '25.02.2026', object: 'Склад №3, Подольск', type: 'Ремонт VRF', status: 'Завершён' },
];

const EQUIPMENT = [
  { id: 1, model: 'Daikin VRV IV-S RXYSQ8TY1', location: 'ТЦ Глобус, кровля', status: 'Работает', lastMaint: '12.04.2026', photo: 'Wind' },
  { id: 2, model: 'Mitsubishi PUHZ-ZRP140YKA', location: 'ТЦ Глобус, торговый зал', status: 'Работает', lastMaint: '02.04.2026', photo: 'Wind' },
  { id: 3, model: 'Hitachi RAS-3HVRC2', location: 'Склад №3, секция А', status: 'Требует ТО', lastMaint: '15.01.2026', photo: 'Wind' },
  { id: 4, model: 'Carrier 38VYX080', location: 'Офис Тверская, этаж 4', status: 'Работает', lastMaint: '20.03.2026', photo: 'Wind' },
  { id: 5, model: 'LG Multi V S ARUM100LTE5', location: 'Офис Тверская, серверная', status: 'В ремонте', lastMaint: '28.04.2026', photo: 'Wind' },
  { id: 6, model: 'Samsung AM080FXVAGH', location: 'ТЦ Глобус, продуктовый', status: 'Работает', lastMaint: '11.03.2026', photo: 'Wind' },
];

const INVOICES = [
  { id: 'INV-2026-0512', date: '10.05.2026', amount: 47500, status: 'Ожидает', due: '25.05.2026' },
  { id: 'INV-2026-0489', date: '02.05.2026', amount: 128400, status: 'Оплачен', due: '15.05.2026' },
  { id: 'INV-2026-0445', date: '20.04.2026', amount: 32100, status: 'Оплачен', due: '05.05.2026' },
  { id: 'INV-2026-0398', date: '08.04.2026', amount: 89700, status: 'Оплачен', due: '23.04.2026' },
  { id: 'INV-2026-0352', date: '25.03.2026', amount: 15600, status: 'Оплачен', due: '09.04.2026' },
  { id: 'INV-2026-0301', date: '12.03.2026', amount: 67800, status: 'Оплачен', due: '27.03.2026' },
  { id: 'INV-2026-0254', date: '28.02.2026', amount: 41200, status: 'Просрочен', due: '15.03.2026' },
  { id: 'INV-2026-0198', date: '14.02.2026', amount: 92300, status: 'Оплачен', due: '01.03.2026' },
];

const DOCUMENTS = [
  { name: 'Акт выполненных работ WO-2026-001102.pdf', date: '28.04.2026', size: '342 КБ' },
  { name: 'Счёт-фактура INV-2026-0489.pdf', date: '02.05.2026', size: '128 КБ' },
  { name: 'Паспорт оборудования Daikin VRV IV-S.pdf', date: '15.03.2026', size: '1.2 МБ' },
  { name: 'Сертификат сервисных работ.pdf', date: '28.04.2026', size: '256 КБ' },
  { name: 'Отчёт о замерах хладагента R-410A.pdf', date: '20.04.2026', size: '512 КБ' },
  { name: 'Гарантийный талон Mitsubishi PUHZ.pdf', date: '02.04.2026', size: '189 КБ' },
  { name: 'Спецификация ЗИП INV-2026-0445.xlsx', date: '20.04.2026', size: '76 КБ' },
  { name: 'Договор сервисного обслуживания №2025-118.pdf', date: '15.01.2026', size: '845 КБ' },
  { name: 'Дополнительное соглашение №1.pdf', date: '01.03.2026', size: '234 КБ' },
  { name: 'График ППР на 2026 год.pdf', date: '10.01.2026', size: '198 КБ' },
];

const ACTIVITY = [
  { time: '10:42', text: 'Инженер Петров А.В. прибыл на объект ТЦ Глобус', icon: 'MapPin' },
  { time: '09:15', text: 'Создана заявка WO-2026-001247 — Аварийный ремонт', icon: 'Plus' },
  { time: 'Вчера', text: 'Получен акт выполненных работ WO-2026-001198', icon: 'FileCheck' },
  { time: '2 дня назад', text: 'Оплачен счёт INV-2026-0489 на сумму 128 400 ₽', icon: 'CreditCard' },
  { time: '3 дня назад', text: 'Запланирован визит на 12.05.2026 — Плановое ТО', icon: 'Calendar' },
];

const statusColor = (s: string) => {
  if (s === 'Завершён' || s === 'Оплачен' || s === 'Работает') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'В работе' || s === 'Назначен инженер' || s === 'Ожидает') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'Просрочен' || s === 'В ремонте') return 'bg-red-100 text-red-700 border-red-200';
  if (s === 'Требует ТО') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const CustomerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [equipmentModal, setEquipmentModal] = useState<typeof EQUIPMENT[0] | null>(null);

  const filteredOrders = statusFilter === 'all' ? ORDERS : ORDERS.filter(o => o.status === statusFilter);

  const renderHome = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Активных заявок', value: '2', icon: 'ClipboardList', color: 'blue' },
          { label: 'Оборудования', value: '15', icon: 'Wind', color: 'cyan' },
          { label: 'Открытых счетов', value: '1', icon: 'CreditCard', color: 'amber' },
          { label: 'Health Score', value: '87', icon: 'Activity', color: 'green' },
        ].map((kpi, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">{kpi.label}</div>
                  <div className="text-3xl font-bold mt-2">{kpi.value}</div>
                </div>
                <div className={`p-2 rounded-lg bg-${kpi.color}-50`}>
                  <Icon name={kpi.icon} className={`w-6 h-6 text-${kpi.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Нужен сервис?</div>
            <div className="text-blue-100 mt-1">Создайте заявку — диспетчер свяжется с вами в течение 15 минут</div>
          </div>
          <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => setNewOrderOpen(true)}>
            <Icon name="Plus" className="w-5 h-5 mr-2" />
            Создать заявку
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Текущая заявка WO-2026-001247</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 mb-1">Аварийный ремонт · ТЦ Глобус, г. Москва</div>
            <div className="text-sm mb-4">Инженер: <strong>Петров А.В.</strong> · ETA: 12:30</div>

            <div className="space-y-3">
              {[
                { label: 'Заявка создана', time: '09:15', done: true },
                { label: 'Инженер назначен', time: '09:42', done: true },
                { label: 'Инженер в пути', time: '10:15', done: true },
                { label: 'Инженер на объекте', time: '10:42', done: true, current: true },
                { label: 'Работы выполнены', time: '—', done: false },
                { label: 'Подписан акт', time: '—', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.current ? 'bg-blue-600 text-white' : step.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.done ? <Icon name="Check" className="w-4 h-4" /> : <span className="text-xs">{i+1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${step.current ? 'font-semibold' : ''}`}>{step.label}</div>
                  </div>
                  <div className="text-xs text-gray-500">{step.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ACTIVITY.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon name={act.icon} className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{act.text}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrders = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Мои заявки</CardTitle>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="В работе">В работе</SelectItem>
                <SelectItem value="Назначен инженер">Назначен инженер</SelectItem>
                <SelectItem value="Завершён">Завершён</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setNewOrderOpen(true)}>
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Создать заявку
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Объект</TableHead>
              <TableHead>Тип работ</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-sm">{o.id}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>{o.object}</TableCell>
                <TableCell>{o.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor(o.status)}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Открываю заявку ${o.id}`)}>
                    <Icon name="Eye" className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Отслеживание инженера')}>
                    <Icon name="MapPin" className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderEquipment = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Моё оборудование (15)</h3>
        <Button variant="outline" onClick={() => toast.info('Откроется камера для сканирования QR')}>
          <Icon name="QrCode" className="w-4 h-4 mr-2" />
          Сканировать QR
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {EQUIPMENT.map(eq => (
          <Card key={eq.id} className="shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setEquipmentModal(eq)}>
            <CardContent className="p-4">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg mb-3 flex items-center justify-center">
                <Icon name={eq.photo} className="w-16 h-16 text-blue-400" />
              </div>
              <div className="font-semibold text-sm mb-1">{eq.model}</div>
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Icon name="MapPin" className="w-3 h-3" />
                {eq.location}
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={statusColor(eq.status)}>{eq.status}</Badge>
                <span className="text-xs text-gray-500">ТО: {eq.lastMaint}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border-amber-300 bg-amber-50">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-amber-700">К оплате</div>
            <div className="text-3xl font-bold text-amber-900 mt-1">47 500 ₽</div>
            <div className="text-sm text-amber-800 mt-1">Срок оплаты: до 25.05.2026 · INV-2026-0512</div>
          </div>
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700" onClick={() => toast.success('Переход к оплате')}>
            <Icon name="CreditCard" className="w-5 h-5 mr-2" />
            Оплатить онлайн
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>История счетов</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Срок оплаты</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.due}</TableCell>
                  <TableCell className="text-right font-semibold">{inv.amount.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(inv.status)}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Загрузка ${inv.id}.pdf`)}>
                      <Icon name="Download" className="w-4 h-4" />
                    </Button>
                    {inv.status !== 'Оплачен' && (
                      <Button variant="ghost" size="sm" onClick={() => toast.success('Переход к оплате')}>
                        <Icon name="CreditCard" className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Сохранённые способы оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: 'Visa', last4: '4521', exp: '08/27', icon: 'CreditCard' },
              { type: 'МИР', last4: '8830', exp: '12/26', icon: 'CreditCard' },
              { type: 'Расчётный счёт', last4: '40702', exp: 'Сбербанк', icon: 'Building' },
            ].map((pm, i) => (
              <div key={i} className="border rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon name={pm.icon} className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">{pm.type}</div>
                  <div className="text-sm text-gray-500">•••• {pm.last4} · {pm.exp}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Документы</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {DOCUMENTS.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon name="FileText" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{doc.name}</div>
                  <div className="text-xs text-gray-500">{doc.date} · {doc.size}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.success(`Загрузка ${doc.name}`)}>
                <Icon name="Download" className="w-4 h-4 mr-2" />
                Скачать
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderContracts = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          num: '№2025-118 от 15.01.2025',
          title: 'Договор сервисного обслуживания',
          term: 'до 15.01.2027',
          sla: 'TTR: 4 часа · TTO: 2 часа',
          sum: '1 250 000 ₽/год',
          objects: '3 объекта · 15 ед. оборудования',
        },
        {
          num: '№2025-203/ДС от 01.03.2026',
          title: 'Доп. соглашение — Аварийное обслуживание 24/7',
          term: 'до 15.01.2027',
          sla: 'TTR: 2 часа · 24/7',
          sum: '380 000 ₽/год',
          objects: 'ТЦ Глобус — критичное оборудование',
        },
      ].map((c, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <div className="text-sm text-gray-500 mt-1">{c.num}</div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Действует</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Срок действия</span>
              <span className="font-medium">{c.term}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">SLA</span>
              <span className="font-medium">{c.sla}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Стоимость</span>
              <span className="font-medium">{c.sum}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Покрытие</span>
              <span className="font-medium">{c.objects}</span>
            </div>
            <Button variant="outline" className="w-full mt-2">
              <Icon name="Download" className="w-4 h-4 mr-2" />
              Скачать договор
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderHelp = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Помощь и поддержка</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 flex items-center gap-3">
            <Icon name="Phone" className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-500">Горячая линия 24/7</div>
              <div className="font-semibold">+7 (495) 123-45-67</div>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-3">
            <Icon name="Mail" className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-500">Email поддержки</div>
              <div className="font-semibold">support@servisklimat.ru</div>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Часто задаваемые вопросы</div>
          <ul className="space-y-2 text-sm">
            <li>• Как создать аварийную заявку?</li>
            <li>• Где посмотреть статус инженера в реальном времени?</li>
            <li>• Как оплатить счёт онлайн?</li>
            <li>• Как добавить новое оборудование в личный кабинет?</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'orders': return renderOrders();
      case 'equipment': return renderEquipment();
      case 'invoices': return renderInvoices();
      case 'documents': return renderDocuments();
      case 'contracts': return renderContracts();
      case 'help': return renderHelp();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Wind" className="w-8 h-8" />
            <div>
              <div className="text-xs text-blue-100">Личный кабинет</div>
              <div className="text-lg font-semibold">ООО «Торговый дом Глобус»</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-500">
              <Icon name="Bell" className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-blue-500 rounded-lg p-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">Сидоров А.П.</div>
                    <div className="text-xs text-blue-100">Гл. инженер</div>
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-white text-blue-700">СА</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Icon name="User" className="w-4 h-4 mr-2" />Профиль</DropdownMenuItem>
                <DropdownMenuItem><Icon name="Settings" className="w-4 h-4 mr-2" />Настройки</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600"><Icon name="LogOut" className="w-4 h-4 mr-2" />Выйти</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r min-h-[calc(100vh-72px)] p-4">
          <nav className="space-y-1">
            {MENU.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  activeTab === item.key
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* New Order Dialog */}
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать заявку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Объект</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Выберите объект" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ТЦ Глобус, г. Москва</SelectItem>
                  <SelectItem value="2">Склад №3, Подольск</SelectItem>
                  <SelectItem value="3">Офис, Тверская 17</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Тип работ</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Аварийный ремонт</SelectItem>
                  <SelectItem value="maintenance">Плановое ТО</SelectItem>
                  <SelectItem value="diag">Диагностика</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Описание проблемы</Label>
              <Textarea placeholder="Опишите проблему..." rows={4} />
            </div>
            <div>
              <Label>Контактное лицо на объекте</Label>
              <Input placeholder="ФИО и телефон" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOrderOpen(false)}>Отмена</Button>
            <Button onClick={() => { toast.success('Заявка создана'); setNewOrderOpen(false); }}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Modal */}
      <Dialog open={!!equipmentModal} onOpenChange={() => setEquipmentModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Паспорт оборудования</DialogTitle>
          </DialogHeader>
          {equipmentModal && (
            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                <Icon name="Wind" className="w-24 h-24 text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Модель</div>
                  <div className="font-semibold">{equipmentModal.model}</div>
                </div>
                <div>
                  <div className="text-gray-500">Расположение</div>
                  <div className="font-semibold">{equipmentModal.location}</div>
                </div>
                <div>
                  <div className="text-gray-500">Статус</div>
                  <Badge variant="outline" className={statusColor(equipmentModal.status)}>{equipmentModal.status}</Badge>
                </div>
                <div>
                  <div className="text-gray-500">Последнее ТО</div>
                  <div className="font-semibold">{equipmentModal.lastMaint}</div>
                </div>
                <div>
                  <div className="text-gray-500">Хладагент</div>
                  <div className="font-semibold">R-410A · 2.5 кг</div>
                </div>
                <div>
                  <div className="text-gray-500">Гарантия</div>
                  <div className="font-semibold">до 15.03.2028</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">История обслуживания</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 border rounded">
                    <span>Плановое ТО</span><span className="text-gray-500">12.04.2026</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Дозаправка хладагентом</span><span className="text-gray-500">02.04.2026</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Замена фильтров</span><span className="text-gray-500">15.01.2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPortal;
