import { useState, useRef, useCallback, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DocTemplate {
  id: string;
  name: string;
  icon: string;
  updatedAt: string;
  content: string;
}

interface VariableItem {
  key: string;
  label: string;
  description: string;
}

interface VariableGroup {
  title: string;
  items: VariableItem[];
}

// ─── Template HTML content ─────────────────────────────────────────────────────

const KP_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
    <div>
      <div style="width: 120px; height: 48px; background: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: 700; font-size: 14px;">ЛОГОТИП</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 20px; font-weight: 700; color: #1e3a8a;">ООО «Сервис Климат»</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">ИНН 7701234567 | +7 (495) 123-45-67</div>
      <div style="font-size: 12px; color: #6b7280;">info@servis-klimat.ru</div>
    </div>
  </div>
  <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 8px;">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h1>
  <div style="display: flex; gap: 32px; margin-bottom: 28px;">
    <div style="font-size: 13px; color: #374151;"><strong>Кому:</strong> {client_name}</div>
    <div style="font-size: 13px; color: #374151;"><strong>Дата:</strong> {date}</div>
    <div style="font-size: 13px; color: #374151;"><strong>№:</strong> {order_number}</div>
  </div>
  <p style="font-size: 14px; color: #374151; margin-bottom: 24px; line-height: 1.6;">
    Уважаемый клиент, предлагаем Вам следующий перечень услуг по обслуживанию климатического оборудования:
  </p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background: #eff6ff;">
        <th style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: left; font-weight: 600; color: #1d4ed8;">№</th>
        <th style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: left; font-weight: 600; color: #1d4ed8;">Наименование услуги</th>
        <th style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: center; font-weight: 600; color: #1d4ed8;">Кол-во</th>
        <th style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: right; font-weight: 600; color: #1d4ed8;">Цена, руб.</th>
        <th style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: right; font-weight: 600; color: #1d4ed8;">Сумма, руб.</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">Техническое обслуживание сплит-системы</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">3 500,00</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">3 500,00</td>
      </tr>
      <tr style="background: #f9fafb;">
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">2</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">Дозаправка хладагентом R-410A (до 500 г)</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">2 200,00</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">2 200,00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">3</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">Чистка фильтров и теплообменника</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">1 800,00</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">1 800,00</td>
      </tr>
    </tbody>
    <tfoot>
      <tr style="background: #dbeafe;">
        <td colspan="4" style="border: 1px solid #bfdbfe; padding: 10px 12px; font-weight: 700; text-align: right; color: #1d4ed8;">ИТОГО:</td>
        <td style="border: 1px solid #bfdbfe; padding: 10px 12px; font-weight: 700; text-align: right; color: #1d4ed8;">{total_amount} руб.</td>
      </tr>
    </tfoot>
  </table>
  <p style="font-size: 12px; color: #6b7280; margin-bottom: 24px;">Предложение действительно в течение 30 дней с даты выставления.</p>
  <div style="font-size: 13px; color: #374151;">С уважением, <strong>Инженер {engineer_name}</strong></div>
</div>`;

const ACT_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <h1 style="text-align: center; font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px;">АКТ ВЫПОЛНЕННЫХ РАБОТ</h1>
  <div style="text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 28px;">№ {order_number} от {date}</div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
      <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 10px;">ЗАКАЗЧИК</div>
      <div style="font-size: 13px; color: #111827; font-weight: 600; margin-bottom: 4px;">{client_name}</div>
      <div style="font-size: 12px; color: #6b7280;">ИНН: ___________</div>
      <div style="font-size: 12px; color: #6b7280;">Адрес: ___________</div>
      <div style="font-size: 12px; color: #6b7280;">Тел: ___________</div>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
      <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 10px;">ИСПОЛНИТЕЛЬ</div>
      <div style="font-size: 13px; color: #111827; font-weight: 600; margin-bottom: 4px;">ООО «Сервис Климат»</div>
      <div style="font-size: 12px; color: #6b7280;">ИНН: 7701234567</div>
      <div style="font-size: 12px; color: #6b7280;">Адрес: г. Москва, ул. Ленинская, 10</div>
      <div style="font-size: 12px; color: #6b7280;">Инженер: {engineer_name}</div>
    </div>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background: #f3f4f6;">
        <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-weight: 600;">№</th>
        <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-weight: 600;">Наименование работ</th>
        <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: center; font-weight: 600;">Ед.</th>
        <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: center; font-weight: 600;">Кол-во</th>
        <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: right; font-weight: 600;">Цена</th>
        <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: right; font-weight: 600;">Сумма</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">Диагностика климатического оборудования</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">шт</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">1 200,00</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">1 200,00</td>
      </tr>
      <tr style="background: #f9fafb;">
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">2</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">Замена компрессора</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">шт</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">18 500,00</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">18 500,00</td>
      </tr>
    </tbody>
    <tfoot>
      <tr style="background: #f3f4f6;">
        <td colspan="5" style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: right; font-weight: 700;">ИТОГО:</td>
        <td style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: right; font-weight: 700;">{total_amount} руб.</td>
      </tr>
    </tfoot>
  </table>
  <p style="font-size: 13px; color: #374151; margin-bottom: 32px;">Работы выполнены в полном объёме. Претензий к качеству выполненных работ не имею.</p>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 40px;">
    <div>
      <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">ЗАКАЗЧИК:</div>
      <div style="border-top: 1px solid #374151; padding-top: 4px; font-size: 12px; color: #6b7280;">{client_name} / подпись /</div>
    </div>
    <div>
      <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">ИСПОЛНИТЕЛЬ:</div>
      <div style="border-top: 1px solid #374151; padding-top: 4px; font-size: 12px; color: #6b7280;">{engineer_name} / подпись /</div>
    </div>
  </div>
</div>`;

const INVOICE_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
    <div>
      <div style="font-size: 22px; font-weight: 700; color: #111827;">СЧЁТ НА ОПЛАТУ</div>
      <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">№ {order_number} от {date}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #6b7280;">
      <div style="font-weight: 600; color: #111827; font-size: 14px;">ООО «Сервис Климат»</div>
      <div>р/с 40702810123456789012</div>
      <div>Банк: АО «Сбербанк», БИК 044525225</div>
    </div>
  </div>
  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Плательщик:</div>
    <div style="font-size: 14px; font-weight: 600; color: #111827;">{client_name}</div>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
    <thead>
      <tr style="background: #1e3a8a; color: white;">
        <th style="padding: 10px 12px; text-align: left;">Наименование</th>
        <th style="padding: 10px 12px; text-align: center;">Кол-во</th>
        <th style="padding: 10px 12px; text-align: right;">Цена</th>
        <th style="padding: 10px 12px; text-align: right;">Сумма</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px;">Услуги по техническому обслуживанию</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: center;">1</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">___</td>
        <td style="border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right;">___</td>
      </tr>
    </tbody>
  </table>
  <div style="text-align: right; font-size: 14px; font-weight: 700; color: #1e3a8a;">Итого к оплате: {total_amount} руб.</div>
</div>`;

const CONTRACT_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <h1 style="text-align: center; font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px;">ДОГОВОР ОБСЛУЖИВАНИЯ</h1>
  <div style="text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 28px;">№ {order_number} | г. Москва | {date}</div>
  <p style="font-size: 13px; color: #374151; margin-bottom: 20px; line-height: 1.7;">
    ООО «Сервис Климат», именуемое в дальнейшем «Исполнитель», и <strong>{client_name}</strong>, именуемый в дальнейшем «Заказчик», заключили настоящий договор о нижеследующем:
  </p>
  <h3 style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">1. ПРЕДМЕТ ДОГОВОРА</h3>
  <p style="font-size: 13px; color: #374151; margin-bottom: 20px; line-height: 1.7;">
    1.1. Исполнитель обязуется оказывать услуги по техническому обслуживанию климатического оборудования Заказчика согласно плану ТО.
  </p>
  <h3 style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">2. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ</h3>
  <p style="font-size: 13px; color: #374151; margin-bottom: 20px; line-height: 1.7;">
    2.1. Стоимость услуг составляет {total_amount} руб. в месяц. Оплата производится до 5-го числа каждого месяца.
  </p>
  <h3 style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">3. СРОК ДЕЙСТВИЯ</h3>
  <p style="font-size: 13px; color: #374151; margin-bottom: 32px; line-height: 1.7;">
    3.1. Договор вступает в силу с {date} и действует 12 месяцев.
  </p>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
    <div>
      <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">ЗАКАЗЧИК:</div>
      <div style="font-size: 13px; color: #111827; margin-bottom: 24px;">{client_name}</div>
      <div style="border-top: 1px solid #374151; padding-top: 4px; font-size: 11px; color: #6b7280;">подпись / дата</div>
    </div>
    <div>
      <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">ИСПОЛНИТЕЛЬ:</div>
      <div style="font-size: 13px; color: #111827; margin-bottom: 24px;">ООО «Сервис Климат»</div>
      <div style="border-top: 1px solid #374151; padding-top: 4px; font-size: 11px; color: #6b7280;">подпись / дата</div>
    </div>
  </div>
</div>`;

const WARRANTY_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <div style="background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 24px; margin-bottom: 28px; text-align: center;">
    <div style="font-size: 32px; margin-bottom: 8px;">✓</div>
    <h1 style="font-size: 20px; font-weight: 700; color: #065f46; margin-bottom: 4px;">ГАРАНТИЙНЫЙ ЛИСТ</h1>
    <div style="font-size: 13px; color: #047857;">Подтверждаем качество выполненных работ</div>
  </div>
  <div style="font-size: 13px; color: #374151; line-height: 1.7; margin-bottom: 20px;">
    <p>ООО «Сервис Климат» настоящим подтверждает, что работы по заявке <strong>{order_number}</strong>, выполненные инженером <strong>{engineer_name}</strong> для клиента <strong>{client_name}</strong> {date}, соответствуют техническим требованиям.</p>
  </div>
  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin-bottom: 12px;">Условия гарантии</div>
    <ul style="font-size: 13px; color: #374151; padding-left: 20px; line-height: 2;">
      <li>Гарантийный срок: <strong>12 месяцев</strong> с даты выполнения работ</li>
      <li>Гарантия на установленные запчасти: <strong>6 месяцев</strong></li>
      <li>Гарантия не распространяется на механические повреждения по вине Заказчика</li>
      <li>Гарантия не распространяется на нарушение правил эксплуатации</li>
    </ul>
  </div>
  <div style="font-size: 13px; color: #374151; margin-top: 32px;">
    <strong>Руководитель сервисного центра:</strong> ___________________ / подпись /
  </div>
</div>`;

const WORK_ORDER_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
    <div>
      <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px;">НАРЯД-ЗАДАНИЕ</h1>
      <div style="font-size: 13px; color: #6b7280;">№ {order_number} | {date}</div>
    </div>
    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: #92400e;">В РАБОТЕ</div>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
    <div>
      <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">Клиент</div>
      <div style="font-size: 14px; font-weight: 600; color: #111827;">{client_name}</div>
    </div>
    <div>
      <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">Инженер</div>
      <div style="font-size: 14px; font-weight: 600; color: #111827;">{engineer_name}</div>
    </div>
  </div>
  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
    <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 10px;">ОПИСАНИЕ РАБОТ</div>
    <div style="font-size: 13px; color: #374151; line-height: 1.7;">
      1. Диагностика неисправности<br/>
      2. Определение причины отказа<br/>
      3. Согласование с клиентом объёма работ<br/>
      4. Выполнение ремонтных работ<br/>
      5. Тестирование оборудования
    </div>
  </div>
  <div style="font-size: 13px; color: #374151; margin-top: 32px;">
    <strong>Инженер:</strong> {engineer_name} ___________________
  </div>
</div>`;

const TO_REPORT_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px;">ОТЧЁТ ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ</h1>
  <div style="font-size: 13px; color: #6b7280; margin-bottom: 28px;">Наряд № {order_number} | {date} | Инженер: {engineer_name}</div>
  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
    <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 12px;">КОНТРОЛЬНЫЕ ПАРАМЕТРЫ</div>
    <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #374151; width: 60%;">Давление всасывания (бар)</td>
        <td style="padding: 6px 0; font-weight: 600; color: #111827;">___</td>
        <td style="padding: 6px 0; color: #6b7280; text-align: right;">норма: 5–7</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #374151;">Давление нагнетания (бар)</td>
        <td style="padding: 6px 0; font-weight: 600; color: #111827;">___</td>
        <td style="padding: 6px 0; color: #6b7280; text-align: right;">норма: 18–22</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #374151;">Температура подающего воздуха (°C)</td>
        <td style="padding: 6px 0; font-weight: 600; color: #111827;">___</td>
        <td style="padding: 6px 0; color: #6b7280; text-align: right;">норма: 22–26</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #374151;">Дозаправлено хладагента (г)</td>
        <td style="padding: 6px 0; font-weight: 600; color: #111827;">___</td>
        <td style="padding: 6px 0; color: #6b7280; text-align: right;"></td>
      </tr>
    </table>
  </div>
  <div style="font-size: 13px; color: #374151; margin-top: 32px;">Клиент: {client_name} ___________________</div>
</div>`;

const COVER_LETTER_CONTENT = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px;">
  <div style="text-align: right; font-size: 13px; color: #374151; margin-bottom: 28px;">
    <div style="font-weight: 600;">ООО «Сервис Климат»</div>
    <div style="color: #6b7280;">{date}</div>
  </div>
  <div style="margin-bottom: 28px;">
    <div style="font-size: 13px; color: #374151;">Кому: <strong>{client_name}</strong></div>
  </div>
  <h1 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 20px;">Сопроводительное письмо</h1>
  <p style="font-size: 14px; color: #374151; line-height: 1.8; margin-bottom: 16px;">
    Уважаемый клиент,
  </p>
  <p style="font-size: 14px; color: #374151; line-height: 1.8; margin-bottom: 16px;">
    Направляем Вам документы по заявке № <strong>{order_number}</strong>. В приложении вы найдёте:
  </p>
  <ul style="font-size: 14px; color: #374151; line-height: 2; padding-left: 20px; margin-bottom: 20px;">
    <li>Акт выполненных работ</li>
    <li>Счёт на оплату</li>
    <li>Гарантийный лист</li>
  </ul>
  <p style="font-size: 14px; color: #374151; line-height: 1.8; margin-bottom: 32px;">
    Просим подписать акт и направить скан на электронную почту. По всем вопросам обращайтесь к инженеру <strong>{engineer_name}</strong>.
  </p>
  <div style="font-size: 14px; color: #374151;">С уважением,<br/><strong>ООО «Сервис Климат»</strong></div>
</div>`;

// ─── Constants ─────────────────────────────────────────────────────────────────

const DOCUMENT_TEMPLATES: DocTemplate[] = [
  { id: 'kp',       name: 'Коммерческое предложение', icon: 'FileText',    updatedAt: '14.05.2026', content: KP_CONTENT },
  { id: 'act',      name: 'Акт выполненных работ',    icon: 'ClipboardCheck', updatedAt: '12.05.2026', content: ACT_CONTENT },
  { id: 'invoice',  name: 'Счёт на оплату',           icon: 'Receipt',     updatedAt: '10.05.2026', content: INVOICE_CONTENT },
  { id: 'contract', name: 'Договор обслуживания',     icon: 'FileSignature', updatedAt: '08.05.2026', content: CONTRACT_CONTENT },
  { id: 'warranty', name: 'Гарантийный лист',         icon: 'ShieldCheck', updatedAt: '06.05.2026', content: WARRANTY_CONTENT },
  { id: 'order',    name: 'Наряд-задание',            icon: 'Wrench',      updatedAt: '04.05.2026', content: WORK_ORDER_CONTENT },
  { id: 'report',   name: 'Отчёт ТО',                icon: 'BarChart2',   updatedAt: '02.05.2026', content: TO_REPORT_CONTENT },
  { id: 'letter',   name: 'Сопроводительное письмо', icon: 'Mail',        updatedAt: '01.05.2026', content: COVER_LETTER_CONTENT },
];

const VARIABLE_GROUPS: VariableGroup[] = [
  {
    title: 'Данные объекта',
    items: [
      { key: '{client_name}',    label: 'Имя клиента',      description: 'Полное наименование клиента' },
      { key: '{date}',           label: 'Дата',             description: 'Дата создания документа' },
      { key: '{order_number}',   label: 'Номер заявки',     description: 'Номер наряда / заявки' },
      { key: '{engineer_name}',  label: 'Инженер',          description: 'ФИО ответственного инженера' },
      { key: '{total_amount}',   label: 'Итоговая сумма',   description: 'Сумма по документу в рублях' },
    ],
  },
  {
    title: 'Данные договора',
    items: [
      { key: '{contract_number}', label: 'Номер договора',  description: 'Номер договора обслуживания' },
      { key: '{contract_date}',   label: 'Дата договора',   description: 'Дата заключения договора' },
      { key: '{sla_level}',       label: 'Уровень SLA',     description: 'Bronze / Silver / Gold' },
      { key: '{address}',         label: 'Адрес объекта',   description: 'Адрес места выполнения работ' },
      { key: '{equipment}',       label: 'Оборудование',    description: 'Модель и серийный номер' },
    ],
  },
];

const INSERT_VARIABLE_KEYS = [
  '{client_name}',
  '{date}',
  '{order_number}',
  '{engineer_name}',
  '{total_amount}',
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DocumentEditorFull() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('kp');
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const variableDropdownRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? DOCUMENT_TEMPLATES[0];

  // ── Word / char count ────────────────────────────────────────────────────────

  const [stats, setStats] = useState({ chars: 0, words: 0 });

  const updateStats = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText ?? '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    setStats({ chars, words });
  }, []);

  // Initialize editor content when template changes
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = selectedTemplate.content;
    updateStats();
  }, [selectedTemplateId, selectedTemplate.content, updateStats]);

  // ── Close dropdown on outside click ─────────────────────────────────────────

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        variableDropdownRef.current &&
        !variableDropdownRef.current.contains(e.target as Node)
      ) {
        setShowVariableDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Format commands ──────────────────────────────────────────────────────────

  const execFormat = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    toast.success('Применено форматирование');
  };

  const execAlign = (align: string) => {
    editorRef.current?.focus();
    document.execCommand(align, false);
    toast.success('Применено форматирование');
  };

  const execInsertList = (ordered: boolean) => {
    editorRef.current?.focus();
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false);
    toast.success('Применено форматирование');
  };

  const insertVariable = (varKey: string) => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, varKey);
    setShowVariableDropdown(false);
    toast.success('Переменная вставлена');
    updateStats();
  };

  const insertTable = () => {
    const tableHtml = `<table style="border-collapse:collapse;width:100%;margin:12px 0;">
      <tr><th style="border:1px solid #d1d5db;padding:8px;background:#f3f4f6;">Колонка 1</th><th style="border:1px solid #d1d5db;padding:8px;background:#f3f4f6;">Колонка 2</th><th style="border:1px solid #d1d5db;padding:8px;background:#f3f4f6;">Колонка 3</th></tr>
      <tr><td style="border:1px solid #d1d5db;padding:8px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px;">&nbsp;</td></tr>
    </table>`;
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, tableHtml);
    toast.success('Таблица вставлена');
    updateStats();
  };

  const insertSignature = () => {
    const sigHtml = `<div style="margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:48px;">
      <div><div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Заказчик:</div><div style="border-top:1px solid #374151;padding-top:4px;font-size:11px;color:#6b7280;">подпись / дата</div></div>
      <div><div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Исполнитель:</div><div style="border-top:1px solid #374151;padding-top:4px;font-size:11px;color:#6b7280;">подпись / дата</div></div>
    </div>`;
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, sigHtml);
    toast.success('Блок подписи вставлен');
    updateStats();
  };

  // ── Bottom actions ───────────────────────────────────────────────────────────

  const handleSave = () => toast.success('Документ сохранён');
  const handlePreview = () => toast.info('Открыт предпросмотр документа');
  const handleDownloadPdf = () => toast.success('Документ отправлен на генерацию PDF');
  const handleSendToClient = () => toast.success('Документ отправлен клиенту');

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">

      {/* ── Left panel: document library (280px) ── */}
      <div className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Icon name="Library" size={15} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">Библиотека документов</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {DOCUMENT_TEMPLATES.map((tpl) => {
              const isActive = tpl.id === selectedTemplateId;
              return (
                <div
                  key={tpl.id}
                  className={`rounded-lg border transition-all ${
                    isActive
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
                    <div className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      <Icon name={tpl.icon as Parameters<typeof Icon>[0]['name']} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium leading-tight ${isActive ? 'text-blue-800' : 'text-gray-700'}`}>
                        {tpl.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">Изм. {tpl.updatedAt}</div>
                    </div>
                  </div>
                  <div className="px-3 pb-2">
                    <Button
                      size="sm"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`w-full h-7 text-[11px] ${
                        isActive
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-gray-600'
                      }`}
                    >
                      {isActive ? 'Выбран' : 'Выбрать'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Center: editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0 flex-wrap">
          {/* Bold / Italic / Underline */}
          <button
            onClick={() => execFormat('bold')}
            title="Жирный"
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-700 font-bold text-sm transition-colors"
          >
            Ж
          </button>
          <button
            onClick={() => execFormat('italic')}
            title="Курсив"
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-700 italic text-sm transition-colors"
          >
            К
          </button>
          <button
            onClick={() => execFormat('underline')}
            title="Подчёркнутый"
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-700 underline text-sm transition-colors"
          >
            Ч
          </button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Alignment */}
          <button onClick={() => execAlign('justifyLeft')}   title="Выровнять по левому краю"  className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Icon name="AlignLeft"    size={14} /></button>
          <button onClick={() => execAlign('justifyCenter')} title="Выровнять по центру"        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Icon name="AlignCenter"  size={14} /></button>
          <button onClick={() => execAlign('justifyRight')}  title="Выровнять по правому краю" className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Icon name="AlignRight"   size={14} /></button>
          <button onClick={() => execAlign('justifyFull')}   title="По ширине"                 className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Icon name="AlignJustify" size={14} /></button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Lists */}
          <button onClick={() => execInsertList(false)} title="Маркированный список" className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Icon name="List"        size={14} /></button>
          <button onClick={() => execInsertList(true)}  title="Нумерованный список"  className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors"><Icon name="ListOrdered" size={14} /></button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Insert variable dropdown */}
          <div className="relative" ref={variableDropdownRef}>
            <button
              onClick={() => setShowVariableDropdown((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors border border-gray-200"
            >
              <Icon name="Variable" size={13} />
              Переменная
              <Icon name="ChevronDown" size={11} className="text-gray-400" />
            </button>

            {showVariableDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20 py-1">
                {INSERT_VARIABLE_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => insertVariable(key)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-mono transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Table & signature */}
          <button
            onClick={insertTable}
            className="flex items-center gap-1.5 px-2.5 h-8 rounded hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors border border-gray-200"
          >
            <Icon name="Table2" size={13} />
            Таблица
          </button>
          <button
            onClick={insertSignature}
            className="flex items-center gap-1.5 px-2.5 h-8 rounded hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors border border-gray-200"
          >
            <Icon name="PenLine" size={13} />
            Подпись
          </button>

          <div className="flex-1" />

          <Badge variant="outline" className="text-[10px] text-gray-500 h-6">
            {selectedTemplate.name}
          </Badge>
        </div>

        {/* Editable area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 py-6 px-4">
          <div className="max-w-[860px] mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateStats}
              className="outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset rounded-lg"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
          <Button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
          >
            <Icon name="Save" size={14} />
            Сохранить
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-1.5 h-9 text-sm"
          >
            <Icon name="Eye" size={14} />
            Предпросмотр
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 h-9 text-sm"
          >
            <Icon name="Download" size={14} />
            Скачать PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleSendToClient}
            className="flex items-center gap-1.5 h-9 text-sm text-green-700 border-green-300 hover:bg-green-50"
          >
            <Icon name="Send" size={14} />
            Отправить клиенту
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              Слов: <span className="font-medium text-gray-600">{stats.words.toLocaleString('ru-RU')}</span>
            </span>
            <span>
              Символов: <span className="font-medium text-gray-600">{stats.chars.toLocaleString('ru-RU')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel: variables (240px) ── */}
      <div className="w-[240px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Icon name="Braces" size={15} className="text-violet-600" />
          <span className="text-sm font-semibold text-gray-800">Переменные</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-4">
            {VARIABLE_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        editorRef.current?.focus();
                        document.execCommand('insertText', false, item.key);
                        toast.success('Переменная вставлена');
                        updateStats();
                      }}
                      className="w-full text-left rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors p-2.5 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-medium text-violet-700 group-hover:text-violet-800">
                          {item.key}
                        </span>
                        <Icon name="Plus" size={11} className="text-gray-300 group-hover:text-violet-500" />
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <p className="text-[10px] text-gray-400 text-center leading-tight">
              Нажмите на переменную для вставки в позицию курсора
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="border-t border-gray-200 px-4 py-3 space-y-2">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            Шаблон
          </div>
          <div className="flex items-center gap-2">
            <Icon name="FileText" size={13} className="text-blue-500 flex-shrink-0" />
            <span className="text-xs text-gray-700 leading-tight">{selectedTemplate.name}</span>
          </div>
          <div className="text-[10px] text-gray-400">Изменён {selectedTemplate.updatedAt}</div>
        </div>
      </div>
    </div>
  );
}
