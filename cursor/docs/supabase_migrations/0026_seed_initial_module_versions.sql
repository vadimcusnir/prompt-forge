-- 0026_seed_initial_module_versions.sql — seed versiuni inițiale 1.0.0 pentru M01-M50
begin;

-- Seed versiuni inițiale pentru toate modulele din catalog
-- Folosește datele din modules.registry.json pentru vectori și spec_json

do $$
declare 
  module_rec record;
  spec_data jsonb;
begin
  -- Iterează prin toate modulele și creează versiuni inițiale
  for module_rec in 
    select id, title, description from modules where id ~ '^M[0-9]{2}$'
  loop
    -- Construiește spec_json bazat pe registry data
    spec_data := jsonb_build_object(
      'module_code', module_rec.id,
      'name', module_rec.title,
      'description', module_rec.description,
      'status', 'draft',
      'version', '1.0.0',
      'created_at', now()
    );
    
    -- Creează versiunea inițială dacă nu există deja
    insert into module_versions (
      module_id,
      semver,
      parent_version_id,
      changelog,
      spec_json,
      vectors,
      requirements,
      spec_text,
      output_schema,
      kpi,
      guardrails,
      enabled,
      is_snapshot,
      created_by
    ) 
    select 
      module_rec.id,
      '1.0.0',
      null,
      'Initial module version',
      spec_data,
      case module_rec.id
        when 'M01' then array[1,6,5]::smallint[]
        when 'M02' then array[2,5]::smallint[]
        when 'M03' then array[2,6]::smallint[]
        when 'M04' then array[2,5]::smallint[]
        when 'M05' then array[4,5]::smallint[]
        when 'M06' then array[2]::smallint[]
        when 'M07' then array[2,7]::smallint[]
        when 'M08' then array[2,5]::smallint[]
        when 'M09' then array[1,6]::smallint[]
        when 'M10' then array[6]::smallint[]
        when 'M11' then array[1]::smallint[]
        when 'M12' then array[1]::smallint[]
        when 'M13' then array[4]::smallint[]
        when 'M14' then array[1,2]::smallint[]
        when 'M15' then array[1,5]::smallint[]
        when 'M16' then array[3]::smallint[]
        when 'M17' then array[3,5]::smallint[]
        when 'M18' then array[2,5]::smallint[]
        when 'M19' then array[3,7]::smallint[]
        when 'M20' then array[2]::smallint[]
        when 'M21' then array[1,3]::smallint[]
        when 'M22' then array[1]::smallint[]
        when 'M23' then array[1,3]::smallint[]
        when 'M24' then array[7]::smallint[]
        when 'M25' then array[6,7]::smallint[]
        when 'M26' then array[4]::smallint[]
        when 'M27' then array[4]::smallint[]
        when 'M28' then array[2,4]::smallint[]
        when 'M29' then array[2,5]::smallint[]
        when 'M30' then array[2]::smallint[]
        when 'M31' then array[6]::smallint[]
        when 'M32' then array[6]::smallint[]
        when 'M33' then array[6]::smallint[]
        when 'M34' then array[6]::smallint[]
        when 'M35' then array[6]::smallint[]
        when 'M36' then array[5]::smallint[]
        when 'M37' then array[5]::smallint[]
        when 'M38' then array[3,5]::smallint[]
        when 'M39' then array[3,5]::smallint[]
        when 'M40' then array[3,5]::smallint[]
        when 'M41' then array[7]::smallint[]
        when 'M42' then array[7]::smallint[]
        when 'M43' then array[7]::smallint[]
        when 'M44' then array[7]::smallint[]
        when 'M45' then array[6,4]::smallint[]
        when 'M46' then array[3]::smallint[]
        when 'M47' then array[3]::smallint[]
        when 'M48' then array[3]::smallint[]
        when 'M49' then array[1]::smallint[]
        when 'M50' then array[1,5]::smallint[]
        else array[1]::smallint[]
      end,
      case module_rec.id
        when 'M01' then 'Avatar definition, problem identification, promise articulation, offer structure'
        when 'M02' then 'Message-market mapping with evidence and channel optimization'
        when 'M03' then 'Brand positioning narrative and spine development'
        when 'M04' then 'Value ladder construction with upsell/cross-sell margins'
        when 'M05' then 'Funnel architecture with TOFU-MOFU-BOFU KPIs'
        when 'M06' then 'Objection mining with classified counter-arguments'
        when 'M07' then 'Risk mitigation and trust building with guarantees'
        when 'M08' then 'Social proof systematization with testimonials and studies'
        when 'M09' then 'Pricing strategy with anchors, plans, and controlled discounting'
        when 'M10' then 'Terms, SLAs, risk ramps, and compliance frameworks'
        else 'Module requirements to be defined'
      end,
      'Initial module specification for ' || module_rec.title,
      jsonb_build_object(
        'type', 'object',
        'properties', jsonb_build_object(
          'output', jsonb_build_object('type', 'string', 'description', 'Module output'),
          'metadata', jsonb_build_object('type', 'object', 'description', 'Execution metadata')
        ),
        'required', jsonb_build_array('output')
      ),
      jsonb_build_object(
        'clarity_weight', 0.25,
        'execution_weight', 0.25,
        'business_fit_weight', 0.3,
        'ambiguity_weight', 0.2,
        'target_composite', 85
      ),
      jsonb_build_object(
        'no_promises', true,
        'compliance_required', true,
        'output_validation', true,
        'max_iterations', 3
      ),
      true,
      false,
      null
    where not exists (
      select 1 from module_versions mv 
      where mv.module_id = module_rec.id and mv.semver = '1.0.0'
    );
    
    raise notice 'Created initial version for module %', module_rec.id;
  end loop;
end $$;

commit;
