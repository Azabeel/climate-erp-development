import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import Icon from '@/components/ui/icon';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type AdStatus = 'Активно' | 'На модерации' | 'Приостановлено';
type MsgStatus = 'Новый' | 'Ожидает' | 'Отвечено';

interface AvitoAd {
  id: string;
  title: string;
  service: string;
  price: number;
  views: number;
  contacts: number;
  status: AdStatus;
  color: string;
}

interface AvitoDialog {
  id: string;
  buyer: string;
  initials: string;
  avatarColor: string;
  preview: string;
  time: string;
  status: MsgStatus;
  adTitle: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  from: 'me' | 'buyer';
  text: string;
  time: string;
}

interface NewAdForm {
  title: string;
  service: string;
  price: string;
  description: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const ADS: AvitoAd[] = [
  { id: '1', title: 'Чистка кондиционера — выезд мастера', service: 'Обслуживание', price: 1500, views: 412, contacts: 18, status: 'Активно', color: '#3b82f6' },
  { id: '2', title: 'Заправка кондиционера фреоном R-410A', service: 'Заправка', price: 2200, views: 389, contacts: 15, status: 'Активно', color: '#10b981' },
  { id: '3', title: 'Ремонт кондиционера — диагностика бесплатно', service: 'Ремонт', price: 500, views: 278, contacts: 11, status: 'Активно', color: '#f59e0b' },
  { id: '4', title: 'Монтаж сплит-системы под ключ', service: 'Монтаж', price: 4500, views: 356, contacts: 22, status: 'На модерации', color: '#8b5cf6' },
  { id: '5', title: 'Техническое обслуживание VRF-системы', service: 'ТО', price: 8000, views: 102, contacts: 6, status: 'Активно', color: '#ec4899' },
  { id: '6', title: 'Демонтаж кондиционера с вывозом', service: 'Демонтаж', price: 1200, views: 89, contacts: 3, status: 'Приостановлено', color: '#64748b' },
  { id: '7', title: 'Замена компрессора кондиционера', service: 'Ремонт', price: 6500, views: 201, contacts: 9, status: 'Активно', color: '#0ea5e9' },
  { id: '8', title: 'Проверка и промывка дренажной системы', service: 'Обслуживание', price: 900, views: 143, contacts: 7, status: 'Активно', color: '#14b8a6' },
  { id: '9', title: 'Установка промышленного кондиционера', service: 'Монтаж', price: 15000, views: 67, contacts: 4, status: 'На модерации', color: '#f97316' },
  { id: '10', title: 'Срочный ремонт кондиционера 24/7', service: 'Ремонт', price: 1000, views: 520, contacts: 31, status: 'Активно', color: '#ef4444' },
  { id: '11', title: 'Антибактериальная обработка кондиционера', service: 'Обслуживание', price: 700, views: 198, contacts: 8, status: 'Активно', color: '#a855f7' },
  { id: '12', title: 'Договор на обслуживание офиса', service: 'Контракт', price: 12000, views: 44, contacts: 5, status: 'Активно', color: '#06b6d4' },
];

const DIALOGS: AvitoDialog[] = [
  { id: 'd1', buyer: 'Алексей Петров', initials: 'АП', avatarColor: '#3b82f6', preview: 'Добрый день! Интересует чистка...', time: '10:34', status: 'Новый', adTitle: 'Чистка кондиционера', messages: [
    { id: 'm1', from: 'buyer', text: 'Добрый день! Интересует чистка кондиционера Samsung, модель AR09.', time: '10:30' },
    { id: 'm2', from: 'me', text: 'Здравствуйте! Да, конечно. Когда вам удобно?', time: '10:34' },
  ]},
  { id: 'd2', buyer: 'Мария Соколова', initials: 'МС', avatarColor: '#10b981', preview: 'Сколько стоит заправка R-32?', time: '09:58', status: 'Ожидает', adTitle: 'Заправка фреоном', messages: [
    { id: 'm1', from: 'buyer', text: 'Сколько стоит заправка фреоном R-32? Кондиционер LG 12BTU.', time: '09:58' },
  ]},
  { id: 'd3', buyer: 'ООО Технострой', initials: 'ОТ', avatarColor: '#f59e0b', preview: 'Нас интересует договор на...', time: 'Вчера', status: 'Отвечено', adTitle: 'Договор обслуживания', messages: [
    { id: 'm1', from: 'buyer', text: 'Нас интересует договор на обслуживание 4 офисов.', time: 'Вчера 15:20' },
    { id: 'm2', from: 'me', text: 'Добрый день! Готовы обсудить. Пришлите адреса объектов.', time: 'Вчера 16:05' },
    { id: 'm3', from: 'buyer', text: 'Хорошо, отправим завтра.', time: 'Вчера 16:10' },
  ]},
  { id: 'd4', buyer: 'Игорь Васильев', initials: 'ИВ', avatarColor: '#8b5cf6', preview: 'Есть ли гарантия на монтаж?', time: 'Вчера', status: 'Отвечено', adTitle: 'Монтаж сплит-системы', messages: [
    { id: 'm1', from: 'buyer', text: 'Есть ли гарантия на монтаж?', time: 'Вчера 11:00' },
    { id: 'm2', from: 'me', text: 'Да, даём 2 года на монтажные работы.', time: 'Вчера 11:15' },
  ]},
  { id: 'd5', buyer: 'Наталья Орлова', initials: 'НО', avatarColor: '#ec4899', preview: 'Когда сможете приехать?', time: 'Пн', status: 'Отвечено', adTitle: 'Ремонт кондиционера', messages: [
    { id: 'm1', from: 'buyer', text: 'Кондиционер не охлаждает. Когда сможете приехать?', time: 'Пн 09:00' },
    { id: 'm2', from: 'me', text: 'Сегодня в 14:00 или 17:00 — как удобно?', time: 'Пн 09:20' },
    { id: 'm3', from: 'buyer', text: 'В 14:00 подходит.', time: 'Пн 09:25' },
  ]},
  { id: 'd6', buyer: 'Дмитрий Кузнецов', initials: 'ДК', avatarColor: '#0ea5e9', preview: 'Какой фреон используете?', time: 'Пн', status: 'Новый', adTitle: 'Заправка фреоном', messages: [
    { id: 'm1', from: 'buyer', text: 'Какой фреон используете? Производитель имеет значение?', time: 'Пн 18:44' },
  ]},
  { id: 'd7', buyer: 'Светлана Попова', initials: 'СП', avatarColor: '#14b8a6', preview: 'А скидка есть для пенсионеров?', time: 'Вс', status: 'Отвечено', adTitle: 'Чистка кондиционера', messages: [
    { id: 'm1', from: 'buyer', text: 'А скидка есть для пенсионеров?', time: 'Вс 12:00' },
    { id: 'm2', from: 'me', text: 'Да, 10% скидка по пенсионному удостоверению.', time: 'Вс 12:30' },
  ]},
  { id: 'd8', buyer: 'Андрей Новиков', initials: 'АН', avatarColor: '#f97316', preview: 'Срочно нужен мастер сегодня!', time: 'Вс', status: 'Отвечено', adTitle: 'Срочный ремонт 24/7', messages: [
    { id: 'm1', from: 'buyer', text: 'Срочно нужен мастер сегодня! Кондиционер течёт.', time: 'Вс 08:00' },
    { id: 'm2', from: 'me', text: 'Уже направляем мастера, будет через 40 минут.', time: 'Вс 08:10' },
  ]},
  { id: 'd9', buyer: 'Ирина Морозова', initials: 'ИМ', avatarColor: '#a855f7', preview: 'Что входит в ТО?', time: 'Сб', status: 'Ожидает', adTitle: 'ТО VRF-системы', messages: [
    { id: 'm1', from: 'buyer', text: 'Что конкретно входит в техническое обслуживание VRF?', time: 'Сб 14:00' },
  ]},
  { id: 'd10', buyer: 'Павел Федоров', initials: 'ПФ', avatarColor: '#ef4444', preview: 'Прайс-лист есть?', time: 'Сб', status: 'Отвечено', adTitle: 'Ремонт кондиционера', messages: [
    { id: 'm1', from: 'buyer', text: 'Прайс-лист есть?', time: 'Сб 10:00' },
    { id: 'm2', from: 'me', text: 'Да, отправлю в личные сообщения.', time: 'Сб 10:15' },
  ]},
];

const LINE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  views: Math.floor(60 + Math.random() * 80 + (i > 15 ? 30 : 0)),
  contacts: Math.floor(3 + Math.random() * 10 + (i > 20 ? 5 : 0)),
}));

const BAR_DATA = ADS.slice(0, 8).map(ad => ({
  name: ad.service,
  contacts: ad.contacts,
}));

// ─── Status helpers ───────────────────────────────────────────────────────────

function adStatusVariant(s: AdStatus) {
  if (s === 'Активно') return 'default';
  if (s === 'На модерации') return 'secondary';
  return 'outline';
}

function msgStatusVariant(s: MsgStatus) {
  if (s === 'Новый') return 'destructive';
  if (s === 'Ожидает') return 'secondary';
  return 'outline';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AvitoCRMFull() {
  const [ads, setAds] = useState<AvitoAd[]>(ADS);
  const [dialogs] = useState<AvitoDialog[]>(DIALOGS);
  const [selectedDialog, setSelectedDialog] = useState<AvitoDialog>(DIALOGS[0]);
  const [chatInput, setChatInput] = useState('');
  const [addAdOpen, setAddAdOpen] = useState(false);
  const [newAd, setNewAd] = useState<NewAdForm>({ title: '', service: '', price: '', description: '' });
  const [autoReply, setAutoReply] = useState(true);
  const [autoBoost, setAutoBoost] = useState(false);
  const [replyTemplate, setReplyTemplate] = useState('Здравствуйте! Спасибо за обращение. Наш специалист свяжется с вами в ближайшее время.');
  const [boostSchedule, setBoostSchedule] = useState('morning');
  const [apiKey] = useState('sk-avito-••••••••••••••••3f9a');
  const [region] = useState('Москва');
  const [category] = useState('Ремонт и строительство');

  const activeCount = ads.filter(a => a.status === 'Активно').length;

  function toggleAdStatus(id: string) {
    setAds(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next: AdStatus = a.status === 'Активно' ? 'Приостановлено' : 'Активно';
      toast.success(`Объявление "${a.title.slice(0, 30)}..." — ${next}`);
      return { ...a, status: next };
    }));
  }

  function handleBoost(ad: AvitoAd) {
    toast.success(`Объявление «${ad.title.slice(0, 28)}…» поднято в поиске`);
  }

  function handleEdit(ad: AvitoAd) {
    toast.info(`Редактирование: «${ad.title.slice(0, 28)}…»`);
  }

  function handleAddAd() {
    if (!newAd.title || !newAd.service || !newAd.price) {
      toast.error('Заполните обязательные поля');
      return;
    }
    const created: AvitoAd = {
      id: String(ads.length + 1),
      title: newAd.title,
      service: newAd.service,
      price: Number(newAd.price),
      views: 0,
      contacts: 0,
      status: 'На модерации',
      color: '#64748b',
    };
    setAds(prev => [...prev, created]);
    setAddAdOpen(false);
    setNewAd({ title: '', service: '', price: '', description: '' });
    toast.success('Объявление отправлено на модерацию');
  }

  function handleSendMessage() {
    if (!chatInput.trim()) return;
    toast.success('Сообщение отправлено через Avito');
    setChatInput('');
  }

  function handleCreateRequest() {
    toast.success(`Заявка создана из диалога с ${selectedDialog.buyer}`);
  }

  function handleSaveSettings() {
    toast.success('Настройки интеграции Avito сохранены');
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Icon name="ShoppingBag" className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Интеграция Avito</h1>
            <p className="text-sm text-muted-foreground">Управление объявлениями и обращениями</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">klimaservice_msk</span>
          <span className="text-sm text-muted-foreground">· Москва</span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Icon name="FileText" className="h-4 w-4" />
              Активных объявлений
            </div>
            <div className="mt-1 text-3xl font-bold">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">из {ads.length} всего</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Icon name="MessageCircle" className="h-4 w-4" />
              Обращений сегодня
            </div>
            <div className="mt-1 text-3xl font-bold text-blue-600">23</div>
            <div className="text-xs text-green-600 mt-1">↑ +4 к вчера</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Icon name="TrendingUp" className="h-4 w-4" />
              Конверсия в заявки
            </div>
            <div className="mt-1 text-3xl font-bold text-green-600">34%</div>
            <div className="text-xs text-green-600 mt-1">↑ +2% к прошлой нед.</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Icon name="Star" className="h-4 w-4" />
              Оценка аккаунта
            </div>
            <div className="mt-1 text-3xl font-bold text-yellow-500">4.8★</div>
            <div className="text-xs text-muted-foreground mt-1">142 отзыва</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ads">
        <TabsList className="mb-4">
          <TabsTrigger value="ads">Объявления</TabsTrigger>
          <TabsTrigger value="messages">Сообщения</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* ── Объявления ── */}
        <TabsContent value="ads">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setAddAdOpen(true)}>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить объявление
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ads.map(ad => (
              <Card key={ad.id}>
                <CardContent className="pt-4">
                  <div
                    className="mb-3 h-28 rounded-lg flex items-center justify-center"
                    style={{ background: `${ad.color}22`, border: `1px solid ${ad.color}44` }}
                  >
                    <Icon name="Image" className="h-8 w-8" style={{ color: ad.color }} />
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{ad.title}</p>
                    <Badge variant={adStatusVariant(ad.status)} className="shrink-0 text-xs">
                      {ad.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{ad.service}</p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-semibold">{ad.price.toLocaleString('ru')} ₽</span>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Icon name="Eye" className="h-3 w-3" />{ad.views}</span>
                      <span className="flex items-center gap-1"><Icon name="MessageSquare" className="h-3 w-3" />{ad.contacts}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(ad)}>
                      <Icon name="Pencil" className="mr-1 h-3 w-3" />
                      Изменить
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toggleAdStatus(ad.id)}>
                      <Icon name={ad.status === 'Активно' ? 'PauseCircle' : 'PlayCircle'} className="mr-1 h-3 w-3" />
                      {ad.status === 'Активно' ? 'Пауза' : 'Активировать'}
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs px-2" onClick={() => handleBoost(ad)}>
                      <Icon name="Rocket" className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Сообщения ── */}
        <TabsContent value="messages">
          <div className="flex gap-4 h-[520px]">
            {/* Dialog list */}
            <div className="w-72 shrink-0 overflow-y-auto rounded-lg border flex flex-col">
              {dialogs.map(d => (
                <button
                  key={d.id}
                  className={`flex items-start gap-3 p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 ${selectedDialog.id === d.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedDialog(d)}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: d.avatarColor }}
                  >
                    {d.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium truncate">{d.buyer}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{d.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{d.preview}</p>
                    <Badge variant={msgStatusVariant(d.status)} className="mt-1 text-xs px-1 py-0">
                      {d.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat panel */}
            <div className="flex flex-1 flex-col rounded-lg border overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: selectedDialog.avatarColor }}
                  >
                    {selectedDialog.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedDialog.buyer}</p>
                    <p className="text-xs text-muted-foreground">{selectedDialog.adTitle}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleCreateRequest}>
                  <Icon name="ClipboardList" className="mr-2 h-4 w-4" />
                  Создать заявку
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedDialog.messages.map(m => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.from === 'me' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
                      <p>{m.text}</p>
                      <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-blue-200' : 'text-muted-foreground'}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-3 flex gap-2">
                <Input
                  placeholder="Написать сообщение..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Icon name="Send" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Статистика ── */}
        <TabsContent value="stats">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
            {[
              { label: 'Просмотров за месяц', value: '8 432', trend: '+12%', up: true, icon: 'Eye' },
              { label: 'Обращений за месяц', value: '312', trend: '+18%', up: true, icon: 'MessageCircle' },
              { label: 'Заявок создано', value: '106', trend: '+8%', up: true, icon: 'ClipboardList' },
              { label: 'Ср. обращений/объявл.', value: '26', trend: '-2%', up: false, icon: 'BarChart2' },
            ].map(k => (
              <Card key={k.label}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Icon name={k.icon as any} className="h-3.5 w-3.5" />
                    {k.label}
                  </div>
                  <div className="text-2xl font-bold">{k.value}</div>
                  <div className={`text-xs mt-1 ${k.up ? 'text-green-600' : 'text-red-500'}`}>
                    {k.up ? '↑' : '↓'} {k.trend} к прошлому месяцу
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Просмотры и обращения за 30 дней</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={LINE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Просмотры" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="contacts" stroke="#10b981" name="Обращения" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Обращения по объявлениям (топ-8)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={BAR_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="contacts" fill="#3b82f6" name="Обращений" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Настройки ── */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Параметры подключения</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">API ключ Avito</label>
                  <div className="flex gap-2">
                    <Input value={apiKey} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => toast.info('Обновление ключа...')}>
                      <Icon name="RefreshCw" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Регион</label>
                  <Input value={region} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Категория объявлений</label>
                  <Input value={category} readOnly />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Статус подключения</p>
                    <p className="text-xs text-muted-foreground">Последняя синхронизация: 5 мин назад</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600 font-medium">Активно</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Автоответ</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Включить автоответ</label>
                    <button
                      role="switch"
                      aria-checked={autoReply}
                      onClick={() => setAutoReply(v => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoReply ? 'bg-blue-600' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoReply ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {autoReply && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Шаблон ответа</label>
                      <textarea
                        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                        value={replyTemplate}
                        onChange={e => setReplyTemplate(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Автоподнятие объявлений</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Включить автоподнятие</label>
                    <button
                      role="switch"
                      aria-checked={autoBoost}
                      onClick={() => setAutoBoost(v => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoBoost ? 'bg-blue-600' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoBoost ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {autoBoost && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Расписание</label>
                      <Select value={boostSchedule} onValueChange={setBoostSchedule}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Утром (08:00)</SelectItem>
                          <SelectItem value="noon">В полдень (12:00)</SelectItem>
                          <SelectItem value="evening">Вечером (18:00)</SelectItem>
                          <SelectItem value="twice">Дважды (08:00 и 18:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Icon name="Save" className="mr-2 h-4 w-4" />
              Сохранить настройки
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Ad Dialog */}
      <Dialog open={addAdOpen} onOpenChange={setAddAdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новое объявление Avito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Заголовок *</label>
              <Input
                placeholder="Например: Чистка кондиционера от 1500 ₽"
                value={newAd.title}
                onChange={e => setNewAd(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Услуга *</label>
              <Select value={newAd.service} onValueChange={v => setNewAd(p => ({ ...p, service: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {['Ремонт', 'Монтаж', 'Обслуживание', 'Заправка', 'Демонтаж', 'ТО', 'Контракт'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Цена, ₽ *</label>
              <Input
                type="number"
                placeholder="1500"
                value={newAd.price}
                onChange={e => setNewAd(p => ({ ...p, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <textarea
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Опишите услугу подробнее..."
                value={newAd.description}
                onChange={e => setNewAd(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdOpen(false)}>Отмена</Button>
            <Button onClick={handleAddAd}>Опубликовать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
