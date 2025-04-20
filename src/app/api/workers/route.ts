import { NextResponse } from 'next/server';
import { pool } from '@/backend/config/database';
import { writeFile } from 'fs/promises';
import path from 'path';

// ดึงข้อมูลคนงานทั้งหมด
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10; // 10 workers per page
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await pool.query('SELECT COUNT(*) FROM workers');
    const totalWorkers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalWorkers / limit);

    // Get paginated workers
    const result = await pool.query(
      'SELECT * FROM workers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

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
    
    // Improved ID generation query with NULLIF and COALESCE
    const idResult = await pool.query(`
      SELECT COALESCE(
        MAX(
          CAST(
            NULLIF(
              REGEXP_REPLACE(id, '\\D', '', 'g'),
              ''
            ) AS INTEGER
          )
        ),
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
      
      // Create unique filename
      const filename = `worker_${Date.now()}_${imageFile.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadDir, filename);
      
      // Save file
      await writeFile(filePath, buffer);
      image_url = `/uploads/${filename}`;
    }

    const values = [
      newId,  // Use generated ID instead of form data
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
      image_url  // Use the saved image URL
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