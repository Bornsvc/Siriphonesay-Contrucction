import { NextResponse } from 'next/server';
import { pool } from '@/backend/config/database';
import { supabase } from '@/lib/supabase';

// ดึงข้อมูลคนงานทั้งหมด
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1'); // หน้าเริ่มต้น
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = searchParams.get('search')?.trim() || ''; // คำที่ใช้ค้นหา
    const searchQuery = `%${search}%`;

    // สร้าง query สำหรับนับจำนวนรวมของข้อมูล (ใช้ search ด้วยถ้ามี)
    let countQuery = 'SELECT COUNT(*) FROM workers';
    let dataQuery = 'SELECT * FROM workers';
    const values = [];

    if (search) {
      countQuery += `
        WHERE position ILIKE $1
        OR first_name ILIKE $1
        OR last_name ILIKE $1
        OR CAST(phone_number AS TEXT) ILIKE $1
        OR CAST(participation_count AS TEXT) ILIKE $1`;
    
      dataQuery += `
        WHERE position ILIKE $1
        OR first_name ILIKE $1
        OR last_name ILIKE $1
        OR CAST(phone_number AS TEXT) ILIKE $1
        OR CAST(participation_count AS TEXT) ILIKE $1`;
    
      values.push(searchQuery);
    }
    

    // เพิ่ม ORDER BY และ pagination (LIMIT + OFFSET)
    dataQuery += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // ดึงข้อมูล count (จำนวนทั้งหมด)
    const countResult = await pool.query(countQuery, search ? [searchQuery] : []);
    const totalWorkers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalWorkers / limit);

    // ดึงข้อมูล workers ตามหน้าและคำค้นหา
    const result = await pool.query(dataQuery, values);

    return NextResponse.json({
      workers: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalWorkers,
        workersPerPage: limit
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคนงาน' }, { status: 500 });
  }
}

// เพิ่มคนงานใหม่
export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const idResult = await pool.query(`
      SELECT COALESCE(
        MAX(CAST(NULLIF(REGEXP_REPLACE(id, '\\D', '', 'g'), '') AS INTEGER)),
        0
      ) as max_id 
      FROM workers
    `);
    const lastId = idResult.rows[0].max_id;
    const newId = `W${String(lastId + 1).padStart(4, '0')}`;

    const imageFile = data.get('image') as File | null;
    let image_url = null;

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const cleanFileName = imageFile.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
      const filename = `worker_${Date.now()}_${cleanFileName}`;

      const { data: uploaded, error: uploadError } = await supabase
        .storage
        .from('workers') // 👈 ต้องมี bucket ชื่อว่า 'workers' ใน Supabase Storage
        .upload(filename, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('workers')
        .getPublicUrl(uploaded.path);

      image_url = urlData.publicUrl;
    }

    const values = [
      newId,
      data.get('first_name'),
      data.get('middle_name'),
      data.get('last_name'),
      data.get('birth_date'),
      data.get('age'),
      data.get('address'),
      data.get('phone_number'),
      data.get('purpose'),
      data.get('gender'),
      data.get('position'),
      data.get('team_count') || 0,
      data.get('participation_count') || 0,
      data.get('rating') || 5,
      image_url,
    ];

    const result = await pool.query(
      `INSERT INTO workers (
        id, first_name, middle_name, last_name, birth_date, 
        age, address, phone_number, purpose, gender, 
        position, team_count, participation_count, rating, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลคนงาน' }, { status: 500 });
  }
}