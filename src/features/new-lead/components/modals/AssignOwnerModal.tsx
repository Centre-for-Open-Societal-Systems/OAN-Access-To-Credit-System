import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
}

const MOCK_USERS: User[] = [
  { id: 'AG-101', name: 'Abebe Bekele Tadesse' },
  { id: 'AG-102', name: 'Abebech Haile Mariam' },
  { id: 'AG-103', name: 'Mekonnen Birhanu Mitiku' },
  { id: 'AG-104', name: 'Sara Hailu Dessalegn' },
  { id: 'AG-105', name: 'Selamawit Tariku Gebre' },
];

interface AssignOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOwnerName: string;
  onAssign: (user: User) => void;
}

export default function AssignOwnerModal({
  isOpen,
  onClose,
  currentOwnerName,

  onAssign,
}: AssignOwnerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_USERS.filter((u) => u.name.toLowerCase().includes(q));
  }, [searchQuery]);

  if (!isOpen || !mounted) return null;

  const handleAssign = () => {
    if (selectedUser) {
      onAssign(selectedUser);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className="flex flex-col items-start p-0 w-[95%] sm:w-[448px] h-auto bg-white rounded-[10px] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="box-border flex flex-row justify-between items-center p-6 w-full h-[77px] border-b border-[#E5E7EB]">
            <h2 className="w-full font-inter font-semibold text-[18px] leading-[28px] tracking-[-0.439453px] text-[#0A0A0A]">
              Assign Owner
            </h2>
            <button
              onClick={onClose}
              className="flex flex-col items-start p-[4px_4px_0px] w-[28px] h-[28px] rounded-[4px] hover:bg-gray-100 transition-colors"
            >
              <X size={20} color="#0A0A0A" strokeWidth={1.66667} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col items-start p-[24px_24px_0px] gap-[16px] w-full h-auto pb-4">

            {/* Current Owner Section */}
            <div className="flex flex-col items-start p-0 gap-[8px] w-full h-auto">
              <label className="w-full h-[20px] font-inter font-medium text-[14px] leading-[20px] tracking-[-0.150391px] text-[#364153]">
                Current Owner
              </label>
              <div className="flex flex-row items-center p-[4px_16px] w-full h-[36px] bg-[#F3F4F6] rounded-[8px]">
                <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.150391px] text-[#101828]">
                  {currentOwnerName}
                </span>
              </div>
            </div>

            {/* Search Input Section */}
            <div className="flex flex-col items-start p-0 gap-[8px] w-full h-auto">
              <label className="w-full h-[20px] font-inter font-medium text-[14px] leading-[20px] tracking-[-0.150391px] text-[#364153]">
                Search Users
              </label>
              <div className="relative w-full h-[42px]">
                <div className="absolute left-[12px] top-[13px] w-[16px] h-[16px]">
                  <Search size={16} color="#99A1AF" strokeWidth={1.33333} />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_12px_8px_40px] absolute w-full h-[42px] left-0 top-0 border border-[#D1D5DC] rounded-[10px] outline-none focus:border-[#2B7FFF] font-inter font-normal text-[16px] leading-[19px] tracking-[-0.3125px] text-[#0A0A0A] placeholder:text-[rgba(10,10,10,0.5)]"
                />
              </div>
            </div>

            {/* Users List Section */}
            <div className="flex flex-col items-start p-0 gap-[8px] w-full h-[284px]">
              <label className="w-full h-[20px] font-inter font-medium text-[14px] leading-[20px] tracking-[-0.150391px] text-[#364153]">
                Change Assignment to
              </label>
              <div className="flex flex-col items-start gap-[8px] w-full h-[256px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {filteredUsers.map((user) => {
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`box-border flex flex-row items-center p-[12px] gap-[12px] w-full h-[54px] rounded-[10px] transition-colors shrink-0 ${isSelected
                        ? 'bg-[#F4F9FF] border border-[#2B7FFF]'
                        : 'bg-white border border-[#E5E7EB] hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex flex-row items-center p-0 w-full h-[28px]">
                        <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.150391px] text-[#101828]">
                          {user.name}
                        </span>
                      </div>
                    </button>
                  );
                })}

              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="box-border flex flex-row justify-end items-center p-[24px] gap-[12px] w-[448px] h-[87px] border-t border-[#E5E7EB] bg-white absolute bottom-0">
            <div className="flex flex-row items-center p-0 gap-[12px] w-[224.86px] h-[40px] ml-auto">
              <button
                onClick={onClose}
                className="box-border flex flex-col justify-center items-center p-[8px_16px] w-[76.86px] h-[40px] bg-[rgba(255,255,255,0.002)] border border-[#D4D4D4] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] hover:bg-gray-50 transition-colors"
              >
                <span className="w-[42.86px] h-[20px] font-roboto font-medium text-[14px] leading-[20px] flex items-center text-center text-[#111827]">
                  Cancel
                </span>
              </button>

              <button
                onClick={handleAssign}
                disabled={!selectedUser}
                className="flex flex-row items-center p-[10px_24px] gap-[8px] w-[136px] h-[40px] bg-[#16A34A] rounded-[8px] relative overflow-hidden transition-colors hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute left-0 right-[0.17px] top-0 bottom-0 bg-[rgba(255,255,255,0.002)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-2px_rgba(0,0,0,0.1)] rounded-[8px] z-0" />
                <span className="w-[88px] h-[20px] font-roboto font-semibold text-[14px] leading-[20px] flex items-center justify-center text-center text-white z-10">
                  Assign Owner
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}
