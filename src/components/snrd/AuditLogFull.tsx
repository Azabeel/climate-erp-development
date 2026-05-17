import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = "create" | "update" | "delete" | "auth" | "export" | "settings";
type EntityType = "WorkOrder" | "Client" | "Stock" | "Settings" | "Contract" | "Invoice" | "Employee" | "Purchase" | "Session" | "Report";
type UserRole = "Диспетчер" | "Менеджер" | "Администратор" | "Инженер" | "Бухгалтер";
type ResultStatus = "success" | "error";
type Period = "today" | "week" | "month";
type TabKey = "all" | "critical" | "auth" | "data";

interface FieldDiff { field: string; before: unknown; after: unknown }

interface AuditEntry {
  id: string; timestamp: string;
  userId: string; userName: string; userInitials: string; userRole: UserRole;
  actionType: ActionType; entityType: EntityType; entityId: string; entityName: string;
  ipAddress: string; userAgent: string; sessionId: string;
  result: ResultStatus; errorMessage?: string; diff?: FieldDiff[]; isCritical: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTION_CFG: Record<ActionType, { label: string; color: string; icon: string }> = {
  create:   { label: "Создание",    color: "bg-green-100 text-green-700",   icon: "Plus" },
  update:   { label: "Изменение",   color: "bg-blue-100 text-blue-700",     icon: "Pencil" },
  delete:   { label: "Удаление",    color: "bg-red-100 text-red-700",       icon: "Trash2" },
  auth:     { label: "Авторизация", color: "bg-purple-100 text-purple-700", icon: "LogIn" },
  export:   { label: "Экспорт",     color: "bg-yellow-100 text-yellow-700", icon: "Download" },
  settings: { label: "Настройки",   color: "bg-gray-100 text-gray-700",     icon: "Settings" },
};

const ROLE_COLOR: Record<UserRole, string> = {
  Диспетчер:    "bg-sky-100 text-sky-700",
  Менеджер:     "bg-indigo-100 text-indigo-700",
  Администратор:"bg-red-100 text-red-700",
  Инженер:      "bg-teal-100 text-teal-700",
  Бухгалтер:    "bg-orange-100 text-orange-700",
};

const AVATAR_COLOR: Record<string, string> = {
  АП: "bg-blue-500", ИС: "bg-green-500", МК: "bg-purple-500",
  НВ: "bg-orange-500", ДО: "bg-teal-500", ЕМ: "bg-rose-500",
};

const USERS = [
  { id: "u1", name: "Алексей Петров",    initials: "АП", role: "Администратор" as UserRole },
  { id: "u2", name: "Ирина Смирнова",    initials: "ИС", role: "Диспетчер"     as UserRole },
  { id: "u3", name: "Михаил Козлов",     initials: "МК", role: "Менеджер"      as UserRole },
  { id: "u4", name: "Наталья Васильева", initials: "НВ", role: "Бухгалтер"     as UserRole },
  { id: "u5", name: "Дмитрий Орлов",     initials: "ДО", role: "Инженер"       as UserRole },
  { id: "u6", name: "Елена Морозова",    initials: "ЕМ", role: "Диспетчер"     as UserRole },
];

// ─── Data ─────────────────────────────────────────────────────────────────────

function p2(n: number) { return String(n).padStart(2, "0"); }

function ts(hoursAgo: number, minOff = 0): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo, d.getMinutes() - minOff);
  return `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
}

const SEED_DATA: Array<{
  h: number; uid: string; at: ActionType; et: EntityType;
  eid: string; en: string; res: ResultStatus; crit: boolean;
  err?: string; diff?: FieldDiff[];
}> = [
  { h:0,  uid:"u2", at:"create",   et:"WorkOrder", eid:"WO-2026-000247", en:"Наряд WO-2026-000247",        res:"success", crit:false, diff:[{field:"status",before:null,after:"NEW"},{field:"client",before:null,after:"ООО «АльфаКлимат»"},{field:"priority",before:null,after:"URGENT"}] },
  { h:0,  uid:"u1", at:"settings", et:"Settings",  eid:"sys-001",        en:"Системные настройки",          res:"success", crit:true,  diff:[{field:"zip_default_markup",before:"25",after:"30"},{field:"sla_warning_percent",before:"20",after:"15"}] },
  { h:0,  uid:"u3", at:"export",   et:"Report",    eid:"RPT-2026-05",    en:"Отчёт по маржинальности",      res:"success", crit:false },
  { h:0,  uid:"u6", at:"update",   et:"WorkOrder", eid:"WO-2026-000246", en:"Наряд WO-2026-000246",         res:"success", crit:false, diff:[{field:"status",before:"ASSIGNED",after:"EN_ROUTE"}] },
  { h:1,  uid:"u5", at:"auth",     et:"Session",   eid:"sess-d9f3",      en:"Вход в систему",               res:"success", crit:false },
  { h:1,  uid:"u4", at:"create",   et:"Invoice",   eid:"INV-2026-0341",  en:"Счёт INV-2026-0341",           res:"success", crit:false, diff:[{field:"amount",before:null,after:"42 500,00 ₽"},{field:"client",before:null,after:"ИП Сидоров А.В."}] },
  { h:1,  uid:"u1", at:"delete",   et:"Employee",  eid:"EMP-088",        en:"Сотрудник Кузнецов П.И.",      res:"success", crit:true  },
  { h:2,  uid:"u2", at:"update",   et:"Client",    eid:"CLT-2210",       en:"ООО «ТехноСервис»",            res:"success", crit:false, diff:[{field:"phone",before:"+7(495)123-45-67",after:"+7(495)987-65-43"},{field:"address",before:"ул. Ленина, 1",after:"ул. Пушкина, 10"}] },
  { h:2,  uid:"u3", at:"create",   et:"Contract",  eid:"CTR-2026-0089",  en:"Договор CTR-2026-0089",        res:"success", crit:false, diff:[{field:"client",before:null,after:"ЗАО «КлиматПрофи»"},{field:"slaLevel",before:null,after:"CONTRACT"}] },
  { h:2,  uid:"u6", at:"auth",     et:"Session",   eid:"sess-b7a1",      en:"Неудачная попытка входа",      res:"error",   crit:true,  err:"Неверный пароль. Попытка 3 из 5." },
  { h:3,  uid:"u4", at:"update",   et:"Invoice",   eid:"INV-2026-0340",  en:"Счёт INV-2026-0340",           res:"success", crit:false, diff:[{field:"status",before:"DRAFT",after:"SENT"}] },
  { h:3,  uid:"u5", at:"update",   et:"WorkOrder", eid:"WO-2026-000244", en:"Наряд WO-2026-000244",         res:"success", crit:false, diff:[{field:"status",before:"ON_SITE",after:"COMPLETED"}] },
  { h:3,  uid:"u2", at:"create",   et:"Purchase",  eid:"PUR-2026-0055",  en:"Закупка PUR-2026-0055",        res:"success", crit:false, diff:[{field:"supplier",before:null,after:"ООО «ХолодСнаб»"},{field:"total",before:null,after:"18 700,00 ₽"}] },
  { h:4,  uid:"u1", at:"export",   et:"Report",    eid:"RPT-2026-04",    en:"Экспорт базы клиентов",        res:"success", crit:false },
  { h:4,  uid:"u3", at:"update",   et:"Contract",  eid:"CTR-2026-0082",  en:"Договор CTR-2026-0082",        res:"success", crit:false, diff:[{field:"validUntil",before:"30.06.2026",after:"31.12.2026"}] },
  { h:5,  uid:"u6", at:"create",   et:"WorkOrder", eid:"WO-2026-000243", en:"Наряд WO-2026-000243",         res:"success", crit:false, diff:[{field:"status",before:null,after:"NEW"},{field:"priority",before:null,after:"NORMAL"}] },
  { h:5,  uid:"u4", at:"update",   et:"Stock",     eid:"STK-R410A-001",  en:"Хладагент R-410A, баллон №14", res:"success", crit:false, diff:[{field:"remainingKg",before:"10.2",after:"7.8"}] },
  { h:6,  uid:"u2", at:"auth",     et:"Session",   eid:"sess-c3e9",      en:"Вход в систему",               res:"success", crit:false },
  { h:7,  uid:"u5", at:"update",   et:"WorkOrder", eid:"WO-2026-000240", en:"Наряд WO-2026-000240",         res:"error",   crit:false, err:"Нарушение FSM: переход COMPLETED → IN_PROGRESS запрещён." },
  { h:8,  uid:"u1", at:"delete",   et:"Contract",  eid:"CTR-2025-0011",  en:"Договор CTR-2025-0011 (истёкший)", res:"success", crit:false },
  { h:8,  uid:"u3", at:"create",   et:"Client",    eid:"CLT-2315",       en:"ГБУ «Школа №1472»",            res:"success", crit:false, diff:[{field:"type",before:null,after:"LEGAL_ENTITY"},{field:"name",before:null,after:"ГБУ «Школа №1472»"}] },
  { h:9,  uid:"u6", at:"export",   et:"Report",    eid:"RPT-2026-ENG",   en:"Отчёт по эффективности инженеров", res:"success", crit:false },
  { h:10, uid:"u4", at:"create",   et:"Invoice",   eid:"INV-2026-0339",  en:"Счёт INV-2026-0339",           res:"success", crit:false, diff:[{field:"amount",before:null,after:"91 200,00 ₽"},{field:"client",before:null,after:"ООО «МегаОфис»"}] },
  { h:11, uid:"u2", at:"update",   et:"WorkOrder", eid:"WO-2026-000238", en:"Наряд WO-2026-000238",         res:"success", crit:false, diff:[{field:"status",before:"AWAITING_PARTS",after:"READY_TO_RESUME"}] },
  { h:12, uid:"u1", at:"settings", et:"Settings",  eid:"sys-notif",      en:"Настройки уведомлений",        res:"success", crit:false, diff:[{field:"telegram_enabled",before:"false",after:"true"}] },
  { h:13, uid:"u5", at:"auth",     et:"Session",   eid:"sess-f1a4",      en:"Вход в систему",               res:"success", crit:false },
  { h:14, uid:"u3", at:"update",   et:"Purchase",  eid:"PUR-2026-0054",  en:"Закупка PUR-2026-0054",        res:"success", crit:false, diff:[{field:"status",before:"IN_PROGRESS",after:"FULLY_RECEIVED"}] },
  { h:15, uid:"u6", at:"create",   et:"WorkOrder", eid:"WO-2026-000236", en:"Наряд WO-2026-000236",         res:"success", crit:false },
  { h:16, uid:"u4", at:"export",   et:"Report",    eid:"RPT-2026-FIN",   en:"Финансовый отчёт за апрель",   res:"success", crit:false },
  { h:17, uid:"u2", at:"delete",   et:"WorkOrder", eid:"WO-2026-000231", en:"Наряд WO-2026-000231 (дубликат)", res:"success", crit:false },
];

const IPS = ["192.168.1", "10.0.0", "172.16.0"];
const UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14) Safari/17",
  "Mozilla/5.0 (Android 14; Mobile) Chrome/124",
];

const ALL_ENTRIES: AuditEntry[] = SEED_DATA.map((s, i) => {
  const u = USERS.find((x) => x.id === s.uid) ?? USERS[0];
  return {
    id: `AUD-${String(i + 1).padStart(5, "0")}`,
    timestamp: ts(s.h, i % 13),
    userId: u.id, userName: u.name, userInitials: u.initials, userRole: u.role,
    actionType: s.at, entityType: s.et, entityId: s.eid, entityName: s.en,
    ipAddress: `${IPS[i % 3]}.${((i * 7 + 12) % 254)}`,
    userAgent: UAS[i % 3],
    sessionId: `sess-${Math.random().toString(36).slice(2, 8)}`,
    result: s.res, errorMessage: s.err, diff: s.diff, isCritical: s.crit,
  };
});

// ─── Chart data ───────────────────────────────────────────────────────────────

const HOURLY = Array.from({ length: 24 }, (_, h) => ({
  hour: `${p2(h)}:00`,
  events: Math.round(5 + (h >= 9 && h <= 18 ? 20 : 0) + Math.abs(Math.sin(h)) * 15),
}));

const TOP_ACTIONS = [
  { name: "Изменение", count: 4823 }, { name: "Создание", count: 3641 },
  { name: "Авторизация", count: 2109 }, { name: "Экспорт", count: 1547 },
  { name: "Удаление", count: 727 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, iconColor, delta }: {
  label: string; value: string; icon: string; iconColor: string; delta?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {delta && <p className="text-xs text-green-600 mt-0.5">{delta}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ExpandedDetails({ entry }: { entry: AuditEntry }) {
  return (
    <tr>
      <td colSpan={8} className="bg-gray-50 px-6 pb-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Session ID</p>
            <code className="text-xs bg-white border rounded px-2 py-1 block">{entry.sessionId}</code>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">IP-адрес</p>
            <code className="text-xs bg-white border rounded px-2 py-1 block">{entry.ipAddress}</code>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">User Agent</p>
            <p className="text-xs text-gray-700 leading-snug">{entry.userAgent}</p>
          </div>
        </div>
        {entry.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-3">
            <Icon name="AlertTriangle" className="w-3.5 h-3.5 inline-block mr-1" />
            {entry.errorMessage}
          </div>
        )}
        {entry.diff && entry.diff.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Изменения полей</p>
            <table className="w-full text-xs border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-1.5 text-gray-600 font-medium">Поле</th>
                  <th className="text-left px-3 py-1.5 text-gray-600 font-medium">Было</th>
                  <th className="text-left px-3 py-1.5 text-gray-600 font-medium">Стало</th>
                </tr>
              </thead>
              <tbody>
                {entry.diff.map((d, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-1.5 font-mono text-gray-700">{d.field}</td>
                    <td className="px-3 py-1.5 text-red-600">{d.before == null ? <span className="italic text-gray-400">—</span> : String(d.before)}</td>
                    <td className="px-3 py-1.5 text-green-700">{d.after == null ? <span className="italic text-gray-400">—</span> : String(d.after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </td>
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AuditLogFull() {
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState<Period>("today");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const TAB_FILTER: Record<TabKey, (e: AuditEntry) => boolean> = {
    all: () => true,
    critical: (e) => e.isCritical,
    auth: (e) => e.actionType === "auth",
    data: (e) => ["create", "update", "delete"].includes(e.actionType),
  };

  const todayPrefix = `${p2(new Date().getDate())}.${p2(new Date().getMonth() + 1)}.${new Date().getFullYear()}`;

  const filtered = useMemo(() => {
    let rows = ALL_ENTRIES.filter(TAB_FILTER[activeTab]);
    if (filterPeriod === "today") rows = rows.filter((e) => e.timestamp.startsWith(todayPrefix));
    if (filterUser !== "all") rows = rows.filter((e) => e.userId === filterUser);
    if (filterAction !== "all") rows = rows.filter((e) => e.actionType === filterAction);
    if (filterResult !== "all") rows = rows.filter((e) => e.result === filterResult);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((e) =>
        e.userName.toLowerCase().includes(q) || e.entityName.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) || e.ipAddress.includes(q)
      );
    }
    return rows.slice(0, 30);
  }, [search, filterUser, filterAction, filterResult, filterPeriod, activeTab]);

  const criticalCount = ALL_ENTRIES.filter((e) => e.isCritical).length;
  const hasFilters = search || filterUser !== "all" || filterAction !== "all" || filterResult !== "all";

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Журнал аудита</h1>
          <p className="text-sm text-gray-500 mt-0.5">Полный лог действий пользователей в системе</p>
        </div>
        <Button
          onClick={() => toast.success("Лог аудита экспортирован", { description: `${ALL_ENTRIES.length} записей сохранены в audit_log_${new Date().toISOString().slice(0, 10)}.csv` })}
          className="gap-2"
        >
          <Icon name="Download" className="w-4 h-4" />
          Экспорт лога
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Всего событий"          value="12 847" icon="ListChecks"    iconColor="bg-blue-100 text-blue-700"   delta="+247 сегодня" />
        <KpiCard label="Сегодня"                value="247"    icon="CalendarCheck" iconColor="bg-green-100 text-green-700" delta="+12% к вчера" />
        <KpiCard label="Критических"            value={String(criticalCount)} icon="ShieldAlert" iconColor="bg-red-100 text-red-700" />
        <KpiCard label="Уникальных пользователей" value="18"  icon="Users"          iconColor="bg-purple-100 text-purple-700" delta="из 24 активных" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Активность по часам (сегодня)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={HOURLY} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="auditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} labelFormatter={(l) => `Час ${l}`} formatter={(v: unknown) => [v, "событий"]} />
                <Area type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={2} fill="url(#auditGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Топ-5 типов действий</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={TOP_ACTIONS} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: unknown) => [v, "событий"]} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-44">
              <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Поиск по имени, объекту, IP..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="h-9 text-sm w-48"><SelectValue placeholder="Пользователь" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                {USERS.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="h-9 text-sm w-44"><SelectValue placeholder="Тип действия" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все действия</SelectItem>
                {Object.entries(ACTION_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Результат" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="success">Успешно</SelectItem>
                <SelectItem value="error">Ошибка</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as Period)}>
              <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Период" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-gray-500"
                onClick={() => { setSearch(""); setFilterUser("all"); setFilterAction("all"); setFilterResult("all"); }}>
                <Icon name="X" className="w-3.5 h-3.5" /> Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table with tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
            <div className="flex items-center justify-between px-4 pt-4 border-b border-gray-100">
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">Все</TabsTrigger>
                <TabsTrigger value="critical" className="text-xs">
                  Критические
                  <span className="ml-1.5 bg-red-100 text-red-700 text-xs rounded-full px-1.5 py-0.5 font-medium">{criticalCount}</span>
                </TabsTrigger>
                <TabsTrigger value="auth" className="text-xs">Авторизация</TabsTrigger>
                <TabsTrigger value="data" className="text-xs">Данные</TabsTrigger>
              </TabsList>
              <span className="text-xs text-gray-400 pr-2">Показано {filtered.length} записей</span>
            </div>

            {(["all", "critical", "auth", "data"] as TabKey[]).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {["Время", "Пользователь", "Роль", "Действие", "Объект", "IP-адрес", "Результат", ""].map((h, i) => (
                          <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">
                          <Icon name="SearchX" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          Нет записей, соответствующих фильтрам
                        </td></tr>
                      ) : filtered.map((e) => {
                        const isExp = expandedId === e.id;
                        const ac = ACTION_CFG[e.actionType];
                        const av = AVATAR_COLOR[e.userInitials] ?? "bg-gray-400";
                        return (
                          <>
                            <tr key={e.id}
                              className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${isExp ? "bg-indigo-50/40" : ""} ${e.isCritical ? "bg-red-50/30" : ""}`}
                              onClick={() => setExpandedId(isExp ? null : e.id)}
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-gray-500 font-mono">{e.timestamp}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full ${av} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>{e.userInitials}</div>
                                  <span className="text-sm text-gray-800 whitespace-nowrap">{e.userName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={`text-xs font-normal ${ROLE_COLOR[e.userRole]}`} variant="outline">{e.userRole}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ac.color}`}>
                                  <Icon name={ac.icon} className="w-3 h-3" /> {ac.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 max-w-[200px]">
                                <p className="text-xs text-gray-400">{e.entityType}</p>
                                <p className="text-sm text-gray-700 truncate">{e.entityName}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-mono text-gray-500">{e.ipAddress}</span>
                              </td>
                              <td className="px-4 py-3">
                                {e.result === "success"
                                  ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium"><Icon name="CheckCircle2" className="w-3 h-3" />Успешно</span>
                                  : <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-medium"><Icon name="XCircle" className="w-3 h-3" />Ошибка</span>
                                }
                              </td>
                              <td className="px-2 py-3 text-gray-400">
                                <Icon name={isExp ? "ChevronUp" : "ChevronDown"} className="w-4 h-4" />
                              </td>
                            </tr>
                            {isExp && <ExpandedDetails key={`${e.id}-exp`} entry={e} />}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
