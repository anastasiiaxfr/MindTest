CREATE TABLE IF NOT EXISTS mindtest_attempts (
  id uuid PRIMARY KEY,
  test text NOT NULL CHECK (test IN ('iq', 'memory', 'mental-age')),
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  payment_status text NOT NULL DEFAULT 'Pending'
);
