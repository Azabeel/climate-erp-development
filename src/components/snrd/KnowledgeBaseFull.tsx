import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

// ─── Types ───────────────────────────────────────────────────────────────────

type ArticleCategory =
  | 'Диагностика'
  | 'Ремонт'
  | 'Монтаж'
  | 'Заправка'
  | 'Нормативы';

interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  author: string;
  date: string;
  views: number;
  rating: number;
  content: string;
}

interface Manual {
  id: string;
  brand: string;
  model: string;
  docType: 'Сервисный мануал' | 'Схема' | 'Паспорт';
  size: string;
  uploadDate: string;
}

interface ErrorCode {
  id: string;
  code: string;
  brand: string;
  model: string;
  description: string;
  causes: string[];
  solution: string;
}

interface Video {
  id: string;
  title: string;
  duration: string;
  views: number;
  date: string;
  color: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const CATEGORIES: ArticleCategory[] = [
  'Диагностика',
  'Ремонт',
  'Монтаж',
  'Заправка',
  'Нормативы',
];

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Диагностика: 'bg-blue-100 text-blue-700',
  Ремонт: 'bg-orange-100 text-orange-700',
  Монтаж: 'bg-green-100 text-green-700',
  Заправка: 'bg-purple-100 text-purple-700',
  Нормативы: 'bg-gray-100 text-gray-700',
};

const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'Диагностика компрессора кондиционера: полная методика',
    category: 'Диагностика',
    author: 'Смирнов А.В.',
    date: '12.05.2026',
    views: 312,
    rating: 4.8,
    content: `Компрессор является сердцем холодильного контура. Диагностику следует начинать с измерения давлений на стороне всасывания и нагнетания манометрическим коллектором.\n\nНормальные значения для R-410A при температуре окружающей среды +25°C: давление всасывания 8–9 бар, давление нагнетания 24–28 бар. Отклонение давления нагнетания ниже 20 бар указывает на недостаток хладагента или неисправность компрессора.\n\nПроверку обмоток электродвигателя компрессора выполняют омметром. Сопротивление обмотки пуска должно быть выше сопротивления рабочей обмотки в 1,5–2 раза. Пробой обмотки на корпус — недопустим; норма не менее 2 МОм.\n\nТок потребления замеряется токоизмерительными клещами на фазном проводе. Превышение номинального тока более чем на 15% свидетельствует о механическом износе или повышенном давлении конденсации.`,
  },
  {
    id: 'a2',
    title: 'Замена платы управления наружного блока Daikin FTXB',
    category: 'Ремонт',
    author: 'Козлов П.С.',
    date: '08.05.2026',
    views: 187,
    rating: 4.5,
    content: `Перед заменой платы управления обязательно сфотографируйте расположение всех разъёмов и клеммных колодок. Ошибка при подключении может привести к выходу из строя нового модуля.\n\nОтключите питание на автоматическом выключателе. Убедитесь в отсутствии напряжения мультиметром. Снимите переднюю панель наружного блока (4 самореза по периметру). Плата крепится на 3–4 стойках.\n\nПри установке новой платы убедитесь в совпадении версии прошивки с моделью блока. Прошивку можно считать с заводской наклейки (поле FW). Несовместимая прошивка вызовет постоянную ошибку U4 или зависание инициализации.\n\nПосле замены выполните сброс настроек: удерживайте кнопку TEST 5 секунд до мигания светодиода. Запустите автодиагностику и проверьте наличие ошибок.`,
  },
  {
    id: 'a3',
    title: 'Монтаж настенного кондиционера: пошаговая инструкция',
    category: 'Монтаж',
    author: 'Иванов Д.Н.',
    date: '03.05.2026',
    views: 445,
    rating: 4.9,
    content: `Монтаж начинается с выбора места установки внутреннего блока. Расстояние от потолка — не менее 15 см, от боковых стен — не менее 30 см. Не допускается установка под прямыми солнечными лучами.\n\nРазметка и крепление монтажной пластины выполняется по уровню. Отклонение более 2 мм/м недопустимо: вызовет некорректный дренаж. Используйте дюбели диаметром 8 мм в бетон или анкеры 6×60 мм в кирпич.\n\nПри прокладке трассы обеспечьте уклон дренажной трубы не менее 1 см на 1 м в сторону отвода. Медные трубки изгибайте трубогибом с минимальным радиусом 4d. Недопустимо перегибать трубки резкими углами.`,
  },
  {
    id: 'a4',
    title: 'Заправка системы хладагентом R-32: правила безопасности',
    category: 'Заправка',
    author: 'Петров В.А.',
    date: '29.04.2026',
    views: 298,
    rating: 4.7,
    content: `R-32 — горючий хладагент класса A2L. При работе с ним запрещается использование открытого огня, курение, применение инструментов, дающих искру. Концентрация паров в воздухе выше 14,4% об. создаёт горючую смесь.\n\nПеред заправкой обязательно выполните вакуумирование системы до давления не выше 300 мкм рт.ст. (0,4 мбар). Время вакуумирования — не менее 30 минут. Проверьте стабильность вакуума 5 минут при закрытых вентилях: рост давления указывает на утечку.\n\nЗаправку R-32 выполняют ТОЛЬКО в жидкой фазе (баллон перевёрнут). Масса заправки по шильдику ±10 г. После заправки проверьте систему течеискателем — R-32 имеет низкий ПДК 1000 ppm.`,
  },
];

const MANUALS: Manual[] = [
  { id: 'm1', brand: 'Daikin', model: 'FTXB25C', docType: 'Сервисный мануал', size: '12.4 МБ', uploadDate: '10.03.2026' },
  { id: 'm2', brand: 'Mitsubishi Electric', model: 'MSZ-LN25VG', docType: 'Схема', size: '3.2 МБ', uploadDate: '05.04.2026' },
  { id: 'm3', brand: 'Haier', model: 'AS12TT4HRA', docType: 'Сервисный мануал', size: '8.7 МБ', uploadDate: '18.04.2026' },
  { id: 'm4', brand: 'Samsung', model: 'AR12TXHQBWK', docType: 'Паспорт', size: '1.1 МБ', uploadDate: '25.04.2026' },
  { id: 'm5', brand: 'LG', model: 'S12EQ.NSJ', docType: 'Сервисный мануал', size: '15.8 МБ', uploadDate: '30.04.2026' },
  { id: 'm6', brand: 'Gree', model: 'GWH12ACC', docType: 'Схема', size: '4.5 МБ', uploadDate: '02.05.2026' },
];

const ERROR_CODES: ErrorCode[] = [
  { id: 'e1', code: 'E1', brand: 'Daikin', model: 'FTXB series', description: 'Защита от высокого давления', causes: ['Засорение конденсатора', 'Недостаточный поток воздуха через наружный блок', 'Перезаправка хладагентом'], solution: 'Очистить конденсатор. Проверить вентилятор. Измерить давление нагнетания. При перезаправке стравить избыток.' },
  { id: 'e2', code: 'E3', brand: 'Daikin', model: 'FTXB series', description: 'Защита от низкого давления', causes: ['Недостаток хладагента', 'Засорение фильтра-осушителя', 'Загрязнение испарителя'], solution: 'Проверить систему на утечки. Дозаправить хладагент. Заменить фильтр-осушитель при необходимости.' },
  { id: 'e3', code: 'F1', brand: 'Mitsubishi Electric', model: 'MSZ-LN', description: 'Ошибка датчика температуры внутреннего блока', causes: ['Обрыв или КЗ датчика', 'Плохой контакт на плате', 'Физическое повреждение датчика'], solution: 'Измерить сопротивление NTC датчика (при 25°C ≈ 5 кОм). Проверить контакт разъёма. Заменить датчик.' },
  { id: 'e4', code: 'F2', brand: 'Mitsubishi Electric', model: 'MSZ-LN', description: 'Ошибка датчика температуры наружного блока', causes: ['Обрыв датчика наружной установки', 'Коррозия контакта', 'Разрыв кабеля трассы'], solution: 'Проверить целостность кабеля от наружного блока. Измерить NTC датчик. Очистить и затянуть контакты.' },
  { id: 'e5', code: 'P1', brand: 'LG', model: 'S12EQ', description: 'Защита компрессора по перегреву', causes: ['Загрязнение конденсатора', 'Выход из строя термопредохранителя', 'Превышение температуры окружающей среды'], solution: 'Очистить конденсатор. Проверить термопредохранитель компрессора. Обеспечить вентиляцию наружного блока.' },
  { id: 'e6', code: 'CH01', brand: 'LG', model: 'Multi-split', description: 'Ошибка связи между блоками', causes: ['Повреждение сигнального кабеля', 'Неправильная адресация блоков', 'Помехи на линии связи'], solution: 'Проверить сигнальный кабель (полярность, целостность). Выполнить переадресацию блоков согласно инструкции.' },
  { id: 'e7', code: 'EC', brand: 'Haier', model: 'AS12TT4HRA', description: 'Ошибка датчика давления', causes: ['Неисправность датчика высокого давления', 'Засорение капиллярной трубки датчика', 'Превышение давления нагнетания'], solution: 'Проверить давление нагнетания. Заменить датчик давления. При превышении давления — искать причину (засор, перезаправка).' },
  { id: 'e18', code: 'E614', brand: 'Gree', model: 'Pular', description: 'Ошибка шагового двигателя жалюзи', causes: ['Механическое препятствие в жалюзи', 'Обрыв обмотки двигателя'], solution: 'Проверить ход жалюзи. Измерить сопротивление обмоток (200–400 Ом). Заменить двигатель.' },
  { id: 'e19', code: 'E6', brand: 'Daikin', model: 'FTXB series', description: 'Перегрузка компрессора', causes: ['Высокое давление конденсации', 'Механический износ компрессора'], solution: 'Измерить давление нагнетания. Проверить симметрию напряжений. При износе — замена компрессора.' },
  { id: 'e20', code: 'CH38', brand: 'LG', model: 'Multi-split', description: 'Ошибка количества внутренних блоков', causes: ['Несовместимость блоков по мощности', 'Ошибка адресации'], solution: 'Проверить схему подключения. Выполнить переадресацию. Отключать блоки поочерёдно для выявления неисправного.' },
];

const VIDEOS: Video[] = [
  { id: 'v1', title: 'Диагностика утечки хладагента: практическое руководство', duration: '18:42', views: 834, date: '05.05.2026', color: 'bg-blue-400' },
  { id: 'v2', title: 'Замена компрессора Daikin FTXB без слива контура', duration: '32:15', views: 612, date: '28.04.2026', color: 'bg-orange-400' },
  { id: 'v3', title: 'Пайка медных трубок кондиционера азотом', duration: '12:08', views: 1024, date: '20.04.2026', color: 'bg-green-400' },
  { id: 'v4', title: 'Настройка инверторного блока после замены платы', duration: '24:33', views: 477, date: '14.04.2026', color: 'bg-purple-400' },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon name={icon} className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      <Icon name="Star" className="h-3.5 w-3.5 fill-amber-400" />
      <span className="text-xs font-medium text-gray-600">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Articles Tab ─────────────────────────────────────────────────────────────

function ArticlesTab() {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState('');

  const filtered = ARTICLES.filter((a) => {
    const matchCat = selectedCategory ? a.category === selectedCategory : true;
    const matchSearch = search
      ? a.title.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  return (
    <div className="flex gap-4">
      {/* Sidebar — Categories */}
      <aside className="w-48 shrink-0">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Категории
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Все статьи
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </CardContent>
        </Card>
      </aside>

      {/* Article List */}
      <div className="flex-1 min-w-0 space-y-2">
        <Input
          placeholder="Поиск по статьям..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        {filtered.map((article) => (
          <Card
            key={article.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              selectedArticle?.id === article.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedArticle(article)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 leading-snug">{article.title}</h3>
                <Badge className={`shrink-0 text-xs ${CATEGORY_COLORS[article.category]}`}>
                  {article.category}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Icon name="User" className="h-3 w-3" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" className="h-3 w-3" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Eye" className="h-3 w-3" />
                  {article.views}
                </span>
                <StarRating rating={article.rating} />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Статьи не найдены</p>
        )}
      </div>

      {/* Preview Panel */}
      {selectedArticle && (
        <aside className="w-80 shrink-0">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {selectedArticle.title}
                </CardTitle>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <Icon name="X" className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>{selectedArticle.author}</span>
                <span>{selectedArticle.date}</span>
                <StarRating rating={selectedArticle.rating} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedArticle.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">
                  {para}
                </p>
              ))}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => toast.success('Открыт редактор статьи')}
                >
                  <Icon name="Pencil" className="h-3.5 w-3.5 mr-1.5" />
                  Редактировать
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => toast.success('Ссылка скопирована в буфер обмена')}
                >
                  <Icon name="Share2" className="h-3.5 w-3.5 mr-1.5" />
                  Поделиться
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      )}
    </div>
  );
}

// ─── Manuals Tab ──────────────────────────────────────────────────────────────

function ManualsTab() {
  const DOC_TYPE_COLORS: Record<Manual['docType'], string> = {
    'Сервисный мануал': 'bg-blue-100 text-blue-700',
    'Схема': 'bg-purple-100 text-purple-700',
    'Паспорт': 'bg-green-100 text-green-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {MANUALS.map((manual) => (
        <Card key={manual.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-red-50 p-2">
                <Icon name="FileText" className="h-5 w-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900">{manual.brand}</p>
                <p className="text-xs text-gray-500 truncate">{manual.model}</p>
              </div>
            </div>
            <Badge className={`text-xs mb-3 ${DOC_TYPE_COLORS[manual.docType]}`}>
              {manual.docType}
            </Badge>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <Icon name="HardDrive" className="h-3 w-3" />
                {manual.size}
              </span>
              <span>{manual.uploadDate}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => toast.success(`Скачивание: ${manual.brand} ${manual.model}`)}
              >
                <Icon name="Download" className="h-3.5 w-3.5 mr-1" />
                Скачать
              </Button>
              <Button
                size="sm"
                variant="default"
                className="flex-1 text-xs"
                onClick={() => toast.info(`Открытие просмотрщика: ${manual.brand} ${manual.model}`)}
              >
                <Icon name="Eye" className="h-3.5 w-3.5 mr-1" />
                Просмотр
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Error Codes Tab ──────────────────────────────────────────────────────────

function ErrorCodesTab() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ERROR_CODES.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.code.toLowerCase().includes(q) ||
      e.brand.toLowerCase().includes(q) ||
      e.model.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Поиск по коду ошибки, бренду или модели..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-lg"
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16">Код</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">Бренд</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">Модель</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Описание</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((err) => (
                <>
                  <tr
                    key={err.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}
                  >
                    <td className="px-4 py-3">
                      <Badge className="bg-red-100 text-red-700 font-mono">{err.code}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{err.brand}</td>
                    <td className="px-4 py-3 text-gray-600">{err.model}</td>
                    <td className="px-4 py-3 text-gray-700">{err.description}</td>
                    <td className="px-4 py-3">
                      <Icon
                        name={expandedId === err.id ? 'ChevronUp' : 'ChevronDown'}
                        className="h-4 w-4 text-gray-400"
                      />
                    </td>
                  </tr>
                  {expandedId === err.id && (
                    <tr key={`${err.id}-detail`} className="bg-blue-50 border-b">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              Возможные причины
                            </p>
                            <ul className="space-y-1">
                              {err.causes.map((cause, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                                  <Icon name="AlertCircle" className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                  {cause}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              Решение
                            </p>
                            <p className="text-sm text-gray-700">{err.solution}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">Коды ошибок не найдены</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Videos Tab ───────────────────────────────────────────────────────────────

function VideosTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {VIDEOS.map((video) => (
        <Card key={video.id} className="hover:shadow-md transition-shadow overflow-hidden">
          {/* Preview thumbnail */}
          <div
            className={`relative h-36 ${video.color} flex items-center justify-center cursor-pointer`}
            onClick={() => toast.info(`Воспроизведение: ${video.title}`)}
          >
            <div className="rounded-full bg-white/25 p-3">
              <Icon name="Play" className="h-8 w-8 text-white fill-white" />
            </div>
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
              {video.duration}
            </span>
          </div>
          <CardContent className="p-3">
            <p className="font-medium text-sm text-gray-900 leading-snug mb-2 line-clamp-2">
              {video.title}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Icon name="Eye" className="h-3 w-3" />
                {video.views.toLocaleString()}
              </span>
              <span>{video.date}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Add Article Modal ────────────────────────────────────────────────────────

interface AddArticleModalProps {
  open: boolean;
  onClose: () => void;
}

function AddArticleModal({ open, onClose }: AddArticleModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !category || !content.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    toast.success('Статья успешно добавлена в базу знаний');
    setTitle('');
    setCategory('');
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить статью</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="article-title">Заголовок *</Label>
            <Input
              id="article-title"
              placeholder="Введите заголовок статьи"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-category">Категория *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="article-category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-content">Содержание *</Label>
            <Textarea
              id="article-content"
              placeholder="Введите текст статьи..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <Icon name="Plus" className="h-4 w-4 mr-1.5" />
            Добавить статью
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SEARCH_SUGGESTIONS = [
  'E1 Daikin высокое давление',
  'замена компрессора',
  'заправка R-32',
  'монтаж наружного блока',
  'коды ошибок Mitsubishi',
  'чистка теплообменника',
];

export default function KnowledgeBaseFull() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const suggestions = globalSearch
    ? SEARCH_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(globalSearch.toLowerCase())
      )
    : SEARCH_SUGGESTIONS.slice(0, 4);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">База знаний</h1>
          <p className="text-sm text-gray-500 mt-0.5">Техническая документация и справочники</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Icon name="Plus" className="h-4 w-4 mr-1.5" />
          Добавить статью
        </Button>
      </div>

      {/* Global Search */}
      <div className="relative">
        <div className="relative">
          <Icon
            name="Search"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          />
          <Input
            className="pl-12 pr-4 h-12 text-base rounded-xl shadow-sm border-gray-200 focus:border-blue-400"
            placeholder="Поиск по базе знаний: статьи, мануалы, коды ошибок..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border bg-white shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                onMouseDown={() => {
                  setGlobalSearch(s);
                  setShowSuggestions(false);
                  toast.info(`Поиск: «${s}»`);
                }}
              >
                <Icon name="Search" className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Статей" value="248" icon="BookOpen" color="bg-blue-500" />
        <KpiCard label="Мануалов" value="89" icon="FileText" color="bg-purple-500" />
        <KpiCard label="Кодов ошибок" value="1 243" icon="AlertTriangle" color="bg-orange-500" />
        <KpiCard label="Просмотров сегодня" value="47" icon="Eye" color="bg-green-500" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="articles">
        <TabsList className="mb-4">
          <TabsTrigger value="articles" className="gap-1.5">
            <Icon name="BookOpen" className="h-4 w-4" />
            Статьи
          </TabsTrigger>
          <TabsTrigger value="manuals" className="gap-1.5">
            <Icon name="FileText" className="h-4 w-4" />
            Мануалы
          </TabsTrigger>
          <TabsTrigger value="errors" className="gap-1.5">
            <Icon name="AlertTriangle" className="h-4 w-4" />
            Коды ошибок
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5">
            <Icon name="PlayCircle" className="h-4 w-4" />
            Видео
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <ArticlesTab />
        </TabsContent>
        <TabsContent value="manuals">
          <ManualsTab />
        </TabsContent>
        <TabsContent value="errors">
          <ErrorCodesTab />
        </TabsContent>
        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>
      </Tabs>

      <AddArticleModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
