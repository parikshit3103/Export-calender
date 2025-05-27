// File: ComplaintTemplate.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/lib/firebase';
import { ref, onValue, push, update, remove, get } from 'firebase/database';

interface ComplaintTemplate {
  id?: string;
  complaint: string;
  description: string;
}

const ComplaintTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<ComplaintTemplate[]>([]);
  const [formData, setFormData] = useState<ComplaintTemplate>({ 
    complaint: '', 
    description: '' 
  });
  const [toggleAddTemplate, setToggleAddTemplate] = useState(false);
  const [toggleText, setToggleText] = useState('Add Template');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // Function to fetch templates from Firebase
  const fetchTemplates = async (page: number = 1, itemsPerPage: number = pagination.limit) => {
    try {
      const templatesRef = ref(db, 'complaintTemplates');
      const snapshot = await get(templatesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const templatesArray: ComplaintTemplate[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        // Implement client-side pagination
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = templatesArray.slice(startIndex, endIndex);
        
        setTemplates(paginatedData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(templatesArray.length / itemsPerPage),
          totalItems: templatesArray.length,
          limit: itemsPerPage
        });
      } else {
        setTemplates([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: itemsPerPage
        });
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      toast.error('Failed to fetch templates');
    }
  };

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
    
    // Set up realtime listener
    const templatesRef = ref(db, 'complaintTemplates');
    const unsubscribe = onValue(templatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const templatesArray: ComplaintTemplate[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Update the list without changing pagination
        setTemplates(prev => {
          // Keep current pagination state
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'complaint') {
      // Validation for complaint field
      const isValid = /^[a-zA-Z0-9 ]*$/.test(value);
      const noLeadingSpace = !/^\s/.test(value);

      if (isValid && noLeadingSpace) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      // No validation for description field
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (toggleText === "Add Template") {
        // Add new template
        await push(ref(db, 'complaintTemplates'), formData);
        toast.success(`Template added successfully`);
      } 
      else if (toggleText === "Update Template" && formData.id) {
        // Update existing template
        await update(ref(db, `complaintTemplates/${formData.id}`), formData);
        toast.success(`Template updated successfully`);
      }
      else if (toggleText === "Delete Template" && deleteId) {
        // Delete template
        await remove(ref(db, `complaintTemplates/${deleteId}`));
        toast.success(`Template deleted successfully`);
      }
      
      setFormData({ complaint: '', description: '' });
      setToggleAddTemplate(false);
      setToggleText('Add Template');
      fetchTemplates(pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error('Operation failed:', err);
      toast.error(`Failed to ${toggleText.toLowerCase()} template`);
    }
  };

  const handleEdit = (template: ComplaintTemplate) => {
    setFormData(template);
    setToggleText('Update Template');
    setToggleAddTemplate(true);
  };

  const handleDelete = (template: ComplaintTemplate) => {
    setFormData(template);
    setDeleteId(template.id || null);
    setToggleText("Delete Template");
    setToggleAddTemplate(true);
  };

  const showForm = () => {
    setToggleAddTemplate(!toggleAddTemplate);
    setToggleText("Add Template");
    setFormData({ complaint: '', description: '' });
  };

  const closeForm = () => {
    setToggleAddTemplate(false);
    setToggleText("Add Template");
    setFormData({ complaint: '', description: '' });
  };

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

  const isTemplateUnique = (complaint: string, id?: string) => {
    return !templates.some(template => 
      template.complaint.toLowerCase() === complaint.toLowerCase() && template.id !== id
    );
  };

  const calculateShowingRange = () => {
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);
    return { start, end };
  };

  const { start, end } = calculateShowingRange();

  return (
    <div className="p-4 relative">
      <div className={`flex-grow transition-all duration-500 ${toggleAddTemplate ? 'mr-[25%]' : ''}`}>
        <div className="flex items-center justify-left mb-4 gap-2">
          <h2 className="text-xl font-bold">Complaint Templates</h2>
          <img
            onClick={showForm}
            className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
              toggleAddTemplate ? 'rotate-90' : 'rotate-0'
            }`}
            src="/images/icons/addtwo.svg"
            alt="Add Template"
          />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">All Templates</h3>
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
                <th className="border p-2">Complaint</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr key={template.id || index}>
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
        toggleAddTemplate ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 relative">
          <button 
            onClick={closeForm}
            className="absolute top-4 right-4 text-black hover:text-gray-700"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-lg font-semibold mb-4 text-black">{toggleText}</h3>
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
                  formData.complaint && !isTemplateUnique(formData.complaint, formData.id)
                    ? 'border-red-500' 
                    : ''
                }`}
                required={toggleText !== 'Delete Template'}
                readOnly={toggleText === 'Delete Template'}
              />
              {formData.complaint && !isTemplateUnique(formData.complaint, formData.id) && (
                <p className="text-red-500 text-sm mt-1">Complaint must be unique</p>
              )}
            </div>

            <div className="mb-2">
              <label htmlFor="description" className="block font-medium mb-1 text-black">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter Description"
                value={formData.description}
                onChange={handleChange}
                className="block border p-2 w-full h-24"
                required={false}
                readOnly={toggleText === 'Delete Template'}
              />
            </div>

            <button
              type="submit"
              className={`${
                toggleText === 'Delete Template'
                  ? 'bg-red-600 hover:bg-red-700'
                  : formData.complaint
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
              } text-white px-4 py-2 rounded w-full transition-colors`}
              disabled={!formData.complaint && toggleText !== 'Delete Template'}
            >
              {toggleText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTemplate;