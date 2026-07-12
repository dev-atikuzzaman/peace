-- ============================================================
-- নোট/ফাইল ফিচারের জন্য Supabase Storage সেটআপ (Phase 4)
-- SQL Editor এ এই পুরো ফাইলটা রান করো (schema.sql এর পরে, একবারই)
-- ============================================================

-- প্রাইভেট বাকেট — ফাইল সরাসরি পাবলিকলি ব্রাউজযোগ্য নয়,
-- শুধু সাইনড URL দিয়েই অ্যাক্সেস করা যাবে (নিচের পলিসি অনুযায়ী)
insert into storage.buckets (id, name, public)
values ('notes-files', 'notes-files', false)
on conflict (id) do nothing;

-- "public/..." ফোল্ডারে থাকা ফাইল সবাই পড়তে (সাইনড URL বানাতে) পারবে
create policy "read public-folder files" on storage.objects for select
  using (bucket_id = 'notes-files' and (storage.foldername(name))[1] = 'public');

-- বাকি সব (private/...) শুধু অ্যাডমিন পড়তে পারবে
create policy "admin read all files" on storage.objects for select
  using (bucket_id = 'notes-files' and auth.uid() = (select admin_user_id from app_config));

create policy "admin upload files" on storage.objects for insert
  with check (bucket_id = 'notes-files' and auth.uid() = (select admin_user_id from app_config));

create policy "admin delete files" on storage.objects for delete
  using (bucket_id = 'notes-files' and auth.uid() = (select admin_user_id from app_config));
