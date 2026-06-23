-- ============================================================================
-- APP DEPORTE 2.0 — Sweep periódico de intenciones vencidas vía pg_cron
-- Programa `expire_stale_intents()` cada minuto para que el marketplace muestre
-- los horarios liberados aunque nadie intente reservar (complementa el barrido
-- perezoso de create_customer_booking). Ver D-004 / P-002.
--
-- Defensivo: si pg_cron no está disponible en el entorno (algún local), el reset
-- no se rompe — el barrido perezoso al reservar sigue cubriendo el bug B-1.
--
-- Supervisión:
--   select * from cron.job where jobname='expire-stale-intents';
--   select status, return_message, start_time from cron.job_run_details
--     where jobid=(select jobid from cron.job where jobname='expire-stale-intents')
--     order by start_time desc limit 10;
-- ============================================================================
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule(
    'expire-stale-intents',
    '* * * * *',
    'select public.expire_stale_intents();'
  );
exception when others then
  raise notice 'pg_cron no disponible (%) — el barrido perezoso al reservar sigue activo.', sqlerrm;
end $$;
