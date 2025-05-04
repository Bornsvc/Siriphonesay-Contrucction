'use client';

import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import RenderImageSection from '@/app/components/RenderImageSection';
import Loding from '@/app/components/loding';
import ConfirmDeleteModal from '@/app/components/ConfirmDeleteModal';

interface ImageColumns {
  column1: File[];
  column2: File[];
  column3: File[];
}

// ฟังก์ชันย่อยสำหรับเรนเดอร์ Section ของแต่ละ column
// const renderImageSection = (
//   column: keyof ImageColumns,
//   title: string,
//   images: ImageColumns,
//   docImage: ImageColumns,
//   handleImageUpload: (column: keyof ImageColumns, e: React.ChangeEvent<HTMLInputElement>) => void,
//   handleImageClick: (img: string) => void,
//   handleDeleteClick: (url: string) => void
// ) => (
//   <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
//     <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto p-2">
//         {(docImage[column] || []).map((Doc, index) => (
//           <div
//             key={`doc-${index}`}
//             className="relative aspect-square group overflow-hidden rounded-lg"
//             onClick={() => handleImageClick(Doc)}
//           >
//             <Image
//               src={Doc.startsWith('http') ? Doc : `/uploads/${Doc}`} 
//               alt={`Document`}
//               fill
//               className="object-cover transition-transform relative duration-200 group-hover:scale-105"
//             />

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDeleteClick(Doc); // ✅ แทนที่ handleDelete โดยตรง
//               }}
//               className="absolute flex justify-center items-center top-0 w-auto h-8 cursor-pointer aspect-square right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//             >
//               <span>x</span>
//             </button>

//           </div>
//         ))}
//         {images[column].map((img, index) => (
//           <div
//             key={`img-${index}`}
//             className="relative aspect-square group overflow-hidden rounded-lg"
//             onClick={() => handleImageClick(img)}
//           >
//             <Image
//               src={img}
//               alt={`${title} ${index + 1}`}
//               fill
//               className="object-cover transition-transform duration-200 group-hover:scale-105"
//             />
//           </div>
//         ))}
//         <div className="relative w-full aspect-square">
//           <label className="absolute inset-0 flex flex-col items-center justify-center 
//                             cursor-pointer rounded-lg border-2 border-dashed w-full 
//                             border-gray-300 hover:border-amber-500 transition-colors duration-200"
//           >
//             <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//             </svg>
//             <span className="mt-2 text-sm text-gray-500">ເພີ່ມຮູບພາບ</span>
//             <input
//               type="file"
//               className="hidden"
//               onChange={(e) => handleImageUpload(column, e)}
//               accept="image/*"
//               multiple
//             />
//           </label>
//         </div>
//       </div>
//       <div className="text-sm text-gray-500 text-center w-full">
//         ຈຳນວນຮູບພາບ: {images[column].length}
//       </div>
//     </div>
//   </div>
// );

function Page() {
  const [images, setImages] = useState<ImageColumns>({
    column1: [],
    column2: [],
    column3: [],
  });

  const [docImg, setDocImg] = useState<ImageColumns>({
    column1: [],
    column2: [],
    column3: [],
  })

  // const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLOading] = useState<boolean>(false);
  const params = useParams();
  const workerId = params.id as string | undefined;
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const handleImageUpload = async (
    column: keyof ImageColumns,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
  
    const filesArray = Array.from(e.target.files);
    const formData = new FormData();
  
    filesArray.forEach((file) => {
      formData.append("files", file); // ต้องใช้ชื่อเดียวกับใน API
    });
    formData.append("column", column); // ส่ง column เช่น column1
  
    try {
      const res = await axios.post(`/api/workers/doc-worker/${workerId}`, formData);
      const uploadedUrls = res.data.urls; // จาก API
      console.log(uploadedUrls)
  
      // ถ้าอยากเก็บไว้ใน state ก็เพิ่มได้แบบนี้:
      setImages((prev) => ({
        ...prev,
        [column]: [...prev[column], ...filesArray],
      }));
  
    } catch (error) {
      console.error("Upload failed:", error);
      alert("อัปโหลดไม่สำเร็จ");
    }
  };

  useEffect(() => {
    console.log("Updated images >>>", images);
    console.log("imageToDelete>>>", imageToDelete)
  }, [images, imageToDelete]);

  useEffect(() => {
    const fetchDocImage = async () => {
      try {
        setIsLOading(true);
        const response = await axios.get(`/api/workers/doc-worker/${workerId}`);
        console.log('RESPONSE:', response.data); 

        const data = response.data;

        setDocImg({
          column1: data.column1 || [],
          column2: data.column2 || [],
          column3: data.column3 || [],
        });
      } catch (error) {
        console.error("Error fetching document images:", error);
      } finally {
        setIsLOading(false);
      }
    };

    fetchDocImage();
  }, [workerId]);

  const handleclickdelete = (url: string) => {
    setImageToDelete(url);
    setConfirmDelete(true)
  };

  // const handleDelete = async (url: string) => {
  //   setIsLOading(true)
  //   try {
  //     const response = await fetch(`/api/workers/doc-worker/${id}`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ url }), // 💡 ต้องส่ง publicId ที่จะลบ
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       setIsLOading(false)
  //       window.location.reload(); // หรือ setState เพื่อลบรูปออกจาก UI
  //     } else {
  //       alert(result.error || "ລຶບຮູບບໍ່ສຳເລັດ");
  //     }
  //   } catch (error) {
  //     console.error("Delete error:", error);
  //     alert("ມີຂໍ້ຜິດພາດໃນການລຶບຮູບ");
  //   }
  // };

  const handleconfirmDelete = async(url: string) => {
    setIsLOading(true)
    try {
      const response = await fetch(`/api/workers/doc-worker/${workerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }), // 💡 ต้องส่ง publicId ที่จะลบ
      });

      const result = await response.json();

      if (response.ok) {
        setIsLOading(false)
        window.location.reload(); // หรือ setState เพื่อลบรูปออกจาก UI
      } else {
        alert(result.error || "ລຶບຮູບບໍ່ສຳເລັດ");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("ມີຂໍ້ຜິດພາດໃນການລຶບຮູບ");
    }
  }

  return (
    <div className="w-full min-h-[100vh] bg-gray-50 p-6">
      <Link href="/" className="text-blue-600 hover:text-blue-800">
        Back to Home
      </Link>
      {isLoading ? <Loding /> : null}
      <h1 className="text-3xl font-bold text-center mb-8">ເອກະສານ</h1>

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RenderImageSection
          title="ໃບສັນຍາ"
          column="column1"
          images={images["column1"]} 
          onChange={handleImageUpload}
          onRemove={handleclickdelete}
          docImg={docImg["column1"]}
        />
        <RenderImageSection
          title="ພາບໜ້າງານ"
          column="column2" 
          images={images["column2"]} 
          onChange={handleImageUpload}
          onRemove={handleclickdelete}
          docImg={docImg["column2"]}
        />
        <RenderImageSection
          title="ໃບແຈ້ງການໂອນ"
          column="column3"
          images={images["column3"]} 
          onChange={handleImageUpload}
          onRemove={handleclickdelete}
          docImg={docImg["column3"]}
        />
      </div>


      {confirmDelete && imageToDelete && (
        <ConfirmDeleteModal
          show={confirmDelete}
          onClose={() => {
            setConfirmDelete(false);
            setImageToDelete(null); // reset
          }}
          onConfirm={() => {
            handleconfirmDelete(imageToDelete); // ✅ เรียกฟังก์ชันลบจริง
            setConfirmDelete(false);
            setImageToDelete(null);
          }}
        />
      )}

    </div>
  );
}

export default Page;
