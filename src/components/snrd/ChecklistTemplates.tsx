import { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit,
  Copy,
  ChevronRight,
  ChevronDown,
  Star,
  AlertCircle,
  Camera,
  Type,
  Hash,
  Check,
  X,
  GripVertical,
  List,
} from 'lucide-react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type ItemInputType = 'checkbox' | 'number' | 'text' | 'photo';
type ItemStatus = 'pending' | 'done' | 'skipped';
type TemplateCategory = 'ТО' | 'Монтаж' | 'Ремонт' | 'Пусконаладка';
type ViewMode = 'edit' | 'preview';

interface ChecklistItem {
  id: string;
  order: number;
  text: string;
  required: boolean;
  inputType: ItemInputType;
  status: ItemStatus;
  value?: string | number | boolean;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  workType: string;
  category: TemplateCategory;
  items: ChecklistItem[];
  usedInOrders: number;
  fillRate: number;
}

const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'tpl-01',
    name: 'Плановое ТО сплит-системы',
    workType: 'MAINTENANCE',
    category: 'ТО',
    usedInOrders: 48,
    fillRate: 94,
    items: [
      { id: 'i01', order: 1, text: 'Проверить давление в системе', required: true, inputType: 'number', status: 'pending' },
      { id: 'i02', order: 2, text: 'Очистить фильтры воздушного блока', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'i03', order: 3, text: 'Проверить температуру подачи/возврата воздуха', required: true, inputType: 'number', status: 'pending' },
      { id: 'i04', order: 4, text: 'Очистить теплообменник испарителя', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'i05', order: 5, text: 'Осмотр медных трубок на утечки', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'i06', order: 6, text: 'Проверить состояние дренажной системы', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'i07', order: 7, text: 'Замерить ток потребления компрессора', required: true, inputType: 'number', status: 'pending' },
      { id: 'i08', order: 8, text: 'Проверить работу в режиме охлаждения', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'i09', order: 9, text: 'Проверить работу в режиме обогрева', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'i10', order: 10, text: 'Очистить внешний блок', required: true, inputType: 'photo', status: 'pending' },
      { id: 'i11', order: 11, text: 'Проверить крепления внешнего блока', required: false, inputType: 'checkbox', status: 'pending' },
      { id: 'i12', order: 12, text: 'Заполнить сервисный журнал', required: true, inputType: 'text', status: 'pending' },
    ],
  },
  {
    id: 'tpl-02',
    name: 'Монтаж кондиционера',
    workType: 'INSTALLATION',
    category: 'Монтаж',
    usedInOrders: 31,
    fillRate: 88,
    items: [
      { id: 'j01', order: 1, text: 'Согласовать место установки внутреннего блока с заказчиком', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j02', order: 2, text: 'Разметить трассу под трубы и кабель', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j03', order: 3, text: 'Пробить отверстие для трассы', required: true, inputType: 'photo', status: 'pending' },
      { id: 'j04', order: 4, text: 'Закрепить монтажную пластину внутреннего блока', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j05', order: 5, text: 'Установить внутренний блок на пластину', required: true, inputType: 'photo', status: 'pending' },
      { id: 'j06', order: 6, text: 'Согласовать место крепления внешнего блока', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j07', order: 7, text: 'Установить кронштейны для внешнего блока', required: true, inputType: 'photo', status: 'pending' },
      { id: 'j08', order: 8, text: 'Установить внешний блок', required: true, inputType: 'photo', status: 'pending' },
      { id: 'j09', order: 9, text: 'Проложить медные трубки в теплоизоляции', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j10', order: 10, text: 'Подключить медные трубки к блокам', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j11', order: 11, text: 'Подключить электрический кабель', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'j12', order: 12, text: 'Опрессовать систему азотом (20 бар, 10 мин)', required: true, inputType: 'number', status: 'pending' },
      { id: 'j13', order: 13, text: 'Вакуумировать систему до -0.1 МПа', required: true, inputType: 'number', status: 'pending' },
      { id: 'j14', order: 14, text: 'Заполнить систему хладагентом согласно паспорту', required: true, inputType: 'number', status: 'pending' },
      { id: 'j15', order: 15, text: 'Проверить работу всех режимов. Подписать акт.', required: true, inputType: 'checkbox', status: 'pending' },
    ],
  },
  {
    id: 'tpl-03',
    name: 'Ремонт VRF системы',
    workType: 'REPAIR',
    category: 'Ремонт',
    usedInOrders: 17,
    fillRate: 79,
    items: [
      { id: 'k01', order: 1, text: 'Снять показания ошибок с контроллера', required: true, inputType: 'text', status: 'pending' },
      { id: 'k02', order: 2, text: 'Проверить давление всасывания', required: true, inputType: 'number', status: 'pending' },
      { id: 'k03', order: 3, text: 'Проверить давление нагнетания', required: true, inputType: 'number', status: 'pending' },
      { id: 'k04', order: 4, text: 'Диагностика компрессора (ток, температура)', required: true, inputType: 'number', status: 'pending' },
      { id: 'k05', order: 5, text: 'Проверка электронных расширительных вентилей', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'k06', order: 6, text: 'Замена неисправного компонента', required: true, inputType: 'text', status: 'pending' },
      { id: 'k07', order: 7, text: 'Вакуумирование после ремонта', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'k08', order: 8, text: 'Дозаправка хладагентом при необходимости', required: false, inputType: 'number', status: 'pending' },
      { id: 'k09', order: 9, text: 'Проверка работы системы в тестовом режиме', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'k10', order: 10, text: 'Фотофиксация выполненных работ', required: true, inputType: 'photo', status: 'pending' },
    ],
  },
  {
    id: 'tpl-04',
    name: 'Диагностика неисправности',
    workType: 'REPAIR',
    category: 'Ремонт',
    usedInOrders: 62,
    fillRate: 97,
    items: [
      { id: 'l01', order: 1, text: 'Опрос клиента о характере неисправности', required: true, inputType: 'text', status: 'pending' },
      { id: 'l02', order: 2, text: 'Считать коды ошибок с блока управления', required: true, inputType: 'text', status: 'pending' },
      { id: 'l03', order: 3, text: 'Визуальный осмотр внутреннего блока', required: true, inputType: 'photo', status: 'pending' },
      { id: 'l04', order: 4, text: 'Визуальный осмотр внешнего блока', required: true, inputType: 'photo', status: 'pending' },
      { id: 'l05', order: 5, text: 'Замер рабочих токов', required: true, inputType: 'number', status: 'pending' },
      { id: 'l06', order: 6, text: 'Замер давлений в контуре', required: true, inputType: 'number', status: 'pending' },
      { id: 'l07', order: 7, text: 'Определить причину неисправности', required: true, inputType: 'text', status: 'pending' },
      { id: 'l08', order: 8, text: 'Согласовать с клиентом стоимость и сроки ремонта', required: true, inputType: 'checkbox', status: 'pending' },
    ],
  },
  {
    id: 'tpl-05',
    name: 'Пусконаладка оборудования',
    workType: 'PPR',
    category: 'Пусконаладка',
    usedInOrders: 23,
    fillRate: 91,
    items: [
      { id: 'm01', order: 1, text: 'Проверить комплектность поставки по документации', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm02', order: 2, text: 'Проверить правильность монтажа всех компонентов', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm03', order: 3, text: 'Проверить электрические соединения и заземление', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm04', order: 4, text: 'Проверить подключение трубопроводов', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm05', order: 5, text: 'Опрессовка контура (давление, протокол)', required: true, inputType: 'number', status: 'pending' },
      { id: 'm06', order: 6, text: 'Вакуумирование системы', required: true, inputType: 'number', status: 'pending' },
      { id: 'm07', order: 7, text: 'Заправка хладагентом (количество по паспорту)', required: true, inputType: 'number', status: 'pending' },
      { id: 'm08', order: 8, text: 'Первый запуск и мониторинг параметров', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm09', order: 9, text: 'Настройка контроллера и параметров работы', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm10', order: 10, text: 'Проверка всех режимов работы', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm11', order: 11, text: 'Замеры параметров и сравнение с паспортными', required: true, inputType: 'text', status: 'pending' },
      { id: 'm12', order: 12, text: 'Инструктаж пользователя', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'm13', order: 13, text: 'Фотофиксация финального состояния', required: true, inputType: 'photo', status: 'pending' },
      { id: 'm14', order: 14, text: 'Подписание акта пусконаладочных работ', required: true, inputType: 'checkbox', status: 'pending' },
    ],
  },
  {
    id: 'tpl-06',
    name: 'Сезонная консервация',
    workType: 'MAINTENANCE',
    category: 'ТО',
    usedInOrders: 19,
    fillRate: 86,
    items: [
      { id: 'n01', order: 1, text: 'Очистить фильтры и теплообменник внутреннего блока', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'n02', order: 2, text: 'Промыть дренажный поддон и трубку', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'n03', order: 3, text: 'Очистить внешний блок от загрязнений', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'n04', order: 4, text: 'Проверить давление хладагента', required: true, inputType: 'number', status: 'pending' },
      { id: 'n05', order: 5, text: 'Обработать контакты антиоксидантом', required: false, inputType: 'checkbox', status: 'pending' },
      { id: 'n06', order: 6, text: 'Установить чехол для защиты от снега/льда', required: false, inputType: 'checkbox', status: 'pending' },
      { id: 'n07', order: 7, text: 'Проверить крепления внешнего блока', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'n08', order: 8, text: 'Составить акт с рекомендациями', required: true, inputType: 'text', status: 'pending' },
      { id: 'n09', order: 9, text: 'Фотофиксация состояния оборудования', required: true, inputType: 'photo', status: 'pending' },
    ],
  },
  {
    id: 'tpl-07',
    name: 'Заправка хладагентом',
    workType: 'MAINTENANCE',
    category: 'ТО',
    usedInOrders: 37,
    fillRate: 98,
    items: [
      { id: 'o01', order: 1, text: 'Определить тип хладагента по паспорту оборудования', required: true, inputType: 'text', status: 'pending' },
      { id: 'o02', order: 2, text: 'Подключить манометрическую станцию', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'o03', order: 3, text: 'Замерить исходное давление в системе', required: true, inputType: 'number', status: 'pending' },
      { id: 'o04', order: 4, text: 'Проверить наличие утечки (течеискатель)', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'o05', order: 5, text: 'Заправить хладагент до нормы (количество кг)', required: true, inputType: 'number', status: 'pending' },
      { id: 'o06', order: 6, text: 'Зафиксировать серийный номер баллона', required: true, inputType: 'text', status: 'pending' },
      { id: 'o07', order: 7, text: 'Записать в журнал хладагентов', required: true, inputType: 'checkbox', status: 'pending' },
    ],
  },
  {
    id: 'tpl-08',
    name: 'Гарантийное обслуживание',
    workType: 'WARRANTY',
    category: 'Ремонт',
    usedInOrders: 14,
    fillRate: 92,
    items: [
      { id: 'p01', order: 1, text: 'Проверить гарантийные документы и сроки', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'p02', order: 2, text: 'Зафиксировать описание неисправности от клиента', required: true, inputType: 'text', status: 'pending' },
      { id: 'p03', order: 3, text: 'Фотофиксация неисправности до начала работ', required: true, inputType: 'photo', status: 'pending' },
      { id: 'p04', order: 4, text: 'Диагностика и определение гарантийного случая', required: true, inputType: 'text', status: 'pending' },
      { id: 'p05', order: 5, text: 'Уточнить у производителя/дистрибьютора порядок замены', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'p06', order: 6, text: 'Произвести замену неисправного узла', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'p07', order: 7, text: 'Проверить работу после замены', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'p08', order: 8, text: 'Фотофиксация после устранения', required: true, inputType: 'photo', status: 'pending' },
      { id: 'p09', order: 9, text: 'Заполнить гарантийный акт', required: true, inputType: 'text', status: 'pending' },
      { id: 'p10', order: 10, text: 'Получить подпись клиента', required: true, inputType: 'checkbox', status: 'pending' },
      { id: 'p11', order: 11, text: 'Передать документы для возмещения производителю', required: true, inputType: 'checkbox', status: 'pending' },
    ],
  },
];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'ТО': 'bg-blue-100 text-blue-700',
  'Монтаж': 'bg-green-100 text-green-700',
  'Ремонт': 'bg-orange-100 text-orange-700',
  'Пусконаладка': 'bg-purple-100 text-purple-700',
};

const INPUT_TYPE_ICON: Record<ItemInputType, React.ReactNode> = {
  checkbox: <Icon name="CheckSquare" size={14} className="text-slate-500" />,
  number: <Icon name="Hash" size={14} className="text-slate-500" />,
  text: <Icon name="Type" size={14} className="text-slate-500" />,
  photo: <Icon name="Camera" size={14} className="text-slate-500" />,
};

const INPUT_TYPE_LABEL: Record<ItemInputType, string> = {
  checkbox: 'Флажок',
  number: 'Число',
  text: 'Текст',
  photo: 'Фото',
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChecklistTemplates() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string | null>('tpl-01');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set(['tpl-01']));

  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;

  // ---------- Template list actions ----------
  function handleSelectTemplate(id: string) {
    setSelectedId(id);
    setEditingItemId(null);
    setViewMode('edit');
    setExpandedTemplates((prev) => new Set([...prev, id]));
  }

  function handleCreateTemplate() {
    const newTpl: ChecklistTemplate = {
      id: `tpl-${generateId()}`,
      name: 'Новый шаблон',
      workType: 'MAINTENANCE',
      category: 'ТО',
      usedInOrders: 0,
      fillRate: 0,
      items: [],
    };
    setTemplates((prev) => [...prev, newTpl]);
    setSelectedId(newTpl.id);
    setViewMode('edit');
  }

  function handleDuplicateTemplate(id: string) {
    const source = templates.find((t) => t.id === id);
    if (!source) return;
    const copy: ChecklistTemplate = {
      ...source,
      id: `tpl-${generateId()}`,
      name: `${source.name} (копия)`,
      usedInOrders: 0,
      fillRate: 0,
      items: source.items.map((item) => ({ ...item, id: `i-${generateId()}`, status: 'pending' })),
    };
    setTemplates((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  }

  function handleDeleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(templates.find((t) => t.id !== id)?.id ?? null);
  }

  // ---------- Item actions ----------
  function handleAddItem() {
    if (!selectedTemplate) return;
    const newItem: ChecklistItem = {
      id: `i-${generateId()}`,
      order: selectedTemplate.items.length + 1,
      text: 'Новый пункт',
      required: false,
      inputType: 'checkbox',
      status: 'pending',
    };
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplate.id ? { ...t, items: [...t.items, newItem] } : t)),
    );
    setEditingItemId(newItem.id);
    setEditingText(newItem.text);
  }

  function handleDeleteItem(itemId: string) {
    if (!selectedTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate.id
          ? {
              ...t,
              items: t.items
                .filter((i) => i.id !== itemId)
                .map((i, idx) => ({ ...i, order: idx + 1 })),
            }
          : t,
      ),
    );
  }

  function handleStartEditItem(item: ChecklistItem) {
    setEditingItemId(item.id);
    setEditingText(item.text);
  }

  function handleSaveItemText(itemId: string) {
    if (!selectedTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, items: t.items.map((i) => (i.id === itemId ? { ...i, text: editingText } : i)) }
          : t,
      ),
    );
    setEditingItemId(null);
  }

  function handleToggleRequired(itemId: string) {
    if (!selectedTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, items: t.items.map((i) => (i.id === itemId ? { ...i, required: !i.required } : i)) }
          : t,
      ),
    );
  }

  function handleChangeInputType(itemId: string, inputType: ItemInputType) {
    if (!selectedTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, items: t.items.map((i) => (i.id === itemId ? { ...i, inputType } : i)) }
          : t,
      ),
    );
  }

  // ---------- Preview actions ----------
  function handleCycleStatus(itemId: string) {
    if (!selectedTemplate || viewMode !== 'preview') return;
    const cycle: ItemStatus[] = ['pending', 'done', 'skipped'];
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate.id
          ? {
              ...t,
              items: t.items.map((i) => {
                if (i.id !== itemId) return i;
                const next = cycle[(cycle.indexOf(i.status) + 1) % cycle.length];
                return { ...i, status: next };
              }),
            }
          : t,
      ),
    );
  }

  // ---------- Stats ----------
  const totalTemplates = templates.length;
  const totalUsed = templates.filter((t) => t.usedInOrders > 0).length;
  const avgFillRate =
    templates.length > 0
      ? Math.round(templates.reduce((sum, t) => sum + t.fillRate, 0) / templates.length)
      : 0;

  const doneCount = selectedTemplate ? selectedTemplate.items.filter((i) => i.status === 'done').length : 0;
  const totalCount = selectedTemplate ? selectedTemplate.items.length : 0;
  const previewProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
            <Icon name="List" size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Шаблоны чеклистов</h1>
            <p className="text-xs text-slate-500">Управление чеклистами для нарядов</p>
          </div>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Icon name="Plus" size={16} />
          Создать шаблон
        </Button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: template list */}
        <div className="flex w-72 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`group relative cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedId === tpl.id
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${
                          selectedId === tpl.id ? 'text-indigo-700' : 'text-slate-800'
                        }`}
                      >
                        {tpl.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[tpl.category]}`}
                        >
                          {tpl.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{tpl.items.length} пунктов</span>
                      </div>
                    </div>
                    <div
                      className={`flex-shrink-0 transition-transform ${
                        selectedId === tpl.id ? 'rotate-90' : ''
                      }`}
                    >
                      <Icon name="ChevronRight" size={14} className="text-slate-400" />
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(tpl.id); }}
                      className="rounded p-1 hover:bg-slate-200"
                      title="Дублировать"
                    >
                      <Icon name="Copy" size={12} className="text-slate-500" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }}
                      className="rounded p-1 hover:bg-red-100"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Bottom stats */}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Всего шаблонов</span>
              <span className="font-semibold text-slate-700">{totalTemplates}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Используется в нарядах</span>
              <span className="font-semibold text-slate-700">{totalUsed}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Средний % заполнения</span>
              <span className="font-semibold text-green-600">{avgFillRate}%</span>
            </div>
          </div>
        </div>

        {/* Main area: checklist editor / preview */}
        {selectedTemplate ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Template toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-slate-900">{selectedTemplate.name}</h2>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[selectedTemplate.category]}`}>
                  {selectedTemplate.category}
                </span>
                <span className="text-xs text-slate-400">{selectedTemplate.items.length} пунктов</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Usage stats */}
                <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  <Icon name="Star" size={12} className="text-amber-500" />
                  <span>Использован в {selectedTemplate.usedInOrders} нарядах</span>
                </div>

                {/* View toggle */}
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-all ${
                      viewMode === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon name="Edit" size={13} />
                    Редактирование
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-all ${
                      viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon name="CheckSquare" size={13} />
                    Предпросмотр
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => handleDuplicateTemplate(selectedTemplate.id)}
                >
                  <Icon name="Copy" size={13} />
                  Дублировать
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs text-slate-500">
                  <Icon name="GripVertical" size={13} />
                  Привязать к типу работ
                </Button>
              </div>
            </div>

            {/* Preview progress bar */}
            {viewMode === 'preview' && (
              <div className="border-b border-slate-200 bg-white px-5 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${previewProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    {doneCount} / {totalCount} выполнено ({previewProgress}%)
                  </span>
                  <span className="text-xs text-slate-400">Нажмите на пункт для смены статуса</span>
                </div>
              </div>
            )}

            {/* Checklist items */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-2">
                {selectedTemplate.items.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    isEditing={editingItemId === item.id}
                    editingText={editingItemId === item.id ? editingText : ''}
                    onEditingTextChange={setEditingText}
                    onStartEdit={() => handleStartEditItem(item)}
                    onSaveEdit={() => handleSaveItemText(item.id)}
                    onCancelEdit={() => setEditingItemId(null)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onToggleRequired={() => handleToggleRequired(item.id)}
                    onChangeInputType={(t) => handleChangeInputType(item.id, t)}
                    onCycleStatus={() => handleCycleStatus(item.id)}
                  />
                ))}

                {/* Add item button (edit mode) */}
                {viewMode === 'edit' && (
                  <button
                    onClick={handleAddItem}
                    className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-400 transition-all hover:border-indigo-400 hover:text-indigo-500"
                  >
                    <Icon name="Plus" size={15} />
                    Добавить пункт
                  </button>
                )}

                {selectedTemplate.items.length === 0 && viewMode === 'preview' && (
                  <div className="flex flex-col items-center py-16 text-slate-400">
                    <Icon name="List" size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">Шаблон пока пустой</p>
                    <p className="text-xs mt-1">Переключитесь в режим редактирования, чтобы добавить пункты</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
            <Icon name="List" size={48} className="mb-4 opacity-25" />
            <p className="text-sm">Выберите шаблон из списка</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- ChecklistItemRow ----------

interface ChecklistItemRowProps {
  item: ChecklistItem;
  viewMode: ViewMode;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onToggleRequired: () => void;
  onChangeInputType: (t: ItemInputType) => void;
  onCycleStatus: () => void;
}

function ChecklistItemRow({
  item,
  viewMode,
  isEditing,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggleRequired,
  onChangeInputType,
  onCycleStatus,
}: ChecklistItemRowProps) {
  const statusStyle: Record<ItemStatus, string> = {
    pending: 'bg-white border-slate-200',
    done: 'bg-green-50 border-green-200',
    skipped: 'bg-slate-100 border-slate-200 opacity-60',
  };

  const StatusIcon = () => {
    if (viewMode !== 'preview') return null;
    if (item.status === 'done') return <Icon name="CheckSquare" size={18} className="text-green-500 flex-shrink-0" />;
    if (item.status === 'skipped') return <Icon name="X" size={18} className="text-slate-400 flex-shrink-0" />;
    return <Icon name="Square" size={18} className="text-slate-300 flex-shrink-0" />;
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border px-4 py-3 transition-all ${
        viewMode === 'preview' ? `cursor-pointer ${statusStyle[item.status]}` : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
      onClick={viewMode === 'preview' ? onCycleStatus : undefined}
    >
      {/* Drag handle (edit mode) */}
      {viewMode === 'edit' && (
        <div className="mt-0.5 cursor-grab text-slate-300 hover:text-slate-400">
          <Icon name="GripVertical" size={16} />
        </div>
      )}

      {/* Order number */}
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
        {item.order}
      </div>

      {/* Status icon (preview) */}
      <StatusIcon />

      {/* Text */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-indigo-300 px-2 py-0.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-200"
          />
        ) : (
          <p
            className={`text-sm ${
              item.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {item.text}
          </p>
        )}

        {/* Badges row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {/* Input type */}
          <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5">
            {INPUT_TYPE_ICON[item.inputType]}
            <span className="text-[10px] text-slate-500">{INPUT_TYPE_LABEL[item.inputType]}</span>
          </div>

          {/* Required badge */}
          {item.required ? (
            <div className="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5">
              <Icon name="AlertCircle" size={11} className="text-red-500" />
              <span className="text-[10px] font-medium text-red-600">Обязательный</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5">
              <span className="text-[10px] text-slate-400">Необязательный</span>
            </div>
          )}

          {/* Preview status label */}
          {viewMode === 'preview' && item.status !== 'pending' && (
            <div
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                item.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {item.status === 'done' ? 'Выполнен' : 'Пропущен'}
            </div>
          )}
        </div>
      </div>

      {/* Edit-mode controls */}
      {viewMode === 'edit' && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Input type switcher */}
          <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5" onClick={(e) => e.stopPropagation()}>
            {(['checkbox', 'number', 'text', 'photo'] as ItemInputType[]).map((type) => (
              <button
                key={type}
                onClick={() => onChangeInputType(type)}
                title={INPUT_TYPE_LABEL[type]}
                className={`rounded p-1 transition-all ${
                  item.inputType === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {INPUT_TYPE_ICON[type]}
              </button>
            ))}
          </div>

          {/* Required toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleRequired(); }}
            title={item.required ? 'Сделать необязательным' : 'Сделать обязательным'}
            className={`rounded p-1.5 transition-colors ${
              item.required ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Icon name="AlertCircle" size={14} />
          </button>

          {/* Edit text */}
          {isEditing ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onSaveEdit(); }}
                className="rounded p-1.5 text-green-600 hover:bg-green-50"
                title="Сохранить"
              >
                <Icon name="Check" size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
                title="Отмена"
              >
                <Icon name="X" size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Редактировать текст"
            >
              <Icon name="Edit" size={14} />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
            title="Удалить пункт"
          >
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
