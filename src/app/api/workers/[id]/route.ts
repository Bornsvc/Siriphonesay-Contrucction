import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/backend/config/database';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


// ดึงข้อมูลคนงานตาม ID
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); 

    const result = await pool.query(
      'SELECT * FROM workers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลคนงาน' }, { status: 404 });
    }
    console.log('👀 worker data from DB:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching worker:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคนงาน' }, { status: 500 });
  }
}

// อัพเดทข้อมูลคนงาน
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const formData = await req.formData();

    const data = {
      first_name: formData.get('first_name') as string,
      middle_name: formData.get('middle_name') as string,
      last_name: formData.get('last_name') as string,
      birth_date: formData.get('birth_date') as string,
      age: Number(formData.get('age')),
      address: formData.get('address') as string,
      phone_number: formData.get('phone_number') as string,
      gender: formData.get('gender') as string,
      position: formData.get('position') as string,
      team_count: Number(formData.get('team_count')),
      participation_count: Number(formData.get('participation_count')),
      rating: Number(formData.get('rating')),
      image_url: null as string | null,
    };

    const imageFile = formData.get('image') as File | null;

    if (imageFile && typeof imageFile === 'object') {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
    
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
    
      const filename = `worker_${Date.now()}_${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
    
      data.image_url = `/uploads/${filename}`;
    }

    const values = [
      data.first_name,
      data.middle_name,
      data.last_name,
      data.birth_date,
      data.age,
      data.address || null,
      data.phone_number,
      'General Worker',
      data.gender,
      data.position,
      data.team_count || 0,
      data.participation_count || 0,
      data.rating || 1,
      data.image_url,
      id
    ];

    const result = await pool.query(
      `UPDATE workers SET 
        first_name = $1, middle_name = $2, last_name = $3, 
        birth_date = $4, age = $5, address = $6, 
        phone_number = $7, purpose = $8, gender = $9, 
        position = $10, team_count = $11, participation_count = $12, 
        rating = $13, image_url = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 
      RETURNING *`,
      values
    );

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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await pool.query(
      'DELETE FROM workers WHERE id = $1 RETURNING *',
      [params.id]
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