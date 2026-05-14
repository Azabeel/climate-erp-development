import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface Client360Props {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

const equipment = [
  { id: 'EQ-001', brand: 'Daikin', model: 'FTXB35C', serial: 'DN2104581', installed: '15.03.2022', lastService: '10.01.2026', nextService: '10.07.2026', status: 'Исправен' },
  { id: 'EQ-002', brand: 'Mitsubishi', model: 'MSZ-AP25VG', serial: 'MT9823764', installed: '22.06.2021', lastService: '05.02.2026', nextService: '05.08.2026', status: 'Исправен' },
  { id: 'EQ-003', brand: 'Samsung', model: 'AR09TXHQASINUA', serial: 'SM4561209', installed: '08.11.2023', lastService: '20.12.2025', nextService: '20.06.2026', status: 'Требует ТО' },
  { id: 'EQ-004', brand: 'LG', model: 'S09ET', serial: 'LG7834521', installed: '30.01.2020', lastService: '15.11.2025', nextService: '15.05.2026', status: 'Внимание' },
  { id: 'EQ-005', brand: 'Haier', model: 'AS09NS4ERA', serial: 'HR2091847', installed: '14.05.2024', lastService: '02.03.2026', nextService: '02.09.2026', status: 'Исправен' },
];

const workOrders = [
  { id: 'WO-2026-000234', date: '10.05.2026', type: 'Ремонт', engineer: 'Иванов А.В.', status: 'Выполнен', amount: '8 500 ₽' },
  { id: 'WO-2026-000198', date: '22.04.2026', type: 'ТО', engineer: 'Петров С.М.', status: 'Выполнен', amount: '4 200 ₽' },
  { id: 'WO-2026-000145', date: '05.03.2026', type: 'Диагностика', engineer: 'Козлов Д.Р.', status: 'Выполнен', amount: '2 800 ₽' },
  { id: 'WO-2025-001892', date: '18.12.2025', type: 'Ремонт', engineer: 'Иванов А.В.', status: 'Выполнен', amount: '12 600 ₽' },
  { id: 'WO-2025-001654', date: '02.11.2025', type: 'ТО', engineer: 'Новиков П.А.', status: 'Выполнен', amount: '4 200 ₽' },
  { id: 'WO-2025-001423', date: '14.09.2025', type: 'Установка', engineer: 'Петров С.М.', status: 'Выполнен', amount: '18 000 ₽' },
  { id: 'WO-2025-001201', date: '28.07.2025', type: 'Ремонт', engineer: 'Козлов Д.Р.', status: 'Выполнен', amount: '6 400 ₽' },
  { id: 'WO-2025-000987', date: '10.06.2025', type: 'ТО', engineer: 'Иванов А.В.', status: 'Выполнен', amount: '4 200 ₽' },
];

const contacts = [
  { name: 'Смирнов Алексей Петрович', role: 'Генеральный директор', phone: '+7 (916) 234-56-78', email: 'smirnov@client.ru', telegram: '@smirnov_ap' },
  { name: 'Козлова Марина Ивановна', role: 'Главный инженер', phone: '+7 (916) 345-67-89', email: 'kozlova@client.ru', telegram: '@kozlova_mi' },
  { name: 'Федоров Дмитрий Сергеевич', role: 'Бухгалтер', phone: '+7 (916) 456-78-90', email: 'fedorov@client.ru', telegram: '' },
  { name: 'Антонова Светлана Юрьевна', role: 'Офис-менеджер', phone: '+7 (916) 567-89-01', email: 'antonova@client.ru', telegram: '@antonova_su' },
];

const invoices = [
  { id: 'INV-2026-089', date: '10.05.2026', amount: '8 500 ₽', status: 'Оплачен', due: '25.05.2026' },
  { id: 'INV-2026-067', date: '22.04.2026', amount: '4 200 ₽', status: 'Оплачен', due: '07.05.2026' },
  { id: 'INV-2026-034', date: '05.03.2026', amount: '2 800 ₽', status: 'Оплачен', due: '20.03.2026' },
  { id: 'INV-2026-012', date: '15.02.2026', amount: '5 600 ₽', status: 'Ожидает оплаты', due: '01.03.2026' },
];

const documents = [
  { name: 'Договор №ДГ-2024-156', type: 'PDF', size: '1.2 МБ', date: '01.03.2024' },
  { name: 'Приложение №1 к договору', type: 'PDF', size: '0.8 МБ', date: '01.03.2024' },
  { name: 'SLA Соглашение', type: 'PDF', size: '0.5 МБ', date: '01.03.2024' },
  { name: 'Акт №АВР-2026-089', type: 'PDF', size: '0.3 МБ', date: '10.05.2026' },
  { name: 'Акт №АВР-2026-067', type: 'PDF', size: '0.3 МБ', date: '22.04.2026' },
  { name: 'Акт №АВР-2026-034', type: 'PDF', size: '0.3 МБ', date: '05.03.2026' },
];

const eqStatusColor: Record<string, string> = {
  'Исправен': 'bg-green-100 text-green-700',
  'Требует ТО': 'bg-yellow-100 text-yellow-700',
  'Внимание': 'bg-orange-100 text-orange-700',
  'Неисправен': 'bg-red-100 text-red-700',
};

const woStatusColor: Record<string, string> = {
  'Выполнен': 'bg-green-100 text-green-700',
  'В работе': 'bg-blue-100 text-blue-700',
  'Назначен': 'bg-yellow-100 text-yellow-700',
};

const invoiceStatusColor: Record<string, string> = {
  'Оплачен': 'bg-green-100 text-green-700',
  'Ожидает оплаты': 'bg-yellow-100 text-yellow-700',
  'Просрочен': 'bg-red-100 text-red-700',
};

const healthScore = 82;

const Client360 = ({ clientName, onClose }: Client360Props) => {
  const [tab, setTab] = useState('overview');
  const healthColor = healthScore >= 70 ? 'text-green-600' : healthScore >= 40 ? 'text-yellow-600' : 'text-red-600';
  const healthBg = healthScore >= 70 ? 'bg-green-100' : healthScore >= 40 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="Building2" size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{clientName}</h2>
              <p className="text-xs text-gray-500">360° карточка клиента</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${healthBg}`}>
              <Icon name="Heart" size={14} className={healthColor} />
              <span className={`text-sm font-bold ${healthColor}`}>{healthScore}/100</span>
              <span className={`text-xs ${healthColor}`}>Здоровье клиента</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}><Icon name="X" size={16} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x border-b text-center">
          {[
            { label: 'Нарядов всего', value: '47', icon: 'ClipboardList' },
            { label: 'Оборудование', value: '5 ед.', icon: 'Wind' },
            { label: 'Выручка (год)', value: '324 800 ₽', icon: 'TrendingUp' },
            { label: 'Средняя оценка', value: '4.8 ★', icon: 'Star' },
          ].map(s => (
            <div key={s.label} className="py-3 px-4">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Icon name={s.icon as never} size={14} className="text-blue-500" />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className="font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6 mt-3 shrink-0">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="equipment">Оборудование</TabsTrigger>
            <TabsTrigger value="history">История нарядов</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto px-6 py-4">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Реквизиты</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {[['Наименование', clientName],['ИНН','7712345678'],['Контактное лицо','Смирнов Алексей Петрович'],['Телефон','+7 (916) 234-56-78'],['Email','smirnov@client.ru'],['Адрес','г. Москва, ул. Ленина, д. 42, оф. 301']].map(([k,v]) => (
                      <div key={k} className="flex justify-between"><span className="text-gray-500">{k}:</span><span className="font-medium text-right max-w-[60%]">{v}</span></div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Договор и SLA</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {[['Договор','ДГ-2024-156'],['Тип','Сервисный'],['Дата начала','01.03.2024'],['Дата окончания','28.02.2027'],['SLA','SLA-Enterprise-001'],['TTF','24 ч (рабочие)']].map(([k,v]) => (
                      <div key={k} className="flex justify-between"><span className="text-gray-500">{k}:</span><span className="font-medium">{v}</span></div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              <Table>
                <TableHeader><TableRow><TableHead>Бренд / Модель</TableHead><TableHead>Серийный №</TableHead><TableHead>Установлен</TableHead><TableHead>Последнее ТО</TableHead><TableHead>Следующее ТО</TableHead><TableHead>Статус</TableHead></TableRow></TableHeader>
                <TableBody>
                  {equipment.map(eq => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.brand} {eq.model}</TableCell>
                      <TableCell className="text-gray-500 font-mono text-xs">{eq.serial}</TableCell>
                      <TableCell>{eq.installed}</TableCell>
                      <TableCell>{eq.lastService}</TableCell>
                      <TableCell>{eq.nextService}</TableCell>
                      <TableCell><Badge className={eqStatusColor[eq.status]}>{eq.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Table>
                <TableHeader><TableRow><TableHead>Номер</TableHead><TableHead>Дата</TableHead><TableHead>Тип</TableHead><TableHead>Инженер</TableHead><TableHead>Статус</TableHead><TableHead className="text-right">Сумма</TableHead></TableRow></TableHeader>
                <TableBody>
                  {workOrders.map(wo => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-mono text-xs">{wo.id}</TableCell>
                      <TableCell>{wo.date}</TableCell>
                      <TableCell>{wo.type}</TableCell>
                      <TableCell>{wo.engineer}</TableCell>
                      <TableCell><Badge className={woStatusColor[wo.status] || 'bg-gray-100 text-gray-700'}>{wo.status}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{wo.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="finance" className="mt-0">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[{label:'Выручка (год)',value:'324 800 ₽',color:'text-green-600'},{label:'Дебиторская задолженность',value:'5 600 ₽',color:'text-yellow-600'},{label:'Средний чек',value:'6 900 ₽',color:'text-blue-600'}].map(s => (
                  <Card key={s.label}><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-gray-500 mb-1">{s.label}</p><p className={`text-xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
                ))}
              </div>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Счета</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Счёт</TableHead><TableHead>Дата</TableHead><TableHead>Срок оплаты</TableHead><TableHead className="text-right">Сумма</TableHead><TableHead>Статус</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {invoices.map(inv => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                          <TableCell>{inv.date}</TableCell>
                          <TableCell>{inv.due}</TableCell>
                          <TableCell className="text-right font-medium">{inv.amount}</TableCell>
                          <TableCell><Badge className={invoiceStatusColor[inv.status]}>{inv.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="mt-0">
              <div className="grid grid-cols-2 gap-3">
                {contacts.map(c => (
                  <Card key={c.name}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Icon name="User" size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{c.role}</p>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5"><Icon name="Phone" size={11} />{c.phone}</div>
                            <div className="flex items-center gap-1.5"><Icon name="Mail" size={11} />{c.email}</div>
                            {c.telegram && <div className="flex items-center gap-1.5"><Icon name="MessageCircle" size={11} />{c.telegram}</div>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                        <Icon name="FileText" size={18} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.type} · {doc.size} · {doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm"><Icon name="Download" size={14} className="mr-1" />Скачать</Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Client360;
