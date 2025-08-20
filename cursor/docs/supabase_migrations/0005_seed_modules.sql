-- 0005_seed_modules.sql — seed for modules (dev only)
begin;

do $$
declare env text := current_setting('app.env', true);
begin
  if env is null or env = 'dev' then
    insert into modules (id, title, description) values
      ('M01','Persona & Offer Clarifier','Avatar, problemă, promisiune, ofertă')
      on conflict (id) do nothing;
    insert into modules (id, title, description) values
      ('M07','Risk & Trust Reversal','Garanții + dovadă → scazi drop‑off')
      on conflict (id) do nothing;
    insert into modules (id, title, description) values
      ('M14','Landing Page Spec','Structură, blocuri, micro‑conversii')
      on conflict (id) do nothing;
    -- adaugă restul M02..M50 după nevoie
  end if;
end $$;

commit;
