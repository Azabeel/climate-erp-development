import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Category = 'Диагностика' | 'Замена' | 'Настройка' | 'Чистка' | 'Пайка';
type CertLevel = 'Базовый' | 'Средний' | 'Эксперт';

interface TypedTask {
  id: string;
  name: string;
  category: Category;
  duration: number;        // minutes
  requiredTools: string[];
  requiredCertLevel: CertLevel;
  laborCost: number;       // ₽
  materialCost: number;    // ₽
  instructions: string[];
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const INITIAL_TASKS: TypedTask[] = [
  // Диагностика
  {
    id: 't01', name: 'Диагностика сплит-системы', category: 'Диагностика', duration: 45,
    requiredTools: ['Манометрический коллектор', 'Мультиметр', 'Термометр'],
    requiredCertLevel: 'Базовый', laborCost: 800, materialCost: 0,
    instructions: ['Осмотр внешнего блока на механические повреждения', 'Проверка давления в системе манометрическим коллектором', 'Измерение рабочих токов двигателей', 'Проверка температурного перепада на испарителе', 'Составление акта диагностики'],
  },
  {
    id: 't02', name: 'Диагностика чиллера', category: 'Диагностика', duration: 90,
    requiredTools: ['Манометрический коллектор', 'Анализатор сети', 'Термограф', 'Ноутбук с ПО'],
    requiredCertLevel: 'Эксперт', laborCost: 2400, materialCost: 0,
    instructions: ['Снятие показаний контроллера', 'Проверка работы компрессора (токи, давления)', 'Диагностика системы охлаждения конденсатора', 'Проверка контуров хладагента на утечки', 'Формирование отчёта'],
  },
  {
    id: 't03', name: 'Диагностика VRF системы', category: 'Диагностика', duration: 120,
    requiredTools: ['Ноутбук с ПО производителя', 'Манометрический коллектор', 'Мультиметр'],
    requiredCertLevel: 'Эксперт', laborCost: 3200, materialCost: 0,
    instructions: ['Подключение к системному контроллеру', 'Считывание кодов ошибок и журнала событий', 'Проверка баланса давлений в магистрали', 'Тестирование каждого внутреннего блока', 'Анализ и отчёт'],
  },
  // Замена
  {
    id: 't04', name: 'Замена компрессора (сплит)', category: 'Замена', duration: 180,
    requiredTools: ['Газовый горелочный набор', 'Вакуумный насос', 'Манометрический коллектор', 'Весы'],
    requiredCertLevel: 'Эксперт', laborCost: 4800, materialCost: 1200,
    instructions: ['Восстановление хладагента из системы', 'Демонтаж старого компрессора', 'Пайка нового компрессора', 'Вакуумирование системы (30 мин)', 'Заправка хладагентом по весам', 'Проверка работы системы'],
  },
  {
    id: 't05', name: 'Замена платы управления', category: 'Замена', duration: 60,
    requiredTools: ['Мультиметр', 'Паяльная станция', 'Набор отвёрток'],
    requiredCertLevel: 'Средний', laborCost: 1600, materialCost: 500,
    instructions: ['Отключение питания, разрядка конденсаторов', 'Фотофиксация разъёмов', 'Демонтаж старой платы', 'Установка новой платы, подключение разъёмов', 'Тестирование всех режимов'],
  },
  {
    id: 't06', name: 'Замена теплообменника (испаритель)', category: 'Замена', duration: 150,
    requiredTools: ['Горелочный набор', 'Вакуумный насос', 'Манометрический коллектор'],
    requiredCertLevel: 'Эксперт', laborCost: 3600, materialCost: 2800,
    instructions: ['Эвакуация хладагента', 'Демонтаж корпуса внутреннего блока', 'Распайка старого теплообменника', 'Пайка нового теплообменника', 'Вакуумирование и заправка', 'Сборка и проверка'],
  },
  {
    id: 't07', name: 'Замена фильтра-осушителя', category: 'Замена', duration: 90,
    requiredTools: ['Горелочный набор', 'Вакуумный насос', 'Манометрический коллектор'],
    requiredCertLevel: 'Средний', laborCost: 2200, materialCost: 400,
    instructions: ['Эвакуация хладагента', 'Демонтаж старого фильтра-осушителя', 'Установка нового фильтра (азотная продувка)', 'Вакуумирование системы', 'Дозаправка хладагентом'],
  },
  // Настройка
  {
    id: 't08', name: 'Настройка контроллера чиллера', category: 'Настройка', duration: 60,
    requiredTools: ['Ноутбук с ПО производителя', 'Кабель RS-485/USB'],
    requiredCertLevel: 'Эксперт', laborCost: 1800, materialCost: 0,
    instructions: ['Подключение к контроллеру', 'Резервная копия текущих настроек', 'Настройка уставок температуры и давления', 'Настройка защит и аварийных сигналов', 'Тест запуска, запись в журнал'],
  },
  {
    id: 't09', name: 'Настройка VRF системы (зонирование)', category: 'Настройка', duration: 90,
    requiredTools: ['Ноутбук с ПО производителя', 'Кабели интерфейсные'],
    requiredCertLevel: 'Эксперт', laborCost: 2400, materialCost: 0,
    instructions: ['Подключение к центральному контроллеру', 'Конфигурация групп и зон', 'Настройка расписаний работы', 'Проверка дистанционного управления', 'Обучение ответственного лица'],
  },
  {
    id: 't10', name: 'Балансировка системы вентиляции', category: 'Настройка', duration: 120,
    requiredTools: ['Анемометр', 'Балансировочные диафрагмы', 'Рулетка'],
    requiredCertLevel: 'Средний', laborCost: 2800, materialCost: 200,
    instructions: ['Измерение расходов воздуха на всех ответвлениях', 'Расчёт требуемых расходов', 'Регулировка балансировочных клапанов', 'Контрольные замеры', 'Составление протокола'],
  },
  // Чистка
  {
    id: 't11', name: 'Чистка внутреннего блока (сплит)', category: 'Чистка', duration: 60,
    requiredTools: ['Парогенератор', 'Набор щёток', 'Моющие средства', 'Поддон'],
    requiredCertLevel: 'Базовый', laborCost: 900, materialCost: 150,
    instructions: ['Снятие крышки и фильтров', 'Промывка фильтров водой', 'Чистка теплообменника паром', 'Дезинфекция антибактериальным составом', 'Сборка и проверка'],
  },
  {
    id: 't12', name: 'Чистка наружного блока (сплит)', category: 'Чистка', duration: 45,
    requiredTools: ['Парогенератор', 'Химия для чистки', 'Защитные очки', 'Перчатки'],
    requiredCertLevel: 'Базовый', laborCost: 700, materialCost: 120,
    instructions: ['Отключение питания', 'Нанесение чистящего состава', 'Промывка конденсатора паром', 'Проверка состояния лопастей вентилятора', 'Проверка работы'],
  },
  {
    id: 't13', name: 'Чистка фанкойла', category: 'Чистка', duration: 50,
    requiredTools: ['Пылесос', 'Щётки', 'Антибактериальный спрей', 'Поддон'],
    requiredCertLevel: 'Базовый', laborCost: 750, materialCost: 100,
    instructions: ['Снятие корпуса', 'Пылесосить теплообменник', 'Промывка поддона', 'Дезинфекция', 'Сборка и проверка дренажа'],
  },
  {
    id: 't14', name: 'Чистка воздуховодов', category: 'Чистка', duration: 240,
    requiredTools: ['Щёточная установка (ротационная)', 'Промышленный пылесос', 'Видеозонд'],
    requiredCertLevel: 'Средний', laborCost: 6400, materialCost: 0,
    instructions: ['Осмотр воздуховодов видеозондом', 'Механическая чистка ротационными щётками', 'Вакуумирование загрязнений', 'Нанесение антимикробного состава', 'Финальный видеоконтроль'],
  },
  // Пайка
  {
    id: 't15', name: 'Пайка медных трубопроводов (до Ø12)', category: 'Пайка', duration: 60,
    requiredTools: ['Газовая горелка', 'Присадочный материал', 'Флюс', 'Азот', 'Детектор утечек'],
    requiredCertLevel: 'Средний', laborCost: 1400, materialCost: 300,
    instructions: ['Обезжирить место пайки', 'Продувка азотом (защита от окисления)', 'Нагрев и нанесение припоя', 'Охлаждение, проверка качества шва', 'Проверка на утечки течеискателем'],
  },
  {
    id: 't16', name: 'Пайка медных трубопроводов (Ø14–28)', category: 'Пайка', duration: 90,
    requiredTools: ['Пропан-кислородная горелка', 'Твёрдый припой', 'Флюс', 'Азот', 'Детектор утечек'],
    requiredCertLevel: 'Эксперт', laborCost: 2200, materialCost: 550,
    instructions: ['Зачистка и обезжиривание торцов', 'Продувка азотом', 'Капиллярная пайка твёрдым припоем', 'Визуальный контроль шва', 'Опрессовка азотом 25 бар, выдержка 30 мин'],
  },
  {
    id: 't17', name: 'Ремонт утечки в фреоновом контуре', category: 'Пайка', duration: 120,
    requiredTools: ['Электронный течеискатель', 'Горелка', 'Припой', 'Вакуумный насос', 'Манометрический коллектор', 'Весы'],
    requiredCertLevel: 'Эксперт', laborCost: 3200, materialCost: 800,
    instructions: ['Поиск утечки электронным детектором', 'Эвакуация хладагента', 'Устранение утечки пайкой', 'Проверка шва азотом 25 бар', 'Вакуумирование системы', 'Заправка хладагентом по весам'],
  },
  {
    id: 't18', name: 'Монтаж фреоновой трассы (до 5 м)', category: 'Пайка', duration: 120,
    requiredTools: ['Трубогиб', 'Вальцовка', 'Горелка', 'Вакуумный насос', 'Манометрический коллектор'],
    requiredCertLevel: 'Средний', laborCost: 2800, materialCost: 1200,
    instructions: ['Разметка и укладка трассы', 'Нарезка и гибка трубопроводов', 'Вальцовка торцов', 'Соединение, пайка или фитинги', 'Опрессовка и вакуумирование'],
  },
  {
    id: 't19', name: 'Замена соединительного шланга (конденсат)', category: 'Замена', duration: 30,
    requiredTools: ['Ножницы для труб', 'Хомуты', 'Дрель'],
    requiredCertLevel: 'Базовый', laborCost: 400, materialCost: 200,
    instructions: ['Перекрыть дренажный поддон', 'Снять старый шланг', 'Установить новый шланг нужной длины', 'Закрепить хомутами', 'Проверить отвод конденсата'],
  },
  {
    id: 't20', name: 'Чистка дренажной системы', category: 'Чистка', duration: 40,
    requiredTools: ['Насос для промывки', 'Химия для дренажа', 'Гибкий зонд'],
    requiredCertLevel: 'Базовый', laborCost: 600, materialCost: 80,
    instructions: ['Снять поддон конденсата', 'Прочистка зондом', 'Промывка химическим составом', 'Проверка уклона и тока воды', 'Сборка'],
  },
];

const CATEGORIES: Category[] = ['Диагностика', 'Замена', 'Настройка', 'Чистка', 'Пайка'];
const CERT_LEVELS: CertLevel[] = ['Базовый', 'Средний', 'Эксперт'];

const CATEGORY_COLORS: Record<Category, string> = {
  'Диагностика': 'bg-blue-100 text-blue-700',
  'Замена':      'bg-red-100 text-red-700',
  'Настройка':   'bg-purple-100 text-purple-700',
  'Чистка':      'bg-green-100 text-green-700',
  'Пайка':       'bg-orange-100 text-orange-700',
};

const CERT_COLORS: Record<CertLevel, string> = {
  'Базовый': 'bg-gray-100 text-gray-600',
  'Средний': 'bg-amber-100 text-amber-700',
  'Эксперт': 'bg-rose-100 text-rose-700',
};

// ─── EMPTY TASK ───────────────────────────────────────────────────────────────

const emptyTask = (): Omit<TypedTask, 'id'> => ({
  name: '',
  category: 'Диагностика',
  duration: 60,
  requiredTools: [],
  requiredCertLevel: 'Базовый',
  laborCost: 0,
  materialCost: 0,
  instructions: [''],
});

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const TypedTasksList = () => {
  const [tasks, setTasks] = useState<TypedTask[]>(INITIAL_TASKS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [certFilter, setCertFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Omit<TypedTask, 'id'>>(emptyTask());
  const [toolsInput, setToolsInput] = useState('');
  const [nextId, setNextId] = useState(100);

  const filtered = tasks.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (certFilter !== 'all' && t.requiredCertLevel !== certFilter) return false;
    return true;
  });

  const grouped = CATEGORIES.reduce<Record<Category, TypedTask[]>>((acc, cat) => {
    acc[cat] = filtered.filter(t => t.category === cat);
    return acc;
  }, {} as Record<Category, TypedTask[]>);

  const handleOpenCreate = () => {
    setEditingTask(emptyTask());
    setToolsInput('');
    setModalOpen(true);
  };

  const handleClone = (task: TypedTask) => {
    const cloned: TypedTask = {
      ...task,
      id: `t${nextId}`,
      name: `${task.name} (копия)`,
    };
    setNextId(n => n + 1);
    setTasks(prev => [...prev, cloned]);
  };

  const handleSave = () => {
    if (!editingTask.name.trim()) return;
    const tools = toolsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const newTask: TypedTask = {
      ...editingTask,
      id: `t${nextId}`,
      requiredTools: tools,
    };
    setNextId(n => n + 1);
    setTasks(prev => [...prev, newTask]);
    setModalOpen(false);
  };

  const totalCost = (t: TypedTask) => t.laborCost + t.materialCost;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Каталог типовых задач</h2>
          <p className="text-sm text-gray-500">Стандартные работы с нормами времени и стоимости</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Icon name="Plus" size={16} className="mr-2" />
          Создать задачу
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Поиск задачи..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-8 w-56 text-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={certFilter} onValueChange={setCertFilter}>
          <SelectTrigger className="h-8 w-32 text-sm">
            <SelectValue placeholder="Уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уровни</SelectItem>
            {CERT_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-400 self-center ml-1">
          {filtered.length} задач
        </span>
      </div>

      {/* Grouped tables */}
      {CATEGORIES.map(cat => {
        const catTasks = grouped[cat];
        if (catTasks.length === 0) return null;
        return (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge className={`text-xs ${CATEGORY_COLORS[cat]}`}>{cat}</Badge>
                <span className="text-gray-500 font-normal">{catTasks.length} задач</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead className="text-right">Время (мин)</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead className="text-right">Работа ₽</TableHead>
                    <TableHead className="text-right">Материалы ₽</TableHead>
                    <TableHead className="text-right">Итого ₽</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catTasks.map(task => (
                    <>
                      <TableRow
                        key={task.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                      >
                        <TableCell>
                          <Icon
                            name={expandedId === task.id ? 'ChevronDown' : 'ChevronRight'}
                            size={14}
                            className="text-gray-400"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-sm">{task.name}</TableCell>
                        <TableCell className="text-right">{task.duration}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${CERT_COLORS[task.requiredCertLevel]}`}>
                            {task.requiredCertLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{task.laborCost.toLocaleString('ru')}</TableCell>
                        <TableCell className="text-right text-sm">{task.materialCost.toLocaleString('ru')}</TableCell>
                        <TableCell className="text-right font-medium text-sm">{totalCost(task).toLocaleString('ru')}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Клонировать задачу"
                            onClick={e => { e.stopPropagation(); handleClone(task); }}
                          >
                            <Icon name="Copy" size={14} className="text-gray-400 hover:text-gray-700" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedId === task.id && (
                        <TableRow key={`${task.id}-expanded`} className="bg-gray-50">
                          <TableCell colSpan={8} className="py-3 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {/* Tools */}
                              <div>
                                <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                  <Icon name="Wrench" size={13} className="text-gray-500" />
                                  Необходимые инструменты
                                </p>
                                {task.requiredTools.length > 0 ? (
                                  <ul className="space-y-0.5">
                                    {task.requiredTools.map((tool, i) => (
                                      <li key={i} className="text-gray-600 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                                        {tool}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-400">Специальные инструменты не требуются</p>
                                )}
                              </div>
                              {/* Instructions */}
                              <div>
                                <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                  <Icon name="ListOrdered" size={13} className="text-gray-500" />
                                  Пошаговая инструкция
                                </p>
                                <ol className="space-y-0.5 list-decimal list-inside">
                                  {task.instructions.map((step, i) => (
                                    <li key={i} className="text-gray-600">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-gray-400">
            <Icon name="SearchX" size={32} className="mb-2" />
            <p className="text-sm">Задачи не найдены</p>
          </CardContent>
        </Card>
      )}

      {/* ── CREATE MODAL ────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать типовую задачу</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-gray-600">Название задачи *</Label>
              <Input
                value={editingTask.name}
                onChange={e => setEditingTask(t => ({ ...t, name: e.target.value }))}
                placeholder="Например: Замена вентилятора наружного блока"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600">Категория</Label>
                <Select
                  value={editingTask.category}
                  onValueChange={v => setEditingTask(t => ({ ...t, category: v as Category }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Уровень допуска</Label>
                <Select
                  value={editingTask.requiredCertLevel}
                  onValueChange={v => setEditingTask(t => ({ ...t, requiredCertLevel: v as CertLevel }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CERT_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-gray-600">Длительность (мин)</Label>
                <Input
                  type="number"
                  value={editingTask.duration}
                  onChange={e => setEditingTask(t => ({ ...t, duration: Number(e.target.value) }))}
                  className="mt-1"
                  min={5}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Стоимость работы ₽</Label>
                <Input
                  type="number"
                  value={editingTask.laborCost}
                  onChange={e => setEditingTask(t => ({ ...t, laborCost: Number(e.target.value) }))}
                  className="mt-1"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Материалы ₽</Label>
                <Input
                  type="number"
                  value={editingTask.materialCost}
                  onChange={e => setEditingTask(t => ({ ...t, materialCost: Number(e.target.value) }))}
                  className="mt-1"
                  min={0}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-600">
                Инструменты <span className="text-gray-400">(через запятую)</span>
              </Label>
              <Input
                value={toolsInput}
                onChange={e => setToolsInput(e.target.value)}
                placeholder="Мультиметр, Манометрический коллектор, ..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!editingTask.name.trim()}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TypedTasksList;
