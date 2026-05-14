import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Client } from '@/types/snrd';

interface ClientsListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onView360: (id: string, name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ClientsList = ({
  clients,
  onEdit,
  onDelete,
  onView360,
  searchQuery,
  setSearchQuery
}: ClientsListProps) => {
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContractColor = (status: string) => {
    switch (status) {
      case 'Активен': return 'bg-green-100 text-green-700';
      case 'На продлении': return 'bg-yellow-100 text-yellow-700';
      case 'Истек': return 'bg-red-100 text-red-700';
      case 'Приостановлен': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Клиенты ({filteredClients.length})</CardTitle>
            <Input 
              placeholder="Поиск по названию или контактному лицу..." 
              className="w-96" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Контактное лицо</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Договор</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Объекты</TableHead>
                <TableHead>Активы</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.contactPerson}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Badge className={getContractColor(client.contract)}>{client.contract}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.slaAgreement}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Icon name="MapPin" size={14} className="text-gray-400" />
                      {client.objectsCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Icon name="Package" size={14} className="text-gray-400" />
                      {client.assetsCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onView360(client.id, client.name)} title="Карточка клиента 360°">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(client)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(client.id)}>
                        <Icon name="Trash2" size={16} />
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
};

export default ClientsList;
