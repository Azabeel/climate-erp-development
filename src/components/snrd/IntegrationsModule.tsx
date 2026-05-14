import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Integration = {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  lastSync: string;
  extra?: string;
};

const messengers: Integration[] = [
  { id: 'telegram', name: 'Telegram Bot', icon: 'Send', description: 'Приём заявок и уведомления через Telegram', connected: true, lastSync: '14.05.2026 10:47', extra: '@ServisKlimat_bot' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: 'MessageCircle', description: 'WhatsApp Business API — клиентские чаты', connected: true, lastSync: '14.05.2026 10:30' },
  { id: 'avito', name: 'Avito Messenger', icon: 'ShoppingBag', description: 'Мультиаккаунт Avito — входящие обращения', connected: false, lastSync: 'Не подключено' },
  { id: 'max', name: 'MAX', icon: 'Zap', description: 'Мессенджер MAX (ВКонтакте) — чаты', connected: false, lastSync: 'Не подключено' },
];

const accounting: Integration[] = [
  { id: '1c', name: '1С:УНФ', icon: 'Database', description: 'Синхронизация справочников, передача документов', connected: true, lastSync: '14.05.2026 10:00' },
  { id: 'sbis', name: 'СБИС', icon: 'FileCheck', description: 'Электронный документооборот (ЭДО)', connected: false, lastSync: 'Не подключено' },
];

const delivery: Integration[] = [
  { id: 'cdek', name: 'СДЭК', icon: 'Truck', description: 'Трекинг посылок и заказ доставки ЗИП', connected: true, lastSync: '14.05.2026 08:00' },
  { id: 'delovye', name: 'Деловые Линии', icon: 'Package', description: 'Отслеживание грузов от поставщиков', connected: true, lastSync: '14.05.2026 08:00' },
  { id: 'pochta', name: 'Почта России', icon: 'Mail', description: 'Трекинг почтовых отправлений', connected: false, lastSync: 'Не подключено' },
];

const communications: Integration[] = [
  { id: 'email', name: 'Email (IMAP/SMTP)', icon: 'AtSign', description: 'Корпоративная почта — входящие заявки и уведомления', connected: true, lastSync: '14.05.2026 10:45', extra: 'info@servis-klimat.ru' },
  { id: 'telephony', name: 'IP-телефония Mango', icon: 'Phone', description: 'Фиксация звонков, создание карточек клиентов', connected: true, lastSync: '14.05.2026 09:55' },
];

const webhookLog = [
  { date: '14.05.2026 10:47', integration: 'Telegram Bot', event: 'incoming_message', status: 'Успешно', data: '{"chat_id":"102938","text":"Добрый день, нужен ремонт..."}' },
  { date: '14.05.2026 10:30', integration: 'WhatsApp Business', event: 'message_status', status: 'Успешно', data: '{"wa_id":"+79001234567","status":"delivered"}' },
  { date: '14.05.2026 10:00', integration: '1С:УНФ', event: 'catalog_sync', status: 'Успешно', data: '{"items_updated":47,"items_added":3}' },
  { date: '14.05.2026 09:55', integration: 'Mango Office', event: 'call_finished', status: 'Успешно', data: '{"caller":"+79161234567","duration":"02:34"}' },
  { date: '14.05.2026 08:00', integration: 'СДЭК', event: 'tracking_update', status: 'Успешно', data: '{"track":"1023847562","status":"В пути"}' },
  { date: '14.05.2026 07:30', integration: 'Email', event: 'new_ticket', status: 'Ошибка', data: '{"error":"IMAP connection timeout","retry":true}' },
];

const IntegrationCard = ({ item }: { item: Integration }) => (
  <div className={`flex items-start gap-3 p-4 rounded-xl border ${
    item.connected ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'
  }`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
      item.connected ? 'bg-blue-100' : 'bg-gray-100'
    }`}>
      <Icon name={item.icon as never} size={20} className={item.connected ? 'text-blue-600' : 'text-gray-400'} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900 text-sm">{item.name}</span>
        <Badge className={item.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
          {item.connected ? 'Подключено' : 'Отключено'}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      {item.extra && <p className="text-xs text-blue-600 mt-0.5">{item.extra}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          <Icon name="Clock" size={11} className="inline mr-1" />
          {item.lastSync}
        </span>
        <Button size="sm" variant={item.connected ? 'outline' : 'default'} className="h-7 text-xs">
          <Icon name={item.connected ? 'Settings' : 'Plug'} size={12} className="mr-1" />
          {item.connected ? 'Настроить' : 'Подключить'}
        </Button>
      </div>
    </div>
  </div>
);

const IntegrationsModule = () => {
  const [search, setSearch] = useState('');

  const allIntegrations = [...messengers, ...accounting, ...delivery, ...communications];
  const connected = allIntegrations.filter(i => i.connected).length;
  const disconnected = allIntegrations.filter(i => !i.connected).length;

  return (
    <div className="p-6 space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Icon name="Plug" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{allIntegrations.length}</p>
                <p className="text-xs text-gray-500">Всего интеграций</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{connected}</p>
                <p className="text-xs text-gray-500">Подключено</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Icon name="XCircle" size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">{disconnected}</p>
                <p className="text-xs text-gray-500">Отключено</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">1</p>
                <p className="text-xs text-gray-500">Ошибок сегодня</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Поиск интеграций..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Messengers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MessageSquare" size={18} className="text-blue-600" />
            Мессенджеры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {messengers.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
              <IntegrationCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accounting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={18} className="text-blue-600" />
            Учётные системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {accounting.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
              <IntegrationCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Truck" size={18} className="text-blue-600" />
            Доставка и трекинг
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {delivery.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
              <IntegrationCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Phone" size={18} className="text-blue-600" />
            Коммуникации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {communications.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
              <IntegrationCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={18} className="text-blue-600" />
            Лог вебхуков
            <Badge className="ml-auto bg-gray-100 text-gray-600">Последние 6 событий</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Интеграция</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Данные</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhookLog.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-gray-500 text-xs whitespace-nowrap">{row.date}</TableCell>
                  <TableCell className="font-medium text-sm">{row.integration}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{row.event}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={row.status === 'Успешно' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-xs text-gray-500 font-mono truncate block">
                      {row.data.length > 50 ? row.data.slice(0, 50) + '...' : row.data}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsModule;
