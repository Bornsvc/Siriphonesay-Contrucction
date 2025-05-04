import React, {useEffect, useState} from 'react'
// import LoadingV3 from '@/icons/LoadingV3.gif'
// import Image from 'next/image';


function LoadingV() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Trigger fade-in after mount
        const timer = setTimeout(() => setShow(true), 50);
        return () => clearTimeout(timer);
      }, []);
    return (
        <div 
        className={`relative
            inset-0 z-50 flex items-center justify-center
            transform transition-all duration-500 ease-in
            ${show ? 'opacity-60' : 'opacity-0'}
          `}
        >
            <video
                src="/Video/LoadingV2.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
            />
            <div className="absolute bg-white w-full h-10 bottom-4"></div>
        </div>
    //     <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
    //     <div className="relative w-full h-full">
    //       <Image
    //         src={LoadingV3}
    //         alt="Loading animation"
    //         fill
    //         className="object-contain"
    //         priority
    //       />
    //     </div>
    //   </div>
      );
}

export default LoadingV