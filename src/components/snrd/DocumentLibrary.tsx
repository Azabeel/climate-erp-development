import { useState } from 'react';
import { Search, Upload, Download, FileText, File, FolderOpen, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  relatedTo?: string;
  tags: string[];
}

const DOCUMENTS: Document[] = [
  { id: 'd1', name: 'Акт выполненных работ WO-2026-000045.pdf', type: 'pdf', category: 'Акты', size: '124 KB', uploadedBy: 'Козлов М.', uploadedAt: '12.05.2026', relatedTo: 'WO-2026-000045', tags: ['акт', 'клиент'] },
  { id: 'd2', name: 'Счёт №2026-0231.pdf', type: 'pdf', category: 'Счета', size: '89 KB', uploadedBy: 'Петрова Е.', uploadedAt: '11.05.2026', relatedTo: 'WO-2026-000044', tags: ['счёт', 'оплата'] },
  { id: 'd3', name: 'Договор обслуживания ООО Альфа.docx', type: 'docx', category: 'Договоры', size: '245 KB', uploadedBy: 'Администратор', uploadedAt: '01.01.2026', tags: ['договор', 'SLA'] },
  { id: 'd4', name: 'Daikin FTXB35C — Инструкция по монтажу.pdf', type: 'pdf', category: 'Мануалы', size: '4.2 MB', uploadedBy: 'Технический директор', uploadedAt: '15.03.2026', tags: ['мануал', 'daikin', 'монтаж'] },
  { id: 'd5', name: 'Отчёт по хладагентам май 2026.xlsx', type: 'xlsx', category: 'Отчёты', size: '78 KB', uploadedBy: 'Иванов А.', uploadedAt: '10.05.2026', tags: ['хладагент', 'отчёт'] },
  { id: 'd6', name: 'Mitsubishi MSZ — Коды ошибок.pdf', type: 'pdf', category: 'Мануалы', size: '1.8 MB', uploadedBy: 'Технический директор', uploadedAt: '20.02.2026', tags: ['мануал', 'mitsubishi', 'диагностика'] },
  { id: 'd7', name: 'КП для ТЦ Мираж.pdf', type: 'pdf', category: 'КП', size: '320 KB', uploadedBy: 'Сидоров В.', uploadedAt: '08.05.2026', relatedTo: 'Клиент #C-007', tags: ['КП', 'продажи'] },
  { id: 'd8', name: 'Журнал учёта хладагентов 2026.xlsx', type: 'xlsx', category: 'Отчёты', size: '156 KB', uploadedBy: 'Администратор', uploadedAt: '01.05.2026', tags: ['хладагент', 'журнал', 'Росприроднадзор'] },
];

const CATEGORIES = ['Все', 'Акты', 'Счета', 'Договоры', 'Мануалы', 'Отчёты', 'КП'];

const FILE_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-500' },
  docx: { icon: File, color: 'text-blue-500' },
  xlsx: { icon: File, color: 'text-green-500' },
};

const DocumentLibrary = () => {
  const [docs, setDocs] = useState<Document[]>(DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Все');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Акты', tags: '' });

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = categoryFilter === 'Все' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleUpload = () => {
    if (!form.name) { toast.error('Введите название документа'); return; }
    const newDoc: Document = {
      id: `d${docs.length + 1}`,
      name: form.name,
      type: 'pdf',
      category: form.category,
      size: '—',
      uploadedBy: 'Текущий пользователь',
      uploadedAt: new Date().toLocaleDateString('ru-RU'),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    setDocs([newDoc, ...docs]);
    toast.success('Документ загружен');
    setUploadOpen(false);
    setForm({ name: '', category: 'Акты', tags: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить документ?')) {
      setDocs(docs.filter(d => d.id !== id));
      toast.success('Документ удалён');
    }
  };

  const catCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'Все' ? docs.length : docs.filter(d => d.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Библиотека документов</h2>
          <p className="text-gray-600 mt-1">Централизованное хранилище файлов и мануалов</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload size={16} className="mr-2" /> Загрузить документ
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar categories */}
        <div className="w-48 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Категории</p>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${categoryFilter === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen size={14} />
                  {cat}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryFilter === cat ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {catCounts[cat]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder="Поиск по названию или тегам..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Документ', 'Категория', 'Теги', 'Размер', 'Загружен', 'Действия'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(doc => {
                  const fileIcon = FILE_ICONS[doc.type] || FILE_ICONS['pdf'];
                  const IconComponent = fileIcon.icon;
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <IconComponent size={20} className={fileIcon.color} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{doc.name}</p>
                            {doc.relatedTo && <p className="text-xs text-gray-500">{doc.relatedTo}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                          ))}
                          {doc.tags.length > 2 && <span className="text-xs text-gray-400">+{doc.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{doc.size}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700">{doc.uploadedAt}</p>
                        <p className="text-xs text-gray-500">{doc.uploadedBy}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toast.info(`Просмотр: ${doc.name}`)}><Eye size={14} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.success(`Скачивание: ${doc.name}`)}><Download size={14} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 size={14} className="text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">Документы не найдены</div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Показано: {filtered.length} из {docs.length}</p>
        </div>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Загрузить документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название документа *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Название.pdf" />
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c !== 'Все').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Теги (через запятую)</Label>
              <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="акт, клиент, 2026" />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Перетащите файл или нажмите для выбора</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX до 50 MB</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Отмена</Button>
            <Button onClick={handleUpload}>Загрузить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentLibrary;
