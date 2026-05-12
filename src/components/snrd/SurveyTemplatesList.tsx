import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

type TemplateType = 'Приёмка' | 'Сдача' | 'Диагностика' | 'ТО' | 'Рекламация';
type QuestionType = 'Текст' | 'Число' | 'Да/Нет' | 'Фото' | 'Подпись' | 'Список';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

interface SurveyTemplate {
  id: string;
  name: string;
  type: TemplateType;
  questionsCount: number;
  fields: string[];
  usageCount: number;
  lastUsed: string;
  questions: Question[];
}

const QUESTION_TYPES: QuestionType[] = ['Текст', 'Число', 'Да/Нет', 'Фото', 'Подпись', 'Список'];

const mockTemplates: SurveyTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Приёмка оборудования',
    type: 'Приёмка',
    questionsCount: 8,
    fields: ['Марка оборудования', 'Серийный номер', 'Внешнее состояние', 'Комплектность', 'Работоспособность', 'Фото до', 'Подпись клиента', 'Дополнительно'],
    usageCount: 142,
    lastUsed: '11.05.2026',
    questions: [
      { id: 'q1', text: 'Марка оборудования', type: 'Текст', required: true },
      { id: 'q2', text: 'Серийный номер', type: 'Текст', required: true },
      { id: 'q3', text: 'Внешнее состояние', type: 'Список', required: true },
      { id: 'q4', text: 'Комплектность соответствует', type: 'Да/Нет', required: true },
      { id: 'q5', text: 'Оборудование работоспособно', type: 'Да/Нет', required: false },
      { id: 'q6', text: 'Фото до ремонта', type: 'Фото', required: true },
      { id: 'q7', text: 'Подпись клиента', type: 'Подпись', required: true },
      { id: 'q8', text: 'Дополнительные замечания', type: 'Текст', required: false },
    ],
  },
  {
    id: 'TPL-002',
    name: 'Сдача после ремонта',
    type: 'Сдача',
    questionsCount: 6,
    fields: ['Выполненные работы', 'Проверка функций', 'Фото после', 'Рекомендации', 'Согласие клиента', 'Подпись'],
    usageCount: 138,
    lastUsed: '11.05.2026',
    questions: [
      { id: 'q1', text: 'Выполненные работы', type: 'Текст', required: true },
      { id: 'q2', text: 'Все функции работают', type: 'Да/Нет', required: true },
      { id: 'q3', text: 'Фото после ремонта', type: 'Фото', required: true },
      { id: 'q4', text: 'Рекомендации клиенту', type: 'Текст', required: false },
      { id: 'q5', text: 'Клиент согласен с результатом', type: 'Да/Нет', required: true },
      { id: 'q6', text: 'Подпись клиента', type: 'Подпись', required: true },
    ],
  },
  {
    id: 'TPL-003',
    name: 'Диагностика кондиционера',
    type: 'Диагностика',
    questionsCount: 10,
    fields: ['Модель', 'Давление фреона', 'Температура нагнетания', 'Ток компрессора', 'Ток вентилятора', 'Загрязнение фильтра', 'Состояние дренажа', 'Коды ошибок', 'Фото', 'Заключение'],
    usageCount: 76,
    lastUsed: '10.05.2026',
    questions: [
      { id: 'q1', text: 'Модель и серийный номер', type: 'Текст', required: true },
      { id: 'q2', text: 'Давление фреона (высокая сторона)', type: 'Число', required: true },
      { id: 'q3', text: 'Давление фреона (низкая сторона)', type: 'Число', required: true },
      { id: 'q4', text: 'Температура нагнетания', type: 'Число', required: true },
      { id: 'q5', text: 'Ток компрессора (А)', type: 'Число', required: true },
      { id: 'q6', text: 'Фильтр загрязнён', type: 'Да/Нет', required: true },
      { id: 'q7', text: 'Состояние дренажа', type: 'Список', required: false },
      { id: 'q8', text: 'Коды ошибок', type: 'Текст', required: false },
      { id: 'q9', text: 'Фото дефектов', type: 'Фото', required: false },
      { id: 'q10', text: 'Заключение инженера', type: 'Текст', required: true },
    ],
  },
  {
    id: 'TPL-004',
    name: 'Плановое ТО (лайт)',
    type: 'ТО',
    questionsCount: 7,
    fields: ['Очистка фильтров', 'Промывка дренажа', 'Проверка давления', 'Дозаправка', 'Чистка блоков', 'Фото', 'Подпись'],
    usageCount: 204,
    lastUsed: '11.05.2026',
    questions: [
      { id: 'q1', text: 'Фильтры очищены', type: 'Да/Нет', required: true },
      { id: 'q2', text: 'Дренаж промыт', type: 'Да/Нет', required: true },
      { id: 'q3', text: 'Давление в норме', type: 'Да/Нет', required: true },
      { id: 'q4', text: 'Потребовалась дозаправка фреона', type: 'Да/Нет', required: false },
      { id: 'q5', text: 'Блоки очищены', type: 'Да/Нет', required: true },
      { id: 'q6', text: 'Фото после ТО', type: 'Фото', required: true },
      { id: 'q7', text: 'Подпись ответственного', type: 'Подпись', required: true },
    ],
  },
  {
    id: 'TPL-005',
    name: 'Плановое ТО (полное)',
    type: 'ТО',
    questionsCount: 12,
    fields: ['Параметры системы', 'Давления', 'Токи', 'Температуры', 'Фильтры', 'Дренаж', 'Электрика', 'Хладагент', 'Корпус', 'Компрессор', 'Фото', 'Подпись'],
    usageCount: 91,
    lastUsed: '09.05.2026',
    questions: [],
  },
  {
    id: 'TPL-006',
    name: 'Рекламационный акт',
    type: 'Рекламация',
    questionsCount: 9,
    fields: ['Описание проблемы', 'Дата обнаружения', 'Фото дефекта', 'Причина', 'Вина инженера', 'Действия', 'Результат', 'Компенсация', 'Подписи'],
    usageCount: 18,
    lastUsed: '07.05.2026',
    questions: [],
  },
  {
    id: 'TPL-007',
    name: 'Диагностика вентиляции',
    type: 'Диагностика',
    questionsCount: 8,
    fields: ['Расходы воздуха', 'Шум', 'Вибрации', 'Фильтры', 'Приводные ремни', 'Автоматика', 'Фото', 'Заключение'],
    usageCount: 33,
    lastUsed: '06.05.2026',
    questions: [],
  },
  {
    id: 'TPL-008',
    name: 'Приёмка монтажа',
    type: 'Приёмка',
    questionsCount: 11,
    fields: ['Место установки', 'Правильность монтажа', 'Трубопроводы', 'Электропроводка', 'Заземление', 'Дренаж', 'Давление', 'Первый пуск', 'Инструктаж', 'Фото', 'Подпись'],
    usageCount: 57,
    lastUsed: '08.05.2026',
    questions: [],
  },
];

const TYPE_COLORS: Record<TemplateType, string> = {
  Приёмка: 'bg-blue-100 text-blue-700',
  Сдача: 'bg-green-100 text-green-700',
  Диагностика: 'bg-purple-100 text-purple-700',
  ТО: 'bg-orange-100 text-orange-700',
  Рекламация: 'bg-red-100 text-red-700',
};

const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  Текст: 'Type',
  Число: 'Hash',
  'Да/Нет': 'ToggleLeft',
  Фото: 'Camera',
  Подпись: 'PenTool',
  Список: 'List',
};

const generateId = () => `q${Date.now()}`;

const OfficeTemplatesList = () => {
  const [templates, setTemplates] = useState<SurveyTemplate[]>(mockTemplates);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TemplateType>('Приёмка');
  const [builderQuestions, setBuilderQuestions] = useState<Question[]>([]);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('Текст');
  const [newQRequired, setNewQRequired] = useState(false);

  const openBuilder = () => {
    setFormName('');
    setFormType('Приёмка');
    setBuilderQuestions([]);
    setNewQText('');
    setIsBuilderOpen(true);
  };

  const addQuestion = () => {
    if (!newQText.trim()) return;
    setBuilderQuestions([
      ...builderQuestions,
      { id: generateId(), text: newQText, type: newQType, required: newQRequired },
    ]);
    setNewQText('');
    setNewQRequired(false);
  };

  const removeQuestion = (id: string) => {
    setBuilderQuestions(builderQuestions.filter((q) => q.id !== id));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const idx = builderQuestions.findIndex((q) => q.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === builderQuestions.length - 1) return;
    const next = [...builderQuestions];
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setBuilderQuestions(next);
  };

  const saveTemplate = () => {
    if (!formName.trim() || builderQuestions.length === 0) return;
    const tpl: SurveyTemplate = {
      id: `TPL-${String(templates.length + 1).padStart(3, '0')}`,
      name: formName,
      type: formType,
      questionsCount: builderQuestions.length,
      fields: builderQuestions.map((q) => q.text),
      usageCount: 0,
      lastUsed: '—',
      questions: builderQuestions,
    };
    setTemplates([...templates, tpl]);
    setIsBuilderOpen(false);
  };

  const openPreview = (tpl: SurveyTemplate) => {
    setSelectedTemplate(tpl);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Шаблоны опросных листов</h2>
          <p className="text-gray-500 mt-1">Управление формами и чек-листами для нарядов</p>
        </div>
        <Button onClick={openBuilder}>
          <Icon name="FilePlus" size={16} className="mr-2" />
          Создать шаблон
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(['Приёмка', 'Сдача', 'Диагностика', 'ТО'] as TemplateType[]).map((type) => {
          const count = templates.filter((t) => t.type === type).length;
          const uses = templates.filter((t) => t.type === type).reduce((s, t) => s + t.usageCount, 0);
          return (
            <Card key={type}>
              <CardContent className="pt-4">
                <Badge className={TYPE_COLORS[type] + ' mb-2'}>{type}</Badge>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-gray-500">{uses} использований</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все шаблоны ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Шаблон</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Вопросов</TableHead>
                <TableHead>Поля</TableHead>
                <TableHead>Использований</TableHead>
                <TableHead>Последнее использование</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((tpl) => (
                <TableRow key={tpl.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{tpl.name}</div>
                    <div className="text-xs text-gray-400">{tpl.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={TYPE_COLORS[tpl.type]}>{tpl.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">{tpl.questionsCount}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {tpl.fields.slice(0, 3).map((f) => (
                        <span key={f} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {f}
                        </span>
                      ))}
                      {tpl.fields.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{tpl.fields.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Icon name="BarChart2" size={14} className="text-gray-400" />
                      <span className="text-sm font-medium">{tpl.usageCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{tpl.lastUsed}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openPreview(tpl)} title="Предпросмотр">
                        <Icon name="Eye" size={15} />
                      </Button>
                      <Button variant="ghost" size="sm" title="Редактировать">
                        <Icon name="Edit" size={15} />
                      </Button>
                      <Button variant="ghost" size="sm" title="Дублировать">
                        <Icon name="Copy" size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Конструктор шаблона</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Название шаблона *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Например: Приёмка оборудования"
                />
              </div>
              <div>
                <Label>Тип</Label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TemplateType)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(['Приёмка', 'Сдача', 'Диагностика', 'ТО', 'Рекламация'] as TemplateType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="font-medium text-sm text-gray-700">Добавить вопрос</div>
              <div className="flex gap-2">
                <Input
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  placeholder="Текст вопроса..."
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') addQuestion(); }}
                />
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as QuestionType)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={newQRequired}
                    onChange={(e) => setNewQRequired(e.target.checked)}
                    className="accent-blue-600"
                  />
                  Обязат.
                </label>
                <Button size="sm" onClick={addQuestion} disabled={!newQText.trim()}>
                  <Icon name="Plus" size={14} />
                </Button>
              </div>
            </div>

            {builderQuestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Вопросы ({builderQuestions.length})
                </div>
                {builderQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
                    <Icon name={QUESTION_TYPE_ICONS[q.type]} size={14} className="text-gray-500 shrink-0" />
                    <span className="flex-1 text-sm">{q.text}</span>
                    <Badge variant="outline" className="text-xs">{q.type}</Badge>
                    {q.required && (
                      <span className="text-xs text-red-500 font-medium">*</span>
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => moveQuestion(q.id, 'up')} disabled={idx === 0}>
                        <Icon name="ChevronUp" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(q.id, 'down')}
                        disabled={idx === builderQuestions.length - 1}
                      >
                        <Icon name="ChevronDown" size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}>
                        <Icon name="Trash2" size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {builderQuestions.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
                Добавьте первый вопрос
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>Отмена</Button>
            <Button onClick={saveTemplate} disabled={!formName.trim() || builderQuestions.length === 0}>
              Сохранить шаблон
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {selectedTemplate && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Предпросмотр: {selectedTemplate.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={TYPE_COLORS[selectedTemplate.type]}>{selectedTemplate.type}</Badge>
                <span className="text-sm text-gray-500">{selectedTemplate.questionsCount} вопросов</span>
              </div>
              <div className="space-y-4">
                {(selectedTemplate.questions.length > 0 ? selectedTemplate.questions : selectedTemplate.fields.map((f, i) => ({
                  id: `f${i}`,
                  text: f,
                  type: 'Текст' as QuestionType,
                  required: false,
                }))).map((q, idx) => (
                  <div key={q.id} className="space-y-1">
                    <Label className="flex items-center gap-1">
                      <span className="text-gray-400 text-xs">{idx + 1}.</span>
                      {q.text}
                      {q.required && <span className="text-red-500">*</span>}
                      <Badge variant="outline" className="text-xs ml-1">{q.type}</Badge>
                    </Label>
                    {(q.type === 'Текст' || q.type === 'Число') && (
                      <Input disabled placeholder={q.type === 'Число' ? '0' : 'Введите ответ...'} />
                    )}
                    {q.type === 'Да/Нет' && (
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="radio" name={q.id} disabled /> Да
                        </label>
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="radio" name={q.id} disabled /> Нет
                        </label>
                      </div>
                    )}
                    {q.type === 'Фото' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm">
                        <Icon name="Camera" size={20} className="mx-auto mb-1 opacity-50" />
                        Прикрепить фото
                      </div>
                    )}
                    {q.type === 'Подпись' && (
                      <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm h-16">
                        <Icon name="PenTool" size={16} className="mx-auto mb-1 opacity-50" />
                        Поле для подписи
                      </div>
                    )}
                    {q.type === 'Список' && (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" disabled>
                        <option>Выберите значение...</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default OfficeTemplatesList;
