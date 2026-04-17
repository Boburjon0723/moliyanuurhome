-- CRM bilan mos: dam olish so‘rovlari (bot «Dam olmoqchiman»)
-- Avval employees jadvalida phone ustuni bo‘lishi kerak (998XXXXXXXXX).

CREATE TABLE IF NOT EXISTS public.employee_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  telegram_chat_id bigint,
  note text,
  source text NOT NULL DEFAULT 'telegram',
  status text NOT NULL DEFAULT 'pending',
  resolved_at timestamptz,
  resolved_by_telegram_id bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS employee_leave_requests_created_idx
  ON public.employee_leave_requests (created_at DESC);

ALTER TABLE public.employee_leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_leave_requests_select_anon" ON public.employee_leave_requests;
CREATE POLICY "employee_leave_requests_select_anon"
  ON public.employee_leave_requests FOR SELECT
  TO anon, authenticated
  USING (true);

-- Realtime: Supabase → Database → Replication → employee_leave_requests
