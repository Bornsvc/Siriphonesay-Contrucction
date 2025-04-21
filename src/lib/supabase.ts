import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASEURL!,
  process.env.SUPABASEANONKEY!
);

export async function uploadImage(file: File) {
  const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
  const filename = `worker_${Date.now()}_${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from('workers') // bucket name
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('workers')
    .getPublicUrl(filename);

  return publicUrl;
}
