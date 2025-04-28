import { pool } from '@/backend/config/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM workers'); 
        // ดึงข้อมูลทั้งหมดจาก table workers
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching workers:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคนงาน' }, { status: 500 });
    }
}
