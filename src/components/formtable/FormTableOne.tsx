
"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { tryLoadManifestWithRetries } from 'next/dist/server/load-components';


// type declaration
interface Mandi {
  _id?: string;
  name: string;
  contact: string;
  region: string;
}
// interface for paginated data
interface PaginatedData {
  data: Mandi[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const FormTableOne: React.FC = () => {
  // state variables
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [formData, setFormData] = useState<Mandi>({
    name: '',
    contact: '',
    region: ''
  });
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [toggleAddMandi, setToggleAddMandi] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toggleText, setToggleText] = useState('Add Mandi');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // function to show popup message
  const showPopup = (message: string) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(null), 3000);
  };

  // function to fetch mandis from the server with pagination
  const fetchMandis = async (page: number = pagination.currentPage, limit: number = pagination.limit) => {
    try {
      const res = await axios.get(`/api/mandis?page=${page}&limit=${limit}`);
      const data: PaginatedData = res.data;
      setMandis(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        limit
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch mandis');
    }
  };

  // useEffect to fetch mandis when the component mounts
  useEffect(() => {
    fetchMandis();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let error = "";
    // Name validation: only letters and spaces
    if (name === "name" && !/^[A-Za-z\s]*$/.test(value)) {
      error = "Name must contain only letters and spaces.";
    }
    //Name validation: length
    if (name ==="name" && value.length > 20) {
      error = "Name must be max 20 characters.";
    }
    // Number validation: only digits
    if (name === "contact" && !/^[0-9]*$/.test(value)) {
      error = "Number must contain only digits.";
    }

    if (name === "contact" &&  value.length > 10) {
      error = "Number must be 10 digits long.";
    }
    // no space in contact
    if (name === "contact" && /\s/.test(value)) {
      error = "Number must not contain spaces.";
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    if (!error) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { name } = e.target as HTMLInputElement;
    
    // Allow only letters and spaces for name
    if (name === "name" && !/^[A-Za-z\s]$/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
  
    // Allow only digits for number
    if (name === "contact" && !/^[0-9]$/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
  };
  // function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some((err) => err && err.trim() !== '');
      if (hasErrors) {
        toast.error('Please fix validation errors before submitting.');
        return;
      }
    try {
       if (toggleText === "Add Mandi") {
     await axios.post('/api/mandis', formData);
      toast.success('Mandi added!');
      showPopup(`${formData.name} is added successfully`);
    } else if (toggleText === "Update Mandi") {
      if (!formData._id) return;
       await axios.put('/api/mandis', formData);
      toast.success('Mandi updated!');
      showPopup(`${formData.name} is updated successfully`);
    } else if (toggleText === "Delete Mandi") {
      setConfirmDelete(false);
      const id = deleteId;;
      if (!id) return;
      try {
        await axios.delete(`/api/mandi?id=${id}`);
        if (mandis.length === 1 && pagination.currentPage > 1) {
          fetchMandis(pagination.currentPage - 1);
        } else {
          fetchMandis();
        }
        toast.success("Mandi deleted!");
        showPopup(`${formData.name} is deleted successfully`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete mandi');
      }
      

    }
    setFormData({ name: '', contact: '' , region: '' });
    fetchMandis();
    setToggleAddMandi(false);
   }   catch (error) {
      console.error(error);
          toast.error('Something went wrong!');
    }     
  }

  // function to handle editing a mandi
  const handleEdit = (mandi: Mandi) => {
    setFormData(mandi);
    setToggleText('Update Mandi');
    setToggleAddMandi(true);
  };

  // function to handle deleting a mandi
  const handleDelete = async (mandi: Mandi) => {
    setFormData(mandi);
    setDeleteId(mandi._id || null);
    setToggleText("Delete Mandi");
    setToggleAddMandi(true);
  };

  function showForm() {
    setToggleAddMandi(!toggleAddMandi);
    setToggleText("Add Mandi");
    setFormData({ name: '', contact: '', region: '' });
  }

  function closeForm() {
    setToggleAddMandi(false);
    setToggleText("Add Mandi");
    setFormData({ name: '', contact: '', region: '' });
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMandis(page);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    fetchMandis(1, newLimit);
  };

  return (
    <div className="p-4 relative">
      <div
        className={`flex-grow transition-all duration-500 ${
          toggleAddMandi ? 'mr-[25%]' : ''
        }`}
      >
        <div className="flex items-center justify-left mb-4 gap-2">
          <h2 className="text-xl font-bold">Mandi Collection</h2>
          <img
            onClick={showForm}
            className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
              toggleAddMandi ? 'rotate-90' : 'rotate-0'
            }`}
            src="/images/icons/addtwo.svg"
            alt=""
          />
        </div>
        {popupMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded shadow-lg z-50 animate-fade-in">
            {popupMessage}
          </div>
        )}

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">All Mandis</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">Items per page:</span>
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="border p-1 rounded text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>
          
          <table className="w-full table-auto border-collapse mb-4">
            <thead className="text-left">
              <tr className="bg-gray-200">
                <th className="border p-2">Name</th>
                <th className="border p-2">Contact</th>
                <th className="border p-2">Region</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mandis.map((mandi, index) => (
                <tr key={index}>
                  <td className="border p-2">{mandi.name}</td>
                  <td className="border p-2">{mandi.contact}</td>
                  <td className="border p-2">{mandi.region}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        className="p-1 text-black hover:text-gray-700"
                        onClick={() => handleEdit(mandi)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(mandi)}
                        className="p-1 text-black hover:text-red-600"
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
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
              {pagination.totalItems} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1}
                className={`p-2 rounded ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`p-2 rounded ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
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
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`p-2 rounded ${pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <ToastContainer className="mt-20" position="top-right" autoClose={3000} />
      </div>
      {/* Form for adding/updating/deleting mandi */}
<div id="form" className={`fixed top-0 right-0 h-full w-[20%] bg-white border-l-2 py-28 border-gray-200 transform transition-transform duration-500 ease-in-out ${
  toggleAddMandi ? 'translate-x-0' : 'translate-x-full'
}`}>
  <div className="p-4 relative">
    <button 
      onClick={closeForm}
      className="absolute top-4 right-4 text-black hover:text-gray-700"
    >
      <X size={20} />
    </button>
    
    <h3 className="text-lg font-semibold mb-4 text-black">{toggleText}</h3>
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="mb-2">
        <label htmlFor="name" className="block font-medium mb-1 text-black">
          Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="Enter Mandi Name"
          value={formData.name}
          onChange={handleChange}
          className={`block border p-2 w-full ${
            toggleText === 'Delete Mandi' || toggleText === 'Update Mandi' 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-white'
          }`}
          required
          readOnly={toggleText === 'Delete Mandi' || toggleText === 'Update Mandi'}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      </div>

      <div className="mb-2">
        <label htmlFor="contact" className="block font-medium mb-1 text-black">
          Contact Info
        </label>
        <input
          id="contact"
          name="contact"
          placeholder="Enter Contact Info"
          value={formData.contact}
          onChange={handleChange}
          className={`block border p-2 w-full  ${
            toggleText === 'Delete Mandi' 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-white'
          }`}
          required
          readOnly={toggleText === 'Delete Mandi'}
        />
        {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="region" className="block font-medium mb-1 text-black">
          Assigned Region
        </label>
        {toggleText === 'Delete Mandi' ? (
          <input
            id="region"
            name="region"
            value={formData.region}
            className="block border p-2 w-full bg-gray-100 cursor-not-allowed"
            readOnly
          />
        ) : (
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="block border p-2 w-full bg-white"
            required
          >
           <option value="" disabled hidden>Select Region</option>
            <option value="North Region">North Region</option>
            <option value="South Region">South Region</option>
            <option value="Middle Region">Middle Region</option>
          </select>
        )}
      </div>

      <button
        type="submit"
        className={`${
          formData.name && formData.contact && formData.region || toggleText === 'Delete Mandi' 
              ? 'bg-[#3C83ED]' 
              : 'bg-gray-300 cursor-not-allowed'
        } text-white px-4 py-2 rounded w-full transition-colors`}
        disabled={!formData.name || !formData.contact || !formData.region}
      >
        {toggleText}
      </button>
    </form>
  </div>
</div>
    </div>
  );
}; 
export default FormTableOne;