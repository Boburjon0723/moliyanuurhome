-- Mavjud employee_leave_requests jadvaliga tasdiqlash ustunlari (Supabase SQL Editor → Run)

ALTER TABLE public.employee_leave_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
UPDATE public.employee_leave_requests SET status = 'pending' WHERE status IS NULL;

ALTER TABLE public.employee_leave_requests ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE public.employee_leave_requests ADD COLUMN IF NOT EXISTS resolved_by_telegram_id bigint;

COMMENT ON COLUMN public.employee_leave_requests.status IS 'pending | approved | rejected';
