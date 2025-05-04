import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { pool } from '@/backend/config/database'; 

// 🌤️ ตั้งค่า Cloudinary To post new worker and Edit worker
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function uploadImage(file: File): Promise<string> {
    const arrayBuffer = await new Response(file).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
  
    const result = await cloudinary.uploader.upload(base64, {
      folder: "workers",
    });
  
    return result.secure_url;
  }

  // const listAssetsInFolder = async (folder: string) => {
  //   const result = await cloudinary.api.resources({
  //     type: 'upload',
  //     prefix: folder, // This specifies the folder
  //     max_results: 500, // Maximum number of results (increase if needed)
  //   });
  //   return result.resources;
  // };

  // const deleteAssetsInFolder = async (folder: string) => {
  //   const assets = await listAssetsInFolder(folder);
  
  //   for (const asset of assets) {
  //     const public_id = asset.public_id;
  //     const result = await cloudinary.uploader.destroy(public_id);
  
  //     if (result.result !== 'ok') {
  //       console.log(`Failed to delete image with public_id: ${public_id}`);
  //     } else {
  //       console.log(`Deleted image with public_id: ${public_id}`);
  //     }
  //   }
  // };

export async function POST(req: NextRequest) {
    
  try {
    const formData = await req.formData();

    // 🔸 ดึงไฟล์ภาพ
    const imageFile = formData.get("image") as File | null;
    let image_url = null;

    // 📤 อัปโหลดรูปไป Cloudinary (ถ้ามี)
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64, {
        folder: `workers/${formData.get("id")}`,
      });

      image_url = uploadResult.secure_url;
    }
    const rawBirthDate = formData.get('birth_date');
    const birthDate = rawBirthDate === "" ? null : rawBirthDate;
    // 📦 เตรียมข้อมูลเพื่อ insert
    const values = [
      formData.get('id'),
      formData.get('first_name'),
      formData.get('middle_name'),
      formData.get('last_name'),
      birthDate,
      formData.get('age'),
      formData.get('address'),
      formData.get('phone_number'),
      formData.get('purpose'),
      formData.get('gender'),
      formData.get('position'),
      formData.get('team_count') || 0,
      formData.get('participation_count') || 0,
      formData.get('rating') || 5,
      image_url,
      formData.get('status'),
      formData.get('field'),
    ];

    // 💾 เพิ่มข้อมูลลง PostgreSQL
    const result = await pool.query(
      `INSERT INTO workers (
        id, first_name, middle_name, last_name, birth_date, 
        age, address, phone_number, purpose, gender, 
        position, team_count, participation_count, rating, image_url,
        status, field
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      values
    );

    return NextResponse.json({
      message: "เพิ่มข้อมูลสำเร็จ ✅",
      worker: result.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return NextResponse.json({ error: "ไม่สามารถเพิ่มข้อมูลได้" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
     const formData = await req.formData();
     const id = formData.get('id') as string; 
      if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
      }
  
      const imageFile = formData.get("image") as File | null;
  
      const data = {
        first_name: formData.get("first_name") as string,
        middle_name: formData.get("middle_name") as string,
        last_name: formData.get("last_name") as string,
        birth_date: formData.get("birth_date") as string,
        age: Number(formData.get("age")),
        address: formData.get("address") as string,
        phone_number: formData.get("phone_number") as string,
        purpose: formData.get("purpose") as string,
        gender: formData.get("gender") as string,
        position: formData.get("position") as string,
        team_count: Number(formData.get("team_count")),
        participation_count: Number(formData.get("participation_count")),
        rating: Number(formData.get("rating")),
        status: formData.get("status") as string,
        field: formData.get("field") as string,
      };
  
      let image_url: string | null = null;
  
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }
  
      // 🔁 ตั้งค่าชุด SQL และ values
      const columns = [
        "first_name",
        "middle_name",
        "last_name",
        "birth_date",
        "age",
        "address",
        "phone_number",
        "purpose",
        "gender",
        "position",
        "team_count",
        "participation_count",
        "rating",
        "status",
        "field",
      ];
  
      const values = [
        data.first_name,
        data.middle_name,
        data.last_name,
        data.birth_date,
        data.age,
        data.address,
        data.phone_number,
        data.purpose,
        data.gender,
        data.position,
        data.team_count || 0,
        data.participation_count || 0,
        data.rating || 5,
        data.status,
        data.field,
      ];
  
      if (image_url) {
        columns.push("image_url");
        values.push(image_url);
      }
  
      values.push(id);
  
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
  
      const query = `
        UPDATE workers 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING *;
      `;
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูลคนงาน" }, { status: 404 });
      }
  
      return NextResponse.json(result.rows[0], { status: 200 });
  
    } catch (error) {
      console.error("Error updating worker:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพเดตข้อมูลคนงาน" }, { status: 500 });
    }
  }

  export async function DELETE(req: Request) {
    try {
      const body = await req.json();
      const id = body.id;
      const folder = `workers/${id}`;
  
      if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
      }
      
      await cloudinary.api.delete_resources_by_prefix(folder);

      await cloudinary.api.delete_folder(folder);
  
      return NextResponse.json({ message: `Folder "${folder}" deleted successfully` });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
    }
  }
