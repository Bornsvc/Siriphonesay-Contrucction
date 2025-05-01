import React, { useState, useEffect } from 'react';

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ label, type, name, value, onChange }) => {
  const [max, setMax] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (label === 'ຄະແນນ (1-5)') {
      setMax(5);
    } else {
      setMax(undefined);
    }
  }, [label]);
  return (
    <div>
      <label htmlFor={name} className="block text-base font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        min={0}
        max={max}
        onChange={onChange}
        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
      />
    </div>
  );
}

export default Input;
