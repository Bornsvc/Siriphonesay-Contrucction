export const runtime = 'nodejs';

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
  function extractPublicId(url: string): string {
    const parts = url.split('/');
    // Helper function to extract the publicId
    // Assuming your URL format is like:
    // https://res.cloudinary.com/demo/image/upload/v1710000000/workers/W0003/column1/filename.jpg
    // Extract the part after `workers/`, which is `W0003/column1/filename`
    
    const workerId = parts[parts.length - 3];
    const column = parts[parts.length - 2];
    const fileNameWithExtension = parts.pop(); // filename.jpg
    const fileName = fileNameWithExtension?.split('.')[0];
  
    return `workers/${workerId}/${column}/${fileName}`;
  }
  
  
  
  export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const workerId = url.pathname.split('/')[4]; // Extract the workerId (W0003)
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const column = formData.get('column') as string;
  
    // Validate column value
    if (!column || !['column1', 'column2', 'column3'].includes(column)) {
      return NextResponse.json({ error: 'Invalid column specified' }, { status: 400 });
    }
  
    const uploadedUrls: string[] = [];
  
    // Upload files to Cloudinary
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
  
      try {
        const uploadResult = await new Promise<CloudinaryResource>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `workers/${workerId}/${column}` },
            (err, result) => {
              if (err) reject(err);
              else if (result) resolve(result);
              else reject(new Error('No result'));
            }
          );
          stream.end(buffer);
        });
  
        uploadedUrls.push(uploadResult.secure_url);
      } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }
  
    return NextResponse.json({ urls: uploadedUrls });
  }
  
  export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const workerId = url.pathname.split('/')[4]; // Extract the workerId (e.g., W0003)
  
    try {
      // Fetch images for each column in parallel
      const [res1, res2, res3] = await Promise.all([
        cloudinary.search.expression(`folder:workers/${workerId}/column1`)
          .sort_by('created_at', 'desc')
          .max_results(100)
          .execute(),
        cloudinary.search.expression(`folder:workers/${workerId}/column2`)
          .sort_by('created_at', 'desc')
          .max_results(100)
          .execute(),
        cloudinary.search.expression(`folder:workers/${workerId}/column3`)
          .sort_by('created_at', 'desc')
          .max_results(100)
          .execute(),
      ]);
  
      // Extract secure URLs from each result
      const column1 = res1.resources.map((r: CloudinaryResource) => r.secure_url);
      const column2 = res2.resources.map((r: CloudinaryResource) => r.secure_url);
      const column3 = res3.resources.map((r: CloudinaryResource) => r.secure_url);
  
      // Return the results as a JSON response
      return NextResponse.json({ column1, column2, column3 });
    } catch (error) {
      console.error('Fetch Cloudinary images error:', error);
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
  }
  
  export async function DELETE(req: NextRequest) {
    try {
      const body = await req.json();
      const { url } = body;
  
      if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'A valid image URL string is required' }, { status: 400 });
      }
  
      const publicId = extractPublicId(url);
      console.log("Deleting publicId:", publicId);
  
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary result:", result);
  
      if (result.result === 'ok' || result.result === 'not found') {
        return NextResponse.json({ message: 'Image deleted successfully (or already deleted)' });
      } else {
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
  }
  
  
