import React, {useState} from 'react';
import Image from 'next/image';
interface ImageColumns {
    column1: File[];
    column2: File[];
    column3: File[];
  }
interface RenderProps {
    title: string;
    column: keyof ImageColumns;
    images: File[];
    onChange: (column: keyof ImageColumns, e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (url: string) => void;
    docImg: File[];
  }
  

const RenderImageSection: React.FC<RenderProps> = ({ title, column, images, onChange, onRemove, docImg }) => {
  //State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  //Function
  const handleClickImage = (file:File) => {
    setSelectedImage(file); 
  }


  return (
    <>
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-md w-full">
            <Image
              src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage}
              alt="selected"
              className="object-contain w-full max-h-[90vh]"
              width={0}
              height={0}
              sizes="100vw"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title || "No title received"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2">
          {docImg.map((file, index) => {
            const isFile = file instanceof File
            const src = isFile ? URL.createObjectURL(file) : file;

            return (
              <div key={index} className="group relative w-full aspect-square rounded overflow-hidden">
                <Image
                  src={src}
                  alt={`uploaded-${index}`}
                  className="w-full h-full object-cover"
                  width={500}
                  height={500}
                  onClick={() => handleClickImage(file)}
                />
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(src);   
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  ✕
                </button>
              </div>
            );
          })}
          {images.map((file, index) => (
            <div key={index} className="relative w-full aspect-square rounded overflow-hidden">
              <Image
                src={URL.createObjectURL(file)}
                alt={`uploaded-${index}`}
                className="w-full h-full object-cover"
                width={500}
                height={500}
                onClick={() => {handleClickImage(file)}}
              />
              {/* <button
                onClick={() => onRemove(column, index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
              >
                ✕
              </button> */}
            </div>
          ))}
          
            <div className="relative w-full aspect-square">
              <label className="absolute inset-0 flex flex-col items-center justify-center 
                                cursor-pointer rounded-lg border-2 border-dashed w-full 
                                border-gray-300 hover:border-amber-500 transition-colors duration-200"
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-2 text-sm text-gray-500">ເພີ່ມຮູບພາບ</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => onChange(column, e)}
                  accept="image/*"
                  multiple
                />
              </label>
            </div>

        </div>
        <div className="text-sm text-gray-500 text-center w-full">
          ຈຳນວນຮູບພາບ: {docImg.length}
        </div>
      </div>
    </>
  );
};

export default RenderImageSection;
