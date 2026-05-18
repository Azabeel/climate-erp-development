import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocKind = "Акт" | "Счёт" | "Накладная";
type QueueStatus = "Ожидает" | "Обрабатывается" | "Ошибка";
type SyncResult = "Успешно" | "Частично" | "Ошибка";

interface QueueDoc {
  id: string;
  kind: DocKind;
  number: string;
  amount: number;
  date: string;
  status: QueueStatus;
}

interface HistoryRow {
  id: string;
  datetime: string;
  type: string;
  success: number;
  errors: number;
  durationMs: number;
  result: SyncResult;
}

interface ErrorItem {
  id: string;
  doc: string;
  description: string;
  date: string;
}

interface MappingRow {
  id: string;
  erpItem: string;
  account1C: string;
  comment: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const QUEUE_DOCS: QueueDoc[] = [
  { id: "q1", kind: "Акт",       number: "АКТ-2026-0847", amount: 18_500, date: "18.05.2026", status: "Обрабатывается" },
  { id: "q2", kind: "Счёт",      number: "СЧ-2026-1124",  amount: 42_700, date: "18.05.2026", status: "Ожидает" },
  { id: "q3", kind: "Накладная", number: "НКЛ-2026-0219", amount:  8_340, date: "18.05.2026", status: "Ошибка" },
  { id: "q4", kind: "Акт",       number: "АКТ-2026-0848", amount: 24_150, date: "18.05.2026", status: "Ожидает" },
  { id: "q5", kind: "Счёт",      number: "СЧ-2026-1125",  amount: 11_900, date: "18.05.2026", status: "Ожидает" },
];

const HOURLY_CHART: { hour: string; docs: number }[] = [
  { hour: "08:00", docs: 12 }, { hour: "09:00", docs: 28 }, { hour: "10:00", docs: 43 },
  { hour: "11:00", docs: 37 }, { hour: "12:00", docs: 19 }, { hour: "13:00", docs: 14 },
  { hour: "14:00", docs: 31 }, { hour: "15:00", docs: 0  },
];

const HISTORY_ROWS: HistoryRow[] = [
  { id: "h1",  datetime: "18.05.2026 14:32:11", type: "Плановая",      success: 24, errors: 0, durationMs: 1_240, result: "Успешно"  },
  { id: "h2",  datetime: "18.05.2026 14:17:08", type: "Плановая",      success: 18, errors: 2, durationMs: 2_810, result: "Частично" },
  { id: "h3",  datetime: "18.05.2026 14:02:04", type: "Плановая",      success: 31, errors: 0, durationMs: 1_580, result: "Успешно"  },
  { id: "h4",  datetime: "18.05.2026 13:47:01", type: "Ручная",        success: 5,  errors: 0, durationMs:   890, result: "Успешно"  },
  { id: "h5",  datetime: "18.05.2026 13:32:09", type: "Плановая",      success: 22, errors: 0, durationMs: 1_120, result: "Успешно"  },
  { id: "h6",  datetime: "18.05.2026 13:17:05", type: "Плановая",      success: 0,  errors: 7, durationMs: 5_020, result: "Ошибка"   },
  { id: "h7",  datetime: "18.05.2026 13:02:03", type: "Плановая",      success: 27, errors: 0, durationMs: 1_340, result: "Успешно"  },
  { id: "h8",  datetime: "18.05.2026 12:47:07", type: "Плановая",      success: 14, errors: 1, durationMs: 1_740, result: "Частично" },
  { id: "h9",  datetime: "18.05.2026 12:32:02", type: "Плановая",      success: 29, errors: 0, durationMs: 1_190, result: "Успешно"  },
  { id: "h10", datetime: "18.05.2026 12:17:06", type: "По событию",    success: 3,  errors: 0, durationMs:   540, result: "Успешно"  },
  { id: "h11", datetime: "18.05.2026 12:02:00", type: "Плановая",      success: 21, errors: 0, durationMs: 1_080, result: "Успешно"  },
  { id: "h12", datetime: "18.05.2026 11:47:04", type: "Плановая",      success: 33, errors: 0, durationMs: 1_610, result: "Успешно"  },
  { id: "h13", datetime: "18.05.2026 11:32:09", type: "Ручная",        success: 8,  errors: 0, durationMs:   710, result: "Успешно"  },
  { id: "h14", datetime: "18.05.2026 11:17:03", type: "Плановая",      success: 26, errors: 0, durationMs: 1_290, result: "Успешно"  },
  { id: "h15", datetime: "18.05.2026 11:02:07", type: "Плановая",      success: 16, errors: 0, durationMs:   980, result: "Успешно"  },
  { id: "h16", datetime: "18.05.2026 10:47:01", type: "Плановая",      success: 19, errors: 0, durationMs: 1_050, result: "Успешно"  },
  { id: "h17", datetime: "18.05.2026 10:32:05", type: "По событию",    success: 1,  errors: 0, durationMs:   320, result: "Успешно"  },
  { id: "h18", datetime: "18.05.2026 10:17:08", type: "Плановая",      success: 24, errors: 0, durationMs: 1_150, result: "Успешно"  },
  { id: "h19", datetime: "18.05.2026 10:02:02", type: "Плановая",      success: 30, errors: 0, durationMs: 1_410, result: "Успешно"  },
  { id: "h20", datetime: "18.05.2026 09:47:06", type: "Плановая",      success: 22, errors: 0, durationMs: 1_070, result: "Успешно"  },
];

const ERRORS_LIST: ErrorItem[] = [
  { id: "e1", doc: "НКЛ-2026-0219", description: "Контрагент не найден в 1С по ИНН 7704567890", date: "18.05.2026 13:18" },
  { id: "e2", doc: "АКТ-2026-0831", description: "Счёт бухучёта 90.01 не существует в плане счетов", date: "18.05.2026 13:17" },
  { id: "e3", doc: "СЧ-2026-1108",  description: "Таймаут соединения с сервером 1С (30 сек)",        date: "17.05.2026 21:44" },
  { id: "e4", doc: "АКТ-2026-0802", description: "Дублирующийся номер документа в 1С",              date: "17.05.2026 15:22" },
  { id: "e5", doc: "НКЛ-2026-0201", description: "Неверный формат даты: 2026-31-05",                date: "17.05.2026 11:09" },
];

const ERRORS_BY_DAY: { day: string; errors: number }[] = [
  { day: "Пн", errors: 3 }, { day: "Вт", errors: 1 }, { day: "Ср", errors: 5 },
  { day: "Чт", errors: 2 }, { day: "Пт", errors: 4 }, { day: "Сб", errors: 0 },
  { day: "Вс", errors: 2 },
];

const ERROR_REASONS = [
  { reason: "Таймаут соединения",         count: 8  },
  { reason: "Контрагент не найден",       count: 5  },
  { reason: "Некорректный счёт бухучёта", count: 4  },
  { reason: "Дублирующийся документ",     count: 3  },
  { reason: "Ошибка формата данных",      count: 2  },
];

const MAPPING_ROWS: MappingRow[] = [
  { id: "m1",  erpItem: "Выручка от услуг",    account1C: "90.01.1", comment: "Продажи по основной деятельности" },
  { id: "m2",  erpItem: "Выручка от продажи ЗИП", account1C: "90.01.2", comment: "Реализация запчастей клиентам" },
  { id: "m3",  erpItem: "ФОТ инженеров",       account1C: "70",      comment: "Оплата труда производственного персонала" },
  { id: "m4",  erpItem: "ФОТ АУП",             account1C: "26",      comment: "Общехозяйственные расходы — зарплата" },
  { id: "m5",  erpItem: "Материалы (расход)",  account1C: "10.01",   comment: "Списание материалов на наряды" },
  { id: "m6",  erpItem: "Запасные части (ЗИП)","account1C": "10.05", comment: "Запчасти — приход и списание" },
  { id: "m7",  erpItem: "ГСМ",                 account1C: "10.03",   comment: "Топливо и горюче-смазочные материалы" },
  { id: "m8",  erpItem: "Накладные расходы",   account1C: "25",      comment: "Общепроизводственные расходы" },
  { id: "m9",  erpItem: "Дебиторская задолженность", account1C: "62.01", comment: "Расчёты с покупателями" },
  { id: "m10", erpItem: "НДС к уплате",        account1C: "68.02",   comment: "НДС начисленный" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const DocKindBadge = ({ kind }: { kind: DocKind }) => {
  const map: Record<DocKind, string> = {
    Акт:       "bg-blue-100 text-blue-700",
    Счёт:      "bg-purple-100 text-purple-700",
    Накладная: "bg-orange-100 text-orange-700",
  };
  return <Badge className={`${map[kind]} border-0 text-xs`}>{kind}</Badge>;
};

const QueueStatusBadge = ({ status }: { status: QueueStatus }) => {
  const map: Record<QueueStatus, string> = {
    Ожидает:        "bg-slate-100 text-slate-600",
    Обрабатывается: "bg-yellow-100 text-yellow-700",
    Ошибка:         "bg-red-100 text-red-600",
  };
  return <Badge className={`${map[status]} border-0 text-xs`}>{status}</Badge>;
};

const SyncResultBadge = ({ result }: { result: SyncResult }) => {
  const map: Record<SyncResult, string> = {
    Успешно:  "bg-green-100 text-green-700",
    Частично: "bg-yellow-100 text-yellow-700",
    Ошибка:   "bg-red-100 text-red-600",
  };
  return <Badge className={`${map[result]} border-0 text-xs`}>{result}</Badge>;
};

const fmt = (n: number) => n.toLocaleString("ru-RU");

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function QueueTab() {
  const [queue, setQueue] = useState<QueueDoc[]>(QUEUE_DOCS);

  const handleSend = (doc: QueueDoc) => {
    setQueue((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: "Обрабатывается" } : d));
    toast.success(`Документ ${doc.number} отправлен в 1С`);
  };

  const handleCancel = (doc: QueueDoc) => {
    setQueue((prev) => prev.filter((d) => d.id !== doc.id));
    toast.info(`Документ ${doc.number} удалён из очереди`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Объём передачи по часам (сегодня)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={HOURLY_CHART} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDocs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v} доп.`, "Документов"]} />
              <Area type="monotone" dataKey="docs" stroke="#6366f1" fill="url(#gradDocs)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Документы в очереди</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Тип</TableHead>
                <TableHead>Номер</TableHead>
                <TableHead className="text-right">Сумма, ₽</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell><DocKindBadge kind={doc.kind} /></TableCell>
                  <TableCell className="font-mono text-xs">{doc.number}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(doc.amount)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{doc.date}</TableCell>
                  <TableCell><QueueStatusBadge status={doc.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleSend(doc)}
                        disabled={doc.status === "Обрабатывается"}
                      >
                        Отправить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-red-500 hover:text-red-600"
                        onClick={() => handleCancel(doc)}
                      >
                        Отмена
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTab() {
  const [filterResult, setFilterResult] = useState<string>("all");

  const filtered = HISTORY_ROWS.filter(
    (r) => filterResult === "all" || r.result === filterResult
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="Успешно">Успешно</SelectItem>
            <SelectItem value="Частично">Частично</SelectItem>
            <SelectItem value="Ошибка">Ошибка</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-400">Найдено: {filtered.length}</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Дата / Время</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="text-right text-green-700">Успешно</TableHead>
                <TableHead className="text-right text-red-600">Ошибок</TableHead>
                <TableHead className="text-right">Длит., мс</TableHead>
                <TableHead>Итог</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{row.datetime}</TableCell>
                  <TableCell className="text-sm">{row.type}</TableCell>
                  <TableCell className="text-right text-green-700 font-medium">{row.success}</TableCell>
                  <TableCell className="text-right text-red-500 font-medium">{row.errors}</TableCell>
                  <TableCell className="text-right text-slate-500 text-sm">{row.durationMs.toLocaleString()}</TableCell>
                  <TableCell><SyncResultBadge result={row.result} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorsTab() {
  const handleRetry = (err: ErrorItem) => {
    toast.promise(
      new Promise((res) => setTimeout(res, 1200)),
      {
        loading: `Повтор: ${err.doc}…`,
        success: `Документ ${err.doc} успешно отправлен`,
        error: "Ошибка повтора",
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ошибки по дням недели</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={ERRORS_BY_DAY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, "Ошибок"]} />
                <Bar dataKey="errors" fill="#f87171" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Топ-5 причин ошибок</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {ERROR_REASONS.map((r) => (
              <div key={r.reason} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 flex-1 truncate">{r.reason}</span>
                <Progress value={(r.count / 10) * 100} className="w-20 h-1.5" />
                <span className="text-xs font-medium text-slate-500 w-4 text-right">{r.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Активные ошибки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ERRORS_LIST.map((err) => (
            <div key={err.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
              <Icon name="AlertTriangle" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-semibold text-slate-700">{err.doc}</span>
                  <span className="text-xs text-slate-400">{err.date}</span>
                </div>
                <p className="text-xs text-slate-600">{err.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-100 shrink-0"
                onClick={() => handleRetry(err)}
              >
                Повторить
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

type DocTypeKey = "acts" | "invoices" | "waybills" | "payments" | "contractors";

function SettingsTab() {
  const [url,      setUrl]      = useState("https://1c.servisklimat.ru/unf/odata/standard.odata");
  const [login,    setLogin]    = useState("erp_sync");
  const [password, setPassword] = useState("••••••••••••");
  const [interval, setInterval] = useState("15");
  const [showPwd,  setShowPwd]  = useState(false);

  const [docTypes, setDocTypes] = useState<Record<DocTypeKey, boolean>>({
    acts: true, invoices: true, waybills: true, payments: false, contractors: true,
  });

  const DOC_LABELS: Record<DocTypeKey, string> = {
    acts: "Акты", invoices: "Счета", waybills: "Накладные",
    payments: "Платежи", contractors: "Контрагенты",
  };

  const toggleDoc = (key: DocTypeKey) =>
    setDocTypes((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCheck = () =>
    toast.promise(new Promise((res) => setTimeout(res, 1500)), {
      loading: "Проверка подключения к 1С…",
      success: "Подключение успешно. 1С:УНФ доступен.",
      error: "Не удалось подключиться",
    });

  const handleSave = () => toast.success("Настройки сохранены");

  return (
    <div className="space-y-6 max-w-xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Подключение к серверу 1С</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">URL сервера</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} className="text-sm font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Логин</label>
              <Input value={login} onChange={(e) => setLogin(e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Пароль</label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon name={showPwd ? "EyeOff" : "Eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Интервал синхронизации</label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-48 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Каждые 5 минут</SelectItem>
                <SelectItem value="15">Каждые 15 минут</SelectItem>
                <SelectItem value="30">Каждые 30 минут</SelectItem>
                <SelectItem value="60">Каждый час</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Типы документов для синхронизации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(docTypes) as DocTypeKey[]).map((key) => (
              <button key={key} type="button" onClick={() => toggleDoc(key)}>
                <Badge
                  className={`cursor-pointer border text-xs px-3 py-1 transition-colors ${
                    docTypes[key]
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-500 border-slate-300 hover:border-indigo-400"
                  }`}
                >
                  {DOC_LABELS[key]}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleCheck} className="gap-2">
          <Icon name="Wifi" className="w-4 h-4" />
          Проверить подключение
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Icon name="Save" className="w-4 h-4" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}

function MappingTab() {
  const handleEdit = (row: MappingRow) =>
    toast.info(`Редактирование маппинга: ${row.erpItem} → ${row.account1C}`);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          Маппинг статей ERP → счета 1С
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Статья ERP</TableHead>
              <TableHead>Счёт 1С</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {MAPPING_ROWS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-sm">{row.erpItem}</TableCell>
                <TableCell>
                  <Badge className="bg-slate-100 text-slate-700 border-0 font-mono text-xs">
                    {row.account1C}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-xs">{row.comment}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-slate-500 hover:text-indigo-600"
                    onClick={() => handleEdit(row)}
                  >
                    <Icon name="Pencil" className="w-3 h-3 mr-1" />
                    Изменить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AccountingIntegrationFull() {
  const handleSync = () =>
    toast.promise(new Promise((res) => setTimeout(res, 2000)), {
      loading: "Синхронизация с 1С:УНФ…",
      success: "Синхронизация завершена: 24 документа передано",
      error: "Ошибка синхронизации",
    });

  const handleSettings = () => toast.info("Открыты настройки подключения");

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Icon name="Link" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Интеграция с бухгалтерией</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="text-sm text-green-600 font-medium">Подключено</span>
              <span className="text-sm text-slate-400">· 1С:УНФ 8.3</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSettings} className="gap-2">
            <Icon name="Settings" className="w-4 h-4" />
            Настройки подключения
          </Button>
          <Button onClick={handleSync} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Icon name="RefreshCw" className="w-4 h-4" />
            Синхронизировать сейчас
          </Button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: "Clock",        label: "Последняя синхронизация", value: "18.05.2026 14:32",  sub: "3 мин назад",         color: "text-indigo-600" },
          { icon: "FileText",     label: "Передано документов",      value: "1 247",             sub: "всего",               color: "text-green-600"  },
          { icon: "AlertCircle",  label: "Ошибок сегодня",           value: "2",                 sub: "требуют внимания",    color: "text-red-500"    },
          { icon: "Hourglass",    label: "Очередь",                  value: "5",                 sub: "документов ожидают",  color: "text-yellow-600" },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={c.icon as any} className={`w-4 h-4 ${c.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{c.label}</p>
                  <p className={`text-lg font-bold leading-tight ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="queue">
        <TabsList className="bg-white border">
          <TabsTrigger value="queue">Очередь</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="errors">
            Ошибки
            <Badge className="ml-1.5 bg-red-100 text-red-600 border-0 text-xs px-1.5">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="mapping">Маппинг</TabsTrigger>
        </TabsList>

        <TabsContent value="queue"   className="mt-4"><QueueTab /></TabsContent>
        <TabsContent value="history" className="mt-4"><HistoryTab /></TabsContent>
        <TabsContent value="errors"  className="mt-4"><ErrorsTab /></TabsContent>
        <TabsContent value="settings" className="mt-4"><SettingsTab /></TabsContent>
        <TabsContent value="mapping" className="mt-4"><MappingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
