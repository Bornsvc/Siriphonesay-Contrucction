import { NextResponse, NextRequest } from 'next/server';
// import { uploadDocWorkerImage } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';


type CloudinaryResource = {
  secure_url: string;
};


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  
  export async function POST(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ) {
    const id = params.id;  // ← ตรงนี้ปกติเลย ไม่ต้อง await
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
  
    const uploadedUrls: string[] = [];
  
    for (const file of files) {
      if (!(file instanceof File)) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
  
      const uploadResult = await new Promise<CloudinaryResource>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `workers/${id}` },
          (err, result) => {
            if (err) reject(err);
            else if (result) resolve(result);
            else reject(new Error('No result'));
          }
        );
        stream.end(buffer);
      });
  
      uploadedUrls.push(uploadResult.secure_url);
    }
  
    return NextResponse.json({ urls: uploadedUrls });
  }
  

  export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const { id } = params;
  
    try {
      // กำหนด type ให้ searchResult ชัดเจน
      const result = await cloudinary.search
        .expression(`folder:workers/${id}`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();
  
        // console.log("result>>>>>>>",result);
      // resources.map ก็จะรู้ว่า r.secure_url มีจริง
      const urls = result.resources.map((r: CloudinaryResource) => r.secure_url);
       // สมมุติ: เราแบ่ง array เป็น 3 column
      const chunkSize = Math.ceil(urls.length / 3);
      const column1 = urls.slice(0, chunkSize);
      const column2 = urls.slice(chunkSize, chunkSize * 2);
      const column3 = urls.slice(chunkSize * 2);

      return NextResponse.json({ column1, column2, column3 });

    } catch (error) {
      console.error('Fetch Cloudinary images error:', error);
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
  }
  
  export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string, publicId: string } } // You can pass the public ID to delete
  ) {
    const { id, publicId } = params;
  
    try {
      // Make sure the publicId is valid
      if (!publicId) {
        return NextResponse.json({ error: 'Public ID is required for deletion' }, { status: 400 });
      }
  
      // Call Cloudinary's destroy API
      const result = await cloudinary.uploader.destroy(publicId, {
        folder: `workers/${id}`,
      });
  
      if (result.result === 'ok') {
        return NextResponse.json({ message: 'Image deleted successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
  }