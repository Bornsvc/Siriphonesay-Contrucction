import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASEURL!,
  process.env.SUPABASEANONKEY!
);

export async function uploadImage(file: File) {
  const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
  const filename = `worker_${Date.now()}_${cleanFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('workers')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;
    console.log('Uploaded successfully:', data);

    const { publicUrl} = supabase.storage
      .from('workers')
      .getPublicUrl(filename).data;

    if (!publicUrl) throw new Error("Failed to get public URL");

    return publicUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error; // หรือคุณสามารถแสดงผลใน UI ตามต้องการ
  }
}

export async function uploadDocWorkerImage(file: File) {
  const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
  const filename = `doc-worker_${Date.now()}_${cleanFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('doc-worker') // ระบุ Bucket ที่จะอัปโหลด
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      console.log(data)
    if (error) throw error;
    const { publicUrl } = supabase.storage
      .from('doc-worker')
      .getPublicUrl(filename).data;

    if (!publicUrl) throw new Error("Failed to get public URL");

    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
