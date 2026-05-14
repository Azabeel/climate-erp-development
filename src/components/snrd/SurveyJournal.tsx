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

interface SurveyAnswer {
  question: string;
  answer: string;
  type: string;
}

interface CompletedSurvey {
  id: string;
  date: string;
  workOrderNumber: string;
  clientName: string;
  objectName: string;
  templateName: string;
  templateType: string;
  engineer: string;
  completionTime: number;
  hasPhotos: boolean;
  hasSigning: boolean;
  score: number;
  answers: SurveyAnswer[];
}

const mockSurveys: CompletedSurvey[] = [
  {
    id: 'SRV-001', date: '11.05.2026', workOrderNumber: 'WO-2026-000115',
    clientName: 'ТЦ «Мега»', objectName: 'Кондиционер Daikin FTX50K', templateName: 'Сдача после ремонта',
    templateType: 'Сдача', engineer: 'Иванов Иван', completionTime: 14, hasPhotos: true, hasSigning: true, score: 98,
    answers: [
      { question: 'Выполненные работы', answer: 'Замена компрессора, дозаправка фреона R-410A', type: 'Текст' },
      { question: 'Все функции работают', answer: 'Да', type: 'Да/Нет' },
      { question: 'Фото после ремонта', answer: '3 фото', type: 'Фото' },
      { question: 'Рекомендации клиенту', answer: 'Чистка фильтров каждые 3 месяца', type: 'Текст' },
      { question: 'Клиент согласен с результатом', answer: 'Да', type: 'Да/Нет' },
      { question: 'Подпись клиента', answer: 'Подписано', type: 'Подпись' },
    ],
  },
  {
    id: 'SRV-002', date: '11.05.2026', workOrderNumber: 'WO-2026-000113',
    clientName: 'БЦ «Авангард»', objectName: 'VRF-система Mitsubishi', templateName: 'Диагностика кондиционера',
    templateType: 'Диагностика', engineer: 'Петров Сергей', completionTime: 28, hasPhotos: true, hasSigning: false, score: 85,
    answers: [
      { question: 'Модель и серийный номер', answer: 'PUHY-P300YNW-A / SN2024031501', type: 'Текст' },
      { question: 'Давление фреона (высокая сторона)', answer: '28.5', type: 'Число' },
      { question: 'Давление фреона (низкая сторона)', answer: '8.2', type: 'Число' },
      { question: 'Ток компрессора (А)', answer: '12.8', type: 'Число' },
      { question: 'Фильтр загрязнён', answer: 'Да', type: 'Да/Нет' },
      { question: 'Коды ошибок', answer: 'E7 — утечка хладагента', type: 'Текст' },
      { question: 'Заключение инженера', answer: 'Требуется устранение утечки и дозаправка', type: 'Текст' },
    ],
  },
  {
    id: 'SRV-003', date: '10.05.2026', workOrderNumber: 'WO-2026-000108',
    clientName: 'Склад «Логистик»', objectName: 'Вентустановка VU-5000', templateName: 'Плановое ТО (лайт)',
    templateType: 'ТО', engineer: 'Сидоров Алексей', completionTime: 45, hasPhotos: true, hasSigning: true, score: 100,
    answers: [
      { question: 'Фильтры очищены', answer: 'Да', type: 'Да/Нет' },
      { question: 'Дренаж промыт', answer: 'Да', type: 'Да/Нет' },
      { question: 'Давление в норме', answer: 'Да', type: 'Да/Нет' },
      { question: 'Потребовалась дозаправка фреона', answer: 'Нет', type: 'Да/Нет' },
      { question: 'Блоки очищены', answer: 'Да', type: 'Да/Нет' },
    ],
  },
  {
    id: 'SRV-004', date: '10.05.2026', workOrderNumber: 'WO-2026-000106',
    clientName: 'Офис «ТехноГрупп»', objectName: 'Кондиционер LG S24EQ', templateName: 'Приёмка оборудования',
    templateType: 'Приёмка', engineer: 'Козлов Михаил', completionTime: 8, hasPhotos: true, hasSigning: true, score: 92,
    answers: [],
  },
  {
    id: 'SRV-005', date: '09.05.2026', workOrderNumber: 'WO-2026-000102',
    clientName: 'ТЦ «Садовод»', objectName: 'Кассетный кондиционер Gree', templateName: 'Рекламационный акт',
    templateType: 'Рекламация', engineer: 'Волков Николай', completionTime: 37, hasPhotos: true, hasSigning: true, score: 75,
    answers: [],
  },
  {
    id: 'SRV-006', date: '09.05.2026', workOrderNumber: 'WO-2026-000100',
    clientName: 'Ресторан «Причал»', objectName: 'Холодильная камера', templateName: 'Диагностика кондиционера',
    templateType: 'Диагностика', engineer: 'Иванов Иван', completionTime: 22, hasPhotos: false, hasSigning: false, score: 80,
    answers: [],
  },
  {
    id: 'SRV-007', date: '09.05.2026', workOrderNumber: 'WO-2026-000099',
    clientName: 'БЦ «Аэрополис»', objectName: 'Чиллер York YCSA', templateName: 'Плановое ТО (полное)',
    templateType: 'ТО', engineer: 'Новиков Андрей', completionTime: 92, hasPhotos: true, hasSigning: true, score: 97,
    answers: [],
  },
  {
    id: 'SRV-008', date: '08.05.2026', workOrderNumber: 'WO-2026-000095',
    clientName: 'Отель «Метрополь»', objectName: 'VRF-система Daikin VRVIII', templateName: 'Сдача после ремонта',
    templateType: 'Сдача', engineer: 'Петров Сергей', completionTime: 19, hasPhotos: true, hasSigning: true, score: 100,
    answers: [],
  },
  {
    id: 'SRV-009', date: '08.05.2026', workOrderNumber: 'WO-2026-000093',
    clientName: 'Завод «МашПром»', objectName: 'Приточная установка PU-10', templateName: 'Диагностика вентиляции',
    templateType: 'Диагностика', engineer: 'Морозов Денис', completionTime: 55, hasPhotos: true, hasSigning: false, score: 88,
    answers: [],
  },
  {
    id: 'SRV-010', date: '07.05.2026', workOrderNumber: 'WO-2026-000089',
    clientName: 'СК «Крылатское»', objectName: 'Кондиционер Haier AC60S', templateName: 'Приёмка оборудования',
    templateType: 'Приёмка', engineer: 'Козлов Михаил', completionTime: 11, hasPhotos: true, hasSigning: true, score: 94,
    answers: [],
  },
  {
    id: 'SRV-011', date: '07.05.2026', workOrderNumber: 'WO-2026-000087',
    clientName: 'Офис «ФинГрупп»', objectName: 'Кондиционер Panasonic CS-Z50TKEW', templateName: 'Плановое ТО (лайт)',
    templateType: 'ТО', engineer: 'Лебедев Артём', completionTime: 31, hasPhotos: true, hasSigning: true, score: 100,
    answers: [],
  },
  {
    id: 'SRV-012', date: '06.05.2026', workOrderNumber: 'WO-2026-000083',
    clientName: 'Бутик «Люкс»', objectName: 'Кондиционер Fujitsu ASYG12KETA', templateName: 'Диагностика кондиционера',
    templateType: 'Диагностика', engineer: 'Сидоров Алексей', completionTime: 18, hasPhotos: false, hasSigning: false, score: 72,
    answers: [],
  },
  {
    id: 'SRV-013', date: '06.05.2026', workOrderNumber: 'WO-2026-000081',
    clientName: 'ТЦ «Акварель»', objectName: 'Кассетный кондиционер Samsung', templateName: 'Плановое ТО (полное)',
    templateType: 'ТО', engineer: 'Волков Николай', completionTime: 67, hasPhotos: true, hasSigning: true, score: 96,
    answers: [],
  },
  {
    id: 'SRV-014', date: '05.05.2026', workOrderNumber: 'WO-2026-000078',
    clientName: 'Склад «Логистик»', objectName: 'Фанкойл Daikin FWF03ATN', templateName: 'Приёмка монтажа',
    templateType: 'Приёмка', engineer: 'Попов Виктор', completionTime: 23, hasPhotos: true, hasSigning: true, score: 99,
    answers: [],
  },
  {
    id: 'SRV-015', date: '05.05.2026', workOrderNumber: 'WO-2026-000075',
    clientName: 'Ресторан «Причал»', objectName: 'Вентустановка ВЕНТС ВУТ 300', templateName: 'Рекламационный акт',
    templateType: 'Рекламация', engineer: 'Иванов Иван', completionTime: 41, hasPhotos: true, hasSigning: true, score: 65,
    answers: [],
  },
];

const ENGINEERS = Array.from(new Set(mockSurveys.map((s) => s.engineer)));
const TEMPLATES = Array.from(new Set(mockSurveys.map((s) => s.templateName)));

const TYPE_COLORS: Record<string, string> = {
  Приёмка: 'bg-blue-100 text-blue-700',
  Сдача: 'bg-green-100 text-green-700',
  Диагностика: 'bg-purple-100 text-purple-700',
  ТО: 'bg-orange-100 text-orange-700',
  Рекламация: 'bg-red-100 text-red-700',
};

const getScoreColor = (score: number) => {
  if (score >= 95) return 'bg-green-100 text-green-700';
  if (score >= 80) return 'bg-blue-100 text-blue-700';
  if (score >= 65) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const SurveyJournal = () => {
  const [surveys] = useState<CompletedSurvey[]>(mockSurveys);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEngineer, setFilterEngineer] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<CompletedSurvey | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtered = surveys.filter((s) => {
    const matchesSearch =
      s.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.objectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEngineer = filterEngineer === 'all' || s.engineer === filterEngineer;
    const matchesTemplate = filterTemplate === 'all' || s.templateName === filterTemplate;
    return matchesSearch && matchesEngineer && matchesTemplate;
  });

  const openDetail = (survey: CompletedSurvey) => {
    setSelectedSurvey(survey);
    setIsDetailOpen(true);
  };

  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, sv) => s + sv.score, 0) / filtered.length)
    : 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Журнал опросных листов</h2>
          <p className="text-gray-500 mt-1">Заполненные формы по закрытым нарядам</p>
        </div>
        <Button variant="outline">
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filtered.length}</div>
              <div className="text-sm text-gray-500">Всего записей</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Star" size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{avgScore}</div>
              <div className="text-sm text-gray-500">Средний балл</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Camera" size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filtered.filter((s) => s.hasPhotos).length}</div>
              <div className="text-sm text-gray-500">С фотографиями</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="PenTool" size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filtered.filter((s) => s.hasSigning).length}</div>
              <div className="text-sm text-gray-500">С подписями</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по наряду, клиенту, объекту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Дата с:</Label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">по:</Label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-36"
              />
            </div>
            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Все шаблоны</option>
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={filterEngineer}
              onChange={(e) => setFilterEngineer(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Все инженеры</option>
              {ENGINEERS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Записи ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Наряд</TableHead>
                <TableHead>Клиент / Объект</TableHead>
                <TableHead>Шаблон</TableHead>
                <TableHead>Инженер</TableHead>
                <TableHead>Время (мин)</TableHead>
                <TableHead>Медиа</TableHead>
                <TableHead>Балл</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((survey) => (
                <TableRow
                  key={survey.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => openDetail(survey)}
                >
                  <TableCell className="text-sm text-gray-700">{survey.date}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono text-blue-600">{survey.workOrderNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-gray-900">{survey.clientName}</div>
                    <div className="text-xs text-gray-500">{survey.objectName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{survey.templateName}</div>
                      <Badge className={TYPE_COLORS[survey.templateType] + ' text-xs'}>
                        {survey.templateType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{survey.engineer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Icon name="Clock" size={13} className="text-gray-400" />
                      <span className="text-sm">{survey.completionTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {survey.hasPhotos && (
                        <span title="Есть фото">
                          <Icon name="Camera" size={15} className="text-blue-500" />
                        </span>
                      )}
                      {survey.hasSigning && (
                        <span title="Есть подпись">
                          <Icon name="PenTool" size={15} className="text-green-500" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(survey.score)}>
                      {survey.score}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Icon name="ChevronRight" size={16} className="text-gray-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedSurvey && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Опросный лист — {selectedSurvey.workOrderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4 text-sm">
                <div>
                  <span className="text-gray-400">Клиент:</span>{' '}
                  <span className="font-medium">{selectedSurvey.clientName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Объект:</span>{' '}
                  <span className="font-medium">{selectedSurvey.objectName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Инженер:</span>{' '}
                  <span className="font-medium">{selectedSurvey.engineer}</span>
                </div>
                <div>
                  <span className="text-gray-400">Дата:</span>{' '}
                  <span className="font-medium">{selectedSurvey.date}</span>
                </div>
                <div>
                  <span className="text-gray-400">Шаблон:</span>{' '}
                  <span className="font-medium">{selectedSurvey.templateName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Время заполнения:</span>{' '}
                  <span className="font-medium">{selectedSurvey.completionTime} мин</span>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Итоговый балл:</span>
                <Badge className={`text-lg px-3 py-1 ${getScoreColor(selectedSurvey.score)}`}>
                  {selectedSurvey.score} / 100
                </Badge>
              </div>

              {/* Answers */}
              {selectedSurvey.answers.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Ответы</div>
                  {selectedSurvey.answers.map((a, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">
                        {idx + 1}. {a.question}
                      </div>
                      {a.type === 'Фото' ? (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
                            >
                              <Icon name="ImageOff" size={20} className="text-gray-300" />
                            </div>
                          ))}
                        </div>
                      ) : a.type === 'Подпись' ? (
                        <div className="h-14 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400 italic">Подпись получена</span>
                        </div>
                      ) : (
                        <div className="text-sm font-medium">{a.answer}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
                  Детальные ответы не загружены для этой записи
                </div>
              )}

              {/* Photos placeholder */}
              {selectedSurvey.hasPhotos && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Фотографии</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
                      >
                        <Icon name="ImageOff" size={20} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline">
                <Icon name="Download" size={15} className="mr-2" />
                Скачать PDF
              </Button>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default SurveyJournal;
