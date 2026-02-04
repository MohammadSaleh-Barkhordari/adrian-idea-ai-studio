-- Drop old policies tied to user_id folder structure
drop policy if exists "Users can view their own project documents" on storage.objects;
drop policy if exists "Users can upload documents to their projects" on storage.objects;
drop policy if exists "Users can update their own project documents" on storage.objects;
drop policy if exists "Users can delete their own project documents" on storage.objects;

-- New project-based policies for Documents bucket
create policy "View documents for owned projects"
on storage.objects for select
using (
  bucket_id = 'Documents'
  and exists (
    select 1
    from public.adrian_projects p
    where p.project_name = (storage.foldername(name))[1]
      and p.user_id = auth.uid()
  )
);

create policy "Upload documents for owned projects"
on storage.objects for insert
with check (
  bucket_id = 'Documents'
  and exists (
    select 1
    from public.adrian_projects p
    where p.project_name = (storage.foldername(name))[1]
      and p.user_id = auth.uid()
  )
);

create policy "Update documents for owned projects"
on storage.objects for update
using (
  bucket_id = 'Documents'
  and exists (
    select 1
    from public.adrian_projects p
    where p.project_name = (storage.foldername(name))[1]
      and p.user_id = auth.uid()
  )
);

create policy "Delete documents for owned projects"
on storage.objects for delete
using (
  bucket_id = 'Documents'
  and exists (
    select 1
    from public.adrian_projects p
    where p.project_name = (storage.foldername(name))[1]
      and p.user_id = auth.uid()
  )
);