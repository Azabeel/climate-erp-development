import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = 'draft' | 'final' | 'signed';

interface DocMeta {
  id: string;
  name: string;
  category: string;
  client: string;
  date: string;
  status: DocStatus;
  relatedOrders: string[];
  content: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  docs: DocMeta[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<DocStatus, string> = {
  draft: 'Черновик',
  final: 'Финальный',
  signed: 'Подписан',
};

const STATUS_COLORS: Record<DocStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  final: 'bg-blue-100 text-blue-800',
  signed: 'bg-green-100 text-green-800',
};

const TEMPLATE_VARIABLES = [
  { key: '{{client_name}}', label: 'Имя клиента' },
  { key: '{{order_id}}', label: 'Номер наряда' },
  { key: '{{date}}', label: 'Дата' },
  { key: '{{engineer_name}}', label: 'Инженер' },
  { key: '{{equipment_model}}', label: 'Модель оборудования' },
  { key: '{{serial_number}}', label: 'Серийный номер' },
  { key: '{{total_cost}}', label: 'Итоговая сумма' },
  { key: '{{company_name}}', label: 'Компания' },
];

const TEMPLATES: { id: string; name: string; category: string; content: string }[] = [
  {
    id: 't1',
    name: 'Акт выполненных работ (стандарт)',
    category: 'Акты выполненных работ',
    content: `АКТ ВЫПОЛНЕННЫХ РАБОТ №___

Дата: {{date}}
Наряд: {{order_id}}

Заказчик: {{client_name}}
Исполнитель: ООО «Сервис Климат»

Инженер: {{engineer_name}}

Оборудование: {{equipment_model}}
Серийный номер: {{serial_number}}

## Выполненные работы

1.
2.
3.

## Использованные материалы

| Наименование | Кол-во | Цена | Сумма |
|---|---|---|---|
|   |   |   |   |

ИТОГО: {{total_cost}} руб.

Работы выполнены в полном объёме и приняты без претензий.

Заказчик: _________________ / {{client_name}} /
Исполнитель: ______________ / {{engineer_name}} /`,
  },
  {
    id: 't2',
    name: 'Коммерческое предложение',
    category: 'Коммерческие предложения',
    content: `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ

Дата: {{date}}
Кому: {{client_name}}
От кого: ООО «Сервис Климат»

Уважаемый клиент,

Мы рады предложить Вам следующие услуги:

## Вариант 1 — Базовый

-
-
Стоимость: ___ руб.

## Вариант 2 — Оптимальный

-
-
-
Стоимость: ___ руб.

## Вариант 3 — Премиум

-
-
-
-
Стоимость: ___ руб.

Предложение действительно до: ___

С уважением,
{{company_name}}`,
  },
  {
    id: 't3',
    name: 'Договор на обслуживание',
    category: 'Договоры',
    content: `ДОГОВОР НА ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ №___

г. Москва                                          {{date}}

ООО «Сервис Климат», именуемое в дальнейшем «Исполнитель», и
{{client_name}}, именуемый в дальнейшем «Заказчик»,
заключили настоящий Договор о следующем:

## 1. ПРЕДМЕТ ДОГОВОРА

1.1. Исполнитель обязуется оказывать услуги по техническому обслуживанию
климатического оборудования Заказчика.

1.2. Оборудование: {{equipment_model}}, с/н {{serial_number}}

## 2. ПРАВА И ОБЯЗАННОСТИ СТОРОН

2.1. Исполнитель обязуется:
-
-

2.2. Заказчик обязуется:
-
-

## 3. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ

3.1. Стоимость услуг составляет {{total_cost}} руб.

## 4. СРОК ДЕЙСТВИЯ ДОГОВОРА

4.1. Договор вступает в силу с момента подписания.
4.2. Срок действия: 1 год.

Исполнитель: _________________
Заказчик: _________________`,
  },
  {
    id: 't4',
    name: 'Гарантийное письмо',
    category: 'Шаблоны',
    content: `ГАРАНТИЙНОЕ ПИСЬМО

Дата: {{date}}

Кому: {{client_name}}

ООО «Сервис Климат» настоящим подтверждает, что работы по наряду {{order_id}}
выполнены в соответствии с техническими нормами и требованиями.

На выполненные работы предоставляется гарантия сроком 12 месяцев.
Гарантия не распространяется на:
- Механические повреждения, возникшие по вине Заказчика
- Нарушение правил эксплуатации оборудования

Оборудование: {{equipment_model}}
Инженер: {{engineer_name}}

С уважением,
{{company_name}}`,
  },
  {
    id: 't5',
    name: 'Дефектная ведомость',
    category: 'Шаблоны',
    content: `ДЕФЕКТНАЯ ВЕДОМОСТЬ

Дата: {{date}}
Наряд: {{order_id}}
Клиент: {{client_name}}

Оборудование: {{equipment_model}}
Серийный номер: {{serial_number}}

## Выявленные дефекты

| № | Описание дефекта | Причина | Рекомендации |
|---|---|---|---|
| 1 |   |   |   |
| 2 |   |   |   |
| 3 |   |   |   |

## Заключение

Инженер: {{engineer_name}}
Дата осмотра: {{date}}

Подпись: _________________`,
  },
  {
    id: 't6',
    name: 'Счёт на оплату',
    category: 'Шаблоны',
    content: `СЧЁТ НА ОПЛАТУ №___

Дата: {{date}}

Поставщик: ООО «Сервис Климат»
Покупатель: {{client_name}}

| № | Наименование | Кол-во | Цена | Сумма |
|---|---|---|---|---|
| 1 |   |   |   |   |

Итого: {{total_cost}} руб.
НДС (20%): ___ руб.
ИТОГО С НДС: ___ руб.

Оплатить до: ___

Реквизиты:
ИНН: ___
р/с: ___
Банк: ___`,
  },
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'acts',
    name: 'Акты выполненных работ',
    docs: [
      { id: 'a1', name: 'Акт WO-2026-000101', category: 'acts', client: 'ООО Альфа', date: '14.05.2026', status: 'signed', relatedOrders: ['WO-2026-000101'], content: TEMPLATES[0].content, updatedAt: '14.05.2026' },
      { id: 'a2', name: 'Акт WO-2026-000098', category: 'acts', client: 'ИП Смирнов В.И.', date: '12.05.2026', status: 'final', relatedOrders: ['WO-2026-000098'], content: TEMPLATES[0].content, updatedAt: '12.05.2026' },
      { id: 'a3', name: 'Акт WO-2026-000095', category: 'acts', client: 'ТЦ Мираж', date: '10.05.2026', status: 'signed', relatedOrders: ['WO-2026-000095'], content: TEMPLATES[0].content, updatedAt: '10.05.2026' },
      { id: 'a4', name: 'Акт WO-2026-000090', category: 'acts', client: 'АО Стройком', date: '08.05.2026', status: 'draft', relatedOrders: ['WO-2026-000090'], content: TEMPLATES[0].content, updatedAt: '08.05.2026' },
      { id: 'a5', name: 'Акт WO-2026-000085', category: 'acts', client: 'ООО Рост', date: '05.05.2026', status: 'signed', relatedOrders: ['WO-2026-000085'], content: TEMPLATES[0].content, updatedAt: '05.05.2026' },
    ],
  },
  {
    id: 'proposals',
    name: 'Коммерческие предложения',
    docs: [
      { id: 'p1', name: 'КП для ТЦ Мираж', category: 'proposals', client: 'ТЦ Мираж', date: '13.05.2026', status: 'final', relatedOrders: ['WO-2026-000099'], content: TEMPLATES[1].content, updatedAt: '13.05.2026' },
      { id: 'p2', name: 'КП Климат Про 2026', category: 'proposals', client: 'ООО КлиматПро', date: '11.05.2026', status: 'draft', relatedOrders: [], content: TEMPLATES[1].content, updatedAt: '11.05.2026' },
      { id: 'p3', name: 'КП Офис Бизнес-центр', category: 'proposals', client: 'БЦ Горизонт', date: '09.05.2026', status: 'draft', relatedOrders: [], content: TEMPLATES[1].content, updatedAt: '09.05.2026' },
    ],
  },
  {
    id: 'contracts',
    name: 'Договоры',
    docs: [
      { id: 'c1', name: 'Договор ООО Альфа 2026', category: 'contracts', client: 'ООО Альфа', date: '01.01.2026', status: 'signed', relatedOrders: [], content: TEMPLATES[2].content, updatedAt: '01.01.2026' },
      { id: 'c2', name: 'Договор ТЦ Мираж', category: 'contracts', client: 'ТЦ Мираж', date: '15.02.2026', status: 'signed', relatedOrders: [], content: TEMPLATES[2].content, updatedAt: '15.02.2026' },
      { id: 'c3', name: 'Договор АО Стройком', category: 'contracts', client: 'АО Стройком', date: '01.03.2026', status: 'final', relatedOrders: [], content: TEMPLATES[2].content, updatedAt: '01.03.2026' },
      { id: 'c4', name: 'Договор ООО Рост', category: 'contracts', client: 'ООО Рост', date: '10.04.2026', status: 'draft', relatedOrders: [], content: TEMPLATES[2].content, updatedAt: '10.04.2026' },
    ],
  },
  {
    id: 'templates',
    name: 'Шаблоны',
    docs: [
      { id: 'tmpl1', name: 'Акт выполненных работ', category: 'templates', client: '—', date: '01.01.2026', status: 'final', relatedOrders: [], content: TEMPLATES[0].content, updatedAt: '01.01.2026' },
      { id: 'tmpl2', name: 'Коммерческое предложение', category: 'templates', client: '—', date: '01.01.2026', status: 'final', relatedOrders: [], content: TEMPLATES[1].content, updatedAt: '01.01.2026' },
      { id: 'tmpl3', name: 'Договор на обслуживание', category: 'templates', client: '—', date: '01.01.2026', status: 'final', relatedOrders: [], content: TEMPLATES[2].content, updatedAt: '01.01.2026' },
      { id: 'tmpl4', name: 'Гарантийное письмо', category: 'templates', client: '—', date: '01.01.2026', status: 'final', relatedOrders: [], content: TEMPLATES[3].content, updatedAt: '01.01.2026' },
      { id: 'tmpl5', name: 'Дефектная ведомость', category: 'templates', client: '—', date: '01.01.2026', status: 'final', relatedOrders: [], content: TEMPLATES[4].content, updatedAt: '01.01.2026' },
      { id: 'tmpl6', name: 'Счёт на оплату', category: 'templates', client: '—', date: '01.01.2026', status: 'final', relatedOrders: [], content: TEMPLATES[5].content, updatedAt: '01.01.2026' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NewDocModalProps {
  onClose: () => void;
  onSelect: (template: typeof TEMPLATES[number]) => void;
}

function NewDocModal({ onClose, onSelect }: NewDocModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900 text-base">Выбор шаблона</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Template list */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onSelect(tpl)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <span className="mt-0.5 text-gray-400 group-hover:text-blue-500">
                  <Icon name="FileText" size={18} />
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                    {tpl.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{tpl.category}</div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="w-full">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentEditor() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [selectedDocId, setSelectedDocId] = useState<string | null>('a1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const allDocs = categories.flatMap((c) => c.docs);

  const selectedDoc = selectedDocId ? allDocs.find((d) => d.id === selectedDocId) ?? null : null;

  const filteredCategories = searchQuery.trim()
    ? categories
        .map((cat) => ({
          ...cat,
          docs: cat.docs.filter((d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.client.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.docs.length > 0)
    : categories;

  const updateDoc = useCallback(
    (id: string, patch: Partial<DocMeta>) => {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          docs: cat.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }))
      );
    },
    []
  );

  const charCount = selectedDoc?.content.length ?? 0;
  const wordCount = selectedDoc?.content.trim()
    ? selectedDoc.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // ── Toolbar actions ───────────────────────────────────────────────────────

  const insertAtCursor = (before: string, after = '') => {
    const ta = textareaRef.current;
    if (!ta || !selectedDoc) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    const newText =
      ta.value.slice(0, start) + before + selected + after + ta.value.slice(end);
    updateDoc(selectedDoc.id, { content: newText });
    // Restore focus + selection after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  };

  const toolbarActions = [
    { label: 'Заголовок', icon: 'Type' as const, action: () => insertAtCursor('## ', '') },
    { label: 'Жирный', icon: 'Bold' as const, action: () => insertAtCursor('**', '**') },
    { label: 'Курсив', icon: 'Italic' as const, action: () => insertAtCursor('_', '_') },
    { label: 'Список', icon: 'List' as const, action: () => insertAtCursor('\n- ', '') },
    {
      label: 'Таблица',
      icon: 'Table' as const,
      action: () =>
        insertAtCursor(
          '\n| Колонка 1 | Колонка 2 | Колонка 3 |\n|---|---|---|\n| Ячейка 1 | Ячейка 2 | Ячейка 3 |\n',
          ''
        ),
    },
  ];

  // ── New document from template ────────────────────────────────────────────

  const handleSelectTemplate = (tpl: typeof TEMPLATES[number]) => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${now.getFullYear()}`;

    const catMap: Record<string, string> = {
      'Акты выполненных работ': 'acts',
      'Коммерческие предложения': 'proposals',
      Договоры: 'contracts',
      Шаблоны: 'templates',
    };
    const catId = catMap[tpl.category] ?? 'templates';

    const newDoc: DocMeta = {
      id: `new-${Date.now()}`,
      name: `Новый — ${tpl.name}`,
      category: catId,
      client: '—',
      date: dateStr,
      status: 'draft',
      relatedOrders: [],
      content: tpl.content,
      updatedAt: dateStr,
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, docs: [newDoc, ...cat.docs] } : cat
      )
    );
    setSelectedDocId(newDoc.id);
    setShowNewDocModal(false);
  };

  // ── Insert variable ───────────────────────────────────────────────────────

  const insertVariable = (key: string) => {
    const ta = textareaRef.current;
    if (!ta || !selectedDoc) return;
    const start = ta.selectionStart;
    const newText = ta.value.slice(0, start) + key + ta.value.slice(start);
    updateDoc(selectedDoc.id, { content: newText });
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + key.length;
      ta.selectionEnd = start + key.length;
    });
  };

  // ── Toggle category ───────────────────────────────────────────────────────

  const toggleCat = (catId: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Icon
            name="Search"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Поиск документов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>

        <div className="flex-1" />

        {/* Template selector label */}
        <span className="text-xs text-gray-500 hidden sm:inline">Шаблон:</span>

        {/* Quick template select */}
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
          defaultValue=""
          onChange={(e) => {
            const tpl = TEMPLATES.find((t) => t.id === e.target.value);
            if (tpl) handleSelectTemplate(tpl);
            e.target.value = '';
          }}
        >
          <option value="" disabled>
            Выбрать шаблон
          </option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <Button
          onClick={() => setShowNewDocModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          <Icon name="Plus" size={15} />
          Новый документ
        </Button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: document tree ── */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Документы
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-1">
              {filteredCategories.map((cat) => {
                const collapsed = collapsedCats.has(cat.id);
                return (
                  <div key={cat.id}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCat(cat.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Icon
                        name={collapsed ? 'ChevronRight' : 'ChevronDown'}
                        size={13}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <Icon name="Folder" size={13} className="text-amber-500 flex-shrink-0" />
                      <span className="truncate">{cat.name}</span>
                      <span className="ml-auto text-gray-400 font-normal">{cat.docs.length}</span>
                    </button>

                    {/* Documents */}
                    {!collapsed &&
                      cat.docs.map((doc) => {
                        const isActive = doc.id === selectedDocId;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`w-full flex items-start gap-2 px-3 py-2 pl-8 text-left transition-colors ${
                              isActive
                                ? 'bg-blue-50 border-r-2 border-blue-500'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <Icon
                              name="FileText"
                              size={13}
                              className={`mt-0.5 flex-shrink-0 ${
                                isActive ? 'text-blue-500' : 'text-gray-400'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-xs truncate leading-tight ${
                                  isActive ? 'text-blue-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                {doc.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-400">{doc.updatedAt}</span>
                                <span
                                  className={`text-[9px] font-medium px-1 rounded ${STATUS_COLORS[doc.status]}`}
                                >
                                  {STATUS_LABELS[doc.status]}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* ── Center: editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedDoc ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                {toolbarActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    title={action.label}
                    className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Icon name={action.icon} size={15} />
                  </button>
                ))}
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <span className="text-xs text-gray-400 ml-1">
                  Markdown-форматирование
                </span>
              </div>

              {/* Document title input */}
              <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex-shrink-0">
                <input
                  type="text"
                  value={selectedDoc.name}
                  onChange={(e) => updateDoc(selectedDoc.id, { name: e.target.value })}
                  className="w-full text-lg font-semibold text-gray-900 border-none outline-none bg-transparent placeholder-gray-400"
                  placeholder="Название документа..."
                />
              </div>

              {/* Textarea */}
              <div className="flex-1 overflow-hidden px-6 pt-3 pb-2">
                <textarea
                  ref={textareaRef}
                  value={selectedDoc.content}
                  onChange={(e) => updateDoc(selectedDoc.id, { content: e.target.value })}
                  className="w-full h-full resize-none border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
                  placeholder="Начните вводить текст документа..."
                  style={{ minHeight: '500px' }}
                  spellCheck={false}
                />
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-4 px-6 py-2 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  Символов: <span className="text-gray-600 font-medium">{charCount.toLocaleString('ru-RU')}</span>
                </span>
                <span className="text-xs text-gray-400">
                  Слов: <span className="text-gray-600 font-medium">{wordCount.toLocaleString('ru-RU')}</span>
                </span>
                <div className="flex-1" />
                <span className="text-xs text-gray-400">
                  Изменён: {selectedDoc.updatedAt}
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Icon name="File" size={48} className="mb-4 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Выберите документ</p>
              <p className="text-xs text-gray-400 mt-1">или создайте новый</p>
            </div>
          )}
        </div>

        {/* ── Right panel: metadata ── */}
        <div className="w-64 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Свойства
            </span>
          </div>

          <ScrollArea className="flex-1">
            {selectedDoc ? (
              <div className="px-4 py-3 space-y-5">
                {/* Metadata fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                      Клиент
                    </label>
                    <input
                      type="text"
                      value={selectedDoc.client}
                      onChange={(e) => updateDoc(selectedDoc.id, { client: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                      Дата
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      <Icon name="Clock" size={13} className="text-gray-400" />
                      {selectedDoc.date}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                      Статус
                    </label>
                    <select
                      value={selectedDoc.status}
                      onChange={(e) =>
                        updateDoc(selectedDoc.id, { status: e.target.value as DocStatus })
                      }
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="draft">Черновик</option>
                      <option value="final">Финальный</option>
                      <option value="signed">Подписан</option>
                    </select>
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                    Переменные
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEMPLATE_VARIABLES.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => insertVariable(v.key)}
                        title={`Вставить ${v.key}`}
                        className="text-[10px] px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors font-mono leading-tight"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Нажмите для вставки в курсор
                  </p>
                </div>

                {/* Related orders */}
                {selectedDoc.relatedOrders.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Связанные наряды
                    </label>
                    <div className="space-y-1">
                      {selectedDoc.relatedOrders.map((order) => (
                        <div
                          key={order}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <Icon name="FileText" size={12} className="text-blue-500 flex-shrink-0" />
                          <span className="text-xs text-blue-600 font-medium">{order}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[selectedDoc.status]}`}
                  >
                    <Icon name="Check" size={11} />
                    {STATUS_LABELS[selectedDoc.status]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-gray-400">
                Выберите документ для просмотра свойств
              </div>
            )}
          </ScrollArea>

          {/* Action buttons */}
          {selectedDoc && (
            <div className="px-4 py-4 border-t border-gray-200 space-y-2 flex-shrink-0">
              <Button
                onClick={() => updateDoc(selectedDoc.id, { updatedAt: new Date().toLocaleDateString('ru-RU') })}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              >
                <Icon name="Save" size={14} />
                Сохранить
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-sm h-9"
                onClick={() => {
                  const blob = new Blob([selectedDoc.content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedDoc.name}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Icon name="Download" size={14} />
                Экспорт PDF
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-sm h-9 text-green-700 border-green-300 hover:bg-green-50"
              >
                <Icon name="Send" size={14} />
                Отправить клиенту
              </Button>
              <button
                className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg py-2 transition-colors"
                onClick={() => {
                  setCategories((prev) =>
                    prev.map((cat) => ({
                      ...cat,
                      docs: cat.docs.filter((d) => d.id !== selectedDoc.id),
                    }))
                  );
                  setSelectedDocId(null);
                }}
              >
                <Icon name="Trash2" size={13} />
                Удалить документ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── New document modal ── */}
      {showNewDocModal && (
        <NewDocModal
          onClose={() => setShowNewDocModal(false)}
          onSelect={handleSelectTemplate}
        />
      )}
    </div>
  );
}
