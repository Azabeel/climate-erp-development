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

type Integration =
  | "1c"
  | "telegram"
  | "whatsapp"
  | "avito"
  | "email"
  | "iot"
  | "cdek"
  | "edo";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type LogStatus = "success" | "error" | "timeout";

type Period = "today" | "hour" | "week";

interface RequestHeader {
  key: string;
  value: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  integration: Integration;
  method: HttpMethod;
  url: string;
  statusCode: number;
  responseMs: number;
  responseSizeKb: number;
  requestHeaders: RequestHeader[];
  requestBody: string;
  responseBody: string;
  errorMessage?: string;
}

// ─── Static config ─────────────────────────────────────────────────────────────

const INTEGRATION_CONFIG: Record<
  Integration,
  { label: string; color: string; badgeClass: string; icon: string }
> = {
  "1c": {
    label: "1С:УНФ",
    color: "text-yellow-700",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "Database",
  },
  telegram: {
    label: "Telegram",
    color: "text-blue-600",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "Send",
  },
  whatsapp: {
    label: "WhatsApp",
    color: "text-green-700",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    icon: "MessageCircle",
  },
  avito: {
    label: "Авито",
    color: "text-orange-700",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "ShoppingBag",
  },
  email: {
    label: "Email",
    color: "text-gray-700",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "Mail",
  },
  iot: {
    label: "IoT",
    color: "text-purple-700",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "Cpu",
  },
  cdek: {
    label: "СДЭК",
    color: "text-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "Truck",
  },
  edo: {
    label: "ЭДО",
    color: "text-indigo-700",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: "FileText",
  },
};

const STATUS_CODE_CLASS: Record<number, string> = {
  200: "text-green-700 bg-green-50",
  201: "text-green-700 bg-green-50",
  400: "text-orange-700 bg-orange-50",
  401: "text-red-700 bg-red-50",
  404: "text-orange-700 bg-orange-50",
  408: "text-yellow-700 bg-yellow-50",
  422: "text-orange-700 bg-orange-50",
  429: "text-yellow-700 bg-yellow-50",
  500: "text-red-700 bg-red-50",
  502: "text-red-700 bg-red-50",
  504: "text-yellow-700 bg-yellow-50",
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_LOGS: LogEntry[] = [
  {
    id: "IL-001",
    timestamp: "2026-05-17 08:02:14",
    integration: "1c",
    method: "POST",
    url: "/odata/standard.odata/Document_ActWorks",
    statusCode: 200,
    responseMs: 312,
    responseSizeKb: 1.2,
    requestHeaders: [
      { key: "Authorization", value: "Basic ***" },
      { key: "Content-Type", value: "application/json;odata=verbose" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody:
      '{"act_id":"ACT-2026-0441","work_order":"WO-2026-000412","amount":8500.00}',
    responseBody: '{"status":"ok","1c_id":"10023","posted":true}',
  },
  {
    id: "IL-002",
    timestamp: "2026-05-17 08:05:33",
    integration: "telegram",
    method: "POST",
    url: "/bot{token}/sendMessage",
    statusCode: 200,
    responseMs: 187,
    responseSizeKb: 0.6,
    requestHeaders: [
      { key: "Content-Type", value: "application/json" },
      { key: "User-Agent", value: "ServisKlimat/4.0" },
    ],
    requestBody:
      '{"chat_id":7812341,"text":"Инженер Смирнов выехал. Ожидайте ~25 минут","parse_mode":"HTML"}',
    responseBody:
      '{"ok":true,"result":{"message_id":5921,"date":1747454733,"chat":{"id":7812341}}}',
  },
  {
    id: "IL-003",
    timestamp: "2026-05-17 08:07:10",
    integration: "1c",
    method: "GET",
    url: "/odata/standard.odata/Catalog_Contractors?$top=100",
    statusCode: 504,
    responseMs: 5021,
    responseSizeKb: 0,
    requestHeaders: [
      { key: "Authorization", value: "Basic ***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody: "",
    errorMessage: "Gateway Timeout — 1С сервер не ответил за 5000 мс",
  },
  {
    id: "IL-004",
    timestamp: "2026-05-17 08:09:47",
    integration: "cdek",
    method: "GET",
    url: "/v2/orders/f2c91cc5-b6ef-4c3d-9d52/statuses",
    statusCode: 200,
    responseMs: 415,
    responseSizeKb: 2.1,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "X-App-Name", value: "servis-klimat" },
    ],
    requestBody: "",
    responseBody:
      '{"entity":{"uuid":"f2c91cc5","statuses":[{"code":"ACCEPTED","name":"Принят","date_time":"2026-05-17T07:00:00+03:00"}]}}',
  },
  {
    id: "IL-005",
    timestamp: "2026-05-17 08:11:05",
    integration: "whatsapp",
    method: "POST",
    url: "/v17.0/{phone-id}/messages",
    statusCode: 200,
    responseMs: 263,
    responseSizeKb: 0.4,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody:
      '{"messaging_product":"whatsapp","to":"+79161234567","type":"text","text":{"body":"Ваша заявка WO-412 принята. Инженер Петров приедет 17.05 в 10:00"}}',
    responseBody:
      '{"messaging_product":"whatsapp","contacts":[{"input":"+79161234567","wa_id":"79161234567"}],"messages":[{"id":"wamid.abc123"}]}',
  },
  {
    id: "IL-006",
    timestamp: "2026-05-17 08:13:22",
    integration: "avito",
    method: "GET",
    url: "/messenger/v3/accounts/1234/chats?limit=50",
    statusCode: 429,
    responseMs: 89,
    responseSizeKb: 0.2,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody: "",
    responseBody: '{"error":"too_many_requests","retry_after":60}',
    errorMessage: "HTTP 429 Too Many Requests — превышен лимит запросов Avito",
  },
  {
    id: "IL-007",
    timestamp: "2026-05-17 08:15:00",
    integration: "email",
    method: "POST",
    url: "smtp://mail.yandex.ru:465 → client@ooo-stroy.ru",
    statusCode: 200,
    responseMs: 945,
    responseSizeKb: 8.4,
    requestHeaders: [
      { key: "From", value: "noreply@servisklimat.ru" },
      { key: "Content-Type", value: "text/html; charset=UTF-8" },
    ],
    requestBody:
      '{"to":"client@ooo-stroy.ru","subject":"Запчасть получена — WO-2026-000412","body":"<html>..."}',
    responseBody: '{"messageId":"<a1b2c3@mail.yandex.ru>","accepted":true}',
  },
  {
    id: "IL-008",
    timestamp: "2026-05-17 08:17:45",
    integration: "iot",
    method: "GET",
    url: "/api/v1/devices/HVAC-MSK-007/telemetry?last=60m",
    statusCode: 200,
    responseMs: 142,
    responseSizeKb: 5.7,
    requestHeaders: [
      { key: "X-API-Key", value: "***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody:
      '{"device_id":"HVAC-MSK-007","readings":[{"ts":1747455465,"temp_in":24.2,"temp_out":38.1,"pressure":8.4,"power_w":2300}]}',
  },
  {
    id: "IL-009",
    timestamp: "2026-05-17 08:19:11",
    integration: "1c",
    method: "PUT",
    url: "/odata/standard.odata/Document_WorkOrder(guid'abc-123')",
    statusCode: 200,
    responseMs: 389,
    responseSizeKb: 0.9,
    requestHeaders: [
      { key: "Authorization", value: "Basic ***" },
      { key: "Content-Type", value: "application/json;odata=verbose" },
    ],
    requestBody:
      '{"status":"COMPLETED","completed_at":"2026-05-17T08:00:00+03:00","engineer_id":"ENG-021"}',
    responseBody: '{"status":"ok","posted":true}',
  },
  {
    id: "IL-010",
    timestamp: "2026-05-17 08:21:33",
    integration: "edo",
    method: "POST",
    url: "/v1/outbox/documents",
    statusCode: 201,
    responseMs: 634,
    responseSizeKb: 12.3,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
      { key: "X-Diadoc-BoxId", value: "box-001" },
    ],
    requestBody:
      '{"type":"UniversalTransferDocument","recipient_inn":"7701234567","document_date":"2026-05-17"}',
    responseBody:
      '{"documentId":"doc-2026-0441","status":"Sent","timestamp":"2026-05-17T08:21:35+03:00"}',
  },
  {
    id: "IL-011",
    timestamp: "2026-05-17 08:23:55",
    integration: "telegram",
    method: "POST",
    url: "/bot{token}/sendMessage",
    statusCode: 500,
    responseMs: 3204,
    responseSizeKb: 0.1,
    requestHeaders: [
      { key: "Content-Type", value: "application/json" },
      { key: "User-Agent", value: "ServisKlimat/4.0" },
    ],
    requestBody:
      '{"chat_id":5534211,"text":"SLA YELLOW: наряд WO-2026-000415 — осталось 20% времени"}',
    responseBody: '{"ok":false,"error_code":500,"description":"Internal Server Error"}',
    errorMessage: "Telegram API вернул HTTP 500 — Internal Server Error",
  },
  {
    id: "IL-012",
    timestamp: "2026-05-17 08:26:02",
    integration: "cdek",
    method: "POST",
    url: "/v2/orders",
    statusCode: 200,
    responseMs: 651,
    responseSizeKb: 3.2,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody:
      '{"tariff_code":480,"from_location":{"address":"Москва, Шоссейная 1"},"to_location":{"address":"Москва, Ленина 23"},"packages":[{"weight":500,"length":30}]}',
    responseBody:
      '{"entity":{"uuid":"b4c5d6e7-f8a9"},"requests":[{"state":"ACCEPTED","type":"CREATE"}]}',
  },
  {
    id: "IL-013",
    timestamp: "2026-05-17 08:28:14",
    integration: "whatsapp",
    method: "POST",
    url: "/v17.0/{phone-id}/messages",
    statusCode: 400,
    responseMs: 178,
    responseSizeKb: 0.3,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody:
      '{"messaging_product":"whatsapp","to":"+7999000","type":"text","text":{"body":"Тест"}}',
    responseBody:
      '{"error":{"message":"Invalid phone number","type":"OAuthException","code":100}}',
    errorMessage: "HTTP 400 — Invalid phone number (+7999000)",
  },
  {
    id: "IL-014",
    timestamp: "2026-05-17 08:30:41",
    integration: "iot",
    method: "POST",
    url: "/api/v1/devices/HVAC-MSK-012/commands",
    statusCode: 200,
    responseMs: 220,
    responseSizeKb: 0.2,
    requestHeaders: [
      { key: "X-API-Key", value: "***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody: '{"command":"set_mode","params":{"mode":"cooling","temp":22}}',
    responseBody: '{"result":"queued","command_id":"cmd-8812","device_id":"HVAC-MSK-012"}',
  },
  {
    id: "IL-015",
    timestamp: "2026-05-17 08:33:07",
    integration: "1c",
    method: "GET",
    url: "/odata/standard.odata/Catalog_Nomenclature?$filter=IsFolder eq false&$top=500",
    statusCode: 200,
    responseMs: 876,
    responseSizeKb: 89.4,
    requestHeaders: [
      { key: "Authorization", value: "Basic ***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody: '{"odata.metadata":"...","value":[{"Ref_Key":"...","Description":"Фреон R-410A"}]}',
  },
  {
    id: "IL-016",
    timestamp: "2026-05-17 08:35:50",
    integration: "avito",
    method: "POST",
    url: "/messenger/v3/accounts/1234/chats/{chatId}/messages",
    statusCode: 200,
    responseMs: 302,
    responseSizeKb: 0.5,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody: '{"message":{"text":"Здравствуйте! Ваша заявка принята в работу, инженер свяжется с вами в течение часа."}}',
    responseBody: '{"ok":true,"value":{"id":"msg-avito-5521"}}',
  },
  {
    id: "IL-017",
    timestamp: "2026-05-17 08:38:15",
    integration: "email",
    method: "POST",
    url: "smtp://mail.yandex.ru:465 → manager@ooo-tekhprom.ru",
    statusCode: 422,
    responseMs: 1240,
    responseSizeKb: 0,
    requestHeaders: [
      { key: "From", value: "noreply@servisklimat.ru" },
      { key: "Content-Type", value: "text/html; charset=UTF-8" },
    ],
    requestBody: '{"to":"manager@ooo-tekhprom.ru","subject":"КП №КП-2026-0112"}',
    responseBody: "",
    errorMessage: "SMTP 550 5.1.1 — адрес получателя не существует",
  },
  {
    id: "IL-018",
    timestamp: "2026-05-17 08:40:22",
    integration: "edo",
    method: "GET",
    url: "/v1/inbox/documents?status=WaitingForSignature&limit=20",
    statusCode: 200,
    responseMs: 489,
    responseSizeKb: 15.6,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "X-Diadoc-BoxId", value: "box-001" },
    ],
    requestBody: "",
    responseBody:
      '{"totalCount":3,"documents":[{"documentId":"doc-in-001","type":"Invoice","status":"WaitingForSignature"}]}',
  },
  {
    id: "IL-019",
    timestamp: "2026-05-17 08:42:05",
    integration: "telegram",
    method: "POST",
    url: "/bot{token}/sendPhoto",
    statusCode: 200,
    responseMs: 534,
    responseSizeKb: 1.1,
    requestHeaders: [
      { key: "Content-Type", value: "multipart/form-data" },
      { key: "User-Agent", value: "ServisKlimat/4.0" },
    ],
    requestBody:
      '{"chat_id":9012345,"caption":"Акт выполненных работ WO-2026-000412","photo":"AgACAgIAA..."}',
    responseBody: '{"ok":true,"result":{"message_id":6102,"photo":[{"file_id":"AgAC..."}]}}',
  },
  {
    id: "IL-020",
    timestamp: "2026-05-17 08:44:33",
    integration: "cdek",
    method: "GET",
    url: "/v2/calculator/tariff",
    statusCode: 200,
    responseMs: 198,
    responseSizeKb: 1.8,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody:
      '{"tariff_code":480,"from_location":{"code":44},"to_location":{"code":44},"packages":[{"weight":1000}]}',
    responseBody: '{"delivery_sum":350.00,"period_min":1,"period_max":2,"currency_code":"RUB"}',
  },
  {
    id: "IL-021",
    timestamp: "2026-05-17 08:47:01",
    integration: "1c",
    method: "POST",
    url: "/odata/standard.odata/Document_InvoiceOut",
    statusCode: 200,
    responseMs: 421,
    responseSizeKb: 2.3,
    requestHeaders: [
      { key: "Authorization", value: "Basic ***" },
      { key: "Content-Type", value: "application/json;odata=verbose" },
    ],
    requestBody:
      '{"client_id":"cl-001","work_order":"WO-2026-000413","amount":12400.00,"vat":2066.67}',
    responseBody: '{"status":"ok","invoice_id":"INV-2026-0221","posted":true}',
  },
  {
    id: "IL-022",
    timestamp: "2026-05-17 08:49:18",
    integration: "whatsapp",
    method: "GET",
    url: "/v17.0/{phone-id}/messages?limit=20",
    statusCode: 200,
    responseMs: 244,
    responseSizeKb: 4.5,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody:
      '{"data":[{"id":"wamid.xyz","from":"79031234567","type":"text","text":{"body":"Когда приедет мастер?"}}],"paging":{"cursors":{}}}',
  },
  {
    id: "IL-023",
    timestamp: "2026-05-17 08:51:44",
    integration: "iot",
    method: "GET",
    url: "/api/v1/alerts?severity=critical&resolved=false",
    statusCode: 200,
    responseMs: 95,
    responseSizeKb: 0.8,
    requestHeaders: [
      { key: "X-API-Key", value: "***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody:
      '{"alerts":[{"id":"alt-551","device_id":"HVAC-MSK-009","type":"HIGH_PRESSURE","value":12.1,"threshold":11.0,"ts":1747457504}]}',
  },
  {
    id: "IL-024",
    timestamp: "2026-05-17 08:53:29",
    integration: "avito",
    method: "GET",
    url: "/core/v1/accounts/{id}/items?status=active",
    statusCode: 500,
    responseMs: 2100,
    responseSizeKb: 0.1,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody: '{"error":"internal_error","code":500}',
    errorMessage: "Avito API — Internal Server Error (500)",
  },
  {
    id: "IL-025",
    timestamp: "2026-05-17 08:55:50",
    integration: "email",
    method: "GET",
    url: "imap://imap.yandex.ru:993 — FETCH UNSEEN",
    statusCode: 200,
    responseMs: 730,
    responseSizeKb: 22.1,
    requestHeaders: [
      { key: "Account", value: "inbox@servisklimat.ru" },
      { key: "Folder", value: "INBOX" },
    ],
    requestBody: "",
    responseBody:
      '{"fetched":3,"messages":[{"uid":8821,"from":"client@firma.ru","subject":"Срочный ремонт кондиционера"},{"uid":8822,"from":"parts@supplier.ru","subject":"Счёт на оплату №С-2244"}]}',
  },
  {
    id: "IL-026",
    timestamp: "2026-05-17 08:58:12",
    integration: "1c",
    method: "GET",
    url: "/odata/standard.odata/Document_PaymentOrder?$filter=Posted eq true&$top=20",
    statusCode: 408,
    responseMs: 10000,
    responseSizeKb: 0,
    requestHeaders: [
      { key: "Authorization", value: "Basic ***" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: "",
    responseBody: "",
    errorMessage: "Request Timeout — 1С не ответила за 10 000 мс",
  },
  {
    id: "IL-027",
    timestamp: "2026-05-17 09:00:05",
    integration: "telegram",
    method: "POST",
    url: "/bot{token}/sendMessage",
    statusCode: 200,
    responseMs: 201,
    responseSizeKb: 0.6,
    requestHeaders: [
      { key: "Content-Type", value: "application/json" },
      { key: "User-Agent", value: "ServisKlimat/4.0" },
    ],
    requestBody:
      '{"chat_id":3312891,"text":"🔴 SLA RED: WO-2026-000416 — время реакции превышено! Клиент: ООО Альфа-Строй","parse_mode":"HTML"}',
    responseBody: '{"ok":true,"result":{"message_id":6134}}',
  },
  {
    id: "IL-028",
    timestamp: "2026-05-17 09:02:38",
    integration: "cdek",
    method: "DELETE",
    url: "/v2/orders?cdek_number=1032741882",
    statusCode: 200,
    responseMs: 312,
    responseSizeKb: 0.3,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody: "",
    responseBody: '{"entity":{"uuid":"b4c5d6e7"},"requests":[{"state":"ACCEPTED","type":"DELETE"}]}',
  },
  {
    id: "IL-029",
    timestamp: "2026-05-17 09:05:14",
    integration: "edo",
    method: "POST",
    url: "/v1/outbox/documents/{id}/send",
    statusCode: 200,
    responseMs: 782,
    responseSizeKb: 0.4,
    requestHeaders: [
      { key: "Authorization", value: "Bearer ***" },
      { key: "X-Diadoc-BoxId", value: "box-001" },
    ],
    requestBody: '{"documentId":"doc-2026-0441"}',
    responseBody: '{"status":"Sent","timestamp":"2026-05-17T09:05:16+03:00","trackingId":"trk-9921"}',
  },
  {
    id: "IL-030",
    timestamp: "2026-05-17 09:07:45",
    integration: "iot",
    method: "PUT",
    url: "/api/v1/devices/HVAC-MSK-007/config",
    statusCode: 200,
    responseMs: 165,
    responseSizeKb: 0.3,
    requestHeaders: [
      { key: "X-API-Key", value: "***" },
      { key: "Content-Type", value: "application/json" },
    ],
    requestBody:
      '{"polling_interval":300,"alert_thresholds":{"high_pressure":11.5,"low_pressure":2.0}}',
    responseBody: '{"result":"updated","device_id":"HVAC-MSK-007","applied_at":"2026-05-17T09:07:47+03:00"}',
  },
];

// ─── Hourly chart data (24h) ─────────────────────────────────────────────────

const HOURLY_DATA = Array.from({ length: 24 }, (_, h) => {
  const success = h < 7 ? Math.floor(Math.random() * 20 + 5) : Math.floor(Math.random() * 80 + 30);
  const errors = Math.floor(Math.random() * 6);
  return { hour: `${String(h).padStart(2, "0")}:00`, success, errors };
});

// ─── Error-by-integration chart data ─────────────────────────────────────────

const ERROR_BY_INTEGRATION: { integration: string; errors: number }[] = [
  { integration: "1С:УНФ", errors: 12 },
  { integration: "Telegram", errors: 7 },
  { integration: "WhatsApp", errors: 5 },
  { integration: "Авито", errors: 9 },
  { integration: "Email", errors: 6 },
  { integration: "IoT", errors: 3 },
  { integration: "СДЭК", errors: 4 },
  { integration: "ЭДО", errors: 3 },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function getLogStatus(entry: LogEntry): LogStatus {
  if (entry.statusCode >= 500 || entry.statusCode === 408 || entry.statusCode === 504) return "timeout";
  if (entry.statusCode >= 400) return "error";
  return "success";
}

function getRowBgClass(entry: LogEntry): string {
  const status = getLogStatus(entry);
  if (status === "timeout") return "bg-yellow-50 hover:bg-yellow-100";
  if (status === "error") return "bg-red-50 hover:bg-red-100";
  return "hover:bg-gray-50";
}

function getStatusCodeClass(code: number): string {
  return STATUS_CODE_CLASS[code] ?? "text-gray-700 bg-gray-50";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetricCard = ({
  label,
  value,
  sub,
  iconName,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  iconName: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon name={iconName as any} size={18} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const IntegrationBadge = ({ integration }: { integration: Integration }) => {
  const cfg = INTEGRATION_CONFIG[integration];
  return (
    <Badge
      className={`text-xs font-medium border ${cfg.badgeClass} flex items-center gap-1`}
    >
      <Icon name={cfg.icon as any} size={11} />
      {cfg.label}
    </Badge>
  );
};

const ExpandedDetails = ({ entry }: { entry: LogEntry }) => {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const bodyPreview = entry.requestBody.slice(0, 200);
  const bodyFull = entry.requestBody;
  const showToggle = bodyFull.length > 200;

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 py-4 grid grid-cols-3 gap-4 text-xs">
      {/* Request Headers */}
      <div>
        <p className="font-semibold text-gray-600 mb-2 flex items-center gap-1">
          <Icon name="List" size={13} />
          Request Headers
        </p>
        <div className="space-y-1">
          {entry.requestHeaders.map((h) => (
            <div key={h.key} className="flex gap-2">
              <span className="text-gray-500 font-medium shrink-0">{h.key}:</span>
              <span className="text-gray-700 break-all">{h.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Request Body */}
      <div>
        <p className="font-semibold text-gray-600 mb-2 flex items-center gap-1">
          <Icon name="ArrowUpCircle" size={13} />
          Request Body
        </p>
        {entry.requestBody ? (
          <div>
            <pre className="bg-white border border-gray-200 rounded p-2 text-xs text-gray-700 whitespace-pre-wrap break-all font-mono">
              {bodyExpanded ? bodyFull : bodyPreview}
              {!bodyExpanded && showToggle && "..."}
            </pre>
            {showToggle && (
              <button
                onClick={() => setBodyExpanded((v) => !v)}
                className="text-blue-600 hover:underline mt-1"
              >
                {bodyExpanded ? "Свернуть" : "Развернуть"}
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-400 italic">Пусто</span>
        )}
      </div>

      {/* Response Body */}
      <div>
        <p className="font-semibold text-gray-600 mb-2 flex items-center gap-1">
          <Icon name="ArrowDownCircle" size={13} />
          Response Body
        </p>
        {entry.responseBody ? (
          <pre className="bg-white border border-gray-200 rounded p-2 text-xs text-gray-700 whitespace-pre-wrap break-all font-mono max-h-32 overflow-y-auto">
            {entry.responseBody}
          </pre>
        ) : entry.errorMessage ? (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 break-words">
            {entry.errorMessage}
          </div>
        ) : (
          <span className="text-gray-400 italic">Пусто</span>
        )}

        <Button
          size="sm"
          variant="outline"
          className="mt-2 h-7 text-xs"
          onClick={() =>
            toast.success(`Запрос ${entry.id} поставлен в очередь на повтор`)
          }
        >
          <Icon name="RotateCcw" size={12} className="mr-1" />
          Повторить запрос
        </Button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const IntegrationLogsFull = () => {
  const [search, setSearch] = useState("");
  const [filterIntegration, setFilterIntegration] = useState<Integration | "all">("all");
  const [filterStatus, setFilterStatus] = useState<LogStatus | "all">("all");
  const [filterMethod, setFilterMethod] = useState<HttpMethod | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<Period>("today");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter((entry) => {
      if (
        search &&
        !entry.url.toLowerCase().includes(search.toLowerCase()) &&
        !entry.method.toLowerCase().includes(search.toLowerCase()) &&
        !(entry.errorMessage ?? "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterIntegration !== "all" && entry.integration !== filterIntegration)
        return false;
      if (filterStatus !== "all" && getLogStatus(entry) !== filterStatus)
        return false;
      if (filterMethod !== "all" && entry.method !== filterMethod) return false;
      return true;
    });
  }, [search, filterIntegration, filterStatus, filterMethod]);

  const handleRowClick = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Журнал интеграций</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Мониторинг всех внешних API-запросов в реальном времени
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Логи очищены")}
          >
            <Icon name="Trash2" size={14} className="mr-1.5" />
            Очистить логи
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("CSV-файл сформирован и загружается")}
          >
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт CSV
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => toast.success("49 ошибочных запросов поставлены в очередь на повтор")}
          >
            <Icon name="RotateCcw" size={14} className="mr-1.5" />
            Повторить все ошибки
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Запросов за сегодня"
          value="1 247"
          iconName="Activity"
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          label="Успешных"
          value="1 198"
          sub="96.1%"
          iconName="CheckCircle"
          color="bg-green-100 text-green-600"
        />
        <MetricCard
          label="Ошибок"
          value="49"
          sub="3.9%"
          iconName="XCircle"
          color="bg-red-100 text-red-600"
        />
        <MetricCard
          label="Среднее время ответа"
          value="234 мс"
          iconName="Clock"
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Line chart — requests by hour */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={15} />
            Запросы по часам (24 ч)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HOURLY_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10 }}
                interval={3}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Успешных"
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Ошибок"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block w-4 h-0.5 bg-green-500" />
              Успешные
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block w-4 h-0.5 bg-red-500" />
              Ошибки
            </span>
          </div>
        </div>

        {/* Bar chart — errors by integration */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Icon name="BarChart2" size={15} />
            Ошибки по интеграциям
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={ERROR_BY_INTEGRATION}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="integration"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="errors" fill="#ef4444" name="Ошибок" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Icon
              name="Search"
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Поиск по URL, методу, ошибке..."
              className="pl-8 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="h-8 rounded-md border border-gray-200 px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={filterIntegration}
            onChange={(e) => setFilterIntegration(e.target.value as Integration | "all")}
          >
            <option value="all">Все интеграции</option>
            <option value="1c">1С:УНФ</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="avito">Авито</option>
            <option value="email">Email</option>
            <option value="iot">IoT</option>
            <option value="cdek">СДЭК</option>
            <option value="edo">ЭДО</option>
          </select>

          <select
            className="h-8 rounded-md border border-gray-200 px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LogStatus | "all")}
          >
            <option value="all">Все статусы</option>
            <option value="success">Успешно</option>
            <option value="error">Ошибка</option>
            <option value="timeout">Таймаут</option>
          </select>

          <select
            className="h-8 rounded-md border border-gray-200 px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as HttpMethod | "all")}
          >
            <option value="all">Все методы</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["today", "hour", "week"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterPeriod === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p === "today" ? "Сегодня" : p === "hour" ? "Час" : "Неделя"}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 ml-auto">
            Показано {filtered.length} из {MOCK_LOGS.length}
          </span>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[160px_140px_72px_1fr_80px_90px_80px] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Время</span>
          <span>Интеграция</span>
          <span>Метод</span>
          <span>URL / Endpoint</span>
          <span className="text-center">Статус</span>
          <span className="text-right">Время, мс</span>
          <span className="text-right">Размер, Кб</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100">
          {filtered.map((entry) => (
            <div key={entry.id}>
              {/* Main row */}
              <div
                className={`grid grid-cols-[160px_140px_72px_1fr_80px_90px_80px] gap-2 px-4 py-2.5 cursor-pointer transition-colors ${getRowBgClass(entry)}`}
                onClick={() => handleRowClick(entry.id)}
              >
                <span className="text-xs text-gray-500 font-mono self-center">
                  {entry.timestamp.split(" ")[1]}
                </span>

                <div className="self-center">
                  <IntegrationBadge integration={entry.integration} />
                </div>

                <span
                  className={`self-center text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                    entry.method === "GET"
                      ? "text-blue-700 bg-blue-50"
                      : entry.method === "POST"
                      ? "text-green-700 bg-green-50"
                      : entry.method === "PUT"
                      ? "text-orange-700 bg-orange-50"
                      : "text-red-700 bg-red-50"
                  }`}
                >
                  {entry.method}
                </span>

                <div className="self-center min-w-0">
                  <p className="text-xs text-gray-700 font-mono truncate" title={entry.url}>
                    {entry.url}
                  </p>
                  {entry.errorMessage && (
                    <p className="text-xs text-red-600 truncate mt-0.5" title={entry.errorMessage}>
                      {entry.errorMessage}
                    </p>
                  )}
                </div>

                <div className="self-center flex justify-center">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded font-mono ${getStatusCodeClass(entry.statusCode)}`}
                  >
                    {entry.statusCode}
                  </span>
                </div>

                <div className="self-center text-right">
                  <span
                    className={`text-xs font-medium ${
                      entry.responseMs > 3000
                        ? "text-red-600"
                        : entry.responseMs > 1000
                        ? "text-yellow-600"
                        : "text-gray-700"
                    }`}
                  >
                    {entry.responseMs > 0 ? entry.responseMs.toLocaleString() : "—"}
                  </span>
                </div>

                <div className="self-center text-right">
                  <span className="text-xs text-gray-500">
                    {entry.responseSizeKb > 0 ? entry.responseSizeKb.toFixed(1) : "—"}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === entry.id && <ExpandedDetails entry={entry} />}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
              <Icon name="SearchX" size={32} />
              <p className="text-sm">Записи не найдены</p>
              <p className="text-xs">Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationLogsFull;
