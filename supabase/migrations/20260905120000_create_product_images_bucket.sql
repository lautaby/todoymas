/*
# Storage bucket for product images

1. New Storage Bucket
- `product-images`: public bucket for product photos uploaded from the admin panel
  (camera, gallery, or manual upload). Files are served via public URLs.

2. Security (RLS on storage.objects)
- SELECT (view/download): public (anon + authenticated) — needed so product photos
  render on the public storefront.
- INSERT/UPDATE/DELETE: authenticated only — only logged-in admin/empleado users
  can upload, replace, or remove product photos.

3. Notes
- Run this once against your Supabase project (SQL Editor, or via the Supabase CLI
  migrations flow) if the bucket doesn't already exist.
- File size/type limits are also enforced client-side in the admin upload widget,
  but the bucket config below caps uploads at 5MB and image mime types only.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_select_product_images" ON storage.objects;
CREATE POLICY "public_select_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "authenticated_insert_product_images" ON storage.objects;
CREATE POLICY "authenticated_insert_product_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "authenticated_update_product_images" ON storage.objects;
CREATE POLICY "authenticated_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "authenticated_delete_product_images" ON storage.objects;
CREATE POLICY "authenticated_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images');
