// File: WardInfo.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/lib/firebase';
import { ref, onValue, push, remove, get } from 'firebase/database';

interface Ward {
  id?: string;
  name: string;
}

const WardInfo: React.FC = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [allWards, setAllWards] = useState<Ward[]>([]); // Add this line to store all wards
  const [formData, setFormData] = useState<Ward>({ name: '' });
  const [toggleAddWard, setToggleAddWard] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // Function to fetch wards from Firebase
  const fetchWards = async (page: number = 1, itemsPerPage: number = pagination.limit) => {
    try {
      const wardsRef = ref(db, 'wards');
      const snapshot = await get(wardsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        let wardsArray: Ward[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        // Sort wards by ID in descending order (newest first)
        wardsArray = wardsArray.sort((a, b) => {
          if (!a.id || !b.id) return 0;
          return b.id.localeCompare(a.id);
        });

        setAllWards(wardsArray); // Store all wards for uniqueness check

        // Implement client-side pagination
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = wardsArray.slice(startIndex, endIndex);

        setWards(paginatedData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(wardsArray.length / itemsPerPage),
          totalItems: wardsArray.length,
          limit: itemsPerPage
        });
      } else {
        setWards([]);
        setAllWards([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: itemsPerPage
        });
      }
    } catch (err) {
      console.error('Failed to fetch wards:', err);
      toast.error('Failed to fetch wards');
    }
  };

  // Fetch wards on component mount
  useEffect(() => {
    fetchWards();

    // Set up realtime listener
    const wardsRef = ref(db, 'wards');
    const unsubscribe = onValue(wardsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let wardsArray: Ward[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        // Sort wards by ID in descending order (newest first)
        wardsArray = wardsArray.sort((a, b) => {
          if (!a.id || !b.id) return 0;
          return b.id.localeCompare(a.id);
        });

        setAllWards(wardsArray); // Update all wards for uniqueness check

        // Update the list without changing pagination
        setWards(prev => {
          const startIndex = (pagination.currentPage - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          return wardsArray.slice(startIndex, endIndex);
        });
      } else {
        setWards([]);
        setAllWards([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validation for ward name field
    const isValid = /^[a-zA-Z0-9 ]*$/.test(value);
    const noLeadingSpace = !/^\s/.test(value);

    if (isValid && noLeadingSpace) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.name) {
        toast.error('Ward name is required');
        return;
      }

      if (!isWardUnique(formData.name)) {
        toast.error('Ward name must be unique');
        return;
      }

      // Add new ward
      await push(ref(db, 'wards'), formData);
      toast.success(`Ward added successfully`);

      setFormData({ name: '' });
      setToggleAddWard(false);
      fetchWards(pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error('Failed to add ward:', err);
      toast.error('Failed to add ward');
    }
  };

  const handleDelete = async (wardId: string) => {
    try {
      await remove(ref(db, `wards/${wardId}`));
      toast.success(`Ward deleted successfully`);
      fetchWards(pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error('Failed to delete ward:', err);
      toast.error('Failed to delete ward');
    }
  };

  const showForm = () => {
    setToggleAddWard(!toggleAddWard);
    setFormData({ name: '' });
  };

  const closeForm = () => {
    setToggleAddWard(false);
    setFormData({ name: '' });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchWards(page, pagination.limit);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchWards(1, newLimit);
  };

  const isWardUnique = (name: string): boolean => {
    // Check if the ward name is unique in the allWards array
    return !allWards.some(ward => ward.name.toLowerCase() === name.toLowerCase());
  };

  const calculateShowingRange = () => {
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);
    return { start, end };
  };

  const { start, end } = calculateShowingRange();

  return (
    <div className="p-4 relative">
      <div className={`flex-grow transition-all duration-500 ${toggleAddWard ? 'mr-[25%]' : ''}`}>
        <div className="flex items-center justify-left mb-4 gap-2">
          <h2 className="text-xl font-bold">Ward Info</h2>
          <img
            onClick={showForm}
            className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
              toggleAddWard ? 'rotate-90' : 'rotate-0'
            }`}
            src="/images/icons/addtwo.svg"
            alt="Add Ward"
          />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">All Wards</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">Items per page:</span>
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="border p-1 rounded text-sm"
              >
                {[5, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full table-auto border-collapse mb-4">
            <thead className="text-left">
              <tr className="bg-gray-200">
                <th className="border p-2">Ward Name</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((ward, index) => (
                <tr key={ward.id || index}>
                  <td className="border p-2">{ward.name}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(ward.id!)}
                        className="p-1 text-black hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {start} to {end} of {pagination.totalItems} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1}
                className={`p-2 rounded ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
                aria-label="First page"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`p-2 rounded ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`p-2 rounded w-10 ${pagination.currentPage === pageNum ? 'bg-gray-300 font-medium' : 'text-black hover:bg-gray-200'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`p-2 rounded ${pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`p-2 rounded ${pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
                aria-label="Last page"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <ToastContainer
          className="z-50 mt-20"
          position="top-right"
          autoClose={3000}
        />
      </div>

      {/* Form for adding ward */}
      <div className={`fixed top-0 right-0 h-full w-[20%] bg-white border-l-2 py-28 border-gray-200 transform transition-transform duration-500 ease-in-out ${
        toggleAddWard ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 relative">
          <button 
            onClick={closeForm}
            className="absolute top-4 right-4 text-black hover:text-gray-700"
            aria-label="Close form"
          >
            <X size={20} />
          </button>

          <h3 className="text-lg font-semibold mb-4 text-black">Add Ward</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="mb-2">
              <label htmlFor="name" className="block font-medium mb-1 text-black">
                Ward Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                placeholder="Enter Ward Name"
                value={formData.name}
                onChange={handleChange}
                className={`block border p-2 w-full ${
                  formData.name && !isWardUnique(formData.name)
                    ? 'border-red-500' 
                    : ''
                }`}
                required
              />
              {formData.name && !isWardUnique(formData.name) && (
                <p className="text-red-500 text-sm mt-1">Ward name must be unique</p>
              )}
            </div>

            <button
              type="submit"
              className={`${
                formData.name && isWardUnique(formData.name)
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              } text-white px-4 py-2 rounded w-full transition-colors`}
              disabled={!formData.name || !isWardUnique(formData.name)}
            >
              Add Ward
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WardInfo;