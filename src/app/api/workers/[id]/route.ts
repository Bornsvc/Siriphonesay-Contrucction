import { NextResponse } from 'next/server';
import { pool } from '@/backend/config/database';

// ดึงข้อมูลคนงานตาม ID just for get one worker and delete
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