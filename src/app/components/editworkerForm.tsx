'use client'
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Input from './input'
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { getCurrentUserId } from '@/utils/auth';
interface Worker {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string;
  age: number;
  address: string;
  phone_number: string;
  purpose: string;
  created_at: string;
  gender: string;
  position: string;
  team_count: number;
  participation_count: number;
  rating: number;
  image_url?: string;
  status: string;
  field: string;
}

interface EditworkerFormProps {
  workerId: string;
  onClose: () => void;
  worker: Worker | null;
}

interface FormData {
  id:string
  firstName: string;
  lastName: string;
  middle_name: string;
  birthDate: string;
  age: number;
  address: string;
  phoneNumber: string;
  gender: string;
  position: string;
  teamCount: number;
  participationCount: number;
  rating: number;
  image: File | null;
  imagePreview: string;
  status: string;
  field: string;
  purpose: string
}

const EditworkerForm: React.FC<EditworkerFormProps> = ({ workerId, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    id:"",
    firstName: "",
    lastName: "",
    middle_name:"",
    birthDate: "",
    age: 0,
    address: "",
    phoneNumber: "",
    gender: "",
    position: "",
    teamCount: 0,
    participationCount: 0,
    rating: 0,
    image: null,
    imagePreview: "",
    status: "",
    field: "",
    purpose: "",
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`/api/workers/${workerId}`);
        console.log("response>>", response.data)
        const worker = response.data;
        setFormData({
          id:worker.id,
          firstName: worker.first_name,
          lastName: worker.last_name,
          middle_name: worker.middle_name,
          birthDate: new Date(worker.birth_date).toISOString().split('T')[0],
          age: worker.age,
          address: worker.address,
          phoneNumber: worker.phone_number,
          gender: worker.gender,
          position: worker.position,
          teamCount: worker.team_count,
          participationCount: worker.participation_count,
          rating: worker.rating,
          image: worker.image_url,
          imagePreview: typeof worker.image_url === 'string' ? worker.image_url : '',
          status: worker.status,
          field: worker.field,
          purpose: worker.purpose
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching workers:", err);
        setError('Failed to load worker data');
        setLoading(false);
      }
    };

    fetchPatient();
  }, [workerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData: Partial<FormData> = { [name]: value };

    if (name === "birthDate") {
      const birthYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      updatedData.age = currentYear - birthYear;
    }

    setFormData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       setFormData(prev => ({ ...prev, image: file }));
       setImagePreview(URL.createObjectURL(file));
     }
   };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Before submit", formData)
    try {
      if (!formData.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        alert('Please input date of birth follow this format YYYY-MM-DD');
        return;
      }

      const formDataToSend = new FormData();
        formDataToSend.append('id', formData.id)
        formDataToSend.append('first_name', formData.firstName);
        formDataToSend.append('last_name', formData.lastName);
        formDataToSend.append('middle_name', formData.middle_name);
        formDataToSend.append('birth_date', formData.birthDate);
        formDataToSend.append('age', String(formData.age));
        formDataToSend.append('phone_number', formData.phoneNumber);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('address', formData.address || "");
        formDataToSend.append('position', formData.position || "");
        formDataToSend.append('team_count', String(formData.teamCount));
        formDataToSend.append('participation_count', String(formData.participationCount));
        formDataToSend.append('rating', String(formData.rating));
        formDataToSend.append('status', formData.status);
        formDataToSend.append('field', formData.field);
        formDataToSend.append('purpose', formData.purpose);

      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      console.log('>>>>>',formDataToSend)

      const response = await axios.put(`/api/workers/submit-all`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('success full !!! EDIT!!',response.data)
      window.location.reload();
    } catch (error) {
      console.error('Error updating patient:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Cannot update patient data';
        alert(errorMessage);
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4">
          <p className="text-red-500 text-center">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50/90 to-gray-50/90 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 relative mx-4 shadow-xl border border-amber-100">
        <div className="bg-gradient-to-r from-amber-50 to-gray-50 pb-4 z-10 rounded-t-lg">

        
          <div className="p-2">
            <h2 className="text-center text-5xl p-5 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500">
              ແກ້ໄຂຂໍ້ມູນຄົນງານ
            </h2>
            <p className="mt-2 text-center text-base text-gray-600">
              ອັບເດດລາຍລະອຽດຂອງຄົນງານຂ້າງລຸ່ມນີ້
            </p>
          </div>
        </div>
    
        <form onSubmit={handleSubmit} className="mt-8">
           {/* Personal Information Section */}
          <div className="space-y-6 bg-gradient-to-br from-amber-50 to-gray-50 p-8 rounded-xl transition-all duration-200 hover:shadow-lg border border-amber-100">
                        <h3 className="text-2xl font-semibold text-gray-800 border-b border-amber-200 pb-3 mb-6">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-400">
                            ຮູບພາບຄົນງານ
                          </span>
                        </h3>
                        <div className="flex flex-col items-center gap-6">
                          {imagePreview ? (
                            <div className="relative w-48 h-48 group">
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="rounded-xl object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
                                priority
                                style={{ objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview('');
                                  setFormData(prev => ({ ...prev, image: null }));
                                }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl shadow-lg hover:bg-red-600 transition-colors duration-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="w-48 h-48 border-3 border-dashed border-amber-200 rounded-xl flex flex-col items-center justify-center bg-white shadow-inner transition-all duration-200 hover:border-amber-300">
                              <svg className="w-12 h-12 text-amber-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-500 text-center">ບໍ່ມີຮູບພາບ</span>
                            </div>
                          )}
                          <label className="cursor-pointer group">
                            <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-500">
                              <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                ເລືອກຮູບພາບ
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

            <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mt-5">ຂໍ້ມູນສ່ວນໂຕ</h3>
            <div className="grid grid-cols-16 md:grid-cols-2">
              <div>
                <Input 
                 label="ຊື່"
                 type="text"
                 name="firstName"
                 value={formData.firstName}
                 onChange={handleChange}
                />
              </div>
              <div>
                <Input 
                 label="ນາມສະກຸນ"
                 type="text"
                 name="lastName"
                 value={formData.lastName}
                 onChange={handleChange}
                />
              </div>
              
              <div>
                <Input 
                 label="ຊື່ເລ່ນ"
                 type="text"
                 name="middle_name"
                 value={formData.middle_name}
                 onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                 <Input 
                 label="ວັນເກີດ"
                 type="date"
                 name="birthDate"
                 value={formData.birthDate}
                 onChange={handleChange}
                />
              </div>
              <div>
                 <Input 
                 label="ອາຍຸ"
                 type="number"
                 name="age"
                 value={formData.age}
                 onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="gender" className="block text-base font-medium text-gray-700 mb-1">ເພດ</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                >
                  <option value="">ເລືອກເພດ</option>
                  <option value="male">ຊາຍ</option>
                  <option value="female">ຍິງ</option>
                  <option value="other">ອື່ນໆ</option>
                </select>
              </div>
              <div>
                <Input 
                 label="ເບີໂທລະສັບ"
                 type="tel"
                 name="phoneNumber"
                 value={formData.phoneNumber}
                 onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-base font-medium text-gray-700 mb-1">ທີ່ຢູ່</label>
              <textarea
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows={3}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm transition duration-200"
              />
            </div>
          </div>

          {/* Social Security Information */}
      

          {/* Work Information */}
          <div className="space-y-4 mt-5">
            <h3 className="text-xl font-semibold text-gray-700">ຂໍ້ມູນການເຮັດວກ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Input 
                 label="ຕຳແໜ່ງ"
                 type="text"
                 name="position"
                 value={formData.position}
                 onChange={handleChange}
                />
              </div>
              <div>
                <Input 
                 label="ສະໜາມ"
                 type="text"
                 name="field"
                 value={formData.field}
                 onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-base font-medium text-gray-700 mb-1">ສະຖານະ</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm transition duration-200"
                >
                  <option value="">ເລືອກສະຖານະ</option>
                  <option value="On-work">On-work</option>
                  <option value="Free">Free</option>
                </select>
              </div>
              <div>
                <Input 
                 label="ຈຳນວນທີມ"
                 type="number"
                 name="teamCount"
                 value={formData.teamCount}
                 onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Input 
                 label="ການເຂົ້າຮ່ວມ"
                 type="number"
                 name="participationCount"
                 value={formData.participationCount}
                 onChange={handleChange}
                />
              </div>
              <div>
                 <Input 
                 label="ຄະແນນ (1-5)"
                 type="number"
                 name="rating"
                 value={formData.rating}
                 onChange={handleChange}
                />
              </div>
              <div>
                 <Input 
                 label="ໜ້າທີ"
                 type="text"
                 name="purpose"
                 value={formData.purpose || 'general worker'}
                 onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-lg"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-lg hover:from-amber-700 hover:to-yellow-600 transition-colors duration-200 text-lg"
            >
              ບັນທຶກການປ່ຽນແປງ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditworkerForm;
