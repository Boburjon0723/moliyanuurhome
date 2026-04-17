-- RLS: employee_leave_requests ga INSERT/UPDATE (bot anon kalit bilan ishlasa)
-- Tavsiya: Railway da SUPABASE_SERVICE_ROLE_KEY qo‘ying — u RLS dan o‘tadi, xavfsizroq.

DROP POLICY IF EXISTS "employee_leave_requests_insert_anon" ON public.employee_leave_requests;
CREATE POLICY "employee_leave_requests_insert_anon"
  ON public.employee_leave_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "employee_leave_requests_update_anon" ON public.employee_leave_requests;
CREATE POLICY "employee_leave_requests_update_anon"
  ON public.employee_leave_requests FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
