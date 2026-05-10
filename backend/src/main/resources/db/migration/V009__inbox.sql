-- Sprint 13: Inbox messages table for omnichannel incoming messages

CREATE TABLE IF NOT EXISTS inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel VARCHAR(20) NOT NULL,
    external_id VARCHAR(200) UNIQUE,
    client_id UUID REFERENCES clients(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    assigned_to UUID,
    work_order_id UUID REFERENCES work_orders(id),
    received_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inbox_channel ON inbox_messages(channel);
CREATE INDEX IF NOT EXISTS idx_inbox_client ON inbox_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_inbox_unread ON inbox_messages(is_read) WHERE NOT is_read;
