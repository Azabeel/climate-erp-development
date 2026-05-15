import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType =
  | "create"
  | "update"
  | "delete"
  | "auth"
  | "export"
  | "error";

type EntityType =
  | "WorkOrder"
  | "Client"
  | "Stock"
  | "Settings"
  | "Contract"
  | "Invoice"
  | "Employee"
  | "Purchase";

type UserRole =
  | "Диспетчер"
  | "Менеджер"
  | "Администратор"
  | "Инженер"
  | "Бухгалтер";

type Period = "today" | "week" | "month";

interface FieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  user: string;
  role: UserRole;
  type: EventType;
  entity: EntityType;
  objectId: string;
  action: string;
  ip: string;
  userAgent: string;
  changes?: FieldChange[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: "AU-001",
    timestamp: "2026-05-15T09:02:14Z",
    user: "Смирнова Ольга",
    role: "Диспетчер",
    type: "update",
    entity: "WorkOrder",
    objectId: "WO-2026-000451",
    action: "Статус изменён: IN_PROGRESS → COMPLETED",
    ip: "192.168.1.22",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    changes: [
      { field: "status", before: "IN_PROGRESS", after: "COMPLETED" },
      { field: "completedAt", before: null, after: "2026-05-15T09:02:14Z" },
    ],
  },
  {
    id: "AU-002",
    timestamp: "2026-05-15T08:55:30Z",
    user: "Петров Дмитрий",
    role: "Менеджер",
    type: "create",
    entity: "Client",
    objectId: "CLT-000194",
    action: "Создан новый клиент: ООО «АрктикХолод»",
    ip: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4",
    changes: [
      { field: "name", before: null, after: "ООО «АрктикХолод»" },
      { field: "type", before: null, after: "LEGAL_ENTITY" },
      { field: "inn", before: null, after: "7712345678" },
    ],
  },
  {
    id: "AU-003",
    timestamp: "2026-05-15T08:40:11Z",
    user: "Козлова Марина",
    role: "Диспетчер",
    type: "update",
    entity: "WorkOrder",
    objectId: "WO-2026-000449",
    action: "Назначен инженер Иванов А.С., приоритет: URGENT",
    ip: "10.0.0.14",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125.0",
    changes: [
      { field: "assignedEngineerId", before: null, after: "EMP-000012" },
      { field: "priority", before: "NORMAL", after: "URGENT" },
      { field: "plannedAt", before: null, after: "2026-05-15T11:00:00Z" },
    ],
  },
  {
    id: "AU-004",
    timestamp: "2026-05-15T08:21:00Z",
    user: "Администратор",
    role: "Администратор",
    type: "auth",
    entity: "Settings",
    objectId: "SYS",
    action: "Вход в систему выполнен успешно",
    ip: "10.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
  },
  {
    id: "AU-005",
    timestamp: "2026-05-15T08:15:44Z",
    user: "Фролова Екатерина",
    role: "Бухгалтер",
    type: "export",
    entity: "Invoice",
    objectId: "INV-2026-000781",
    action: "Экспорт счёта в PDF (18 500 ₽)",
    ip: "172.16.0.8",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/124.0",
  },
  {
    id: "AU-006",
    timestamp: "2026-05-15T07:58:22Z",
    user: "Администратор",
    role: "Администратор",
    type: "create",
    entity: "Employee",
    objectId: "EMP-000041",
    action: "Создан сотрудник: Романов Сергей Викторович",
    ip: "10.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    changes: [
      { field: "fullName", before: null, after: "Романов Сергей Викторович" },
      { field: "role", before: null, after: "TECHNICIAN" },
      { field: "employmentType", before: null, after: "EMPLOYEE" },
    ],
  },
  {
    id: "AU-007",
    timestamp: "2026-05-15T07:30:05Z",
    user: "Смирнова Ольга",
    role: "Диспетчер",
    type: "error",
    entity: "WorkOrder",
    objectId: "WO-2026-000450",
    action: "Ошибка смены статуса: недопустимый переход NEW → COMPLETED",
    ip: "192.168.1.22",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
  },
  {
    id: "AU-008",
    timestamp: "2026-05-14T17:33:05Z",
    user: "Петров Дмитрий",
    role: "Менеджер",
    type: "update",
    entity: "Contract",
    objectId: "CTR-2025-000019",
    action: "Договор продлён до 31.12.2026, сумма увеличена",
    ip: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4",
    changes: [
      { field: "endDate", before: "2025-12-31", after: "2026-12-31" },
      { field: "amount", before: 120000, after: 145000 },
    ],
  },
  {
    id: "AU-009",
    timestamp: "2026-05-14T16:10:00Z",
    user: "Козлова Марина",
    role: "Диспетчер",
    type: "delete",
    entity: "Client",
    objectId: "CLT-000103",
    action: "Удалён дублирующий профиль (объединён с CLT-000087)",
    ip: "10.0.0.14",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125.0",
  },
  {
    id: "AU-010",
    timestamp: "2026-05-14T15:45:18Z",
    user: "Фролова Екатерина",
    role: "Бухгалтер",
    type: "create",
    entity: "Invoice",
    objectId: "INV-2026-000780",
    action: "Выставлен счёт клиенту на сумму 24 300 ₽",
    ip: "172.16.0.8",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/124.0",
    changes: [
      { field: "amount", before: null, after: 24300 },
      { field: "clientId", before: null, after: "CLT-000087" },
      { field: "status", before: null, after: "PENDING" },
    ],
  },
  {
    id: "AU-011",
    timestamp: "2026-05-14T14:22:37Z",
    user: "Смирнова Ольга",
    role: "Диспетчер",
    type: "update",
    entity: "WorkOrder",
    objectId: "WO-2026-000444",
    action: "Статус изменён: ASSIGNED → EN_ROUTE",
    ip: "192.168.1.22",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    changes: [
      { field: "status", before: "ASSIGNED", after: "EN_ROUTE" },
      { field: "enRouteAt", before: null, after: "2026-05-14T14:22:37Z" },
    ],
  },
  {
    id: "AU-012",
    timestamp: "2026-05-14T13:05:50Z",
    user: "Администратор",
    role: "Администратор",
    type: "update",
    entity: "Settings",
    objectId: "SYS",
    action: "Изменены системные настройки: наценка ЗИП по умолчанию",
    ip: "10.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    changes: [
      { field: "zip_default_markup", before: 25, after: 30 },
    ],
  },
  {
    id: "AU-013",
    timestamp: "2026-05-14T12:00:00Z",
    user: "Козлова Марина",
    role: "Диспетчер",
    type: "auth",
    entity: "Employee",
    objectId: "EMP-000034",
    action: "Вход в систему выполнен успешно",
    ip: "10.0.0.14",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125.0",
  },
  {
    id: "AU-014",
    timestamp: "2026-05-14T11:48:14Z",
    user: "Петров Дмитрий",
    role: "Менеджер",
    type: "create",
    entity: "WorkOrder",
    objectId: "WO-2026-000452",
    action: "Создан наряд на плановое ТО: Daikin FTXS35K",
    ip: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4",
    changes: [
      { field: "type", before: null, after: "MAINTENANCE" },
      { field: "equipmentId", before: null, after: "EQ-000221" },
      { field: "priority", before: null, after: "NORMAL" },
    ],
  },
  {
    id: "AU-015",
    timestamp: "2026-05-14T10:30:22Z",
    user: "Фролова Екатерина",
    role: "Бухгалтер",
    type: "update",
    entity: "Invoice",
    objectId: "INV-2026-000775",
    action: "Статус оплаты изменён: PENDING → PAID",
    ip: "172.16.0.8",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/124.0",
    changes: [
      { field: "paymentStatus", before: "PENDING", after: "PAID" },
      { field: "paidAt", before: null, after: "2026-05-14T10:30:00Z" },
      { field: "paymentMethod", before: null, after: "BANK_TRANSFER" },
    ],
  },
  {
    id: "AU-016",
    timestamp: "2026-05-14T09:15:05Z",
    user: "Смирнова Ольга",
    role: "Диспетчер",
    type: "update",
    entity: "Stock",
    objectId: "STOCK-CENTRAL",
    action: "Списано со склада: хладагент R-410A 0.8 кг (наряд WO-444)",
    ip: "192.168.1.22",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    changes: [
      { field: "balance_R410A_kg", before: 12.5, after: 11.7 },
      { field: "movementType", before: null, after: "WRITE_OFF" },
    ],
  },
  {
    id: "AU-017",
    timestamp: "2026-05-13T18:00:00Z",
    user: "Администратор",
    role: "Администратор",
    type: "create",
    entity: "Contract",
    objectId: "CTR-2026-000025",
    action: "Заключён новый договор: ООО «ТехноГрупп», SLA = 4ч",
    ip: "10.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
    changes: [
      { field: "clientId", before: null, after: "CLT-000194" },
      { field: "slaConfigId", before: null, after: "SLA-004" },
      { field: "amount", before: null, after: 180000 },
    ],
  },
  {
    id: "AU-018",
    timestamp: "2026-05-13T16:44:30Z",
    user: "Фролова Екатерина",
    role: "Бухгалтер",
    type: "export",
    entity: "Invoice",
    objectId: "REPORT-2026-05",
    action: "Экспорт реестра счетов за май 2026 (CSV, 47 записей)",
    ip: "172.16.0.8",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/124.0",
  },
  {
    id: "AU-019",
    timestamp: "2026-05-13T15:20:11Z",
    user: "Козлова Марина",
    role: "Диспетчер",
    type: "update",
    entity: "Purchase",
    objectId: "PO-2026-000089",
    action: "Статус заявки на ЗИП: ORDERED → IN_TRANSIT",
    ip: "10.0.0.14",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125.0",
    changes: [
      { field: "status", before: "ORDERED", after: "IN_TRANSIT" },
      { field: "trackingNumber", before: null, after: "CDEK-10234567890" },
    ],
  },
  {
    id: "AU-020",
    timestamp: "2026-05-13T09:00:00Z",
    user: "Петров Дмитрий",
    role: "Менеджер",
    type: "error",
    entity: "Settings",
    objectId: "INT-1C",
    action: "Ошибка синхронизации с 1С: таймаут соединения 5 000 мс",
    ip: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
  auth: "Вход/Выход",
  export: "Экспорт",
  error: "Ошибка",
};

const EVENT_TYPE_BADGE: Record<
  EventType,
  { bg: string; text: string; dot: string }
> = {
  create:  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  update:  { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  delete:  { bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-500"     },
  auth:    { bg: "bg-violet-100",  text: "text-violet-700",  dot: "bg-violet-500"  },
  export:  { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-500"  },
  error:   { bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-600"    },
};

const ENTITY_LABELS: Record<EntityType, string> = {
  WorkOrder: "Наряд",
  Client:    "Клиент",
  Stock:     "Склад",
  Settings:  "Настройки",
  Contract:  "Договор",
  Invoice:   "Счёт",
  Employee:  "Сотрудник",
  Purchase:  "Закупка",
};

const ALL_USERS = Array.from(new Set(MOCK_ENTRIES.map((e) => e.user))).sort();

// ─── Analytics mock data ──────────────────────────────────────────────────────

const HOURLY_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  events: Math.round(
    (h >= 8 && h <= 19
      ? 40 + Math.random() * 80
      : 2 + Math.random() * 10),
  ),
}));

const DAILY_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-04-16");
  d.setDate(d.getDate() + i);
  return {
    day: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
    events: Math.round(600 + Math.random() * 900),
  };
});

const TOP_USERS = [
  { user: "Смирнова Ольга",    events: 412 },
  { user: "Козлова Марина",    events: 387 },
  { user: "Петров Дмитрий",    events: 341 },
  { user: "Фролова Екатерина", events: 228 },
  { user: "Администратор",     events: 114 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTs(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function isInPeriod(iso: string, period: Period): boolean {
  const d = new Date(iso);
  const now = new Date("2026-05-15T12:00:00Z");
  if (period === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (period === "week") {
    const diff = now.getTime() - d.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }
  // month
  const diff = now.getTime() - d.getTime();
  return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
}

function prettyJson(value: unknown): string {
  if (value === null || value === undefined) return "null";
  return JSON.stringify(value, null, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: EventType }) {
  const s = EVENT_TYPE_BADGE[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {EVENT_TYPE_LABELS[type]}
    </span>
  );
}

function JsonDiff({ changes }: { changes: FieldChange[] }) {
  return (
    <div className="flex flex-col gap-2">
      {changes.map((c, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <span className="text-xs font-mono font-semibold text-gray-500 mb-0.5">
            {c.field}
          </span>
          <div className="flex gap-2">
            <div className="flex-1 bg-red-50 border border-red-200 rounded px-2 py-1 text-xs font-mono text-red-700 whitespace-pre-wrap">
              <span className="text-red-400 select-none">- </span>
              {prettyJson(c.before)}
            </div>
            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-xs font-mono text-emerald-700 whitespace-pre-wrap">
              <span className="text-emerald-400 select-none">+ </span>
              {prettyJson(c.after)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon name={icon} size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [period, setPeriod] = useState<Period>("today");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return MOCK_ENTRIES.filter((e) => {
      if (!isInPeriod(e.timestamp, period)) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (userFilter !== "all" && e.user !== userFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !e.user.toLowerCase().includes(q) &&
          !e.action.toLowerCase().includes(q) &&
          !e.objectId.toLowerCase().includes(q) &&
          !ENTITY_LABELS[e.entity].toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [search, typeFilter, userFilter, period]);

  const critical = filtered.filter((e) => e.type === "error" || e.type === "delete").length;
  const dataChanges = filtered.filter((e) => ["create", "update", "delete"].includes(e.type)).length;
  const activeUsers = new Set(filtered.map((e) => e.user)).size;

  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    toast.success("Журнал аудита экспортирован в CSV (готов к скачиванию)");
  }

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-gray-50">
      {/* ── Left: main content ── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <Icon name="ShieldCheck" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Журнал аудита</h1>
              <p className="text-sm text-gray-500">История системных действий и изменений данных</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Icon name="Download" size={15} />
            Экспорт
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Событий сегодня"     value="1 284" icon="Activity"   color="bg-blue-500"    />
          <StatCard label="Критических"          value={critical || 12}  icon="AlertTriangle" color="bg-rose-500"    />
          <StatCard label="Изменений данных"     value={dataChanges || 847} icon="DatabaseZap"  color="bg-amber-500"  />
          <StatCard label="Активных пользователей" value={activeUsers || 34} icon="Users"        color="bg-emerald-500" />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Поиск</label>
            <Input
              placeholder="Событие, пользователь, ID объекта..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Тип события</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType | "all")}
              className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все типы</option>
              {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Пользователь</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все пользователи</option>
              {ALL_USERS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Период</label>
            <div className="flex rounded-md overflow-hidden border border-gray-200 h-9">
              {(["today", "week", "month"] as Period[]).map((p) => {
                const labels: Record<Period, string> = { today: "Сегодня", week: "Неделя", month: "Месяц" };
                return (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 text-sm font-medium transition-colors ${
                      period === p
                        ? "bg-slate-800 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Время</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Пользователь</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Тип</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Сущность</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">ID объекта</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Действие</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                      <Icon name="Search" size={32} className="mx-auto mb-2 text-gray-300" />
                      Нет записей по выбранным фильтрам
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const { date, time } = formatTs(entry.timestamp);
                    const isOpen = expanded.has(entry.id);
                    const hasDetails = !!(entry.changes && entry.changes.length > 0);

                    return (
                      <>
                        <tr
                          key={entry.id}
                          className={`transition-colors ${hasDetails ? "cursor-pointer hover:bg-gray-50" : ""} ${isOpen ? "bg-slate-50" : ""}`}
                          onClick={() => hasDetails && toggleRow(entry.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-mono text-gray-900 text-xs font-medium">{time}</div>
                            <div className="text-xs text-gray-400">{date}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-800">{entry.user}</div>
                            <div className="text-xs text-gray-400">{entry.role}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <EventTypeBadge type={entry.type} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs font-normal">
                              {ENTITY_LABELS[entry.entity]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-xs text-blue-600">{entry.objectId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 text-sm">{entry.action}</span>
                              {hasDetails && (
                                <Icon
                                  name={isOpen ? "ChevronUp" : "ChevronDown"}
                                  size={14}
                                  className="text-gray-400 flex-shrink-0"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-xs text-gray-500">{entry.ip}</span>
                          </td>
                        </tr>

                        {/* Expandable detail row */}
                        {isOpen && hasDetails && (
                          <tr key={`${entry.id}-detail`}>
                            <td
                              colSpan={7}
                              className="px-6 py-4 bg-slate-50 border-t border-slate-200"
                            >
                              <div className="flex gap-8">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Изменения данных (до / после)
                                  </p>
                                  <JsonDiff changes={entry.changes!} />
                                </div>
                                <div className="shrink-0 w-72">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Браузер / User-Agent
                                  </p>
                                  <p className="text-xs text-gray-600 font-mono bg-white border border-gray-200 rounded p-2 break-all">
                                    {entry.userAgent}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Показано <span className="font-medium">{filtered.length}</span> из{" "}
              <span className="font-medium">{MOCK_ENTRIES.length}</span> записей
            </span>
            <span className="text-xs text-gray-400">
              Кликните на строку с изменениями для просмотра деталей
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: analytics sidebar ── */}
      <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-5">
        {/* Hourly activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon name="BarChart3" size={16} className="text-blue-500" />
            Активность по часам
          </h3>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={HOURLY_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                interval={3}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(v: number) => [v, "событий"]}
              />
              <Bar dataKey="events" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" size={16} className="text-emerald-500" />
            Динамика за 30 дней
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={DAILY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                interval={6}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(v: number) => [v, "событий"]}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top users */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon name="Users" size={16} className="text-violet-500" />
            Топ-5 по активности
          </h3>
          <div className="flex flex-col gap-2.5">
            {TOP_USERS.map((u, idx) => {
              const maxEvents = TOP_USERS[0].events;
              const pct = Math.round((u.events / maxEvents) * 100);
              return (
                <div key={u.user}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-gray-700 truncate max-w-[160px]">
                      <span className="text-gray-400 mr-1 font-mono">{idx + 1}.</span>
                      {u.user}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 ml-2">{u.events}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event type breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon name="PieChart" size={16} className="text-amber-500" />
            Разбивка по типам
          </h3>
          <div className="flex flex-col gap-1.5">
            {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([type, label]) => {
              const count = MOCK_ENTRIES.filter((e) => e.type === type).length;
              const s = EVENT_TYPE_BADGE[type];
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
