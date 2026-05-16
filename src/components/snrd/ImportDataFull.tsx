import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type DataType =
  | 'clients'
  | 'service-objects'
  | 'employees'
  | 'equipment'
  | 'price-list'
  | 'contracts'
  | 'work-orders'
  | 'stock';

type WizardStep = 1 | 2 | 3 | 4;
type ActiveTab = 'import' | 'history';

interface ImportTypeConfig {
  id: DataType;
  label: string;
  description: string;
  icon: string;
  formats: string[];
  fields: FieldConfig[];
  previewColumns: string[];
  previewRows: string[][];
}

interface FieldConfig {
  systemField: string;
  label: string;
  required: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface ImportError {
  row: number;
  field: string;
  description: string;
}

interface ImportHistoryEntry {
  id: string;
  date: string;
  type: string;
  file: string;
  status: 'success' | 'partial' | 'processing';
  total: number;
  success: number;
  errors: number;
  skipped: number;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const IMPORT_TYPES: ImportTypeConfig[] = [
  {
    id: 'clients',
    label: 'Клиенты',
    description: 'Физические и юридические лица с контактными данными',
    icon: 'Users',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'type', label: 'Тип клиента (физ./юр.)', required: true },
      { systemField: 'name', label: 'Наименование / ФИО', required: true },
      { systemField: 'inn', label: 'ИНН', required: false },
      { systemField: 'phone', label: 'Телефон', required: true },
      { systemField: 'email', label: 'Email', required: false },
      { systemField: 'address', label: 'Адрес', required: false },
      { systemField: 'contact_person', label: 'Контактное лицо', required: false },
      { systemField: 'notes', label: 'Примечания', required: false },
    ],
    previewColumns: ['Тип', 'Наименование', 'ИНН', 'Телефон'],
    previewRows: [
      ['Физ. лицо', 'Иванов Иван Иванович', '', '+7 900 123-45-67'],
      ['Юр. лицо', 'ООО «Климат Плюс»', '7701234567', '+7 495 000-11-22'],
      ['Физ. лицо', 'Петрова Мария Сергеевна', '', '+7 912 345-67-89'],
    ],
  },
  {
    id: 'service-objects',
    label: 'Объекты обслуживания',
    description: 'Адреса и объекты, где установлено оборудование клиентов',
    icon: 'MapPin',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'client_id', label: 'Клиент (ID или название)', required: true },
      { systemField: 'address', label: 'Адрес объекта', required: true },
      { systemField: 'name', label: 'Название объекта', required: false },
      { systemField: 'contact_person', label: 'Контактное лицо на объекте', required: false },
      { systemField: 'phone', label: 'Телефон на объекте', required: false },
      { systemField: 'floor', label: 'Этаж', required: false },
      { systemField: 'access_notes', label: 'Инструкция по доступу', required: false },
      { systemField: 'zone', label: 'Зона / район', required: false },
    ],
    previewColumns: ['Клиент', 'Адрес', 'Название', 'Контакт'],
    previewRows: [
      ['ООО «Климат Плюс»', 'ул. Ленина, 12, оф. 45', 'Главный офис', 'Секретарь'],
      ['Иванов И.И.', 'ул. Мира, 7, кв. 23', 'Квартира', ''],
      ['ООО «ТехСервис»', 'Пр-т Победы, 88', 'Склад №2', 'Кладовщик'],
    ],
  },
  {
    id: 'employees',
    label: 'Сотрудники',
    description: 'Инженеры, диспетчеры, менеджеры с компетенциями',
    icon: 'UserCheck',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'full_name', label: 'ФИО', required: true },
      { systemField: 'role', label: 'Роль (инженер/диспетчер/менеджер)', required: true },
      { systemField: 'phone', label: 'Телефон', required: true },
      { systemField: 'email', label: 'Email', required: true },
      { systemField: 'competencies', label: 'Компетенции (через запятую)', required: false },
      { systemField: 'schedule', label: 'График работы', required: false },
      { systemField: 'employment_type', label: 'Тип занятости', required: false },
      { systemField: 'hire_date', label: 'Дата приёма', required: false },
    ],
    previewColumns: ['ФИО', 'Роль', 'Телефон', 'Email'],
    previewRows: [
      ['Козлов Алексей', 'Инженер', '+7 900 111-22-33', 'kozlov@sk.ru'],
      ['Петрова Анна', 'Диспетчер', '+7 900 444-55-66', 'petrova@sk.ru'],
      ['Сидоров Денис', 'Инженер', '+7 900 777-88-99', 'sidorov@sk.ru'],
    ],
  },
  {
    id: 'equipment',
    label: 'Оборудование',
    description: 'Каталог климатического оборудования клиентов',
    icon: 'Wind',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'brand', label: 'Бренд', required: true },
      { systemField: 'model', label: 'Модель', required: true },
      { systemField: 'serial_number', label: 'Серийный номер', required: true },
      { systemField: 'client_id', label: 'Клиент', required: true },
      { systemField: 'object_address', label: 'Адрес объекта', required: true },
      { systemField: 'install_date', label: 'Дата установки', required: false },
      { systemField: 'refrigerant_type', label: 'Тип хладагента', required: false },
      { systemField: 'refrigerant_volume', label: 'Объём хладагента (кг)', required: false },
      { systemField: 'warranty_until', label: 'Гарантия до', required: false },
    ],
    previewColumns: ['Бренд', 'Модель', 'Серийный №', 'Клиент'],
    previewRows: [
      ['Daikin', 'FTXB25C', 'JPN12345678', 'ООО «Климат Плюс»'],
      ['Mitsubishi', 'MSZ-LN35VG', 'TH98765432', 'Иванов И.И.'],
      ['Haier', 'AS18NS5ERA', 'CHN11223344', 'ООО «ТехСервис»'],
    ],
  },
  {
    id: 'price-list',
    label: 'Прайс-лист',
    description: 'Услуги, запасные части и материалы с ценами',
    icon: 'Tag',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'article', label: 'Артикул', required: true },
      { systemField: 'name', label: 'Наименование', required: true },
      { systemField: 'category', label: 'Категория', required: true },
      { systemField: 'unit', label: 'Единица измерения', required: true },
      { systemField: 'purchase_price', label: 'Цена закупки', required: false },
      { systemField: 'sale_price', label: 'Цена продажи', required: true },
      { systemField: 'brand', label: 'Бренд', required: false },
      { systemField: 'compatible_models', label: 'Совместимые модели', required: false },
    ],
    previewColumns: ['Артикул', 'Наименование', 'Категория', 'Цена продажи'],
    previewRows: [
      ['AC-001', 'Чистка внутреннего блока', 'Услуги ТО', '1 500 ₽'],
      ['SKU-R410', 'Фреон R-410A (баллон 10 кг)', 'Хладагенты', '6 200 ₽'],
      ['SKU-FLT1', 'Фильтр-осушитель 1/4"', 'Фильтры', '180 ₽'],
    ],
  },
  {
    id: 'contracts',
    label: 'Договоры',
    description: 'Сервисные договоры и SLA-конфигурации',
    icon: 'FileSignature',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'contract_number', label: 'Номер договора', required: true },
      { systemField: 'client_id', label: 'Клиент', required: true },
      { systemField: 'start_date', label: 'Дата начала', required: true },
      { systemField: 'end_date', label: 'Дата окончания', required: true },
      { systemField: 'contract_amount', label: 'Сумма договора', required: false },
      { systemField: 'sla_tto', label: 'SLA: время реакции (ч)', required: false },
      { systemField: 'sla_ttr', label: 'SLA: время восстановления (ч)', required: false },
      { systemField: 'notes', label: 'Примечания', required: false },
    ],
    previewColumns: ['Номер', 'Клиент', 'Дата начала', 'Дата окончания'],
    previewRows: [
      ['ДГ-2025-001', 'ООО «Климат Плюс»', '01.01.2025', '31.12.2025'],
      ['ДГ-2025-002', 'ООО «ТехСервис»', '01.03.2025', '28.02.2026'],
      ['ДГ-2024-088', 'Иванов И.И.', '15.06.2024', '14.06.2025'],
    ],
  },
  {
    id: 'work-orders',
    label: 'Наряды',
    description: 'Архив нарядов на выполненные работы из другой системы',
    icon: 'ClipboardList',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'order_number', label: 'Номер наряда', required: true },
      { systemField: 'created_at', label: 'Дата создания', required: true },
      { systemField: 'client_id', label: 'Клиент', required: true },
      { systemField: 'object_address', label: 'Адрес объекта', required: false },
      { systemField: 'type', label: 'Тип работ', required: true },
      { systemField: 'status', label: 'Статус', required: true },
      { systemField: 'engineer', label: 'Инженер', required: false },
      { systemField: 'amount', label: 'Сумма', required: false },
      { systemField: 'completed_at', label: 'Дата завершения', required: false },
    ],
    previewColumns: ['Номер', 'Дата', 'Клиент', 'Статус'],
    previewRows: [
      ['WO-2025-000123', '12.03.2025', 'ООО «Климат Плюс»', 'Завершён'],
      ['WO-2025-000124', '13.03.2025', 'Иванов И.И.', 'Завершён'],
      ['WO-2025-000125', '14.03.2025', 'ООО «ТехСервис»', 'Отменён'],
    ],
  },
  {
    id: 'stock',
    label: 'Складские остатки',
    description: 'Начальные остатки товаров и материалов на складе',
    icon: 'Package',
    formats: ['Excel (.xlsx)', 'CSV'],
    fields: [
      { systemField: 'article', label: 'Артикул', required: true },
      { systemField: 'name', label: 'Наименование', required: true },
      { systemField: 'category', label: 'Категория', required: true },
      { systemField: 'unit', label: 'Единица измерения', required: true },
      { systemField: 'quantity', label: 'Количество', required: true },
      { systemField: 'purchase_price', label: 'Цена закупки', required: false },
      { systemField: 'warehouse', label: 'Склад', required: false },
      { systemField: 'min_quantity', label: 'Минимальный остаток', required: false },
    ],
    previewColumns: ['Артикул', 'Наименование', 'Кол-во', 'Ед.'],
    previewRows: [
      ['SKU-R410', 'Фреон R-410A (баллон 10 кг)', '12', 'баллон'],
      ['SKU-FLT1', 'Фильтр-осушитель 1/4"', '48', 'шт'],
      ['SKU-COP1', 'Медная трубка 1/4" (бухта 25м)', '8', 'бухта'],
    ],
  },
];

const IMPORT_HISTORY: ImportHistoryEntry[] = [
  {
    id: 'IMP-006',
    date: '12.05.2026 09:30',
    type: 'Клиенты',
    file: 'clients_may_2026.xlsx',
    status: 'partial',
    total: 87,
    success: 85,
    errors: 2,
    skipped: 0,
  },
  {
    id: 'IMP-005',
    date: '05.05.2026 14:20',
    type: 'Складские остатки',
    file: 'stock_catalog_v3.csv',
    status: 'success',
    total: 234,
    success: 234,
    errors: 0,
    skipped: 0,
  },
  {
    id: 'IMP-004',
    date: '28.04.2026 10:00',
    type: 'Сотрудники',
    file: 'engineers_list.xlsx',
    status: 'partial',
    total: 15,
    success: 14,
    errors: 1,
    skipped: 0,
  },
  {
    id: 'IMP-003',
    date: '20.04.2026 16:45',
    type: 'Оборудование',
    file: 'equipment_database.xlsx',
    status: 'partial',
    total: 412,
    success: 400,
    errors: 7,
    skipped: 5,
  },
  {
    id: 'IMP-002',
    date: '15.04.2026 11:15',
    type: 'Прайс-лист',
    file: 'services_catalog.csv',
    status: 'success',
    total: 48,
    success: 48,
    errors: 0,
    skipped: 0,
  },
];

const MOCK_ERRORS: ImportError[] = [
  { row: 14, field: 'phone', description: 'Неверный формат телефона: «89001234567» — ожидается +7XXXXXXXXXX' },
  { row: 27, field: 'email', description: 'Некорректный email: «ivanov@mail»' },
  { row: 43, field: 'inn', description: 'ИНН содержит 10 цифр, но для физ. лиц должно быть 12' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepIndicator = ({ step }: { step: WizardStep }) => {
  const steps = [
    { n: 1, label: 'Тип данных' },
    { n: 2, label: 'Загрузка' },
    { n: 3, label: 'Маппинг' },
    { n: 4, label: 'Результат' },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, idx) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                ${s.n < step ? 'bg-blue-600 text-white' : s.n === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}
            >
              {s.n < step ? <Icon name="Check" size={14} /> : s.n}
            </div>
            <span className={`text-xs whitespace-nowrap ${s.n === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${s.n < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Step 1: Data type selection ──────────────────────────────────────────────

interface Step1Props {
  onSelect: (type: ImportTypeConfig) => void;
}

const Step1 = ({ onSelect }: Step1Props) => (
  <div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">Выберите тип данных для импорта</h3>
    <p className="text-sm text-gray-500 mb-6">Нажмите на нужную карточку, чтобы перейти к загрузке файла</p>
    <div className="grid grid-cols-4 gap-4">
      {IMPORT_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type)}
          className="text-left p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
            <Icon name={type.icon as never} size={20} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="font-medium text-gray-900 text-sm mb-1">{type.label}</p>
          <p className="text-xs text-gray-500 leading-snug mb-3">{type.description}</p>
          <div className="flex flex-wrap gap-1">
            {type.formats.map((f) => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {f}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ─── Step 2: File upload ───────────────────────────────────────────────────────

interface Step2Props {
  selectedType: ImportTypeConfig;
  uploadedFile: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  onNext: () => void;
  onBack: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const Step2 = ({ selectedType, uploadedFile, onFileSelect, onNext, onBack }: Step2Props) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect({ name: file.name, size: file.size, type: file.type });
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect({ name: file.name, size: file.size, type: file.type });
    }
  };

  const handleTemplateDownload = () => {
    toast.success(`Шаблон для «${selectedType.label}» скачивается...`, {
      description: 'Файл будет сохранён в папку «Загрузки»',
    });
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left: upload zone */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Загрузка файла</h3>
        <p className="text-sm text-gray-500 mb-4">
          Тип данных: <span className="font-medium text-gray-700">{selectedType.label}</span>
        </p>

        {!uploadedFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
              ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
          >
            <Icon
              name="CloudUpload"
              size={40}
              className={`mx-auto mb-3 transition-colors ${dragOver ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <p className="font-medium text-gray-700 mb-1">
              {dragOver ? 'Отпустите файл для загрузки' : 'Перетащите файл сюда'}
            </p>
            <p className="text-sm text-gray-500 mb-4">или нажмите для выбора</p>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Icon name="FolderOpen" size={14} className="mr-2" />
              Выбрать файл
            </Button>
            <p className="text-xs text-gray-400 mt-3">.xlsx, .xls, .csv — до 50 МБ</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="border-2 border-green-300 bg-green-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="FileCheck2" size={20} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
              <button
                onClick={() => onFileSelect(null as unknown as UploadedFile)}
                className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Icon name="CheckCircle" size={14} />
              <span>Файл готов к обработке</span>
            </div>
          </div>
        )}

        <button
          onClick={handleTemplateDownload}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Icon name="Download" size={14} />
          Скачать шаблон для «{selectedType.label}»
        </button>
      </div>

      {/* Right: requirements */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Требования к файлу</h4>
        <ul className="space-y-2 mb-6">
          {[
            'Первая строка — заголовки столбцов',
            'Кодировка: UTF-8 или Windows-1251',
            'Разделитель CSV: точка с запятой (;)',
            'Даты в формате: ДД.ММ.ГГГГ',
            'Телефоны в формате: +7XXXXXXXXXX',
            'Денежные суммы без пробелов и знаков валюты',
          ].map((req) => (
            <li key={req} className="flex items-start gap-2 text-sm text-gray-600">
              <Icon name="Info" size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Обязательные поля</h4>
        <div className="flex flex-wrap gap-1.5">
          {selectedType.fields
            .filter((f) => f.required)
            .map((f) => (
              <Badge key={f.systemField} className="bg-red-50 text-red-700 border border-red-200">
                {f.label} *
              </Badge>
            ))}
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" size={14} className="mr-2" />
            Назад
          </Button>
          <Button onClick={onNext} disabled={!uploadedFile}>
            Далее
            <Icon name="ArrowRight" size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 3: Field mapping ────────────────────────────────────────────────────

interface Step3Props {
  selectedType: ImportTypeConfig;
  mapping: Record<string, string>;
  onMappingChange: (field: string, value: string) => void;
  onBack: () => void;
  onImport: () => void;
}

// Simulate file columns that came from the uploaded file
const MOCK_FILE_COLUMNS = [
  '— не выбрано —',
  'Колонка A',
  'Колонка B',
  'Колонка C',
  'Колонка D',
  'Колонка E',
  'Колонка F',
  'Колонка G',
  'Колонка H',
];

const Step3 = ({ selectedType, mapping, onMappingChange, onBack, onImport }: Step3Props) => {
  const requiredMapped = selectedType.fields
    .filter((f) => f.required)
    .every((f) => mapping[f.systemField] && mapping[f.systemField] !== '— не выбрано —');

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Маппинг полей</h3>
      <p className="text-sm text-gray-500 mb-6">
        Сопоставьте поля системы с колонками вашего файла. Поля, помеченные{' '}
        <span className="text-red-500 font-medium">*</span>, обязательны для заполнения.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Mapping table */}
        <div>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 border-b">Поле системы</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 border-b">Колонка в файле</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedType.fields.map((field) => (
                <tr key={field.systemField} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span className="text-gray-700">{field.label}</span>
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={mapping[field.systemField] || '— не выбрано —'}
                      onChange={(e) => onMappingChange(field.systemField, e.target.value)}
                      className={`w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                        ${mapping[field.systemField] && mapping[field.systemField] !== '— не выбрано —'
                          ? 'border-green-300 bg-green-50'
                          : field.required
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-300 bg-white'}`}
                    >
                      {MOCK_FILE_COLUMNS.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Предпросмотр файла{' '}
            <span className="font-normal text-gray-500">(первые 3 строки)</span>
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {selectedType.previewColumns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-semibold text-gray-600 border-b">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedType.previewRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-gray-700 max-w-[120px] truncate">
                        {cell || <span className="text-gray-300 italic">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!requiredMapped && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Icon name="AlertTriangle" size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Не все обязательные поля сопоставлены. Заполните их перед импортом.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <Icon name="ArrowLeft" size={14} className="mr-2" />
          Назад
        </Button>
        <Button onClick={onImport} disabled={!requiredMapped}>
          <Icon name="Upload" size={14} className="mr-2" />
          Импортировать
        </Button>
      </div>
    </div>
  );
};

// ─── Step 4: Result ────────────────────────────────────────────────────────────

interface Step4Props {
  selectedType: ImportTypeConfig;
  onNewImport: () => void;
}

const Step4 = ({ selectedType, onNewImport }: Step4Props) => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const totalMs = 1500;
    const intervalMs = 30;
    const step = (intervalMs / totalMs) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setDone(true);
          return 100;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadReport = () => {
    toast.success('Отчёт об импорте скачивается...', {
      description: 'Файл import_report.xlsx будет сохранён в «Загрузки»',
    });
  };

  const statsTotal = 87;
  const statsSuccess = 84;
  const statsErrors = MOCK_ERRORS.length;
  const statsSkipped = 0;

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Результат импорта</h3>
      <p className="text-sm text-gray-500 mb-6">
        Тип данных: <span className="font-medium text-gray-700">{selectedType.label}</span>
      </p>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {done ? 'Импорт завершён' : 'Обработка файла...'}
          </span>
          <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-75 ${done ? 'bg-green-500' : 'bg-blue-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {done && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-2xl font-bold text-gray-900">{statsTotal}</p>
              <p className="text-xs text-gray-500 mt-1">Всего записей</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <p className="text-2xl font-bold text-green-600">{statsSuccess}</p>
              <p className="text-xs text-green-600 mt-1">Успешно</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
              <p className="text-2xl font-bold text-red-600">{statsErrors}</p>
              <p className="text-xs text-red-600 mt-1">С ошибками</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-2xl font-bold text-amber-600">{statsSkipped}</p>
              <p className="text-xs text-amber-600 mt-1">Пропущено</p>
            </div>
          </div>

          {/* Success banner */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="CheckCircle2" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">
                {statsSuccess} из {statsTotal} записей успешно импортированы
              </p>
              <p className="text-sm text-green-600">Данные доступны в разделе «{selectedType.label}»</p>
            </div>
          </div>

          {/* Error table */}
          {statsErrors > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="AlertCircle" size={14} className="text-red-500" />
                Ошибки импорта ({statsErrors})
              </h4>
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-red-700 border-b border-red-200">
                        Строка
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-red-700 border-b border-red-200">
                        Поле
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-red-700 border-b border-red-200">
                        Описание ошибки
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {MOCK_ERRORS.map((err, idx) => (
                      <tr key={idx} className="hover:bg-red-50">
                        <td className="px-4 py-2.5 font-mono text-gray-600">{err.row}</td>
                        <td className="px-4 py-2.5">
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            {err.field}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{err.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadReport}>
              <Icon name="Download" size={14} className="mr-2" />
              Скачать отчёт
            </Button>
            <Button onClick={onNewImport}>
              <Icon name="RefreshCw" size={14} className="mr-2" />
              Новый импорт
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── History tab ───────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
  success: { label: 'Завершён', className: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  partial: { label: 'С ошибками', className: 'bg-amber-100 text-amber-700', icon: 'AlertCircle' },
  processing: { label: 'В обработке', className: 'bg-blue-100 text-blue-700', icon: 'Loader' },
};

const HistoryTab = ({ onRepeat }: { onRepeat: (entry: ImportHistoryEntry) => void }) => (
  <div>
    <h3 className="text-base font-semibold text-gray-900 mb-4">История импортов</h3>
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b">Дата</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b">Тип данных</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b">Файл</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 border-b">Всего</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 border-b">Успешно</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 border-b">Ошибок</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b">Статус</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {IMPORT_HISTORY.map((entry) => {
            const sc = statusConfig[entry.status];
            return (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{entry.id}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{entry.date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{entry.type}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                  <div className="flex items-center gap-1.5">
                    <Icon name="File" size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{entry.file}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{entry.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium text-green-600">{entry.success.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {entry.errors > 0 ? (
                    <span className="text-red-600">{entry.errors}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${sc.className}`}>
                    <Icon name={sc.icon as never} size={11} />
                    {sc.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() => onRepeat(entry)}
                  >
                    <Icon name="RotateCcw" size={12} className="mr-1" />
                    Повторить
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ImportDataFull = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('import');
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedType, setSelectedType] = useState<ImportTypeConfig | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleTypeSelect = (type: ImportTypeConfig) => {
    setSelectedType(type);
    setUploadedFile(null);
    setMapping({});
    setStep(2);
  };

  const handleMappingChange = (field: string, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewImport = () => {
    setStep(1);
    setSelectedType(null);
    setUploadedFile(null);
    setMapping({});
  };

  const handleRepeat = (entry: ImportHistoryEntry) => {
    toast.info(`Повторный импорт: ${entry.type}`, {
      description: `Файл: ${entry.file}`,
    });
    setActiveTab('import');
    setStep(1);
  };

  const handleFileSelect = (file: UploadedFile | null) => {
    setUploadedFile(file);
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Импорт данных</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Загрузка данных из внешних файлов Excel и CSV в систему «Сервис Климат»
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {(
          [
            { id: 'import', label: 'Новый импорт', icon: 'Upload' },
            { id: 'history', label: 'История импортов', icon: 'History' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon name={tab.icon as never} size={14} />
            {tab.label}
            {tab.id === 'history' && (
              <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {IMPORT_HISTORY.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'import' ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <StepIndicator step={step} />

          {step === 1 && <Step1 onSelect={handleTypeSelect} />}

          {step === 2 && selectedType && (
            <Step2
              selectedType={selectedType}
              uploadedFile={uploadedFile}
              onFileSelect={handleFileSelect}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && selectedType && (
            <Step3
              selectedType={selectedType}
              mapping={mapping}
              onMappingChange={handleMappingChange}
              onBack={() => setStep(2)}
              onImport={() => setStep(4)}
            />
          )}

          {step === 4 && selectedType && (
            <Step4 selectedType={selectedType} onNewImport={handleNewImport} />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <HistoryTab onRepeat={handleRepeat} />
        </div>
      )}
    </div>
  );
};

export default ImportDataFull;
