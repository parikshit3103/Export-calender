"use client";
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/lib/firebase';
import { ref, onValue, push, update, remove, get } from 'firebase/database';
import SearchBar from '@/components/searchBar/SearchBar';

interface WardInfo {
  id?: string;
  wardName: string;
  wardNumber: string;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10] as const;

const WardInfo: React.FC = () => {
  // State management
  const [wards, setWards] = useState<WardInfo[]>([]);
  const [formData, setFormData] = useState<WardInfo>({ 
    wardName: '', 
    wardNumber: '' 
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formAction, setFormAction] = useState<'Add' | 'Update' | 'Delete'>('Add');
   const [searchQuery, setSearchQuery] = useState('');
    const [allData, setAllData] = useState<WardInfo[]>([]);
    const [filteredData, setFilteredData] = useState<WardInfo[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching
  const fetchWards = async (page: number = 1, itemsPerPage: number = pagination.limit) => {
    try {
      const wardsRef = ref(db, 'wardInfo');
      const snapshot = await get(wardsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const wardsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

                setAllData(wardsArray);
      setFilteredData(wardsArray);

        // Sort wards by ID in descending order to get the latest entry first
        const sortedWards = wardsArray.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

        // Ensure the latest entry is always at the top of the first page
        const latestEntry = sortedWards[0];
        const paginatedData = sortedWards.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        // Add the latest entry to the top of the paginated data if it's not already included
        const finalData = page === 1 && latestEntry ? [latestEntry, ...paginatedData.filter(item => item.id !== latestEntry.id)] : paginatedData;

        setWards(finalData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(wardsArray.length / itemsPerPage),
          totalItems: wardsArray.length,
          limit: itemsPerPage
        });
      } else {
        setWards([]);
        resetPagination(itemsPerPage);
      }
    } catch (err) {
      console.error('Failed to fetch wards:', err);
      toast.error('Failed to fetch wards');
    }
  };

  const resetPagination = (itemsPerPage: number = 10) => {
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: itemsPerPage
    });
  };

  // Effects
  useEffect(() => {
    fetchWards();
    
    const wardsRef = ref(db, 'wardInfo');
    const unsubscribe = onValue(wardsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const wardsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        setWards(prev => {
          const startIndex = (pagination.currentPage - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          return wardsArray.slice(startIndex, endIndex);
        });
      } else {
        setWards([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'wardName') {
      // Allow only alphanumeric characters and no leading space
      const isValid = /^[a-zA-Z0-9 ]*$/.test(value);
      const noLeadingSpace = !/^\s/.test(value);

      if (isValid && noLeadingSpace) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'wardNumber') {
      // Allow only numbers
      if (/^\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check uniqueness for Add and Update actions
      const isUnique = isWardUnique(formData.wardName, formData.wardNumber, formData.id);
      if (!isUnique) {
        toast.error('Ward name or number must be unique');
        setIsSubmitting(false);
        return;
      }

      switch (formAction) {
        case 'Add':
          await push(ref(db, 'wardInfo'), formData);
          toast.success(`Ward "${formData.wardName}" added successfully`);
          break;
        case 'Update':
          if (formData.id) {
            await update(ref(db, `wardInfo/${formData.id}`), formData);
            toast.success(`Ward "${formData.wardName}" updated successfully`);
          }
          break;
        case 'Delete':
          if (deleteId) {
            await remove(ref(db, `wardInfo/${deleteId}`));
            toast.success(`Ward "${formData.wardName}" deleted successfully`);
          }
          break;
      }

      resetForm();
      fetchWards(pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error('Operation failed:', err);
      toast.error(`Failed to ${formAction.toLowerCase()} ward`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (query: string) => {
  setSearchQuery(query);

  if (query.trim() === '') {
    setFilteredData(allData);
    return;
  }

  const lower = query.toLowerCase();

  const result = allData.filter((item) =>
    item.wardName.toLowerCase().includes(lower) ||
    item.wardNumber.toLowerCase().includes(lower)
  );

  setFilteredData(result);

  // Reset pagination when search changes
  setPagination((prev) => ({
    ...prev,
    currentPage: 1,
    totalItems: result.length,
    totalPages: Math.ceil(result.length / prev.limit),
  }));
};

  const resetForm = () => {
    setFormData({ wardName: '', wardNumber: '' });
    setIsFormOpen(false);
    setFormAction('Add');
  };

  // Ward actions
  const handleEdit = (ward: WardInfo) => {
    setFormData(ward);
    setFormAction('Update');
    setIsFormOpen(true);
  };

  const handleDelete = (ward: WardInfo) => {
    setFormData(ward);
    setDeleteId(ward.id || null);
    setFormAction('Delete');
    setIsFormOpen(true);
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
    setFormAction('Add');
    setFormData({ wardName: '', wardNumber: '' });
  };

  // Pagination
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

  // Utility functions
  const isWardUnique = (wardName: string, wardNumber: string, id?: string) => {
    return !wards.some(ward => 
      (ward.wardName.toLowerCase() === wardName.toLowerCase() || 
       ward.wardNumber === wardNumber) && 
      ward.id !== id
    );
  };

  const calculateShowingRange = () => {
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);
    return { start, end };
  };

  const { start, end } = calculateShowingRange();

  // Derived values
  const formTitle = `${formAction} Ward${formAction === 'Add' ? '' : ' Info'}`;
  const isUnique = formData.wardName && formData.wardNumber && 
                  isWardUnique(formData.wardName, formData.wardNumber, formData.id);
  const showUniquenessError = formData.wardName && formData.wardNumber && 
                            !isUnique && formAction === 'Add' && !isSubmitting;

  return (
    <div className="p-4 relative">
      <div className={`flex-grow transition-all duration-500 ${isFormOpen ? 'mr-[25%]' : ''}`}>
        <div className="flex items-center justify-left mb-4 gap-2">
          <h2 className="text-xl font-bold">Ward Information</h2>
          <img
            onClick={toggleForm}
            className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
              isFormOpen ? 'rotate-90' : 'rotate-0'
            }`}
            src="/images/icons/addtwo.svg"
            alt="Add Ward"
          />
        </div>
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} placeholder='Search by Ward Name  or Ward Number...' />

        <div className="bg-white p-4 rounded shadow mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">All Wards</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">Items per page:</span>
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="border p-1 rounded text-sm"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          
          <table className="w-full table-auto border-collapse mb-4">
            <thead className="text-left">
              <tr className="bg-gray-200">
                <th className="border p-2">Ward Name</th>
                <th className="border p-2">Ward Number</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData
                .slice() // Create a copy of the array
                .sort((a, b) => (b.id || '').localeCompare(a.id || '')) // Sort by id in descending order
                .map((ward) => (
                  <tr key={ward.id}>
                    <td className="border p-2">{ward.wardName}</td>
                    <td className="border p-2">{ward.wardNumber}</td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(ward)}
                          className="p-1 text-black hover:text-gray-700"
                          aria-label="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ward)}
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
      
      {/* Form for adding/updating/deleting ward */}
      <div className={`fixed top-0 right-0 h-full w-[20%] bg-white border-l-2 py-28 border-gray-200 transform transition-transform duration-500 ease-in-out ${
        isFormOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 relative">
          <button 
            onClick={resetForm}
            className="absolute top-4 right-4 text-black hover:text-gray-700"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-lg font-semibold mb-4 text-black">{formTitle}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="mb-2">
              <label htmlFor="wardName" className="block font-medium mb-1 text-black">
                Ward Name <span className="text-red-500">*</span>
              </label>
              <input
                id="wardName"
                name="wardName"
                placeholder="Enter Ward Name"
                value={formData.wardName}
                onChange={handleChange}
                className={`block border p-2 w-full ${
                  showUniquenessError ? 'border-red-500' : ''
                }`}
                required={formAction !== 'Delete'}
                readOnly={formAction === 'Delete'}
              />
            </div>

            <div className="mb-2">
              <label htmlFor="wardNumber" className="block font-medium mb-1 text-black">
                Ward Number <span className="text-red-500">*</span>
              </label>
              <input
                id="wardNumber"
                name="wardNumber"
                placeholder="Enter Ward Number"
                value={formData.wardNumber}
                onChange={handleChange}
                className={`block border p-2 w-full ${
                  showUniquenessError ? 'border-red-500' : ''
                }`}
                required={formAction !== 'Delete'}
                readOnly={formAction === 'Delete'}
              />
              {showUniquenessError && (
                <p className="text-red-500 text-sm mt-1">Ward name or number must be unique</p>
              )}
            </div>

            <button
              type="submit"
              className={`${
                formAction === 'Delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : formData.wardName && formData.wardNumber && (formAction === 'Update' || isUnique)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
              } text-white px-4 py-2 rounded w-full transition-colors`}
              disabled={
                (formAction !== 'Delete' && (!formData.wardName || !formData.wardNumber)) ||
                (formAction === 'Add' && !isUnique)
              }
            >
              {formAction}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WardInfo;