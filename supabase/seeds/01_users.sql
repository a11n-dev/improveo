-- Auth user fixtures for local and CI seeds.
-- Keep these deterministic and idempotent.

delete from auth.identities
where email in ('member1@example.test', 'member2@example.test')
  and user_id not in (
    '10000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000002'::uuid
  );

delete from auth.users
where email in ('member1@example.test', 'member2@example.test')
  and id not in (
    '10000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000002'::uuid
  );

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '10000000-0000-4000-8000-000000000001'::uuid,
    'authenticated',
    'authenticated',
    'member1@example.test',
    '$2a$10$LIPKyEDXaG/y5HGQ1eFqce.kJmfefONlrWz9jgaCys6q4mMuuZ04q',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Member #1","email_verified":true}'::jsonb,
    now(),
    now(),
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '10000000-0000-4000-8000-000000000002'::uuid,
    'authenticated',
    'authenticated',
    'member2@example.test',
    '$2a$10$LIPKyEDXaG/y5HGQ1eFqce.kJmfefONlrWz9jgaCys6q4mMuuZ04q',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Member #2","email_verified":true}'::jsonb,
    now(),
    now(),
    false,
    false
  )
on conflict (id) do update
set
  instance_id = excluded.instance_id,
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  confirmation_token = excluded.confirmation_token,
  recovery_token = excluded.recovery_token,
  email_change_token_new = excluded.email_change_token_new,
  email_change_token_current = excluded.email_change_token_current,
  email_change = excluded.email_change,
  phone_change = excluded.phone_change,
  phone_change_token = excluded.phone_change_token,
  reauthentication_token = excluded.reauthentication_token,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now(),
  is_sso_user = excluded.is_sso_user,
  is_anonymous = excluded.is_anonymous;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
)
values
  (
    '20000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000001'::uuid,
    '{"sub":"10000000-0000-4000-8000-000000000001","email":"member1@example.test","email_verified":false,"phone_verified":false}'::jsonb,
    'email',
    '10000000-0000-4000-8000-000000000001',
    now(),
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000002'::uuid,
    '10000000-0000-4000-8000-000000000002'::uuid,
    '{"sub":"10000000-0000-4000-8000-000000000002","email":"member2@example.test","email_verified":false,"phone_verified":false}'::jsonb,
    'email',
    '10000000-0000-4000-8000-000000000002',
    now(),
    now()
  )
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = now();
