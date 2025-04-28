import React from 'react';
import Image, { StaticImageData } from 'next/image';

interface SidebarItemProps {
  icon: StaticImageData;
  label: string;
  onClick?: () => void;
  isActive: boolean;
}

function SidebarItem({ icon, label, onClick, isActive }: SidebarItemProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 cursor-pointer justify-between hover:bg-yellow-50 ${
        isActive ? 'bg-yellow-100 border-r-6 border-yellow-500' : '' 
      }`}
      onClick={onClick} 
    >
      <Image src={icon} alt={label} width={24} height={24} />
      <span className="font-medium text-lg text-gray-700 inline">{label}</span>
    </div>
  );
}

export default SidebarItem;
