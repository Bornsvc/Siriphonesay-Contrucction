'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import Loding from '@/app/components/loding';

// ประเภทข้อมูลที่ใช้
interface ImageColumns {
  column1: string[];
  column2: string[];
  column3: string[];
}

// ฟังก์ชันย่อยสำหรับเรนเดอร์ Section ของแต่ละ column
const renderImageSection = (
  column: keyof ImageColumns,
  title: string,
  images: ImageColumns,
  docImage: ImageColumns,
  handleImageUpload: (column: keyof ImageColumns, e: React.ChangeEvent<HTMLInputElement>) => void,
  handleImageClick: (img: string) => void,
) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto p-2">
        {(docImage[column] || []).map((Doc, index) => {
        return (
          <div
            key={`doc-${index}`}
            className="relative aspect-square group overflow-hidden rounded-lg"
            onClick={() => handleImageClick(Doc)}
          >
            <Image
               src={Doc.startsWith('http') ? Doc : `/uploads/${Doc}`} 
              alt={`Document`}
              fill
              className="object-cover transition-transform relative duration-200 group-hover:scale-105"
            />

            <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering image click event
                  // handleDelete(Doc); // Call the delete handler function
                }}
                className="absolute flex justify-center items-center top-0 w-auto h-8 cursor-pointer aspect-square right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <span>x</span>
            </button>
          </div>
        ) 
        })}
        {images[column].map((img, index) => (
          <div
            key={`img-${index}`}
            className="relative aspect-square group overflow-hidden rounded-lg"
            onClick={() => handleImageClick(img)}
          >
            <Image
              src={img}
              alt={`${title} ${index + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        ))}
        <div className="relative w-full aspect-square">
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 border-dashed w-full border-gray-300 hover:border-amber-500 transition-colors duration-200">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-2 text-sm text-gray-500">ເພີ່ມຮູບພາບ</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleImageUpload(column, e)}
              accept="image/*"
              multiple
            />
          </label>
        </div>
      </div>
      <div className="text-sm text-gray-500 text-center w-full">
        ຈຳນວນຮູບພາບ: {images[column].length}
      </div>
    </div>
  </div>
);

function Page() {
  const [images, setImages] = useState<ImageColumns>({
    column1: [],
    column2: [],
    column3: [],
  });
  const [realFiles, setRealFiles] = useState<File[]>([]);
  const [docImage, setDocImage] = useState<ImageColumns>({
    column1: [],
    column2: [],
    column3: [],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLOading] = useState<boolean>(false);
  const params = useParams();
  const id = params.id as string | undefined;


  useEffect(() => {
    const fetchDocImage = async () => {
      try {
        setIsLOading(true)
        const response = await axios.get(`/api/workers/doc-worker/${id}`);
        console.log('RESPONSE:', response.data); // ดูให้ชัวร์
  
        const data = response.data;
  
        setDocImage({
          column1: data.column1 || [],
          column2: data.column2 || [],
          column3: data.column3 || [],
        });
      } catch (error) {
        console.error("Error fetching document images:", error);
      }finally{
        setIsLOading(false)
      }
    };
  
    fetchDocImage();
  }, [id]);

  const handleImageClick = (img: string) => {
    setSelectedImage(img);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleImageUpload = (column: keyof ImageColumns, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const newImages = selectedFiles.map((file) => URL.createObjectURL(file));

      setImages((prevImages) => ({
        ...prevImages,
        [column]: [...prevImages[column], ...newImages],
      }));

      setRealFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleSave = async () => {
    setIsLOading(true)
    try {
      if (realFiles.length === 0) {
        alert('กรุณาเลือกรูปภาพก่อนบันทึก');
        return;
      }

      const formData = new FormData();
      realFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`/api/workers/doc-worker/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(response.data);

      // อัปเดตภาพหลังบันทึกเสร็จ
      setImages({ column1: [], column2: [], column3: [] });
      setRealFiles([]);
      if (id) {
        const updatedImages = await axios.get<ImageColumns>(`/api/workers/doc-worker/${id}`);
        setDocImage(updatedImages.data);
      }
      window.location.reload();
    } catch (error) {
      console.error('Error saving images:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally{
      setIsLOading(false)
    }
  };

  return (
    <div className="w-full min-h-[100vh] bg-gray-50 p-6">
      <Link href="/" className="text-blue-600 hover:text-blue-800">
        Back to Home
      </Link>
      {isLoading ? <Loding /> : null}
      

      <h1 className="text-3xl font-bold text-center mb-8">ໃບເບກເງິນ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderImageSection('column1', 'ຮູບພາບຄົງມີໃນປະເພດ 1', images, docImage, handleImageUpload, handleImageClick)}
        {renderImageSection('column2', 'ຮູບພາບຄົງມີໃນປະເພດ 2', images, docImage, handleImageUpload, handleImageClick)}
        {renderImageSection('column3', 'ຮູບພາບຄົງມີໃນປະເພດ 3', images, docImage, handleImageUpload, handleImageClick)}
      </div>

      <div className="w-full text-center py-10">
        <button
          onClick={handleSave}
          className="bg-yellow-500 py-3 px-8 rounded-2xl text-white font-semibold shadow-md hover:bg-yellow-600 transition duration-200 transform hover:scale-105"
        >
          Save
        </button>
      </div>

      {/* Popup modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative w-11/12 max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt="Selected Image"
              width={1000}
              height={1000}
              className="object-contain max-h-[80vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
