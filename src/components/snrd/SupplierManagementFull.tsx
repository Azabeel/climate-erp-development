import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Типы ─────────────────────────────────────────────────────────────────────

type SupplierCategory = 'ЗИП' | 'Хладагенты' | 'Оборудование' | 'Расходники';
type SupplierStatus = 'Активен' | 'Приостановлен' | 'Новый' | 'Заблокирован';
type DeliveryStatus = 'Вовремя' | 'С задержкой' | 'Досрочно';

interface Delivery {
  id: string; date: string; items: string;
  amount: number; deliveryDays: number; plannedDays: number; status: DeliveryStatus;
}
interface RatingCriteria { price: number; quality: number; timing: number; reliability: number }
interface Supplier {
  id: string; name: string; shortName: string; category: SupplierCategory; rating: number;
  deliveryDays: number; paymentTerms: string; status: SupplierStatus; city: string; inn: string;
  totalPurchases: number; ordersCount: number; delayPercent: number;
  contact: { name: string; role: string; phone: string; email: string };
  deliveries: Delivery[]; contractNumber: string; contractEnd: string;
  notes: string; criteria: RatingCriteria;
}

// ─── Данные ────────────────────────────────────────────────────────────────────

const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001', name: 'ООО «Дайкин СНГ»', shortName: 'Daikin CIS',
    category: 'Оборудование', rating: 4.8, deliveryDays: 5, paymentTerms: 'Отсрочка 30 дн.',
    status: 'Активен', city: 'Москва', inn: '7729535870',
    totalPurchases: 4_820_000, ordersCount: 38, delayPercent: 2.6,
    criteria: { price: 80, quality: 98, timing: 94, reliability: 96 },
    contact: { name: 'Смирнов Алексей Петрович', role: 'Менеджер по партнёрам', phone: '+7 (495) 363-11-11', email: 'a.smirnov@daikin.ru' },
    contractNumber: 'ДОГ-2024-001', contractEnd: '31.12.2026',
    notes: 'Авторизованный дилер Daikin. Приоритетные условия поставки.',
    deliveries: [
      { id: 'D-001', date: '12.05.2026', items: 'Daikin FTXB-C (5 шт.)', amount: 185_000, deliveryDays: 4, plannedDays: 5, status: 'Досрочно' },
      { id: 'D-002', date: '28.04.2026', items: 'Daikin RZQS (2 шт.)', amount: 320_000, deliveryDays: 6, plannedDays: 5, status: 'С задержкой' },
      { id: 'D-003', date: '10.03.2026', items: 'Daikin VRV IV (1 шт.)', amount: 480_000, deliveryDays: 5, plannedDays: 5, status: 'Вовремя' },
    ],
  },
  {
    id: 'SUP-002', name: 'АО «Мицубиши Электрик (РЭС)»', shortName: 'Mitsubishi Electric',
    category: 'Оборудование', rating: 4.7, deliveryDays: 7, paymentTerms: 'Предоплата 50%',
    status: 'Активен', city: 'Москва', inn: '7704065845',
    totalPurchases: 3_650_000, ordersCount: 29, delayPercent: 3.4,
    criteria: { price: 75, quality: 97, timing: 88, reliability: 95 },
    contact: { name: 'Козлова Мария Игоревна', role: 'Региональный представитель', phone: '+7 (495) 730-67-00', email: 'm.kozlova@merus.ru' },
    contractNumber: 'ДОГ-2024-002', contractEnd: '30.06.2026',
    notes: 'Официальный дистрибьютор Mitsubishi Electric.',
    deliveries: [
      { id: 'D-004', date: '08.05.2026', items: 'MSZ-LN35VG (3 шт.)', amount: 215_000, deliveryDays: 7, plannedDays: 7, status: 'Вовремя' },
      { id: 'D-005', date: '20.04.2026', items: 'MXZ-3F54VF (1 шт.)', amount: 178_000, deliveryDays: 9, plannedDays: 7, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-003', name: 'ООО «Хайер Рус»', shortName: 'Haier Rus',
    category: 'Оборудование', rating: 4.2, deliveryDays: 4, paymentTerms: 'Отсрочка 14 дн.',
    status: 'Активен', city: 'Санкт-Петербург', inn: '7814432210',
    totalPurchases: 1_240_000, ordersCount: 22, delayPercent: 8.1,
    criteria: { price: 91, quality: 80, timing: 74, reliability: 78 },
    contact: { name: 'Ли Вэй', role: 'Коммерческий директор', phone: '+7 (812) 495-77-00', email: 'li.wei@haier.ru' },
    contractNumber: 'ДОГ-2025-007', contractEnd: '31.12.2025',
    notes: 'Бюджетный сегмент. Задержки бывают.',
    deliveries: [
      { id: 'D-006', date: '05.05.2026', items: 'AS09TT4HRA-A (8 шт.)', amount: 96_000, deliveryDays: 5, plannedDays: 4, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-004', name: 'ООО «Хладонснаб»', shortName: 'Хладонснаб',
    category: 'Хладагенты', rating: 4.9, deliveryDays: 2, paymentTerms: 'Отсрочка 7 дн.',
    status: 'Активен', city: 'Москва', inn: '7716543210',
    totalPurchases: 1_870_000, ordersCount: 64, delayPercent: 0.8,
    criteria: { price: 88, quality: 99, timing: 99, reliability: 99 },
    contact: { name: 'Федоров Николай Андреевич', role: 'Менеджер по продажам', phone: '+7 (495) 641-32-15', email: 'n.fedorov@hladonsnab.ru' },
    contractNumber: 'ДОГ-2023-015', contractEnd: '31.12.2026',
    notes: 'Основной поставщик хладагентов. Стабильное качество.',
    deliveries: [
      { id: 'D-008', date: '14.05.2026', items: 'R-410A (20 баллонов)', amount: 90_000, deliveryDays: 2, plannedDays: 2, status: 'Вовремя' },
      { id: 'D-009', date: '01.05.2026', items: 'R-32 (15 баллонов)', amount: 63_000, deliveryDays: 1, plannedDays: 2, status: 'Досрочно' },
      { id: 'D-010', date: '18.04.2026', items: 'R-22 (5 баллонов)', amount: 38_500, deliveryDays: 2, plannedDays: 2, status: 'Вовремя' },
    ],
  },
  {
    id: 'SUP-005', name: 'ООО «ГазХолод»', shortName: 'ГазХолод',
    category: 'Хладагенты', rating: 4.4, deliveryDays: 3, paymentTerms: 'Предоплата 100%',
    status: 'Активен', city: 'Нижний Новгород', inn: '5258098765',
    totalPurchases: 680_000, ordersCount: 31, delayPercent: 5.1,
    criteria: { price: 93, quality: 86, timing: 82, reliability: 84 },
    contact: { name: 'Шаповалов Виктор Сергеевич', role: 'Директор по сбыту', phone: '+7 (831) 415-22-88', email: 'shapovalov@gazkholod.ru' },
    contractNumber: 'ДОГ-2024-019', contractEnd: '30.09.2026',
    notes: 'Резервный поставщик. Цены ниже на 5–8%.',
    deliveries: [
      { id: 'D-011', date: '09.05.2026', items: 'R-410A (10 баллонов)', amount: 42_500, deliveryDays: 3, plannedDays: 3, status: 'Вовремя' },
    ],
  },
  {
    id: 'SUP-006', name: 'ООО «ТД Климатехника»', shortName: 'Климатехника',
    category: 'ЗИП', rating: 4.6, deliveryDays: 3, paymentTerms: 'Отсрочка 21 дн.',
    status: 'Активен', city: 'Москва', inn: '7731456789',
    totalPurchases: 2_140_000, ordersCount: 87, delayPercent: 4.2,
    criteria: { price: 82, quality: 90, timing: 86, reliability: 90 },
    contact: { name: 'Петрова Елена Васильевна', role: 'Старший менеджер', phone: '+7 (495) 258-17-40', email: 'e.petrova@klimate.ru' },
    contractNumber: 'ДОГ-2023-008', contractEnd: '31.12.2026',
    notes: 'Широкий ассортимент >5000 позиций.',
    deliveries: [
      { id: 'D-012', date: '11.05.2026', items: 'Компрессор Daikin 2YC45 (1 шт.)', amount: 52_000, deliveryDays: 3, plannedDays: 3, status: 'Вовремя' },
      { id: 'D-013', date: '25.04.2026', items: 'Платы управления (12 шт.)', amount: 187_000, deliveryDays: 4, plannedDays: 3, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-007', name: 'ИП Горшков А.В. «ЗапчастиКлимат»', shortName: 'ЗапчастиКлимат',
    category: 'ЗИП', rating: 3.9, deliveryDays: 5, paymentTerms: 'По факту',
    status: 'Приостановлен', city: 'Екатеринбург', inn: '665812345678',
    totalPurchases: 420_000, ordersCount: 18, delayPercent: 16.7,
    criteria: { price: 95, quality: 62, timing: 54, reliability: 58 },
    contact: { name: 'Горшков Анатолий Викторович', role: 'Владелец', phone: '+7 (343) 365-44-12', email: 'gorshkov@zapclimat.ru' },
    contractNumber: 'ДОГ-2024-031', contractEnd: '31.03.2026',
    notes: 'Приостановлен до переоформления. Высокий % задержек.',
    deliveries: [
      { id: 'D-014', date: '15.03.2026', items: 'Теплообменники (3 шт.)', amount: 29_400, deliveryDays: 8, plannedDays: 5, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-008', name: 'ООО «Рефком»', shortName: 'Рефком',
    category: 'Расходники', rating: 4.5, deliveryDays: 2, paymentTerms: 'Отсрочка 14 дн.',
    status: 'Активен', city: 'Москва', inn: '7710987654',
    totalPurchases: 560_000, ordersCount: 43, delayPercent: 2.3,
    criteria: { price: 87, quality: 92, timing: 95, reliability: 93 },
    contact: { name: 'Яковлев Денис Романович', role: 'Менеджер', phone: '+7 (495) 780-55-32', email: 'd.yakovlev@refcom.ru' },
    contractNumber: 'ДОГ-2024-012', contractEnd: '30.06.2026',
    notes: 'Медь, теплоизоляция, монтажные материалы.',
    deliveries: [
      { id: 'D-015', date: '10.05.2026', items: 'Медная трубка 1/4" (100 м)', amount: 18_000, deliveryDays: 2, plannedDays: 2, status: 'Вовремя' },
    ],
  },
  {
    id: 'SUP-009', name: 'ООО «Алько Контролс Рус»', shortName: 'Alco Controls',
    category: 'ЗИП', rating: 4.7, deliveryDays: 6, paymentTerms: 'Отсрочка 30 дн.',
    status: 'Активен', city: 'Москва', inn: '7729001234',
    totalPurchases: 890_000, ordersCount: 34, delayPercent: 2.9,
    criteria: { price: 77, quality: 96, timing: 91, reliability: 95 },
    contact: { name: 'Никонов Сергей Александрович', role: 'Менеджер по партнёрам', phone: '+7 (495) 937-34-44', email: 's.nikonov@alcocontrols.ru' },
    contractNumber: 'ДОГ-2023-022', contractEnd: '31.03.2027',
    notes: 'Фильтры, вентили, клапаны. Европейское качество.',
    deliveries: [
      { id: 'D-018', date: '06.05.2026', items: 'Фильтр-осушитель 1/4" (100 шт.)', amount: 12_000, deliveryDays: 6, plannedDays: 6, status: 'Вовремя' },
    ],
  },
  {
    id: 'SUP-010', name: 'ООО «Данфосс» (Россия)', shortName: 'Danfoss',
    category: 'ЗИП', rating: 4.8, deliveryDays: 8, paymentTerms: 'Отсрочка 45 дн.',
    status: 'Активен', city: 'Москва', inn: '7707123456',
    totalPurchases: 1_480_000, ordersCount: 41, delayPercent: 1.4,
    criteria: { price: 78, quality: 99, timing: 93, reliability: 98 },
    contact: { name: 'Власова Ольга Юрьевна', role: 'Менеджер по ключевым клиентам', phone: '+7 (495) 540-01-11', email: 'o.vlasova@danfoss.com' },
    contractNumber: 'ДОГ-2022-005', contractEnd: '31.12.2027',
    notes: 'ТРВ, реле давления. Долгосрочный партнёр.',
    deliveries: [
      { id: 'D-019', date: '03.05.2026', items: 'ТРВ TGE 1-3 (20 шт.)', amount: 68_000, deliveryDays: 8, plannedDays: 8, status: 'Вовремя' },
      { id: 'D-020', date: '12.04.2026', items: 'Реле давления KP15 (10 шт.)', amount: 32_000, deliveryDays: 7, plannedDays: 8, status: 'Досрочно' },
    ],
  },
  {
    id: 'SUP-011', name: 'ООО «Фуджи Климат»', shortName: 'Fujitsu',
    category: 'Оборудование', rating: 4.3, deliveryDays: 10, paymentTerms: 'Предоплата 30%',
    status: 'Активен', city: 'Санкт-Петербург', inn: '7841234567',
    totalPurchases: 980_000, ordersCount: 14, delayPercent: 6.8,
    criteria: { price: 80, quality: 89, timing: 72, reliability: 80 },
    contact: { name: 'Акимов Павел Геннадьевич', role: 'Менеджер по продажам', phone: '+7 (812) 640-12-34', email: 'p.akimov@fujitsu-klimat.ru' },
    contractNumber: 'ДОГ-2025-011', contractEnd: '31.12.2026',
    notes: 'Длительные сроки из-за доставки с Дальнего Востока.',
    deliveries: [
      { id: 'D-021', date: '29.04.2026', items: 'ASYG14LMCA (2 шт.)', amount: 98_000, deliveryDays: 12, plannedDays: 10, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-012', name: 'ООО «СпецМонтажКомплект»', shortName: 'СМК',
    category: 'Расходники', rating: 4.1, deliveryDays: 4, paymentTerms: 'Отсрочка 10 дн.',
    status: 'Активен', city: 'Ростов-на-Дону', inn: '6163098765',
    totalPurchases: 310_000, ordersCount: 27, delayPercent: 7.4,
    criteria: { price: 90, quality: 78, timing: 75, reliability: 80 },
    contact: { name: 'Тарасенко Игорь Михайлович', role: 'Торговый представитель', phone: '+7 (863) 255-11-88', email: 'tarasenko@smk-don.ru' },
    contractNumber: 'ДОГ-2025-003', contractEnd: '31.12.2025',
    notes: 'Монтажные расходники: крепёж, гильзы, уплотнители.',
    deliveries: [
      { id: 'D-017', date: '07.05.2026', items: 'Крепёжный набор (50 компл.)', amount: 12_500, deliveryDays: 5, plannedDays: 4, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-013', name: 'ООО «Технохолод-Комплект»', shortName: 'Технохолод',
    category: 'Расходники', rating: 4.0, deliveryDays: 3, paymentTerms: 'По факту',
    status: 'Новый', city: 'Краснодар', inn: '2309087654',
    totalPurchases: 85_000, ordersCount: 5, delayPercent: 0,
    criteria: { price: 89, quality: 79, timing: 100, reliability: 80 },
    contact: { name: 'Бондаренко Артём Валерьевич', role: 'Директор', phone: '+7 (861) 274-88-10', email: 'bondarenko@tekhokholod.ru' },
    contractNumber: 'ДОГ-2026-001', contractEnd: '31.12.2026',
    notes: 'Новый поставщик. Пробные заказы.',
    deliveries: [
      { id: 'D-022', date: '13.05.2026', items: 'Помпа Aspen Mini (10 шт.)', amount: 32_000, deliveryDays: 3, plannedDays: 3, status: 'Вовремя' },
    ],
  },
  {
    id: 'SUP-014', name: 'ООО «ПромХолод Урал»', shortName: 'ПромХолод',
    category: 'Хладагенты', rating: 3.6, deliveryDays: 5, paymentTerms: 'Предоплата 100%',
    status: 'Заблокирован', city: 'Челябинск', inn: '7451234567',
    totalPurchases: 230_000, ordersCount: 9, delayPercent: 28.6,
    criteria: { price: 96, quality: 40, timing: 40, reliability: 35 },
    contact: { name: 'Малинин Геннадий Борисович', role: 'Менеджер', phone: '+7 (351) 777-44-55', email: 'malinin@promkholod.ru' },
    contractNumber: 'ДОГ-2024-044', contractEnd: '01.01.2025',
    notes: 'ЗАБЛОКИРОВАН. Контрафактный R-410A. Жалоба в ФАС.',
    deliveries: [
      { id: 'D-023', date: '14.11.2024', items: 'R-410A (15 баллонов)', amount: 58_500, deliveryDays: 9, plannedDays: 5, status: 'С задержкой' },
    ],
  },
  {
    id: 'SUP-015', name: 'ООО «МТК Логистик»', shortName: 'МТК Логистик',
    category: 'Расходники', rating: 4.3, deliveryDays: 1, paymentTerms: 'Отсрочка 7 дн.',
    status: 'Активен', city: 'Москва', inn: '7702345678',
    totalPurchases: 195_000, ordersCount: 58, delayPercent: 1.7,
    criteria: { price: 83, quality: 85, timing: 99, reliability: 92 },
    contact: { name: 'Соловьёв Кирилл Дмитриевич', role: 'Менеджер по снабжению', phone: '+7 (495) 933-12-00', email: 'solovev@mtk-logistik.ru' },
    contractNumber: 'ДОГ-2025-016', contractEnd: '31.12.2026',
    notes: 'Экспресс-доставка в день заказа.',
    deliveries: [
      { id: 'D-024', date: '15.05.2026', items: 'Расходники монтаж (лот)', amount: 8_500, deliveryDays: 1, plannedDays: 1, status: 'Вовремя' },
    ],
  },
];

const BAR_DATA = [
  { name: 'Хладонснаб', value: 1_870_000 },
  { name: 'Daikin CIS', value: 1_650_000 },
  { name: 'Климатехника', value: 1_240_000 },
  { name: 'Danfoss', value: 980_000 },
  { name: 'Mitsubishi', value: 820_000 },
  { name: 'Alco Controls', value: 590_000 },
  { name: 'Haier Rus', value: 480_000 },
  { name: 'Рефком', value: 320_000 },
];

const PIE_DATA = [
  { name: 'Оборудование', value: 10_690_000, color: '#3b82f6' },
  { name: 'ЗИП', value: 4_930_000, color: '#8b5cf6' },
  { name: 'Хладагенты', value: 2_780_000, color: '#06b6d4' },
  { name: 'Расходники', value: 1_150_000, color: '#10b981' },
];

// ─── Утилиты ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
const fmtShort = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} млн ₽` : `${(n / 1_000).toFixed(0)} тыс. ₽`;

const stars = (v: number) => {
  const full = Math.round(v);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

const STATUS_CLS: Record<SupplierStatus, string> = {
  Активен: 'bg-emerald-100 text-emerald-700',
  Новый: 'bg-blue-100 text-blue-700',
  Приостановлен: 'bg-amber-100 text-amber-700',
  Заблокирован: 'bg-red-100 text-red-700',
};
const CAT_CLS: Record<SupplierCategory, string> = {
  Оборудование: 'bg-violet-100 text-violet-700',
  ЗИП: 'bg-blue-100 text-blue-700',
  Хладагенты: 'bg-cyan-100 text-cyan-700',
  Расходники: 'bg-emerald-100 text-emerald-700',
};
const DELIVERY_CLS: Record<DeliveryStatus, string> = {
  Вовремя: 'text-emerald-600',
  Досрочно: 'text-blue-600',
  'С задержкой': 'text-red-500',
};

// ─── Форма добавления ─────────────────────────────────────────────────────────

function AddSupplierDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [payment, setPayment] = useState('');

  const handleSave = () => {
    if (!name || !inn || !category) {
      toast.error('Заполните обязательные поля: название, ИНН, категория');
      return;
    }
    toast.success(`Поставщик «${name}» добавлен в реестр`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Новый поставщик</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Название *</label>
            <Input placeholder='ООО «Название»' value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ИНН *</label>
              <Input placeholder="0000000000" value={inn} onChange={(e) => setInn(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Категория *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category} onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Выберите...</option>
                {(['ЗИП', 'Хладагенты', 'Оборудование', 'Расходники'] as const).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Город</label>
            <Input placeholder="Москва" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Условия оплаты</label>
            <Input placeholder="Отсрочка 14 дн." value={payment} onChange={(e) => setPayment(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Контактное лицо</label>
            <Input placeholder="Иванов Иван Иванович" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Телефон</label>
              <Input placeholder="+7 (495) 000-00-00" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <Input placeholder="mail@company.ru" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Icon name="Plus" className="w-4 h-4 mr-1" />Добавить
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Прогресс-бар критерия ────────────────────────────────────────────────────

function CriteriaBar({ label, value }: { label: string; value: number }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-blue-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ─── Панель детализации ───────────────────────────────────────────────────────

function DetailPanel({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'deliveries' | 'rating'>('info');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Шапка */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_CLS[supplier.category]}`}>
              {supplier.category}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[supplier.status]}`}>
              {supplier.status}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate pr-2">{supplier.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">ИНН {supplier.inn} · {supplier.city}</p>
          <p className="mt-1.5 text-sm text-amber-500 tracking-wider font-medium">{stars(supplier.rating)}
            <span className="text-gray-400 text-xs ml-1 font-normal">{supplier.rating.toFixed(1)}</span>
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-1 shrink-0">
          <Icon name="X" className="w-4 h-4" />
        </button>
      </div>

      {/* Мини-КПИ */}
      <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
        {[
          ['Закупок', fmtShort(supplier.totalPurchases)],
          ['Заказов', String(supplier.ordersCount)],
          ['Задержки', `${supplier.delayPercent}%`],
        ].map(([l, v]) => (
          <div key={l} className="bg-white px-3 py-2.5 text-center">
            <p className="text-xs text-gray-400">{l}</p>
            <p className="font-semibold text-gray-900 text-sm">{v}</p>
          </div>
        ))}
      </div>

      {/* Вкладки */}
      <div className="flex border-b border-gray-100">
        {([['info', 'Контакты'], ['deliveries', 'Поставки'], ['rating', 'Рейтинг']] as const).map(([k, l]) => (
          <button
            key={k} onClick={() => setTab(k)}
            className={`px-3 py-2 text-xs font-medium transition-colors flex-1 ${tab === k ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >{l}</button>
        ))}
      </div>

      {/* Контент */}
      <div className="p-4 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: '220px' }}>
        {tab === 'info' && (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-gray-700">
              <Icon name="User" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-xs"><span className="font-medium">{supplier.contact.name}</span>
                <span className="text-gray-400"> — {supplier.contact.role}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Icon name="Phone" className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-xs">{supplier.contact.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Icon name="Mail" className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-xs">{supplier.contact.email}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-gray-400">Договор: </span><span className="font-medium">{supplier.contractNumber}</span></div>
              <div><span className="text-gray-400">Действует до: </span><span className="font-medium">{supplier.contractEnd}</span></div>
              <div><span className="text-gray-400">Срок доставки: </span><span className="font-medium">{supplier.deliveryDays} дн.</span></div>
              <div><span className="text-gray-400">Оплата: </span><span className="font-medium">{supplier.paymentTerms}</span></div>
            </div>
            {supplier.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-800">
                <Icon name="Info" className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                {supplier.notes}
              </div>
            )}
          </div>
        )}
        {tab === 'deliveries' && (
          <div className="space-y-0">
            {supplier.deliveries.map((d) => (
              <div key={d.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-gray-800 text-xs leading-tight">{d.items}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{d.date} · {d.deliveryDays}/{d.plannedDays} дн.</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-xs text-gray-800">{fmt(d.amount)}</p>
                  <p className={`text-xs font-medium ${DELIVERY_CLS[d.status]}`}>{d.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'rating' && (
          <div className="space-y-3">
            <CriteriaBar label="Цена / конкурентоспособность" value={supplier.criteria.price} />
            <CriteriaBar label="Качество товаров" value={supplier.criteria.quality} />
            <CriteriaBar label="Соблюдение сроков" value={supplier.criteria.timing} />
            <CriteriaBar label="Надёжность партнёра" value={supplier.criteria.reliability} />
            <p className="text-xs text-gray-400 pt-1">
              Итоговый рейтинг рассчитывается как взвешенное среднее по 4 критериям.
            </p>
          </div>
        )}
      </div>

      {/* Действия */}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <Button
          variant="outline" size="sm" className="flex-1 text-xs"
          onClick={() => toast.success(`КП запрошено у «${supplier.shortName}»`)}
        >
          <Icon name="Send" className="w-3.5 h-3.5 mr-1" />Запросить КП
        </Button>
        <Button
          variant="outline" size="sm" className="flex-1 text-xs"
          onClick={() => toast.info('Открыта форма редактирования поставщика')}
        >
          <Icon name="Pencil" className="w-3.5 h-3.5 mr-1" />Редактировать
        </Button>
      </div>
    </div>
  );
}

// ─── Главный компонент ─────────────────────────────────────────────────────────

export default function SupplierManagementFull() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>('SUP-001');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filtered = useMemo(() => SUPPLIERS.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.inn.includes(q))
      && (filterCategory === 'all' || s.category === filterCategory)
      && (filterStatus === 'all' || s.status === filterStatus)
    );
  }), [search, filterCategory, filterStatus]);

  const selectedSupplier = SUPPLIERS.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showAddDialog && <AddSupplierDialog onClose={() => setShowAddDialog(false)} />}

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление поставщиками</h1>
          <p className="text-sm text-gray-400 mt-0.5">Реестр, аналитика и оценка партнёров</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Icon name="Plus" className="w-4 h-4 mr-2" />Добавить поставщика
        </Button>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Активных поставщиков', value: '24', sub: `из ${SUPPLIERS.length} в реестре`, icon: 'Building2', bg: 'bg-blue-100', ic: 'text-blue-600' },
          { label: 'Средний рейтинг', value: '4.2', sub: 'по всем поставщикам', icon: 'Star', bg: 'bg-amber-100', ic: 'text-amber-600' },
          { label: 'Сумма закупок', value: '3.8 млн ₽', sub: '2025–2026 год', icon: 'ShoppingCart', bg: 'bg-emerald-100', ic: 'text-emerald-600' },
          { label: 'Задержек поставок', value: '12%', sub: 'среднее по реестру', icon: 'AlertTriangle', bg: 'bg-red-100', ic: 'text-red-500' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${kpi.bg} shrink-0`}>
              <Icon name={kpi.icon as any} className={`w-5 h-5 ${kpi.ic}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 leading-tight">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-400">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* BarChart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Объём закупок по поставщикам (топ-8, год)</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={BAR_DATA} margin={{ top: 0, right: 10, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 1_000).toFixed(0)}т`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [fmt(v), 'Закупки']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Структура по категориям</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={PIE_DATA} cx="50%" cy="50%"
                innerRadius={38} outerRadius={62}
                paddingAngle={3} dataKey="value"
              >
                {PIE_DATA.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [fmtShort(v), '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {PIE_DATA.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-medium text-gray-800">{fmtShort(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Таблица + Детали */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Таблица */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Фильтры */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-44">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, городу, ИНН..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Все категории</option>
              {(['ЗИП', 'Хладагенты', 'Оборудование', 'Расходники'] as const).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Все статусы</option>
              {(['Активен', 'Новый', 'Приостановлен', 'Заблокирован'] as const).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Поставщик', 'Категория', 'Рейтинг', 'Срок, дн.', 'Статус', ''].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 ${selectedId === s.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs leading-tight">{s.shortName}</p>
                      <p className="text-xs text-gray-400">{s.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_CLS[s.category]}`}>
                        {s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500 font-medium text-sm tracking-wider">{stars(s.rating)}</span>
                      <span className="text-gray-400 text-xs ml-1">{s.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{s.deliveryDays}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline" size="sm"
                        className="text-xs h-7 px-2.5 whitespace-nowrap"
                        onClick={(e) => { e.stopPropagation(); setSelectedId(s.id); }}
                      >
                        Детали
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      Поставщики не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            Показано {filtered.length} из {SUPPLIERS.length} поставщиков
          </div>
        </div>

        {/* Панель деталей */}
        <div>
          {selectedSupplier
            ? <DetailPanel supplier={selectedSupplier} onClose={() => setSelectedId(null)} />
            : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-64 text-gray-400">
                <Icon name="MousePointerClick" className="w-8 h-8 mb-2" />
                <p className="text-sm">Выберите поставщика</p>
                <p className="text-xs text-gray-300 mt-1">или нажмите «Детали»</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
