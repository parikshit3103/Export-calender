"use client";
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/lib/firebase';
import { ref, onValue, push, update, remove, get } from 'firebase/database';
import SearchBar from '@/components/searchBar/SearchBar';

interface ComplaintTemplate {
  id?: string;
  complaint: string;
  description: string;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10] as const;

const ComplaintTemplate: React.FC = () => {
  // State management
  const [templates, setTemplates] = useState<ComplaintTemplate[]>([]);
  const [formData, setFormData] = useState<ComplaintTemplate>({ 
    complaint: '', 
    description: '' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [allData, setAllData] = useState<ComplaintTemplate[]>([]);
  const [filteredData, setFilteredData] = useState<ComplaintTemplate[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formAction, setFormAction] = useState<'Add' | 'Update' | 'Delete'>('Add');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching
  const fetchTemplates = async (page: number = 1, itemsPerPage: number = pagination.limit) => {
    try {
      const templatesRef = ref(db, 'complaintTemplates');
      const snapshot = await get(templatesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const templatesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

            setAllData(templatesArray);
      setFilteredData(templatesArray); // by default show al

        // Sort templates by ID in descending order to get the latest entry first
        const sortedTemplates = templatesArray.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

        // Ensure the latest entry is always at the top of the first page
        const latestEntry = sortedTemplates[0];
        const paginatedData = sortedTemplates.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        // Add the latest entry to the top of the paginated data if it's not already included
        const finalData = page === 1 && latestEntry ? [latestEntry, ...paginatedData.filter(item => item.id !== latestEntry.id)] : paginatedData;

        setTemplates(finalData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(templatesArray.length / itemsPerPage),
          totalItems: templatesArray.length,
          limit: itemsPerPage
        });
      } else {
        setTemplates([]);
        resetPagination(itemsPerPage);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      toast.error('Failed to fetch templates');
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
    item.complaint.toLowerCase().includes(lower) ||
    item.description.toLowerCase().includes(lower)
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
    fetchTemplates();
    
    const templatesRef = ref(db, 'complaintTemplates');
    const unsubscribe = onValue(templatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const templatesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        setTemplates(prev => {
          const startIndex = (pagination.currentPage - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          return templatesArray.slice(startIndex, endIndex);
        });
      } else {
        setTemplates([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'complaint') {
      const isValid = /^[a-zA-Z0-9 ]*$/.test(value);
      const noLeadingSpace = !/^\s/.test(value);

      if (isValid && noLeadingSpace) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'description') {
      // Limit description to 160 characters
      if (value.split(' ').length <= 160) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      switch (formAction) {
        case 'Add':
          await push(ref(db, 'complaintTemplates'), formData);
          toast.success(`Complaint "${formData.complaint}" added successfully`);
          break;
        case 'Update':
          if (formData.id) {
            await update(ref(db, `complaintTemplates/${formData.id}`), formData);
            toast.success(`"${formData.complaint}" updated successfully`);
          }
          break;
        case 'Delete':
          if (deleteId) {
            await remove(ref(db, `complaintTemplates/${deleteId}`));
            toast.success(`"${formData.complaint}" deleted successfully`);
          }
          break;
      }

      resetForm();
      fetchTemplates(pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error('Operation failed:', err);
      toast.error(`Failed to ${formAction.toLowerCase()} complaint`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ complaint: '', description: '' });
    setIsFormOpen(false);
    setFormAction('Add');
  };

  // Template actions
  const handleEdit = (template: ComplaintTemplate) => {
    setFormData(template);
    setFormAction('Update');
    setIsFormOpen(true);
  };

  const handleDelete = (template: ComplaintTemplate) => {
    setFormData(template);
    setDeleteId(template.id || null);
    setFormAction('Delete');
    setIsFormOpen(true);
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
    setFormAction('Add');
    setFormData({ complaint: '', description: '' });
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTemplates(page, pagination.limit);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchTemplates(1, newLimit);
  };

  // Utility functions
  const isTemplateUnique = (complaint: string, id?: string) => {
    return !templates.some(template => 
      template.complaint.toLowerCase() === complaint.toLowerCase() && 
      template.id !== id
    );
  };

  const calculateShowingRange = () => {
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);
    return { start, end };
  };

  const { start, end } = calculateShowingRange();

  // Derived values
  const formTitle = `${formAction} Complaint${formAction === 'Add' ? '' : ' Template'}`;
  const isUnique = formData.complaint && isTemplateUnique(formData.complaint, formData.id);
  const showUniquenessError = formData.complaint && !isUnique && formAction === 'Add' && !isSubmitting;

  return (
    <div className="p-4 relative">
       
      <div className={`flex-grow transition-all duration-500 ${isFormOpen ? 'mr-[25%]' : ''}`}>
        <div className="flex items-center justify-left mb-4 gap-2">
          <h2 className="text-xl font-bold">Complaint Templates</h2>
          <img
            onClick={toggleForm}
            className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
              isFormOpen ? 'rotate-90' : 'rotate-0'
            }`}
            src="/images/icons/addtwo.svg"
            alt="Add Template"
          />
        </div>
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} placeholder='Search by complaint or description...' />
        <div className="bg-white p-4 rounded shadow mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">All Templates</h3>
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
                <th className="border p-2">Complaint</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData
                .slice()
                .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
                .map((template) => (
                  <tr key={template.id}>
                    <td className="border p-2">{template.complaint}</td>
                    <td className="border p-2 max-w-xs truncate">{template.description}</td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-1 text-black hover:text-gray-700"
                          aria-label="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(template)}
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
      
      {/* Form for adding/updating/deleting template */}
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
              <label htmlFor="complaint" className="block font-medium mb-1 text-black">
                Complaint <span className="text-red-500">*</span>
              </label>
              <input
                id="complaint"
                name="complaint"
                placeholder="Enter Complaint"
                value={formData.complaint}
                onChange={handleChange}
                className={`block border p-2 w-full ${
                  showUniquenessError ? 'border-red-500' : ''
                }`}
                required={formAction !== 'Delete'}
                readOnly={formAction === 'Delete'}
              />
              {showUniquenessError && (
                <p className="text-red-500 text-sm mt-1">Complaint must be unique</p>
              )}
            </div>

            <div className="mb-2">
              <label htmlFor="description" className="block font-medium mb-1 text-black">
                Description <span className="text-gray-500">(Max 160 words)</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter Description"
                value={formData.description}
                onChange={handleChange}
                className="block border p-2 w-full h-24"
                required={false}
                readOnly={formAction === 'Delete'}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.split(' ').length}/160 words
              </p>
            </div>

            <button
              type="submit"
              className={`${
                formAction === 'Delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : formData.complaint && (formAction === 'Update' || isUnique)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
              } text-white px-4 py-2 rounded w-full transition-colors`}
              disabled={
                (formAction !== 'Delete' && !formData.complaint) ||
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

export default ComplaintTemplate;