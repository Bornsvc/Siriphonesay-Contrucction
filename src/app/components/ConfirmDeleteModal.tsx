import React from 'react';

interface ConfirmDeleteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 text-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບຮູບນີ້?
        </h2>
        <div className="flex justify-center gap-10 mt-10">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            ຍົກເລີກ
          </button>
          <button
            onClick={onConfirm}
            className="px-10 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            ລຶບ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
