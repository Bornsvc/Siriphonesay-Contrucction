"use client"
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PatientForm from './components/patientForm'
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import ImportFile from './components/importPatientForm'
import Pagination from './components/Pagination';

import ExportIcon from '@/icons/export.png'
import UploadIcon from '@/icons/import.png'
import LOGO from '@/icons/ChatGPT Image Apr 20, 2025, 12_12_55 PM.png'
import Image from 'next/image';
import PtientIcon from '@/icons/patient.png'
import AddPtientIcon from '@/icons/add.png'
import LogOutIcon from '@/icons/logout.png'
import { FormContext } from '@/context/FormContext'

interface Workers {
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
}

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [active, setActive] = useState<boolean>(false);
  const [formActive, setFormactive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMassage, setToastMassage] = useState<boolean | null>(null);
  const [workers, setWorkers] = useState<Workers[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isImportActive, setIsImportActive] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(11);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchWorkers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/workers?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
      setWorkers(response.data.workers);
      setTotalPages(response.data.pagination.totalPages);
    } catch(error) {
      console.log("Error fetching workers:", error);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຄົນງານ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Add debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchWorkers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage, itemsPerPage, fetchWorkers]);

  useEffect(() => {
    setActive(true);
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          // Remove fetchPatients call here as it will be triggered by the debounced effect
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Error from login", error);
        router.push('/login');
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (toastMassage === true) {
      toast.success("ເພີ່ມຜູ້ຄົນໄຂ້ສຳເລັດແລ້ວ!");
      setToastMassage(null);
    } else if (toastMassage === false) {
      toast.error("ເພີ່ມຜູ້ໄຂ້ບໍ່ສຳເລັດ!");
      setToastMassage(null);
    }
  }, [toastMassage]);

  const renderPagination = () => {
    return (
      <div className="flex flex-col items-center gap-4 mt-4 mb-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const handleOpenForm = () => {
    setFormactive(true);
  };

  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

 return (
  <FormContext.Provider value={{ formActive, setFormactive, toastMassage, setToastMassage, setSearchQuery, setIsImportActive }}>
    {isMounted && (
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    )}

    {formActive ? <PatientForm /> : (
      <div>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <nav className="sticky top-0 z-20 bg-gradient-to-r from-amber-600 to-yellow-400 shadow-lg">
            <div className="flex mx-auto px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3 sm:gap-6">
                <Image 
                  src={LOGO}
                  alt='LOGO'
                  className='w-12 h-12 rounded-full bg-white'
                />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">SIRIPHONESAY CONSTRUCTION</h1>
              </div>
            </div>
          </nav>

          <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-4rem)]">
            <div className="w-full md:w-72 lg:w-64 relative bg-white mr-0 md:mr-3 shadow-lg border-b md:border-b-0">
              <div className="md:hidden flex justify-between items-center p-4 border-b mt-5 transition-all duration-500">
                <span className="font-medium text-gray-700">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isMobileMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                </button>
              </div>

              <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col justify-between h-[calc(100%-60px)] md:h-full`}>
                <div 
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 justify-center md:justify-start
                    ${active ? 'bg-yellow-50 border-r-4 border-amber-500' : 'hover:bg-gray-50'}`}
                >
                  <Image src={PtientIcon} alt="Patient" width={24} height={24} />
                  <span className="font-medium text-gray-700 inline">ຄົນງານ</span>
                </div>

                <div 
                  className="flex items-center gap-4 p-4 w-full cursor-pointer justify-center md:justify-start hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  <Image src={LogOutIcon} alt="LogOutIcon" width={24} height={24} />
                  <span className="font-medium text-gray-700 text-lg inline">ອອກຈາກລະບົບ</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-0">
              <div className="p-4 mr-3 md:p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200 mt-3 mb-3">
                <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div className="relative w-full md:w-96">
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາຄົນ..."
                      onChange={(e) => {
                        setSearchQuery((e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
                    />
                  </div>

                  <div className="flex items-center gap-6 mr-10">
                    <div className="flex justify-center items-center gap-5">
                      <div className="relative group rounded-full hover:bg-gray-200 p-2 flex items-center">
                        <button onClick={() => setIsImportActive(!isImportActive)}>
                          <Image src={UploadIcon} alt="Import" width={24} height={24} />
                        </button>
                        <span className="absolute -top-7 left-1/2 -translate-x-25 whitespace-nowrap bg-gray-700 text-white text-sm px-3 py-1 rounded-lg rounded-br-none shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          Import File
                        </span>
                      </div>

                      <div className="relative group">
                        <button 
                          onClick={async () => {
                            try {
                              const response = await axios.get('/api/patients/all');
                              if (response.data) {
                                const { exportPatientsToExcel } = await import('../utils/exportToExcel');
                                exportPatientsToExcel(response.data);
                              }
                            } catch (error) {
                              console.error('Export failed:', error);
                              toast.error('Failed to export patients data');
                            }
                          }}
                          className="rounded-full hover:bg-gray-200 p-2 flex items-center"
                        >
                          <Image src={ExportIcon} alt="Export" width={24} height={24} />
                        </button>
                        <span className="absolute -top-7 left-1/2 -translate-x-25 whitespace-nowrap bg-gray-700 text-white text-sm px-3 py-1 rounded-lg rounded-br-none shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          Export File
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenForm}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl shadow-md hover:bg-amber-600 hover:shadow-lg active:scale-95 transition-all duration-300 w-full md:w-auto"
                    >
                      <Image src={AddPtientIcon} alt="Add" width={24} height={24} />
                      <span className='text-lg'>ເພິ້ມຄົນງານ</span>
                    </button>
                    {isImportActive ? <ImportFile /> : null}
                  </div>
                </div>
              </div>

              <div className="flex-1 mr-3 overflow-hidden bg-white rounded-lg shadow-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ລະຫັດ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ຊື່ / ນາມສກຸນ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ລົງທະບຽນ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ເພດ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ຈຳນວນຄັ້ງຮ່ວມງານ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ຈຳນວນທິມງານ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ຕຳເເໜ່ງ / ໜ້າທີ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">ເບີໂທລະສັບ</th>
                      <th className="px-6 py-4 text-center text-lg font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    </tr>
                  </thead>
                  {isLoading ? (
                    <tbody className="relative">
                      <tr>
                        <td colSpan={9} className="h-[200px]">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody className="bg-white divide-y divide-gray-200 text-center">
                      {workers && workers.map((worker, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-amber-600 hover:text-amber-800">
                            <Link href={`/workers/${worker.id}`}>
                              {`${worker.first_name} ${worker.last_name} (${worker.middle_name || null})`}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{formatDate(worker.created_at || '-')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 capitalize">{worker.gender || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.participation_count || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.team_count || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.position || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.phone_number || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                            { worker.rating === 5 ? '⭐⭐⭐⭐⭐' : 
                              worker.rating === 4 ? '⭐⭐⭐⭐' :
                              worker.rating === 3 ? '⭐⭐⭐' :
                              worker.rating === 2 ? '⭐⭐' :
                              worker.rating === 1 ? '⭐' : null
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                {renderPagination()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </FormContext.Provider>
);

}

// export { FormContext };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};