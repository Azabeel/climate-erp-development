import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type IncidentPriority = "critical" | "high" | "medium";
type IncidentStatus   = "open" | "in_progress" | "resolved";
type WarrantyStatus   = "in_progress" | "resolved";

interface Engineer {
  id: string; name: string; initials: string;
  rating: number; nps: number; repeatRate: number; warrantyRate: number; score: number;
}

interface WarrantyCase {
  id: string; workOrder: string; client: string; equipment: string;
  reason: string; engineer: string; cost: number; status: WarrantyStatus;
}

interface IncidentEvent { date: string; text: string }

interface Incident {
  id: string; date: string; client: string; description: string;
  priority: IncidentPriority; status: IncidentStatus; responsible: string;
  timeline: IncidentEvent[];
}

interface ChecklistItem { id: string; text: string; required: boolean }

interface Checklist {
  id: string; name: string; workType: string; total: number; required: number;
  items: ChecklistItem[];
}

// ─── Static data ──────────────────────────────────────────────────────────────

const NPS_TREND = [
  { month: "Май'25",  nps: 68 }, { month: "Июн'25", nps: 71 },
  { month: "Июл'25",  nps: 73 }, { month: "Авг'25", nps: 70 },
  { month: "Сен'25",  nps: 72 }, { month: "Окт'25", nps: 75 },
  { month: "Ноя'25",  nps: 74 }, { month: "Дек'25", nps: 76 },
  { month: "Янв'26",  nps: 75 }, { month: "Фев'26", nps: 77 },
  { month: "Мар'26",  nps: 79 }, { month: "Апр'26", nps: 78 },
];

const ENGINEERS: Engineer[] = [
  { id: "e1", name: "Дмитрий Орлов",    initials: "ДО", rating: 4.9, nps: 85, repeatRate: 1.8, warrantyRate: 0.9, score: 96 },
  { id: "e2", name: "Сергей Ким",       initials: "СК", rating: 4.7, nps: 79, repeatRate: 2.9, warrantyRate: 2.1, score: 88 },
  { id: "e3", name: "Андрей Волков",    initials: "АВ", rating: 4.6, nps: 76, repeatRate: 3.5, warrantyRate: 2.8, score: 83 },
  { id: "e4", name: "Павел Зайцев",     initials: "ПЗ", rating: 4.5, nps: 74, repeatRate: 4.1, warrantyRate: 3.3, score: 79 },
  { id: "e5", name: "Николай Соколов",  initials: "НС", rating: 4.3, nps: 68, repeatRate: 5.2, warrantyRate: 4.0, score: 71 },
];

const RADAR_DATA = [
  { criterion: "Скорость",   ДО: 98, СК: 85, АВ: 78 },
  { criterion: "Качество",   ДО: 95, СК: 88, АВ: 82 },
  { criterion: "Чистота",    ДО: 92, СК: 90, АВ: 85 },
  { criterion: "Вежливость", ДО: 97, СК: 83, АВ: 80 },
  { criterion: "Цена",       ДО: 88, СК: 86, АВ: 88 },
];

const WARRANTY_CASES: WarrantyCase[] = [
  { id: "w1", workOrder: "WO-2026-000198", client: "ООО «ТехноПром»",       equipment: "Daikin FTXB35C",    reason: "Неверная заправка",       engineer: "Андрей Волков",   cost: 5800, status: "resolved"    },
  { id: "w2", workOrder: "WO-2026-000201", client: "Иванов И.И.",            equipment: "Mitsubishi MSZ-LN",  reason: "Некачественный монтаж",   engineer: "Николай Соколов", cost: 6200, status: "resolved"    },
  { id: "w3", workOrder: "WO-2026-000210", client: "ЗАО «АльфаКлимат»",     equipment: "LG S12EQ",           reason: "Ошибка диагностики",      engineer: "Павел Зайцев",    cost: 3100, status: "in_progress" },
  { id: "w4", workOrder: "WO-2026-000219", client: "Петрова А.С.",           equipment: "Samsung AR12TXHQB",  reason: "Неверная настройка",      engineer: "Андрей Волков",   cost: 2900, status: "in_progress" },
  { id: "w5", workOrder: "WO-2026-000231", client: "ООО «КлиматСервис»",    equipment: "Haier AS12TT4HRA",   reason: "Некачественный монтаж",   engineer: "Сергей Ким",      cost: 3000, status: "resolved"    },
];

const WARRANTY_REASONS = [
  { name: "Некачественный монтаж", value: 2, color: "#ef4444" },
  { name: "Ошибка диагностики",    value: 1, color: "#f97316" },
  { name: "Неверная заправка",     value: 1, color: "#eab308" },
  { name: "Неверная настройка",    value: 1, color: "#3b82f6" },
];

const INCIDENTS: Incident[] = [
  {
    id: "i1", date: "12.05.2026", client: "ООО «ТехноПром»",
    description: "Оборудование не запущено в срок из-за отсутствия запчасти — клиент остался без кондиционирования в жару",
    priority: "critical", status: "resolved", responsible: "Ирина Смирнова",
    timeline: [
      { date: "12.05 09:00", text: "Зафиксирован инцидент" },
      { date: "12.05 09:45", text: "Назначен ответственный — Ирина Смирнова" },
      { date: "12.05 11:30", text: "Экстренно заказана запчасть у альтернативного поставщика" },
      { date: "12.05 16:00", text: "Инженер выехал с запчастью" },
      { date: "12.05 18:30", text: "Оборудование запущено. Клиенту принесены извинения, скидка 15%" },
    ],
  },
  {
    id: "i2", date: "05.05.2026", client: "Петрова А.С.",
    description: "Жалоба на грубость инженера при выполнении работ",
    priority: "high", status: "resolved", responsible: "Алексей Петров",
    timeline: [
      { date: "05.05 14:00", text: "Получена жалоба через форму обратной связи" },
      { date: "05.05 15:00", text: "Руководитель связался с клиентом" },
      { date: "06.05 10:00", text: "Проведена беседа с инженером" },
      { date: "06.05 14:00", text: "Клиент получил компенсацию — бесплатное ТО" },
    ],
  },
  {
    id: "i3", date: "28.04.2026", client: "ЗАО «АльфаКлимат»",
    description: "Повторный выезд по той же неисправности в течение 7 дней",
    priority: "high", status: "in_progress", responsible: "Дмитрий Орлов",
    timeline: [
      { date: "28.04 11:00", text: "Создан повторный наряд — зафиксирован инцидент" },
      { date: "29.04 09:00", text: "Выявлена системная причина: ошибка в диагностике" },
      { date: "30.04 10:00", text: "Переназначен инженер, выполнена повторная диагностика" },
    ],
  },
  {
    id: "i4", date: "20.04.2026", client: "ООО «КлиматСервис»",
    description: "Опоздание инженера более чем на 2 часа без предупреждения клиента",
    priority: "medium", status: "resolved", responsible: "Ирина Смирнова",
    timeline: [
      { date: "20.04 15:00", text: "Клиент позвонил с жалобой на опоздание" },
      { date: "20.04 15:30", text: "Принесены извинения, скорректировано время" },
      { date: "20.04 17:00", text: "Работы выполнены. Напоминание инженеру выслано" },
    ],
  },
  {
    id: "i5", date: "15.04.2026", client: "Иванов И.И.",
    description: "Загрязнение имущества клиента в ходе монтажных работ",
    priority: "medium", status: "resolved", responsible: "Алексей Петров",
    timeline: [
      { date: "15.04 13:00", text: "Клиент сообщил о загрязнении" },
      { date: "15.04 14:00", text: "Направлена клининговая бригада за счёт компании" },
      { date: "15.04 17:30", text: "Ущерб устранён. Клиент доволен реакцией" },
    ],
  },
];

const CHECKLISTS: Checklist[] = [
  {
    id: "cl1", name: "Монтаж кондиционера", workType: "Монтаж", total: 12, required: 10,
    items: [
      { id: "c1",  text: "Проверить комплектность поставки",           required: true  },
      { id: "c2",  text: "Согласовать место установки с клиентом",     required: true  },
      { id: "c3",  text: "Подготовить защитный настил",                required: true  },
      { id: "c4",  text: "Пробурить отверстие точно по схеме",         required: true  },
      { id: "c5",  text: "Закрепить кронштейны по уровню",             required: true  },
      { id: "c6",  text: "Подключить трассу и проверить герметичность", required: true  },
      { id: "c7",  text: "Вакуумировать систему не менее 30 минут",    required: true  },
      { id: "c8",  text: "Проверить работу во всех режимах",           required: true  },
      { id: "c9",  text: "Убрать строительный мусор",                  required: true  },
      { id: "c10", text: "Сфотографировать результат (до/после)",      required: true  },
      { id: "c11", text: "Заполнить паспорт оборудования",             required: false },
      { id: "c12", text: "Предложить сервисный договор",               required: false },
    ],
  },
  {
    id: "cl2", name: "Техническое обслуживание", workType: "ТО", total: 10, required: 9,
    items: [
      { id: "c1", text: "Проверить давление хладагента",               required: true  },
      { id: "c2", text: "Очистить фильтры внутреннего блока",          required: true  },
      { id: "c3", text: "Промыть дренажный поддон",                    required: true  },
      { id: "c4", text: "Очистить вентилятор наружного блока",         required: true  },
      { id: "c5", text: "Проверить электрические соединения",          required: true  },
      { id: "c6", text: "Замерить потребляемый ток",                   required: true  },
      { id: "c7", text: "Проверить работу пульта управления",          required: true  },
      { id: "c8", text: "Нанести защитное покрытие на радиатор",       required: true  },
      { id: "c9", text: "Проверить все режимы работы",                 required: true  },
      { id: "c10", text: "Рекомендовать дату следующего ТО",           required: false },
    ],
  },
  {
    id: "cl3", name: "Диагностика неисправности", workType: "Ремонт", total: 8, required: 8,
    items: [
      { id: "c1", text: "Считать коды ошибок с блока управления",      required: true },
      { id: "c2", text: "Измерить давление в контуре хладагента",      required: true },
      { id: "c3", text: "Проверить компрессор мультиметром",           required: true },
      { id: "c4", text: "Проверить вентилятор наружного блока",        required: true },
      { id: "c5", text: "Проверить плату управления",                  required: true },
      { id: "c6", text: "Измерить сопротивление изоляции",             required: true },
      { id: "c7", text: "Зафиксировать все показания в наряде",        required: true },
      { id: "c8", text: "Согласовать смету ремонта с клиентом",        required: true },
    ],
  },
  {
    id: "cl4", name: "Заправка хладагентом", workType: "Ремонт", total: 7, required: 7,
    items: [
      { id: "c1", text: "Выявить и устранить утечку до заправки",      required: true },
      { id: "c2", text: "Вакуумировать систему не менее 30 минут",     required: true },
      { id: "c3", text: "Проверить тип хладагента на шильдике",        required: true },
      { id: "c4", text: "Заправить строго по норме из паспорта",       required: true },
      { id: "c5", text: "Зафиксировать серийный номер баллона",        required: true },
      { id: "c6", text: "Внести запись в журнал хладагентов",          required: true },
      { id: "c7", text: "Проверить работу системы после заправки",     required: true },
    ],
  },
  {
    id: "cl5", name: "Гарантийный ремонт", workType: "Гарантия", total: 9, required: 9,
    items: [
      { id: "c1", text: "Проверить гарантийный талон клиента",         required: true },
      { id: "c2", text: "Сфотографировать оборудование и неисправность", required: true },
      { id: "c3", text: "Установить причину отказа",                   required: true },
      { id: "c4", text: "Проверить — не является ли случай негарантийным", required: true },
      { id: "c5", text: "Заполнить акт гарантийного обращения",        required: true },
      { id: "c6", text: "Получить подпись клиента на акте",            required: true },
      { id: "c7", text: "Передать акт в отдел качества",               required: true },
      { id: "c8", text: "Устранить неисправность или забрать в СЦ",    required: true },
      { id: "c9", text: "Уведомить клиента о результате",              required: true },
    ],
  },
];

const STANDARDS_COMPLIANCE = [
  { name: "Дм. Орлов",   compliance: 97 },
  { name: "Серг. Ким",   compliance: 91 },
  { name: "Анд. Волков", compliance: 84 },
  { name: "Пав. Зайцев", compliance: 79 },
  { name: "Ник. Соколов",compliance: 72 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CFG: Record<IncidentPriority, { label: string; cls: string }> = {
  critical: { label: "Критично", cls: "bg-red-100 text-red-700 border-red-200"    },
  high:     { label: "Высокий",  cls: "bg-orange-100 text-orange-700 border-orange-200" },
  medium:   { label: "Средний",  cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

const INCIDENT_STATUS_CFG: Record<IncidentStatus, { label: string; cls: string }> = {
  open:        { label: "Открыт",    cls: "bg-red-100 text-red-700"    },
  in_progress: { label: "В работе",  cls: "bg-blue-100 text-blue-700"  },
  resolved:    { label: "Решён",     cls: "bg-green-100 text-green-700" },
};

const WARRANTY_STATUS_CFG: Record<WarrantyStatus, { label: string; cls: string }> = {
  in_progress: { label: "В работе", cls: "bg-blue-100 text-blue-700"  },
  resolved:    { label: "Решено",   cls: "bg-green-100 text-green-700" },
};

const RADAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name="Star"
          className={`w-3.5 h-3.5 ${value >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-800">{value.toFixed(1)}</span>
    </span>
  );
}

function EngineerAvatar({ initials }: { initials: string }) {
  const colors: Record<string, string> = {
    ДО: "bg-blue-500", СК: "bg-green-500", АВ: "bg-purple-500",
    ПЗ: "bg-orange-500", НС: "bg-rose-500",
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${colors[initials] ?? "bg-gray-400"}`}>
      {initials}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RatingsTab() {
  return (
    <div className="space-y-6">
      {/* NPS Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">NPS за последние 12 месяцев</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={NPS_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [v, "NPS"]} />
              <Line type="monotone" dataKey="nps" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Оценка по критериям — топ-3 инженера</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid />
              <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 12 }} />
              {["ДО", "СК", "АВ"].map((key, i) => (
                <Radar key={key} name={ENGINEERS[i].name} dataKey={key} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.15} />
              ))}
              <Legend formatter={(value) => ENGINEERS[["ДО","СК","АВ"].indexOf(value)]?.name ?? value} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engineers table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Рейтинг инженеров</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="text-left py-3 px-4 font-medium">Инженер</th>
                  <th className="text-center py-3 px-4 font-medium">Оценка</th>
                  <th className="text-center py-3 px-4 font-medium">NPS</th>
                  <th className="text-center py-3 px-4 font-medium">Повторных</th>
                  <th className="text-center py-3 px-4 font-medium">Гарантийных</th>
                  <th className="text-center py-3 px-4 font-medium">Итоговый балл</th>
                </tr>
              </thead>
              <tbody>
                {ENGINEERS.map((e, idx) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Icon name="Trophy" className="w-4 h-4 text-yellow-500" />}
                        <EngineerAvatar initials={e.initials} />
                        <span className="font-medium text-gray-800">{e.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center"><StarRating value={e.rating} /></td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-700">{e.nps}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={e.repeatRate > 4 ? "text-red-600 font-semibold" : "text-gray-700"}>{e.repeatRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={e.warrantyRate > 3 ? "text-red-600 font-semibold" : "text-gray-700"}>{e.warrantyRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={e.score} className="w-20 h-2" />
                        <span className="font-bold text-gray-800 w-8">{e.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WarrantyTab() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "ShieldAlert", label: "Гарантийных случаев", value: "5", sub: "за апрель–май 2026", color: "text-red-600", bg: "bg-red-50" },
          { icon: "Percent",     label: "% от всех нарядов",   value: "2.1%", sub: "норма < 3%",       color: "text-orange-600", bg: "bg-orange-50" },
          { icon: "CircleDollarSign", label: "Средняя стоимость", value: "₽ 4 200", sub: "за случай",   color: "text-blue-600", bg: "bg-blue-50" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${k.bg}`}>
                  <Icon name={k.icon as Parameters<typeof Icon>[0]["name"]} className={`w-5 h-5 ${k.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-0.5">{k.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Table */}
        <div className="col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Гарантийные обращения</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600">
                      <th className="text-left py-3 px-4 font-medium">Наряд</th>
                      <th className="text-left py-3 px-4 font-medium">Клиент</th>
                      <th className="text-left py-3 px-4 font-medium">Оборудование</th>
                      <th className="text-left py-3 px-4 font-medium">Причина</th>
                      <th className="text-left py-3 px-4 font-medium">Инженер</th>
                      <th className="text-right py-3 px-4 font-medium">Стоимость</th>
                      <th className="text-center py-3 px-4 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WARRANTY_CASES.map((w) => (
                      <tr key={w.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-blue-700">{w.workOrder}</td>
                        <td className="py-3 px-4 text-gray-800">{w.client}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs">{w.equipment}</td>
                        <td className="py-3 px-4 text-gray-700">{w.reason}</td>
                        <td className="py-3 px-4 text-gray-700">{w.engineer}</td>
                        <td className="py-3 px-4 text-right font-semibold">₽ {w.cost.toLocaleString("ru-RU")}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs border ${WARRANTY_STATUS_CFG[w.status].cls}`}>
                            {WARRANTY_STATUS_CFG[w.status].label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Причины обращений</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={WARRANTY_REASONS} dataKey="value" cx="50%" cy="50%" outerRadius={75} label={false}>
                  {WARRANTY_REASONS.map((r, i) => <Cell key={i} fill={r.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, _n: string, entry) => [v, entry.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {WARRANTY_REASONS.map((r) => (
                <div key={r.name} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                  <span>{r.name}</span>
                  <span className="ml-auto font-semibold text-gray-800">{r.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IncidentsTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const incident = INCIDENTS.find((i) => i.id === selected) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Всего инцидентов: <span className="font-semibold text-gray-800">{INCIDENTS.length}</span></p>
        <Button
          size="sm"
          onClick={() => toast.success("Форма регистрации инцидента открыта")}
          className="gap-2"
        >
          <Icon name="Plus" className="w-4 h-4" />
          Зарегистрировать инцидент
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-3">
          {INCIDENTS.map((inc) => (
            <Card
              key={inc.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected === inc.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelected(selected === inc.id ? null : inc.id)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs border ${PRIORITY_CFG[inc.priority].cls}`}>
                      {PRIORITY_CFG[inc.priority].label}
                    </Badge>
                    <Badge className={`text-xs ${INCIDENT_STATUS_CFG[inc.status].cls}`}>
                      {INCIDENT_STATUS_CFG[inc.status].label}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{inc.date}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{inc.client}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{inc.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Icon name="User" className="w-3 h-3" />
                  {inc.responsible}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail */}
        <div>
          {incident ? (
            <Card className="sticky top-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Детали инцидента</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="h-7 w-7 p-0">
                    <Icon name="X" className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Клиент</p>
                  <p className="font-semibold text-gray-800">{incident.client}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Описание</p>
                  <p className="text-sm text-gray-700">{incident.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={`text-xs border ${PRIORITY_CFG[incident.priority].cls}`}>
                    {PRIORITY_CFG[incident.priority].label}
                  </Badge>
                  <Badge className={`text-xs ${INCIDENT_STATUS_CFG[incident.status].cls}`}>
                    {INCIDENT_STATUS_CFG[incident.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-3">Хронология</p>
                  <div className="space-y-3">
                    {incident.timeline.map((ev, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${i === incident.timeline.length - 1 ? "bg-blue-500" : "bg-gray-300"}`} />
                          {i < incident.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-xs text-gray-400">{ev.date}</p>
                          <p className="text-sm text-gray-700">{ev.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <div>
                <Icon name="MousePointerClick" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Выберите инцидент слева, чтобы увидеть детали
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StandardsTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const checklist = CHECKLISTS.find((c) => c.id === selected) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Checklist list */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Шаблоны чеклистов ({CHECKLISTS.length})</p>
          {CHECKLISTS.map((cl) => (
            <Card
              key={cl.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected === cl.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelected(selected === cl.id ? null : cl.id)}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{cl.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Icon name="Tag" className="w-3 h-3" />{cl.workType}</span>
                      <span className="flex items-center gap-1"><Icon name="ListChecks" className="w-3 h-3" />{cl.total} пунктов</span>
                      <span className="flex items-center gap-1"><Icon name="ShieldCheck" className="w-3 h-3 text-red-500" />{cl.required} обязательных</span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" className={`w-4 h-4 text-gray-400 transition-transform ${selected === cl.id ? "rotate-90" : ""}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checklist detail */}
        <div>
          {checklist ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{checklist.name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="h-7 w-7 p-0">
                    <Icon name="X" className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checklist.items.map((item, i) => (
                    <div key={item.id} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 text-xs w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <span className="flex-1 text-gray-700">{item.text}</span>
                      {item.required && (
                        <Badge className="text-xs bg-red-50 text-red-600 border-red-200 border flex-shrink-0">
                          Обяз.
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg p-8 text-center min-h-[200px]">
              <div>
                <Icon name="ClipboardList" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Выберите шаблон слева для просмотра
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Соблюдение стандартов по инженерам (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={STANDARDS_COMPLIANCE} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, "Соблюдение"]} />
              <Bar dataKey="compliance" radius={[4, 4, 0, 0]}>
                {STANDARDS_COMPLIANCE.map((entry, i) => (
                  <Cell key={i} fill={entry.compliance >= 90 ? "#10b981" : entry.compliance >= 80 ? "#3b82f6" : "#f97316"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QualityControlFull() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Контроль качества</h1>
          <p className="text-sm text-gray-500 mt-0.5">Мониторинг удовлетворённости клиентов и стандартов обслуживания</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Отчёт формируется…")}>
          <Icon name="Download" className="w-4 h-4" />
          Экспорт отчёта
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: "Star",         label: "Средняя оценка",      value: "4.7★",  sub: "+0.1 к прошлому месяцу", trend: "up",    color: "text-yellow-500", bg: "bg-yellow-50" },
          { icon: "RefreshCw",    label: "Повторных обращений", value: "3.2%",  sub: "−0.4% к норме",          trend: "down",  color: "text-blue-600",   bg: "bg-blue-50"   },
          { icon: "TrendingUp",   label: "NPS",                  value: "78",    sub: "+3 пункта за месяц",     trend: "up",    color: "text-green-600",  bg: "bg-green-50"  },
          { icon: "ShieldAlert",  label: "Гарантийных случаев", value: "5",     sub: "2.1% от нарядов",        trend: "neutral", color: "text-red-600",  bg: "bg-red-50"    },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${k.bg}`}>
                  <Icon name={k.icon as Parameters<typeof Icon>[0]["name"]} className={`w-5 h-5 ${k.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{k.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    {k.trend === "up"   && <Icon name="ArrowUp"    className="w-3 h-3 text-green-500" />}
                    {k.trend === "down" && <Icon name="ArrowDown"   className="w-3 h-3 text-red-500"   />}
                    {k.sub}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ratings">
        <TabsList className="mb-4">
          <TabsTrigger value="ratings">Оценки</TabsTrigger>
          <TabsTrigger value="warranty">Гарантия</TabsTrigger>
          <TabsTrigger value="incidents">Инциденты</TabsTrigger>
          <TabsTrigger value="standards">Стандарты</TabsTrigger>
        </TabsList>

        <TabsContent value="ratings"><RatingsTab /></TabsContent>
        <TabsContent value="warranty"><WarrantyTab /></TabsContent>
        <TabsContent value="incidents"><IncidentsTab /></TabsContent>
        <TabsContent value="standards"><StandardsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
