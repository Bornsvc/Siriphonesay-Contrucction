'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';

const renderImageSection = (
  column: string,
  title: string,
  images: Record<string, string[]>,
  handleImageUpload: (column: string, e: React.ChangeEvent<HTMLInputElement>) => void,
  handleImageClick: (img: string) => void,
) => (
<div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto p-2">
      {images[column].map((img, index) => (
        <div 
          key={index} 
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
  const [images, setImages] = useState({
    column1: [] as string[],
    column2: [] as string[],
    column3: [] as string[],
  });
  const [realFiles, setRealFiles] = useState<File[]>([]);
  const [docImage, setDocImage] = useState({
    column1: [] as string[],
    column2: [] as string[],
    column3: [] as string[],
  })
  // const [testimg, setTestimg] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;  

  const handleImageClick = (img: string) => {
    setSelectedImage(img);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // useEffect( () => {
  //   try {
  //     const feactDocImage = async() => {
  //       const rsponse = await axios.get(`/api/workers/doc-worker/${id}`)
  //       console.log("rsponse>>>>>",rsponse)
  //     }
  //     feactDocImage()
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }, [id])

  const handleImageUpload = async (column: keyof typeof images, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
  
      // 1. อัปเดต URL preview
      const newImages = [
        ...images[column],
        ...selectedFiles.map((file) => URL.createObjectURL(file)),
      ];
      setImages((prevImages) => ({
        ...prevImages,
        [column]: newImages,
      }));
  
      // 2. เก็บไฟล์จริงลงใน state
      setRealFiles(prev => [...prev, ...selectedFiles]);
    }
  };
  

  const handleSave = async () => {
    try {
      if (realFiles.length === 0) {
        alert('กรุณาเลือกรูปภาพก่อนบันทึก');
        return;
      }
  
      const formData = new FormData();
      realFiles.forEach((file) => {
        formData.append('files', file);
      });
  
      console.log('📦 FormData to send:', Array.from(formData.entries()));
      console.log('🆔 ID:', id);
  
      const response = await axios.post(`/api/workers/doc-worker/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('✅ Save success:', response.data);
      alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('❌ Save error:', error);
      const message = error || 'เกิดข้อผิดพลาดในการบันทึก';
      alert(message);
    }
  };
  
  

  return (
    <div className="w-full min-h-[100vh] bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">ໃບເບກເງິນ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderImageSection('column1', 'ຮູບພາບຄົງມີໃນປະເພດ 1', images, handleImageUpload, handleImageClick)}
        {renderImageSection('column2', 'ຮູບພາບຄົງມີໃນປະເພດ 2', images, handleImageUpload, handleImageClick)}
        {renderImageSection('column3', 'ຮູບພາບຄົງມີໃນປະເພດ 3', images, handleImageUpload, handleImageClick)}
      </div>

      <div className="w-full text-center py-10">
        <button 
        onClick={handleSave}
        className="bg-yellow-500 py-3 px-8 rounded-2xl text-white font-semibold shadow-md hover:bg-yellow-600 transition duration-200 transform hover:scale-105">
          Save
        </button>
      </div>

      {/* <Image
      src={testimg}
      alt='testimg'
      width={500}
      height={500}
      /> */}

      {/* Popup modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={closeModal}
        >
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
