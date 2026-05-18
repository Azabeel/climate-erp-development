import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType = "Наряд" | "Счёт" | "Акт" | "Контрагент";
type Direction = "→1С" | "←1С";
type LogStatus = "Успешно" | "Ошибка" | "Пропущено";
type Priority = "Высокий" | "Средний" | "Низкий";

interface LogEntry {
  id: string;
  datetime: string;
  docType: DocType;
  direction: Direction;
  status: LogStatus;
  docLabel: string;
  errorMsg?: string;
}

interface QueueItem {
  id: string;
  docType: DocType;
  docRef: string;
  priority: Priority;
  addedAt: string;
}

interface MappingRow {
  entity: string;
  fieldLocal: string;
  field1C: string;
  transform: string;
}

interface SyncSettings {
  url: string;
  login: string;
  password: string;
  interval: string;
  autoSync: boolean;
  syncWorkOrders: boolean;
  syncWorkOrdersDir: Direction;
  syncInvoices: boolean;
  syncInvoicesDir: Direction;
  syncActs: boolean;
  syncActsDir: Direction;
  syncClients: boolean;
  syncClientsDir: Direction;
  syncStock: boolean;
  syncStockDir: Direction;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LOG_DATA: LogEntry[] = [
  { id: "1",  datetime: "18.05.2026 10:47:03", docType: "Наряд",       direction: "→1С", status: "Успешно",   docLabel: "WO-2026-000247" },
  { id: "2",  datetime: "18.05.2026 10:45:18", docType: "Счёт",        direction: "→1С", status: "Успешно",   docLabel: "INV-2026-0891"  },
  { id: "3",  datetime: "18.05.2026 10:44:55", docType: "Контрагент",  direction: "←1С", status: "Ошибка",    docLabel: "ООО «АльфаТех»", errorMsg: "Дублирующийся ИНН 7712345678" },
  { id: "4",  datetime: "18.05.2026 10:43:10", docType: "Акт",         direction: "→1С", status: "Успешно",   docLabel: "ACT-2026-0412"  },
  { id: "5",  datetime: "18.05.2026 10:41:02", docType: "Наряд",       direction: "→1С", status: "Пропущено", docLabel: "WO-2026-000246" },
  { id: "6",  datetime: "18.05.2026 10:39:47", docType: "Счёт",        direction: "→1С", status: "Успешно",   docLabel: "INV-2026-0890"  },
  { id: "7",  datetime: "18.05.2026 10:37:30", docType: "Контрагент",  direction: "←1С", status: "Успешно",   docLabel: "ИП Сидоров А.В." },
  { id: "8",  datetime: "18.05.2026 10:35:14", docType: "Наряд",       direction: "→1С", status: "Ошибка",    docLabel: "WO-2026-000244", errorMsg: "Таймаут соединения (30s)" },
  { id: "9",  datetime: "18.05.2026 10:33:01", docType: "Акт",         direction: "→1С", status: "Успешно",   docLabel: "ACT-2026-0411"  },
  { id: "10", datetime: "18.05.2026 10:30:55", docType: "Счёт",        direction: "←1С", status: "Успешно",   docLabel: "INV-2026-0889"  },
  { id: "11", datetime: "18.05.2026 10:28:40", docType: "Наряд",       direction: "→1С", status: "Успешно",   docLabel: "WO-2026-000243" },
  { id: "12", datetime: "18.05.2026 10:26:22", docType: "Контрагент",  direction: "←1С", status: "Пропущено", docLabel: "ЗАО «БетаСервис»" },
  { id: "13", datetime: "18.05.2026 10:24:05", docType: "Акт",         direction: "→1С", status: "Успешно",   docLabel: "ACT-2026-0410"  },
  { id: "14", datetime: "18.05.2026 10:21:50", docType: "Счёт",        direction: "→1С", status: "Успешно",   docLabel: "INV-2026-0888"  },
  { id: "15", datetime: "18.05.2026 10:19:33", docType: "Наряд",       direction: "→1С", status: "Ошибка",    docLabel: "WO-2026-000241", errorMsg: "Поле 'СуммаДокумента' обязательно" },
  { id: "16", datetime: "18.05.2026 10:17:11", docType: "Контрагент",  direction: "←1С", status: "Успешно",   docLabel: "ООО «ГаммаКлимат»" },
  { id: "17", datetime: "18.05.2026 10:15:00", docType: "Наряд",       direction: "→1С", status: "Успешно",   docLabel: "WO-2026-000240" },
  { id: "18", datetime: "18.05.2026 10:12:45", docType: "Акт",         direction: "→1С", status: "Успешно",   docLabel: "ACT-2026-0409"  },
  { id: "19", datetime: "18.05.2026 10:10:20", docType: "Счёт",        direction: "←1С", status: "Успешно",   docLabel: "INV-2026-0887"  },
  { id: "20", datetime: "18.05.2026 10:08:07", docType: "Наряд",       direction: "→1С", status: "Успешно",   docLabel: "WO-2026-000239" },
];

const HOURLY_CHART: { hour: string; docs: number }[] = [
  { hour: "00", docs: 3 }, { hour: "01", docs: 1 }, { hour: "02", docs: 0 },
  { hour: "03", docs: 0 }, { hour: "04", docs: 2 }, { hour: "05", docs: 4 },
  { hour: "06", docs: 8 }, { hour: "07", docs: 14 }, { hour: "08", docs: 22 },
  { hour: "09", docs: 31 }, { hour: "10", docs: 28 }, { hour: "11", docs: 35 },
  { hour: "12", docs: 29 }, { hour: "13", docs: 27 }, { hour: "14", docs: 18 },
  { hour: "15", docs: 12 }, { hour: "16", docs: 6 }, { hour: "17", docs: 3 },
];

const INITIAL_QUEUE: QueueItem[] = [
  { id: "q1",  docType: "Наряд",      docRef: "WO-2026-000248", priority: "Высокий", addedAt: "10:52:01" },
  { id: "q2",  docType: "Счёт",       docRef: "INV-2026-0892",  priority: "Средний", addedAt: "10:51:44" },
  { id: "q3",  docType: "Акт",        docRef: "ACT-2026-0413",  priority: "Средний", addedAt: "10:51:12" },
  { id: "q4",  docType: "Контрагент", docRef: "ООО «ДельтаСервис»", priority: "Низкий", addedAt: "10:50:30" },
  { id: "q5",  docType: "Наряд",      docRef: "WO-2026-000249", priority: "Высокий", addedAt: "10:49:55" },
  { id: "q6",  docType: "Счёт",       docRef: "INV-2026-0893",  priority: "Средний", addedAt: "10:49:20" },
  { id: "q7",  docType: "Наряд",      docRef: "WO-2026-000250", priority: "Низкий",  addedAt: "10:48:47" },
  { id: "q8",  docType: "Акт",        docRef: "ACT-2026-0414",  priority: "Средний", addedAt: "10:48:05" },
  { id: "q9",  docType: "Контрагент", docRef: "ИП Козлов Р.Т.", priority: "Низкий",  addedAt: "10:47:30" },
  { id: "q10", docType: "Счёт",       docRef: "INV-2026-0894",  priority: "Высокий", addedAt: "10:46:58" },
  { id: "q11", docType: "Наряд",      docRef: "WO-2026-000251", priority: "Средний", addedAt: "10:46:10" },
  { id: "q12", docType: "Акт",        docRef: "ACT-2026-0415",  priority: "Низкий",  addedAt: "10:45:33" },
];

const MAPPING_ROWS: MappingRow[] = [
  { entity: "Наряд",    fieldLocal: "workOrderNumber",   field1C: "НомерДокумента",      transform: "WO-{YYYY}-{N:06d} → {N}" },
  { entity: "Наряд",    fieldLocal: "totalAmount",       field1C: "СуммаДокумента",      transform: "BigDecimal → Number" },
  { entity: "Наряд",    fieldLocal: "status",            field1C: "СостояниеДокумента",  transform: "Enum → String (справочник)" },
  { entity: "Наряд",    fieldLocal: "completedAt",       field1C: "ДатаВыполнения",      transform: "ZonedDateTime → DateTime" },
  { entity: "Клиент",   fieldLocal: "inn",               field1C: "ИНН",                 transform: "String (10/12)" },
  { entity: "Клиент",   fieldLocal: "legalName",         field1C: "НаименованиеПолное",  transform: "прямое" },
  { entity: "Клиент",   fieldLocal: "type",              field1C: "ЮридическоеЛицо",     transform: "LEGAL_ENTITY → true" },
  { entity: "Счёт",     fieldLocal: "invoiceNumber",     field1C: "НомерСчёта",          transform: "INV-{YYYY}-{N:04d} → {N}" },
  { entity: "Счёт",     fieldLocal: "dueDate",           field1C: "СрокОплаты",          transform: "LocalDate → Date" },
  { entity: "Счёт",     fieldLocal: "vatAmount",         field1C: "СуммаНДС",            transform: "BigDecimal → Number" },
  { entity: "Акт",      fieldLocal: "actNumber",         field1C: "НомерАкта",           transform: "ACT-{YYYY}-{N:04d} → {N}" },
  { entity: "Акт",      fieldLocal: "signedAt",          field1C: "ДатаПодписания",      transform: "ZonedDateTime → DateTime" },
  { entity: "Товар",    fieldLocal: "sku",               field1C: "Артикул",             transform: "прямое" },
  { entity: "Товар",    fieldLocal: "purchasePrice",     field1C: "ЦенаЗакупки",         transform: "BigDecimal → Number" },
  { entity: "Товар",    fieldLocal: "unit",              field1C: "ЕдиницаИзмерения",    transform: "String → Справочник.ЕдИзм" },
];

const INITIAL_SETTINGS: SyncSettings = {
  url: "http://192.168.1.100/unf/odata/standard.odata",
  login: "api_user",
  password: "••••••••••",
  interval: "15",
  autoSync: true,
  syncWorkOrders: true,
  syncWorkOrdersDir: "→1С",
  syncInvoices: true,
  syncInvoicesDir: "→1С",
  syncActs: true,
  syncActsDir: "→1С",
  syncClients: true,
  syncClientsDir: "←1С",
  syncStock: false,
  syncStockDir: "←1С",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: LogStatus) {
  if (status === "Успешно")
    return <Badge className="bg-green-100 text-green-700 border-green-200">Успешно</Badge>;
  if (status === "Ошибка")
    return <Badge variant="destructive">Ошибка</Badge>;
  return <Badge variant="secondary">Пропущено</Badge>;
}

function priorityBadge(p: Priority) {
  if (p === "Высокий") return <Badge className="bg-red-100 text-red-700 border-red-200">Высокий</Badge>;
  if (p === "Средний") return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Средний</Badge>;
  return <Badge variant="secondary">Низкий</Badge>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OneCIntegrationFull() {
  const [syncing, setSyncing] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [settings, setSettings] = useState<SyncSettings>(INITIAL_SETTINGS);
  const [testingConn, setTestingConn] = useState(false);
  const [savingMapping, setSavingMapping] = useState(false);

  // ── Sync Now ────────────────────────────────────────────────────────────────
  function handleSyncNow() {
    if (syncing) return;
    setSyncing(true);
    toast.loading("Синхронизация запущена…", { id: "sync" });
    setTimeout(() => {
      toast.success("Синхронизировано 18 документов. Ошибок: 0", { id: "sync", duration: 4000 });
      setSyncing(false);
    }, 2800);
  }

  // ── Queue actions ────────────────────────────────────────────────────────────
  function handleProcessNow(item: QueueItem) {
    toast.loading(`Обрабатываем ${item.docRef}…`, { id: `proc-${item.id}` });
    setTimeout(() => {
      setQueue(prev => prev.filter(q => q.id !== item.id));
      toast.success(`${item.docRef} успешно передан в 1С`, { id: `proc-${item.id}`, duration: 3000 });
    }, 1500);
  }

  function handleRemoveFromQueue(item: QueueItem) {
    setQueue(prev => prev.filter(q => q.id !== item.id));
    toast.info(`${item.docRef} удалён из очереди`);
  }

  // ── Retry ────────────────────────────────────────────────────────────────────
  function handleRetry(entry: LogEntry) {
    toast.loading(`Повторная отправка ${entry.docLabel}…`, { id: `retry-${entry.id}` });
    setTimeout(() => {
      toast.success(`${entry.docLabel} успешно отправлен`, { id: `retry-${entry.id}`, duration: 3000 });
    }, 1800);
  }

  // ── Mapping save ─────────────────────────────────────────────────────────────
  function handleSaveMapping() {
    setSavingMapping(true);
    setTimeout(() => {
      setSavingMapping(false);
      toast.success("Маппинг полей сохранён");
    }, 1000);
  }

  // ── Test connection ──────────────────────────────────────────────────────────
  function handleTestConnection() {
    setTestingConn(true);
    toast.loading("Проверяем соединение с 1С…", { id: "conntest" });
    setTimeout(() => {
      setTestingConn(false);
      toast.success("Соединение успешно. Версия 1С:УНФ 8.3.24.1467", { id: "conntest", duration: 4000 });
    }, 2000);
  }

  function handleSaveSettings() {
    toast.success("Настройки сохранены");
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Интеграция с 1С:УНФ</h1>
          <p className="text-sm text-gray-500 mt-0.5">Синхронизация документов с 1С:Управление нашей фирмой</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-green-700">Подключено</span>
            <span className="text-xs text-green-600 opacity-75">v8.3.24</span>
          </div>

          <div className="text-xs text-gray-400 text-right leading-tight hidden sm:block">
            <div>Последняя синхронизация</div>
            <div className="font-medium text-gray-600">4 мин назад</div>
          </div>

          <Button onClick={handleSyncNow} disabled={syncing} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Icon name={syncing ? "Loader2" : "RefreshCw"} size={15} className={syncing ? "animate-spin mr-1.5" : "mr-1.5"} />
            {syncing ? "Синхронизация…" : "Синхронизировать сейчас"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Синхронизировано сегодня</span>
              <Icon name="FileCheck2" size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">247</div>
            <div className="text-xs text-gray-400 mt-0.5">документов</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Ошибок</span>
              <Icon name="AlertCircle" size={16} className="text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-xs text-gray-400 mt-0.5">требуют внимания</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">В очереди</span>
              <Icon name="Clock" size={16} className="text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{queue.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">ожидают отправки</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Задержка</span>
              <Icon name="Zap" size={16} className="text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1.2<span className="text-base font-normal text-gray-400">с</span></div>
            <div className="text-xs text-green-600 mt-0.5">норма ≤ 3с</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="log">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="log">Лог синхронизации</TabsTrigger>
          <TabsTrigger value="queue">
            Очередь
            {queue.length > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {queue.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mapping">Маппинг</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* ── Лог синхронизации ─────────────────────────────────────────────── */}
        <TabsContent value="log" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Документов в час (сегодня)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={HOURLY_CHART} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={h => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} doc`, "Документов"]} labelFormatter={h => `${h}:00`} />
                  <Line type="monotone" dataKey="docs" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs pl-4">Дата / Время</TableHead>
                    <TableHead className="text-xs">Тип документа</TableHead>
                    <TableHead className="text-xs">Направление</TableHead>
                    <TableHead className="text-xs">Статус</TableHead>
                    <TableHead className="text-xs">Документ</TableHead>
                    <TableHead className="text-xs pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {LOG_DATA.map(entry => (
                    <TableRow key={entry.id} className={entry.status === "Ошибка" ? "bg-red-50 hover:bg-red-50" : undefined}>
                      <TableCell className="text-xs text-gray-500 pl-4 whitespace-nowrap">{entry.datetime}</TableCell>
                      <TableCell className="text-xs font-medium">{entry.docType}</TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {entry.direction}
                        </span>
                      </TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell className="text-xs">
                        {entry.status === "Ошибка" ? (
                          <div>
                            <span className="text-red-600 font-medium">{entry.docLabel}</span>
                            {entry.errorMsg && <div className="text-red-400 mt-0.5">{entry.errorMsg}</div>}
                          </div>
                        ) : (
                          <a href="#" className="text-blue-600 hover:underline">{entry.docLabel}</a>
                        )}
                      </TableCell>
                      <TableCell className="pr-4">
                        {entry.status === "Ошибка" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRetry(entry)}>
                            <Icon name="RotateCcw" size={12} className="mr-1" />
                            Повторить
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Очередь ───────────────────────────────────────────────────────── */}
        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Документы в очереди — {queue.length} шт.
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Icon name="CheckCircle2" size={36} className="mb-2 text-green-400" />
                  <span className="text-sm">Очередь пуста</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs pl-4">Тип</TableHead>
                      <TableHead className="text-xs">Документ</TableHead>
                      <TableHead className="text-xs">Приоритет</TableHead>
                      <TableHead className="text-xs">Добавлен</TableHead>
                      <TableHead className="text-xs pr-4 text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium pl-4">{item.docType}</TableCell>
                        <TableCell className="text-xs text-blue-600">{item.docRef}</TableCell>
                        <TableCell>{priorityBadge(item.priority)}</TableCell>
                        <TableCell className="text-xs text-gray-500">{item.addedAt}</TableCell>
                        <TableCell className="pr-4">
                          <div className="flex gap-1.5 justify-end">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleProcessNow(item)}>
                              <Icon name="Play" size={11} className="mr-1" />
                              Обработать
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveFromQueue(item)}>
                              <Icon name="Trash2" size={11} className="mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Маппинг ───────────────────────────────────────────────────────── */}
        <TabsContent value="mapping" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Соответствие полей</CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs" onClick={handleSaveMapping} disabled={savingMapping}>
                <Icon name={savingMapping ? "Loader2" : "Save"} size={13} className={`mr-1.5 ${savingMapping ? "animate-spin" : ""}`} />
                {savingMapping ? "Сохранение…" : "Сохранить маппинг"}
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs pl-4">Сущность</TableHead>
                    <TableHead className="text-xs">Поле в системе</TableHead>
                    <TableHead className="text-xs text-center">↔</TableHead>
                    <TableHead className="text-xs">Поле в 1С</TableHead>
                    <TableHead className="text-xs pr-4">Трансформация</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MAPPING_ROWS.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs pl-4">
                        {i === 0 || MAPPING_ROWS[i - 1].entity !== row.entity
                          ? <span className="font-semibold text-gray-700">{row.entity}</span>
                          : <span className="text-gray-300">│</span>
                        }
                      </TableCell>
                      <TableCell className="text-xs font-mono text-blue-700">{row.fieldLocal}</TableCell>
                      <TableCell className="text-center text-gray-400 text-xs">↔</TableCell>
                      <TableCell className="text-xs font-mono text-orange-700">{row.field1C}</TableCell>
                      <TableCell className="text-xs text-gray-500 pr-4">{row.transform}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Настройки ─────────────────────────────────────────────────────── */}
        <TabsContent value="settings" className="mt-4 space-y-4">

          {/* Connection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon name="Server" size={15} className="text-gray-500" />
                Подключение к 1С
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">URL OData сервиса</label>
                <Input
                  value={settings.url}
                  onChange={e => setSettings(s => ({ ...s, url: e.target.value }))}
                  className="text-sm font-mono"
                  placeholder="http://host/unf/odata/standard.odata"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Логин</label>
                  <Input
                    value={settings.login}
                    onChange={e => setSettings(s => ({ ...s, login: e.target.value }))}
                    className="text-sm"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Пароль</label>
                  <Input
                    type="password"
                    value={settings.password}
                    onChange={e => setSettings(s => ({ ...s, password: e.target.value }))}
                    className="text-sm"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="h-9 text-sm" onClick={handleTestConnection} disabled={testingConn}>
                  <Icon name={testingConn ? "Loader2" : "Wifi"} size={14} className={`mr-1.5 ${testingConn ? "animate-spin" : ""}`} />
                  {testingConn ? "Проверяем…" : "Проверить соединение"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon name="Settings2" size={15} className="text-gray-500" />
                Параметры синхронизации
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">Автоматическая синхронизация</div>
                  <div className="text-xs text-gray-400">Запускать по расписанию</div>
                </div>
                <Switch
                  checked={settings.autoSync}
                  onCheckedChange={v => setSettings(s => ({ ...s, autoSync: v }))}
                />
              </div>

              {settings.autoSync && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Интервал синхронизации</label>
                  <Select value={settings.interval} onValueChange={v => setSettings(s => ({ ...s, interval: v }))}>
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
              )}

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Типы документов</div>

                {(
                  [
                    { key: "syncWorkOrders", dirKey: "syncWorkOrdersDir", label: "Наряды на работу", icon: "ClipboardList" },
                    { key: "syncInvoices",   dirKey: "syncInvoicesDir",   label: "Счета",             icon: "FileText"     },
                    { key: "syncActs",       dirKey: "syncActsDir",       label: "Акты выполненных работ", icon: "FileCheck"  },
                    { key: "syncClients",    dirKey: "syncClientsDir",    label: "Контрагенты",       icon: "Users"        },
                    { key: "syncStock",      dirKey: "syncStockDir",      label: "Складские остатки", icon: "Package"      },
                  ] as { key: keyof SyncSettings; dirKey: keyof SyncSettings; label: string; icon: string }[]
                ).map(({ key, dirKey, label, icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={15} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {settings[key] && (
                        <Select
                          value={settings[dirKey] as string}
                          onValueChange={v => setSettings(s => ({ ...s, [dirKey]: v as Direction }))}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="→1С">→ в 1С</SelectItem>
                            <SelectItem value="←1С">← из 1С</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Switch
                        checked={settings[key] as boolean}
                        onCheckedChange={v => setSettings(s => ({ ...s, [key]: v }))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm" onClick={handleSaveSettings}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
