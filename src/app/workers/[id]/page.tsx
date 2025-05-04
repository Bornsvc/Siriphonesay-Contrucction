'use client'
import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import EditworkerForm from '@/app/components/editworkerForm';
import { FormContext, FormContextType } from "@/context/FormContext"; // Add FormContextType
import Loding from "@/app/components/loding";

import Image from 'next/image';

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
  status:string;
  field: string;
  image_url?: string;
}
export default function WorkerDetails() { // Capitalize component name
  const { setToastMassage } = useContext(FormContext) as FormContextType;
  const params = useParams<{ id: string }>();
  const [workers, setWorkers] = useState<Worker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [public_id, setPublic_id] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchworker = async () => {
      try {
        if (params?.id) {
          const response = await axios.get(`/api/workers/${params.id}`);
          console.log(response.data);
          setWorkers(response.data);
          setPublic_id(response.data.id); // ← ถูกต้องแล้ว
        } else {
          setError('Invalid worker ID');
        }
      } catch (err) {
        console.log("Error>>>>>", err);
        setError('Failed to load worker data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchworker(); // อย่า log public_id ทันทีตรงนี้ เพราะมันยังไม่ถูกตั้งค่า
  }, [params?.id]); // ✅ ถูกต้อง
  
  useEffect(() => {
    if (public_id) {
      console.log("public_id:", public_id);
    }
  }, [public_id]);

  if (loading) {
    return (
      <Loding />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!workers) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p>worker not found</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
    );
  }
  
  const deleteworker = async () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if(params !== null){
        const response = await axios.delete(`/api/workers/${params.id}`);
        if (response.status === 200) {
          setIsDeleteModalOpen(false);
          router.push('/'); 
          setToastMassage(true);
        } else {
          setToastMassage(false);
          throw new Error('Can not delete worker');
        }
        const deleteimg = await axios.delete(`/api/workers/submit-all/`,  {
          data: {id: public_id},
        })
        console.log("successfully", deleteimg)
      } else {
        setToastMassage(false);
        throw new Error('Can not delete worker');
      }
    } catch (error) {
      console.error('Delete fail:', error);
      alert('Can not delete worker, pls try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const DeleteConfirmationModal = () => {
    if (isDeleteModalOpen) {
      return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4">
            <h3 className="text-2xl font-semibold mb-6">ລົບຄົນງານ</h3>
            <p className="text-gray-600 mb-8 text-lg">
              ທ່ານແນ່ໃຈະລົບຄົນເຈັບນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-lg"
              >
                ລົບ
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {isDeleteModalOpen && <DeleteConfirmationModal />}

      {isEditModalOpen && typeof params?.id === 'string' && (
        <EditworkerForm 
          workerId={params.id} 
          onClose={() => setIsEditModalOpen(false)}
          worker={workers}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-amber-700 hover:text-amber-900 mb-6 group text-lg transition-colors duration-200"
        >
          <svg className="w-6 h-6 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          ກັບຄືນສູ່ລາຍຊື່ຄົນງານ
        </Link>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-amber-100 transition-all duration-300 hover:shadow-amber-100/20">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-400">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">ລາຍລະອຽດຄົນງານ</h1>
                <p className="text-amber-100 mt-1 text-lg">ລະຫັດ: {workers.id}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 rounded-lg text-white hover:bg-amber-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl text-lg transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>ເເກ້ໄຂ</span>
                </button>
                <button 
                  onClick={deleteworker}
                  className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl text-lg transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>ລົບ</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-gray-50 p-6 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-semibold">
                    {(workers.first_name).charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{`${workers.first_name} ${workers.last_name} (${workers.middle_name})` }</h2>
                  <p className="text-amber-600 text-lg">
                    ເລີ່ມວຽກ: {new Date(workers.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b border-amber-100 pb-3">
                  <svg className="w-6 h-6 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ຂໍ້ມູນສ່ວນໂຕ
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-base text-amber-600">ວັນເດືອນປີເກີດ</p>
                      <p className="text-lg font-medium text-gray-800">{new Date(workers.birth_date).toLocaleDateString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-base text-amber-600">ອາຍຸ</p>
                      <p className="text-lg font-medium text-gray-800">{workers.age} ປີ</p>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className="text-base text-amber-600">ເພດ</p>
                      <p className="text-lg font-medium text-gray-800">{workers.gender === 'male' ? 'ຊາຍ' : 'ຍິງ'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                {workers.image_url ? (
                  <div className="relative h-[300px] w-full">
                    <Image 
                      src={workers?.image_url || './../../../icons/LOGO.png'}
                      alt='Worker Photo'
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className='object-cover rounded-lg transform hover:scale-105 transition-transform duration-300'
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/worker-placeholder.png';
                      }}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-gray-400 text-lg">ບໍ່ມີຮູບພາບ</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b border-amber-100 pb-3">
                <svg className="w-6 h-6 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                ຂໍ້ມູນການຕິດຕໍ່
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base text-amber-600">ເບີໂທລະສັບ</p>
                  <p className="text-lg font-medium text-gray-800">{workers.phone_number}</p>
                </div>
                <div>
                  <p className="text-base text-amber-600">ທີ່ຢູ່</p>
                  <p className="text-lg font-medium text-gray-800">{workers.address || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b border-amber-100 pb-3">
                <svg className="w-6 h-6 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                ຂໍ້ມູນການເຮັດວຽກ
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-amber-600">ຕຳແໜ່ງ</p>
                    <p className="text-lg font-medium text-gray-800">{workers.position || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                  </div>
                  <div>
                    <p className="text-base text-amber-600">ສະຖານະ</p>
                    <span 
                      className={`
                        px-4 py-1 rounded-full text-sm font-medium inline-block
                        ${workers.status === 'On-work' 
                          ? 'bg-red-500 text-white' 
                          : workers.status === 'Free' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }
                      `}
                    >
                      {workers.status || 'ບໍ່ມີຂໍ້ມູນ'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-amber-600">ສະໜາມ</p>
                    <p className="text-lg font-medium text-gray-800">{workers.field || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                  </div>
                  <div>
                    <p className="text-base text-amber-600">ໜ້າທີ່</p>
                    <p className="text-lg font-medium text-gray-800">{workers.purpose || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-amber-600">ຈຳນວນທີມງານ</p>
                    <p className="text-lg font-medium text-gray-800">{workers.team_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-base text-amber-600">ການເຂົ້າຮ່ວມ</p>
                    <p className="text-lg font-medium text-gray-800">{workers.participation_count || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-amber-600">ຄະແນນ</p>
                    <p className="text-lg font-medium text-gray-800">{workers.rating || 0}/5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}