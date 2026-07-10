-- ============================================================
-- NOOR-E-HIDAYAH — Supabase Schema
-- Supabase Dashboard > SQL Editor এ পুরো ফাইলটা পেস্ট করে Run করো
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- 1. App config: কে অ্যাডমিন সেটা এক জায়গায় রাখা ----------
create table if not exists app_config (
  id boolean primary key default true,
  admin_user_id uuid references auth.users(id),
  constraint single_row check (id)
);
insert into app_config (id, admin_user_id) values (true, null)
  on conflict (id) do nothing;

-- প্রথম যে সাইন-আপ করবে, সে-ই স্বয়ংক্রিয়ভাবে অ্যাডমিন হয়ে যাবে
create or replace function set_first_admin()
returns trigger as $$
begin
  update app_config
    set admin_user_id = new.id
    where id = true and admin_user_id is null;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function set_first_admin();

-- ---------- 2. সূরা ও আয়াত ----------
create table if not exists surahs (
  id serial primary key,
  number int unique not null,
  name_arabic text not null,
  name_bengali text not null,
  name_english text not null,
  meaning text,
  total_ayahs int
);

create table if not exists ayahs (
  id uuid primary key default uuid_generate_v4(),
  surah_id int references surahs(id) on delete cascade,
  ayah_number int not null,
  arabic_text text not null,
  transliteration_bn text,
  meaning_bn text,
  meaning_en text,
  tafsir_bn text,        -- তরজমা/ব্যাখ্যা/প্রেক্ষাপট (রেফারেন্সসহ, একই টেক্সটে লেখা)
  related_hadith text,   -- সংশ্লিষ্ট হাদীস (রেফারেন্সসহ)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (surah_id, ayah_number)
);

-- ---------- 3. ৯৯ নাম (Phase 3 তে ব্যবহৃত হবে, এখনই বানিয়ে রাখছি) ----------
create table if not exists asma_ul_husna (
  id serial primary key,
  serial_no int unique not null,
  name_arabic text not null,
  name_english text not null,
  name_bengali text not null,
  meaning_bn text,
  significance_bn text
);

-- ---------- 4. হাদীস টপিক (Phase 4) ----------
create table if not exists hadith_topics (
  id uuid primary key default uuid_generate_v4(),
  topic_bn text not null,
  hadith_text_bn text not null,
  reference text not null,
  importance_tag text default 'গুরুত্বপূর্ণ',
  created_at timestamptz default now()
);

-- ---------- 5. নোট / ফাইল (Phase 4) ----------
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  folder text default 'সাধারণ',
  title text not null,
  content text,
  file_url text,
  visibility text default 'admin' check (visibility in ('admin', 'public')),
  created_at timestamptz default now()
);

-- ---------- 6. ফেভারিট (ডিভাইস-ভিত্তিক, কারণ পাবলিক ভিউয়ারদের অ্যাকাউন্ট নেই) ----------
create table if not exists favorites (
  device_id text not null,
  ayah_id uuid references ayahs(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (device_id, ayah_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table app_config enable row level security;
alter table surahs enable row level security;
alter table ayahs enable row level security;
alter table asma_ul_husna enable row level security;
alter table hadith_topics enable row level security;
alter table notes enable row level security;
alter table favorites enable row level security;

-- সবাই পড়তে পারবে
create policy "public read app_config" on app_config for select using (true);
create policy "public read surahs" on surahs for select using (true);
create policy "public read ayahs" on ayahs for select using (true);
create policy "public read asma_ul_husna" on asma_ul_husna for select using (true);
create policy "public read hadith_topics" on hadith_topics for select using (true);
create policy "public read public notes" on notes for select using (visibility = 'public');
create policy "admin read all notes" on notes for select using (
  auth.uid() = (select admin_user_id from app_config)
);

-- শুধু অ্যাডমিন লিখতে/এডিট/ডিলিট করতে পারবে
create policy "admin write surahs" on surahs for all using (
  auth.uid() = (select admin_user_id from app_config)
) with check (
  auth.uid() = (select admin_user_id from app_config)
);
create policy "admin write ayahs" on ayahs for all using (
  auth.uid() = (select admin_user_id from app_config)
) with check (
  auth.uid() = (select admin_user_id from app_config)
);
create policy "admin write asma_ul_husna" on asma_ul_husna for all using (
  auth.uid() = (select admin_user_id from app_config)
) with check (
  auth.uid() = (select admin_user_id from app_config)
);
create policy "admin write hadith_topics" on hadith_topics for all using (
  auth.uid() = (select admin_user_id from app_config)
) with check (
  auth.uid() = (select admin_user_id from app_config)
);
create policy "admin write notes" on notes for all using (
  auth.uid() = (select admin_user_id from app_config)
) with check (
  auth.uid() = (select admin_user_id from app_config)
);

-- Favorites: ডিভাইস-আইডি দিয়ে নিয়ন্ত্রিত, সবাইকে read/write দেয়া (sensitive data না)
create policy "anyone manage favorites" on favorites for all using (true) with check (true);

-- ============================================================
-- Realtime — এই টেবিলগুলোর পরিবর্তন সাথে সাথে সব ডিভাইসে দেখাবে
-- ============================================================
alter publication supabase_realtime add table surahs;
alter publication supabase_realtime add table ayahs;
alter publication supabase_realtime add table asma_ul_husna;
alter publication supabase_realtime add table hadith_topics;
alter publication supabase_realtime add table favorites;

-- ============================================================
-- সিড ডেটা: সূরা আল-ফাতিহা (কাঠামো বোঝার জন্য একটা উদাহরণ)
-- ============================================================
insert into surahs (number, name_arabic, name_bengali, name_english, meaning, total_ayahs)
values (1, 'الفاتحة', 'আল-ফাতিহা', 'Al-Fatiha', 'সূচনা', 7)
on conflict (number) do nothing;
