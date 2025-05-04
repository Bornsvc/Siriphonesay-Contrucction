"use client"
//Hook
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

//component
import PatientForm from './components/patientForm'
import ImportFile from './components/importPatientForm'
import Pagination from './components/Pagination';
import SidebarItem from './components/SidebarItem';

//Icon and Image
import LOGO from '@/icons/LOGO.png'
import Image from 'next/image';
import AddPtientIcon from '@/icons/add.png'
import Clicklist from '@/icons/check-list.png'
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
  status: string;
  field: string;
}

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
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
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // const split = searchQuery.split(' ')
  // useEffect(() => {
  //   console.log(searchQuery)
  // }, [searchQuery])

  const [allWorker, setAllWorker] = useState<Workers[]>([])
  useEffect(() => {
    setIsMounted(true);
    try {
        const fetchAllWorkers = async() => {
          const response = await axios.get(`/api/workers/all`);
          setAllWorker(response.data)
        }
        fetchAllWorkers()
    } catch (error) {
        console.log(error)
    }
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

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    if (label === "ສະຖານະ") {
      setIsDropdownOpen((prev) => !prev); // toggle dropdown
    } else {
      setIsDropdownOpen(false); // ปิด dropdown ถ้าเลือกอันอื่น
    }
  };

  // Add debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchWorkers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage, itemsPerPage, fetchWorkers]);

  useEffect(() => {
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
      toast.success("ເພີ່ມຜູ້ຄົນງານສຳເລັດແລ້ວ!");
      setToastMassage(null);
    } else if (toastMassage === false) {
      toast.error("ເພີ່ມຜູ້ງານບໍ່ສຳເລັດ!");
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

              <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col h-[calc(100%-60px)] md:h-full`}>
                <div className="flex flex-col h-full">
                  <SidebarItem
                    icon={Clicklist}
                    label="ສະຖານະ"
                    onClick={() => handleItemClick("ສະຖານະ")}
                    isActive={activeItem === "ສະຖານະ"}
                  />
                   {/* ถ้า isDropdownOpen เป็น true ให้โชว์ dropdown */}
                   <div className={`flex flex-col space-y-2 py-1 overflow-hidden transition-all duration-500 ease-in-out
                      ${isDropdownOpen 
                        ? 'max-h-[1000px] transform translate-y-0 bg-yellow-50' 
                        : 'max-h-0 transform -translate-y-2'
                      }
                    `}
                  >
                    <div className='flex flex-col mt-2'>
                      {allWorker
                      .filter((worker) => worker.status === 'On-work')
                      .map((worker, index) => (
                        <Link href={`docpage/${worker.id}`}  key={index}>
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer
                                    hover:bg-yellow-100 transition-all duration-300 border-b
                                    border-yellow-100/50 last:border-b-0"
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                            <span className="text-gray-700 font-medium truncate max-w-[120px] hover:whitespace-normal hover:overflow-visible group relative">
                              <span className="truncate block">
                                    {worker.first_name} {worker.position ? `(${worker.position})` : null}
                              </span>

                              <span className="absolute -top-8 left-0 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                {worker.first_name} {worker.position ? `(${worker.position})` : null} {worker.field}
                              </span>
                            </span>
                            <span 
                              className={`
                                px-4 py-1 rounded-full text-sm font-medium transition-colors duration-300
                                ${worker.status === 'On-work' 
                                  ? 'bg-red-500 text-black' 
                                  : worker.status === 'Free' 
                                    ? 'bg-green-500 text-white' 
                                    : ''
                                }
                              `}
                            >
                              {worker.status}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="w-full mt-auto cursor-pointer">
                    <SidebarItem
                      icon={LogOutIcon}
                      label="ອອກຈາກລະບົບ"
                      onClick={handleLogout}
                      isActive={activeItem === "ອອກຈາກລະບົບ"}
                    />
                  </div>
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
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ລະຫັດ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ຊື່ / ນາມສກຸນ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ລົງທະບຽນ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ເພດ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ສະໜາມ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ສະຖານະ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ຕຳເເໜ່ງ / ໜ້າທີ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ເບີໂທລະສັບ</th>
                      <th className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Rating</th>
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
                    <tbody className="bg-white divide-y divide-gray-200 text-left">
                      {workers && workers.map((worker, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-amber-600 hover:text-amber-800">
                            <Link href={`/workers/${worker.id}`}>
                              {`${worker.first_name || '-'} ${worker.last_name || '-'}`}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{formatDate(worker.created_at || '-')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 capitalize">{worker.gender || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.field || '-'}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-base text-gray-900`}>
                            {
                              <span className={`${
                                   worker.status === 'On-work' 
                                 ? 'bg-red-500 text-white p-1 px-4 rounded-2xl' 
                                 : worker.status === 'Free' 
                                 ? 'bg-green-500 text-white p-1 px-4 rounded-2xl' 
                                 : ''
                                 }`}> 
                                 {worker.status || '-'}
                              </span>
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.position || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{worker.phone_number || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                            { worker.rating === 5 ? '⭐⭐⭐⭐⭐' : 
                              worker.rating === 4 ? '⭐⭐⭐⭐' :
                              worker.rating === 3 ? '⭐⭐⭐' :
                              worker.rating === 2 ? '⭐⭐' :
                              worker.rating === 1 ? '⭐' : '-'
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

