import { v2 as cloudinary, UploadApiResponse } from'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });


  export async function POST(req: NextResponse) {
    try {
      const formData = await req.formData();
      const file = formData.get('file'); // สมมติ field ชื่อ file
        if(!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'your_folder_name' },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Unknown error'));
          }
        ).end(buffer);
      });
  
      return NextResponse.json({ url: result.secure_url });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  }