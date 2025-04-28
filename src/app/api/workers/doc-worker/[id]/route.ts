import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadDocWorkerImage } from '@/lib/supabase';

const supabase = createClient(
  process.env.SUPABASEURL!,
  process.env.SUPABASEANONKEY!
);


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Missing worker ID' }, { status: 400 });
    }

    // สร้างชนิดของ documents
    type DocumentsMap = {
      idCard: string[];
      passport: string[];
      familyBook: string[];
      other: string[];
    };


   // ดึงข้อมูลจาก Supabase
    const { data, error } = await supabase
    .from('worker_documents')
    .select('*')
    .eq('worker_id', id); // ค้นหาตาม worker_id

    if (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching documents' }, { status: 500 });
    }

    // เตรียมเอกสารเป็นประเภทที่เราอยากให้
    const documents: DocumentsMap = {
    idCard: [],
    passport: [],
    familyBook: [],
    other: []
    };

    // ตรวจสอบว่าข้อมูลมีหรือไม่
    if (data && Array.isArray(data)) {
    data.forEach((doc) => {
      // เพิ่มการตรวจสอบว่า doc.type เป็น key ของ DocumentsMap หรือไม่
      if (doc.type in documents) {
        // ใช้ type assertion เพื่อบอก TypeScript ว่า doc.type เป็น keyof DocumentsMap
        documents[doc.type as keyof DocumentsMap].push(doc.image_url);
      }
    });
    }

    // ส่งกลับข้อมูล
    return NextResponse.json(documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Error fetching documents' }, { status: 500 });
      }
    }

    export async function POST(req: NextRequest) {
      try {
        const url = new URL(req.url);
        const workerId = url.pathname.split('/').pop(); // รับ ID จาก URL
        console.log("workerId>>>", workerId)
        
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];
    
        if (!workerId || !files.length) {
          return NextResponse.json({ error: "Worker ID or files are missing" }, { status: 400 });
        }
    
        // อัปโหลดไฟล์ไปยัง Supabase และเก็บ URL
        const uploadPromises = files.map(async (file) => {
          try {
            const imageUrl = await uploadDocWorkerImage(file);
            
            // เก็บข้อมูลในฐานข้อมูล (เช่น worker_documents table)
            const { error } = await supabase
              .from('worker_documents')
              .insert({
                worker_id: workerId,
                image_url: imageUrl,
                created_at: new Date().toISOString()
              });
    
            if (error) throw error;
            return imageUrl;
          } catch (error) {
            console.error('Error processing file:', error);
            return null;
          }
        });
    
        // รอให้ไฟล์ทั้งหมดอัปโหลดเสร็จ
        const uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
    
        // ส่งข้อมูลที่อัปโหลดกลับไปยัง Frontend
        return NextResponse.json({ message: 'Files uploaded successfully', urls: uploadedUrls });
      } catch (error) {
        console.error('Error uploading documents:', error);
        return NextResponse.json({ error: 'Error uploading documents' }, { status: 500 });
      }
    }

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const workerId = url.pathname.split('/').pop();
    const { type, imageUrl } = await req.json();

    // Get the filename from the URL
    const filename = imageUrl.split('/').pop()?.split('?')[0];

    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('doc-worker')
      .remove([filename]);

    if (storageError) throw storageError;

    // Delete from Supabase database
    const { error: dbError } = await supabase
      .from('worker_documents')
      .delete()
      .eq('worker_id', workerId)
      .eq('type', type)
      .eq('image_url', imageUrl);

    if (dbError) throw dbError;

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Error deleting document' }, { status: 500 });
  }
}