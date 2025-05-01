'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import Loding from '@/app/components/loding';
import ConfirmDeleteModal from '@/app/components/ConfirmDeleteModal';

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
  handleDeleteClick: (url: string) => void
) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto p-2">
        {(docImage[column] || []).map((Doc, index) => (
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
                e.stopPropagation();
                handleDeleteClick(Doc); // ✅ แทนที่ handleDelete โดยตรง
              }}
              className="absolute flex justify-center items-center top-0 w-auto h-8 cursor-pointer aspect-square right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span>x</span>
            </button>

          </div>
        ))}
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
  const [docImage, setDocImage] = useState<ImageColumns>({
    column1: [],
    column2: [],
    column3: [],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLOading] = useState<boolean>(false);
  const params = useParams();
  const id = params.id as string | undefined;
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  
  // This state now tracks files and their associated columns
  const [realFiles, setRealFiles] = useState<{ file: File, column: keyof ImageColumns }[]>([]);

  const handleImageUpload = (column: keyof ImageColumns, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = selectedFiles.map((file) => URL.createObjectURL(file));

      // Update the specific column state independently
      setImages((prevImages) => ({
        ...prevImages,
        [column]: [...prevImages[column], ...newImages], // Add to the correct column
      }));

      // Store each file with its column association
      setRealFiles((prev) => [
        ...prev,
        ...selectedFiles.map((file) => ({ file, column })), // Associate the file with the column
      ]);
    }
  };

  const handleSave = async () => {
    setIsLOading(true);
    try {
      if (realFiles.length === 0) {
        alert('กรุณาเลือกรูปภาพก่อนบันทึก');
        return;
      }

      const formData = new FormData();

      // Group files by column and append them to formData
      realFiles.forEach(({ file, column }) => {
        formData.append('files', file);
        formData.append('column', column); // Add the column for each file
      });

      const response = await axios.post(`/api/workers/doc-worker/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload response:', response);

      // Reset only the columns that were updated
      setRealFiles([]);

      if (id) {
        // Fetch updated images for all columns after saving
        const updatedImages = await axios.get<ImageColumns>(`/api/workers/doc-worker/${id}`);
        setDocImage(updatedImages.data);
      }

      window.location.reload();
    } catch (error) {
      console.error('Error saving images:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsLOading(false);
    }
  };

  const handleDeleteClick = (url: string) => {
    setImageToDelete(url); // เก็บ url รูปที่ต้องการลบ
    setConfirmDelete(true); // เปิด modal
  };
  

  useEffect(() => {
    const fetchDocImage = async () => {
      try {
        setIsLOading(true);
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
      } finally {
        setIsLOading(false);
      }
    };

    fetchDocImage();
  }, [id]);

  const handleDelete = async (url: string) => {
    setIsLOading(true)
    try {
      const response = await fetch(`/api/workers/doc-worker/${id}`, {
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
  };

  const handleImageClick = (img: string) => {
    setSelectedImage(img);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="w-full min-h-[100vh] bg-gray-50 p-6">
      <Link href="/" className="text-blue-600 hover:text-blue-800">
        Back to Home
      </Link>
      {isLoading ? <Loding /> : null}
      <h1 className="text-3xl font-bold text-center mb-8">ໃບເບກເງິນ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderImageSection('column1', 'ຮູບພາບຂອງພະນັກງານ', images, docImage, handleImageUpload, handleImageClick, handleDeleteClick)}
        {renderImageSection('column2', 'ຮູບພາບຂອງຮູບພາບ', images, docImage, handleImageUpload, handleImageClick, handleDeleteClick)}
        {renderImageSection('column3', 'ຮູບພາບຄວາມຄິດ', images, docImage, handleImageUpload, handleImageClick, handleDeleteClick)}
      </div>

      {confirmDelete && imageToDelete && (
        <ConfirmDeleteModal
          show={confirmDelete}
          onClose={() => {
            setConfirmDelete(false);
            setImageToDelete(null); // reset
          }}
          onConfirm={() => {
            handleDelete(imageToDelete); // ✅ เรียกฟังก์ชันลบจริง
            setConfirmDelete(false);
            setImageToDelete(null);
          }}
        />
      )}


      <div className="text-center mt-8">
        <button
          onClick={handleSave}
          className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded-lg"
        >
          ບັນທຶກ
        </button>
      </div>

      {/* Modal to display full-size image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="relative">
            <Image
              src={selectedImage}
              alt="Selected Image"
              width={1000}
              height={1000}
              className="object-contain max-h-[80vh] rounded-lg"
            />
            <button onClick={closeModal} className="absolute top-0 right-0 p-4 text-white text-xl">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
