import React, { useState, useContext } from "react";
import { FormContext } from "@/context/FormContext"; // Import the context
import Image from "next/image";
import ClodeIcon from "@/icons/close.png";
import axios from "axios";
import ConfirmClose from './confirmClose'
import Input from './input'
// import workersSchema from "@/lib/balibationSchema";
// import z from 'zod'

interface FormData {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  age: number;
  address: string;
  phoneNumber: string;
  purpose: string;
  gender: string;
  position: string;
  teamCount: number;
  participationCount: number;
  rating: number;
  image: File | null;
  status:string;
  field:string
}

const CustomerForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    id: '',
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    age: 0,
    address: "",
    phoneNumber: "",
    purpose: "",
    gender: "",
    position: "",
    teamCount: 0,
    participationCount: 0,
    rating: 0,
    image: null,
    status: '',
    field: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const { setFormactive, setToastMassage, setSearchQuery } = useContext(FormContext); 
  const [comFirm, setComfirm] = useState<boolean>(false);
  // const [selected, setSelected] = useState("On_work");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const options = [
    { label: "On-work", value: "On-work", bgColor: "bg-red-500", textColor: "text-white" },
    { label: "Free", value: "Free", bgColor: "bg-green-500", textColor: "text-white" },
  ];

  // const handleSelect = (value: string) => {
  //   setSelected(value);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    
    if (name === "birthDate") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setFormData(prevData => ({
        ...prevData,
        birthDate: value,
        age: age
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
      console.log("formData?>>>>>", formData)
    }
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
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', formData.id);
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('middle_name', formData.middleName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('birth_date', formData.birthDate);
      formDataToSend.append('age', String(formData.age));
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone_number', formData.phoneNumber);
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('team_count', String(formData.teamCount));
      formDataToSend.append('participation_count', String(formData.participationCount));
      formDataToSend.append('status', String(formData.status));
      formDataToSend.append('rating', String(formData.rating));
      formDataToSend.append('field', String(formData.field));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('/api/workers', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('response submit>>',response.data)

      setToastMassage(true);
      setFormactive(false);
      setSearchQuery("");
      window.location.reload();
    } catch (error) {
      console.error('Error submitting form:', error);
      setToastMassage(false);
    }
  };
 
  const handleClose = () => {
    setComfirm(true);
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative">
        <Image
          src={ClodeIcon}
          alt="ClodeIcon"
          width={30}
          height={30}
          className="absolute top-6 right-6 cursor-pointer hover:opacity-75 hover:scale-110 transition-all duration-200"
          onClick={handleClose}
        />
        {comFirm ? <ConfirmClose comFirm={comFirm} setComfirm={setComfirm} /> : null}
        
        <div className="transform hover:scale-[1.01] transition-all duration-200">
          <h2 className="text-center text-5xl h-15 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-400 tracking-tight">
            ຂໍ້ມູນຄົນງານ
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            ກະລຸນາຕື່ມລາຍລະອຽດຂ້າງລຸ່ມນີ້
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
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
                      className="rounded-xl object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
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

          <div className="space-y-6 bg-gray-50 p-6 rounded-xl transition-all duration-200 hover:shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">ຂໍ້ມູນສ່ວນຕົວ</h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  label="ຊື່ຫຼີ້ນ"
                  type="text"
                  name="middleName"
                  value={formData.middleName}
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
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                >
                  <option value="">ເລືອກເພດ</option>
                  <option value="male">ຊາຍ</option>
                  <option value="female">ຍິງ</option>
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
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              ></textarea>
            </div>
          </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-xl transition-all duration-200 hover:shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 flex items-center">
              <svg className="w-6 h-6 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              ຂໍ້ມູນການເຮັດວຽກ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Dropdown */}
              <div className="w-full">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  ສະຖານະ
                </label>
                <div className="relative">
                  {/* Hidden input for form */}
                  <input
                    type="hidden"
                    id="status"
                    name="status"
                    value={formData.status}
                  />

                  {/* Selected Item */}
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm flex items-center justify-between"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <span className={`px-3 py-1 rounded-full ${options.find(opt => opt.value === formData.status)?.bgColor} ${options.find(opt => opt.value === formData.status)?.textColor}`}>
                      {options.find(opt => opt.value === formData.status)?.label || "ເລືອກສະຖານະ"}
                    </span>
                    <svg className="h-4 w-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown List */}
                  {dropdownOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {options.map((option) => (
                        <li
                          key={option.value}
                          onClick={() => {
                            handleChange({ target: { name: 'status', value: option.value } });
                            setDropdownOpen(false);
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-amber-100`}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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


              {/* Position Input */}
              <div>
                <div className="relative">
                   <Input
                    label="ຕຳແໜ່ງ"
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  />   
                </div>
              </div>

              {/* Purpose Input */}
              <div>
                <div className="relative">
                   <Input
                    label="ໜ້າທີ່"
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                  />   
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <div className="relative">
                    <Input
                    label="ຈຳນວນທີມ"
                    type="text"
                    name="teamCount"
                    value={formData.teamCount}
                    onChange={handleChange}
                  />   
                </div>
              </div>

              <div>
                <div className="relative">
                    <Input
                    label="ການເຂົ້າຮ່ວມ"
                    type="text"
                    name="participationCount"
                    value={formData.participationCount}
                    onChange={handleChange}
                  />   
                </div>
              </div>

              <div>
                <label htmlFor="rating" className="block text-base font-medium text-gray-700 mb-1">ຄະແນນ</label>
                <div className="relative">
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'ດາວ' : 'ດາວ'}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-yellow-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 pointer-events-none">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-2xl font-bold rounded-lg text-white bg-gradient-to-r from-amber-600 to-yellow-400 hover:from-amber-700 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
          >
            ເພີ່ມຂໍ້ມູນຄົນງານ
          </button>
        </form>
      </div>
    </div>
  );
};
export default CustomerForm;