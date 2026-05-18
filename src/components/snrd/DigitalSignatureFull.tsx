import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = "Акт" | "Счёт" | "Договор" | "Доп.соглашение";
type SignChannel = "ЭЦП" | "SMS-код" | "Личная";
type TemplateStatus = "Активен" | "Черновик";
type SignMethod = "eds" | "sms" | "email";

interface PendingDoc {
  id: string;
  type: DocType;
  client: string;
  order: string;
  createdAt: string;
  expiresAt: string;
  responsible: string;
  amount: string;
}

interface SignedDoc {
  id: string;
  type: DocType;
  client: string;
  order: string;
  signedAt: string;
  signedBy: string;
  channel: SignChannel;
  amount: string;
}

interface DocTemplate {
  id: string;
  name: string;
  status: TemplateStatus;
  version: string;
  updatedAt: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const now = new Date();
const soon = new Date(now.getTime() + 20 * 60 * 60 * 1000); // 20h from now (< 24h)

const PENDING_DOCS: PendingDoc[] = [
  { id: "d1", type: "Акт",           client: "ООО «АрктикКлимат»",   order: "WO-2025-001847", createdAt: "18.05.2026 09:15", expiresAt: "19.05.2026 09:00", responsible: "Иванов А.П.",  amount: "18 500 ₽" },
  { id: "d2", type: "Счёт",          client: "ИП Петров В.С.",        order: "WO-2025-001831", createdAt: "17.05.2026 14:30", expiresAt: "20.05.2026 14:30", responsible: "Смирнова И.В.", amount: "7 200 ₽"  },
  { id: "d3", type: "Договор",       client: "ТЦ «Галерея Север»",   order: "—",              createdAt: "17.05.2026 11:00", expiresAt: "24.05.2026 11:00", responsible: "Козлов М.Р.",  amount: "145 000 ₽"},
  { id: "d4", type: "Акт",           client: "Завод «ПромХолод»",     order: "WO-2025-001812", createdAt: "16.05.2026 16:45", expiresAt: soon.toLocaleString("ru-RU", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }).replace(",",""), responsible: "Орлов Д.К.",  amount: "32 700 ₽" },
  { id: "d5", type: "Доп.соглашение",client: "Гостиница «Полярная»", order: "WO-2025-001799", createdAt: "16.05.2026 10:00", expiresAt: soon.toLocaleString("ru-RU", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }).replace(",",""), responsible: "Смирнова И.В.", amount: "8 900 ₽"  },
  { id: "d6", type: "Счёт",          client: "ООО «КлиматЭксперт»",  order: "WO-2025-001788", createdAt: "15.05.2026 13:20", expiresAt: "22.05.2026 13:20", responsible: "Иванов А.П.",  amount: "12 400 ₽" },
  { id: "d7", type: "Акт",           client: "Школа №47",             order: "WO-2025-001775", createdAt: "15.05.2026 08:30", expiresAt: "22.05.2026 08:30", responsible: "Васильева Н.О.", amount: "5 600 ₽" },
  { id: "d8", type: "Договор",       client: "БЦ «Меридиан»",        order: "—",              createdAt: "14.05.2026 17:00", expiresAt: "28.05.2026 17:00", responsible: "Козлов М.Р.",  amount: "220 000 ₽"},
];

const SIGNED_DOCS: SignedDoc[] = [
  { id: "s1",  type: "Акт",           client: "ООО «АрктикКлимат»",   order: "WO-2025-001820", signedAt: "17.05.2026 15:42", signedBy: "Иванов А.П.",    channel: "ЭЦП"     },
  { id: "s2",  type: "Счёт",          client: "ИП Ковалёв Р.Д.",       order: "WO-2025-001815", signedAt: "17.05.2026 12:10", signedBy: "Смирнова И.В.",  channel: "SMS-код" },
  { id: "s3",  type: "Договор",       client: "Завод «ПромХолод»",     order: "—",              signedAt: "16.05.2026 09:30", signedBy: "Козлов М.Р.",    channel: "Личная"  },
  { id: "s4",  type: "Акт",           client: "Гостиница «Полярная»",  order: "WO-2025-001801", signedAt: "16.05.2026 11:55", signedBy: "Орлов Д.К.",     channel: "ЭЦП"     },
  { id: "s5",  type: "Доп.соглашение",client: "ТЦ «Галерея Север»",   order: "WO-2025-001790", signedAt: "15.05.2026 16:00", signedBy: "Иванов А.П.",    channel: "SMS-код" },
  { id: "s6",  type: "Счёт",          client: "Школа №47",             order: "WO-2025-001783", signedAt: "15.05.2026 10:20", signedBy: "Васильева Н.О.", channel: "Личная"  },
  { id: "s7",  type: "Акт",           client: "БЦ «Меридиан»",        order: "WO-2025-001772", signedAt: "14.05.2026 14:35", signedBy: "Козлов М.Р.",    channel: "ЭЦП"     },
  { id: "s8",  type: "Договор",       client: "ООО «КлиматЭксперт»",  order: "—",              signedAt: "14.05.2026 09:00", signedBy: "Смирнова И.В.",  channel: "ЭЦП"     },
  { id: "s9",  type: "Акт",           client: "ИП Петров В.С.",        order: "WO-2025-001761", signedAt: "13.05.2026 17:10", signedBy: "Орлов Д.К.",     channel: "SMS-код" },
  { id: "s10", type: "Счёт",          client: "Завод «ПромХолод»",     order: "WO-2025-001755", signedAt: "13.05.2026 11:45", signedBy: "Иванов А.П.",    channel: "Личная"  },
  { id: "s11", type: "Акт",           client: "ООО «АрктикКлимат»",   order: "WO-2025-001748", signedAt: "12.05.2026 15:30", signedBy: "Смирнова И.В.",  channel: "ЭЦП"     },
  { id: "s12", type: "Доп.соглашение",client: "Гостиница «Полярная»",  order: "WO-2025-001740", signedAt: "12.05.2026 10:00", signedBy: "Козлов М.Р.",    channel: "SMS-код" },
  { id: "s13", type: "Счёт",          client: "БЦ «Меридиан»",        order: "WO-2025-001733", signedAt: "11.05.2026 16:20", signedBy: "Иванов А.П.",    channel: "ЭЦП"     },
  { id: "s14", type: "Акт",           client: "ТЦ «Галерея Север»",   order: "WO-2025-001725", signedAt: "11.05.2026 09:50", signedBy: "Орлов Д.К.",     channel: "Личная"  },
  { id: "s15", type: "Договор",       client: "Школа №47",             order: "—",              signedAt: "10.05.2026 14:00", signedBy: "Васильева Н.О.", channel: "ЭЦП"     },
  { id: "s16", type: "Акт",           client: "ИП Ковалёв Р.Д.",       order: "WO-2025-001718", signedAt: "10.05.2026 11:30", signedBy: "Смирнова И.В.",  channel: "SMS-код" },
  { id: "s17", type: "Счёт",          client: "ООО «КлиматЭксперт»",  order: "WO-2025-001710", signedAt: "09.05.2026 15:45", signedBy: "Иванов А.П.",    channel: "ЭЦП"     },
  { id: "s18", type: "Акт",           client: "Завод «ПромХолод»",     order: "WO-2025-001703", signedAt: "09.05.2026 10:15", signedBy: "Козлов М.Р.",    channel: "Личная"  },
  { id: "s19", type: "Доп.соглашение",client: "БЦ «Меридиан»",        order: "WO-2025-001696", signedAt: "08.05.2026 16:00", signedBy: "Орлов Д.К.",     channel: "ЭЦП"     },
  { id: "s20", type: "Счёт",          client: "Гостиница «Полярная»",  order: "WO-2025-001688", signedAt: "08.05.2026 09:30", signedBy: "Васильева Н.О.", channel: "SMS-код" },
];

const TEMPLATES: DocTemplate[] = [
  { id: "t1", name: "Акт выполненных работ", status: "Активен",  version: "3.2", updatedAt: "10.04.2026", description: "Стандартный акт по выполненным работам СЦ" },
  { id: "t2", name: "Счёт на оплату",        status: "Активен",  version: "2.1", updatedAt: "01.03.2026", description: "Счёт с НДС и реквизитами организации" },
  { id: "t3", name: "Договор на ТО",         status: "Активен",  version: "4.0", updatedAt: "15.02.2026", description: "Договор технического обслуживания климатической техники" },
  { id: "t4", name: "Гарантийный лист",      status: "Черновик", version: "1.0", updatedAt: "05.05.2026", description: "Гарантийный документ на установленное оборудование" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOC_TYPE_COLOR: Record<DocType, string> = {
  "Акт":           "bg-blue-100 text-blue-700",
  "Счёт":          "bg-green-100 text-green-700",
  "Договор":       "bg-purple-100 text-purple-700",
  "Доп.соглашение":"bg-orange-100 text-orange-700",
};

const CHANNEL_COLOR: Record<SignChannel, string> = {
  "ЭЦП":    "bg-indigo-100 text-indigo-700",
  "SMS-код":"bg-teal-100 text-teal-700",
  "Личная": "bg-gray-100 text-gray-700",
};

function isExpiringSoon(expiresAt: string): boolean {
  try {
    const parts = expiresAt.split(" ");
    if (parts.length < 2) return false;
    const [datePart, timePart] = parts;
    const [d, m, y] = datePart.split(".");
    const dt = new Date(`${y}-${m}-${d}T${timePart}`);
    const diff = dt.getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// ─── Signature Canvas ─────────────────────────────────────────────────────────

function SignatureCanvas({ onSigned }: { onSigned: (signed: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSig(true);
    onSigned(true);
  }, [onSigned]);

  const endDraw = useCallback(() => { drawing.current = false; }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onSigned(false);
  }, [onSigned]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-500 mb-1">Нарисуйте подпись в поле ниже:</div>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-32">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSig && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-sm">Подпись здесь</span>
          </div>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={clear} className="text-gray-500">
        <Icon name="RotateCcw" size={14} className="mr-1" /> Очистить
      </Button>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon name={icon} size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Document Preview ─────────────────────────────────────────────────────────

function DocPreview({ doc }: { doc: PendingDoc }) {
  return (
    <div className="bg-gray-50 border rounded-lg p-3 flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
        <Icon name="FileText" size={12} />
        <span>{doc.type}</span>
      </div>
      <div className="bg-gray-200 rounded h-14 flex items-center justify-center">
        <span className="text-gray-400 text-xs text-center px-2 leading-tight">
          {doc.client}<br />{doc.amount}
        </span>
      </div>
      <div className="text-gray-400 text-xs">{doc.order !== "—" ? doc.order : "Без наряда"}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DigitalSignatureFull() {
  // Sign dialog
  const [signDoc, setSignDoc] = useState<PendingDoc | null>(null);
  const [hasSig, setHasSig] = useState(false);

  // Reject dialog
  const [rejectDoc, setRejectDoc] = useState<PendingDoc | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Settings
  const [signMethod, setSignMethod] = useState<SignMethod>("eds");
  const [orgName, setOrgName] = useState("ООО «Сервис Климат»");
  const [orgInn, setOrgInn] = useState("7701234567");
  const [orgAddress, setOrgAddress] = useState("г. Москва, ул. Ленина, д. 1");
  const [orgPhone, setOrgPhone] = useState("+7 (495) 123-45-67");
  const [autoSend, setAutoSend] = useState(true);

  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>(PENDING_DOCS);

  const handleConfirmSign = () => {
    if (!signDoc) return;
    setPendingDocs(prev => prev.filter(d => d.id !== signDoc.id));
    toast.success(`Документ «${signDoc.type}» подписан`, {
      description: `${signDoc.client} · ${signDoc.order !== "—" ? signDoc.order : "без наряда"}`,
    });
    setSignDoc(null);
    setHasSig(false);
  };

  const handleSendToClient = (doc: PendingDoc) => {
    toast.success("Документ отправлен на Email клиента", {
      description: `${doc.type} · ${doc.client}`,
    });
  };

  const handleReject = () => {
    if (!rejectDoc) return;
    if (!rejectReason.trim()) {
      toast.error("Укажите причину отклонения");
      return;
    }
    setPendingDocs(prev => prev.filter(d => d.id !== rejectDoc.id));
    toast.warning(`Документ отклонён`, {
      description: `${rejectDoc.type} · ${rejectDoc.client} · Причина: ${rejectReason}`,
    });
    setRejectDoc(null);
    setRejectReason("");
  };

  const handleDownload = (doc: SignedDoc) => {
    toast.success("Документ скачивается", {
      description: `${doc.type} · ${doc.client} · ${doc.signedAt}`,
    });
  };

  const handleEditTemplate = (t: DocTemplate) => {
    toast.info(`Открыт редактор шаблона «${t.name}»`);
  };

  const handleDuplicateTemplate = (t: DocTemplate) => {
    toast.success(`Шаблон «${t.name}» скопирован`, {
      description: "Новый шаблон добавлен как черновик",
    });
  };

  const handleSaveSettings = () => {
    toast.success("Настройки сохранены");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Электронная подпись и документооборот</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление документами и электронными подписями</p>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Download" size={15} className="mr-1.5" /> Экспорт отчёта
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon="CheckCircle2" label="Подписано документов" value="847" sub="за всё время" color="bg-green-100 text-green-600" />
        <KPICard icon="Clock"        label="Ожидают подписи"      value={String(pendingDocs.length)} sub="требуют действия" color="bg-yellow-100 text-yellow-600" />
        <KPICard icon="Timer"        label="Среднее время подписания" value="2.3 ч" sub="за последние 30 дней" color="bg-blue-100 text-blue-600" />
        <KPICard icon="XCircle"      label="Отклонено"            value="3"   sub="в текущем месяце" color="bg-red-100 text-red-600" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Ожидают подписи
            {pendingDocs.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0">{pendingDocs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="signed">Подписанные</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* ── Pending ── */}
        <TabsContent value="pending" className="space-y-3">
          {pendingDocs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <Icon name="CheckCircle2" size={40} className="mx-auto mb-3 opacity-30" />
                <p>Все документы подписаны</p>
              </CardContent>
            </Card>
          )}
          {pendingDocs.map(doc => {
            const expiring = isExpiringSoon(doc.expiresAt);
            return (
              <Card key={doc.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <DocPreview doc={doc} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={DOC_TYPE_COLOR[doc.type]}>{doc.type}</Badge>
                        <span className="font-semibold text-gray-800">{doc.client}</span>
                        {doc.order !== "—" && (
                          <span className="text-sm text-gray-500">{doc.order}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-500">
                        <div>
                          <span className="text-xs text-gray-400 block">Создан</span>
                          {doc.createdAt}
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Истекает</span>
                          <span className={expiring ? "text-red-600 font-medium" : ""}>
                            {expiring && <Icon name="AlertTriangle" size={12} className="inline mr-1" />}
                            {doc.expiresAt}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Ответственный</span>
                          {doc.responsible}
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Сумма</span>
                          <span className="font-medium text-gray-700">{doc.amount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 justify-end flex-wrap sm:flex-nowrap">
                      <Button size="sm" onClick={() => { setSignDoc(doc); setHasSig(false); }}>
                        <Icon name="PenLine" size={14} className="mr-1" /> Подписать
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSendToClient(doc)}>
                        <Icon name="Send" size={14} className="mr-1" /> Отправить
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => { setRejectDoc(doc); setRejectReason(""); }}>
                        <Icon name="X" size={14} className="mr-1" /> Отклонить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ── Signed ── */}
        <TabsContent value="signed">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Подписанные документы</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тип</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Наряд</TableHead>
                    <TableHead>Подписан</TableHead>
                    <TableHead>Подписал</TableHead>
                    <TableHead>Канал</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SIGNED_DOCS.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Badge className={DOC_TYPE_COLOR[doc.type]}>{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[160px] truncate">{doc.client}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{doc.order}</TableCell>
                      <TableCell className="text-sm text-gray-600">{doc.signedAt}</TableCell>
                      <TableCell className="text-sm">{doc.signedBy}</TableCell>
                      <TableCell>
                        <Badge className={CHANNEL_COLOR[doc.channel]}>{doc.channel}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)}>
                          <Icon name="Download" size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Templates ── */}
        <TabsContent value="templates" className="space-y-3">
          {TEMPLATES.map(t => (
            <Card key={t.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg mt-0.5">
                      <Icon name="FileText" size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{t.name}</span>
                        <Badge className={t.status === "Активен" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                          {t.status}
                        </Badge>
                        <span className="text-xs text-gray-400">v{t.version}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Обновлён: {t.updatedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEditTemplate(t)}>
                      <Icon name="Pencil" size={14} className="mr-1" /> Редактировать
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(t)}>
                      <Icon name="Copy" size={14} className="mr-1" /> Дублировать
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Settings ── */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Настройки документооборота</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sign method */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Метод подписания</label>
                <Select value={signMethod} onValueChange={v => setSignMethod(v as SignMethod)}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eds">ЭЦП (электронная цифровая подпись)</SelectItem>
                    <SelectItem value="sms">SMS-код</SelectItem>
                    <SelectItem value="email">E-mail код</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Способ подтверждения при подписании документа</p>
              </div>

              {/* Org requisites */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Реквизиты организации</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Наименование организации</label>
                    <Input value={orgName} onChange={e => setOrgName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">ИНН</label>
                    <Input value={orgInn} onChange={e => setOrgInn(e.target.value)} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-gray-500">Юридический адрес</label>
                    <Input value={orgAddress} onChange={e => setOrgAddress(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Телефон</label>
                    <Input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Auto-send */}
              <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-700">Автоотправка после подписания</p>
                  <p className="text-xs text-gray-400 mt-0.5">Документ автоматически отправляется клиенту после подписи</p>
                </div>
                <Switch checked={autoSend} onCheckedChange={setAutoSend} />
              </div>

              <Button onClick={handleSaveSettings}>
                <Icon name="Save" size={15} className="mr-1.5" /> Сохранить настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sign Dialog */}
      <Dialog open={!!signDoc} onOpenChange={open => { if (!open) { setSignDoc(null); setHasSig(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Подписание документа</DialogTitle>
          </DialogHeader>
          {signDoc && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24">Тип:</span>
                  <Badge className={DOC_TYPE_COLOR[signDoc.type]}>{signDoc.type}</Badge>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24">Клиент:</span>
                  <span className="font-medium">{signDoc.client}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24">Наряд:</span>
                  <span>{signDoc.order}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24">Сумма:</span>
                  <span className="font-semibold text-gray-700">{signDoc.amount}</span>
                </div>
              </div>
              <SignatureCanvas onSigned={setHasSig} />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setSignDoc(null); setHasSig(false); }}>Отмена</Button>
            <Button onClick={handleConfirmSign} disabled={!hasSig}>
              <Icon name="CheckCircle2" size={15} className="mr-1.5" /> Подтвердить подпись
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDoc} onOpenChange={open => { if (!open) { setRejectDoc(null); setRejectReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Отклонение документа</DialogTitle>
          </DialogHeader>
          {rejectDoc && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                <Icon name="AlertTriangle" size={14} className="inline mr-1" />
                Вы отклоняете <strong>{rejectDoc.type}</strong> для клиента <strong>{rejectDoc.client}</strong>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Причина отклонения</label>
                <Input
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Укажите причину..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setRejectDoc(null); setRejectReason(""); }}>Отмена</Button>
            <Button variant="destructive" onClick={handleReject}>
              <Icon name="X" size={15} className="mr-1.5" /> Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
