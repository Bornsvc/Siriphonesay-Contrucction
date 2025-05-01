import { NextResponse } from 'next/server';
import { pool } from '@/backend/config/database';

// ดึงข้อมูลคนงานทั้งหมด GET and search
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

