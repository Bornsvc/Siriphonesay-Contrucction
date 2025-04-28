import { NextResponse } from 'next/server';
import { pool } from '@/backend/config/database';
import { uploadImage } from '@/lib/supabase';


// ดึงข้อมูลคนงานตาม ID
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ไม่พบ ID คนงานใน URL' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT * FROM workers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลคนงาน' }, { status: 404 });
    }

    const worker = result.rows[0];
    console.log('👀 worker data from DB:', worker);

    // เช็กว่า image URL ใช้ได้มั้ย
    if (!worker.image || !worker.image.startsWith('http')) {
      worker.image = null; // หรือ default image
    }

    return NextResponse.json(worker, { status: 200 });
  } catch (error) {
    console.error('Error fetching worker:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคนงาน' }, { status: 500 });
  }
}


// อัพเดทข้อมูลคนงาน
export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).pathname.split('/').pop();
    const formData = await req.formData();

    const data = {
      first_name: formData.get('first_name') as string,
      middle_name: formData.get('middle_name') as string,
      last_name: formData.get('last_name') as string,
      birth_date: formData.get('birth_date') as string,
      age: Number(formData.get('age')),
      address: formData.get('address') as string,
      phone_number: formData.get('phone_number') as string,
      purpose: formData.get('purpose') as string,
      gender: formData.get('gender') as string,
      position: formData.get('position') as string,
      team_count: Number(formData.get('team_count')),
      participation_count: Number(formData.get('participation_count')),
      rating: Number(formData.get('rating')),
      image_url: null as string | null,
      status: formData.get('status') as string,
      field: formData.get('field') as string,
    };

    const imageFile = formData.get('image') as File | null;
    if (imageFile) {
      data.image_url = await uploadImage(imageFile);
    }

    const hasNewImage = Boolean(data.image_url);

    const query = `
      UPDATE workers SET 
        first_name = $1, 
        middle_name = $2, 
        last_name = $3, 
        birth_date = $4, 
        age = $5, 
        address = $6, 
        phone_number = $7, 
        purpose = $8, 
        gender = $9, 
        position = $10, 
        team_count = $11, 
        participation_count = $12, 
        rating = $13, 
        ${hasNewImage ? 'image_url = $14,' : ''}
        updated_at = CURRENT_TIMESTAMP,
        status = ${hasNewImage ? '$16' : '$15'},
        field = ${hasNewImage ? '$17' : '$16'}
      WHERE id = ${hasNewImage ? '$15' : '$14'}
      RETURNING *
    `;

    const values = hasNewImage
      ? [
          data.first_name,
          data.middle_name,
          data.last_name,
          data.birth_date,
          data.age,
          data.address || null,
          data.phone_number,
          data.purpose,
          data.gender,
          data.position,
          data.team_count || 0,
          data.participation_count || 0,
          data.rating || 1,
          data.image_url,
          id,
          data.status,
          data.field,
        ]
      : [
          data.first_name,
          data.middle_name,
          data.last_name,
          data.birth_date,
          data.age,
          data.address || null,
          data.phone_number,
          data.purpose,
          data.gender,
          data.position,
          data.team_count || 0,
          data.participation_count || 0,
          data.rating || 1,
          id,
          data.status,
          data.field,
        ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลคนงาน' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลคนงาน' }, { status: 500 });
  }
}



// ลบข้อมูลคนงาน
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM workers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลคนงาน' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบข้อมูลคนงานเรียบร้อยแล้ว' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลคนงาน' }, { status: 500 });
  }
}