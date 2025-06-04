import React , {useState} from 'react';
import BarLoader from 'react-spinners/BarLoader';
import "../../app/(admin)/styles.css";


import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2 ,
  Archive ,
  ArchiveRestore
} from 'lucide-react';

type ActionMode = 'delete' | 'archive' | 'disable' | 'flag' | "disable" | "restore"; // Add more if needed

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}


interface TableProps<T extends Record<string, any>> {
  data: T[];
  pagination: PaginationProps;
  goToPage: (page: number) => void;
  handleLimitChange: (e: React.ChangeEvent< HTMLSelectElement>) => void;
  isSideBarOpen: boolean;
  handleEdit: (row: T) => void;
  handleDelete: (row: T) => void;
  handleArchive : (row : T) => void ;
  handleArchiveRestore : (row : T) => void ;
  actionMode?: ActionMode;

}


const TableProp = <T extends Record<string, any>>({ data , pagination , goToPage , handleLimitChange , isSideBarOpen , handleDelete ,handleEdit , handleArchive , handleArchiveRestore , actionMode = 'delete' }: TableProps<T>) => {
  if (!data || data.length === 0) {
    return <div>
      <BarLoader color="#000"  />
    </div>;
  }
  console.log("data" , data);
  const headings = Object.keys(data[0]).filter(
  (key) => key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== "firstName" && key !== "lastName" && key !== "salutation" && key !== "middleName" && key !== "address" && key !== "photo" &&  key !== "gstin" && key !=="panNo" && key !== "isArchived"
);

const renderActionIcon = () => {
  switch (actionMode) {
    case 'archive':
      return <Archive className="w-5 h-5" />;
    case 'restore':
      return <ArchiveRestore className="w-5 h-5" />;
    case 'disable':
      return ;
    case 'delete':
    default:
      return <Trash2 className="w-5 h-5" />;
  }
};

  
  const handleAction = (row: any) => {
    switch (actionMode) {
      case 'archive':
        handleArchive?.(row);
        break;
      case 'restore':
        handleArchiveRestore?.(row);
        break;
      case 'disable':
        break;
      case 'delete':
      default:
        handleDelete?.(row);
        break;
    }
  };

  return (
    <div  className={`flew flex-grow transition-all  duration-500 overflow-x-auto  rounded-2xl border-2 p-4 shadow-md custom-scroll-table  ${
      isSideBarOpen ? 'mr-[25%]' : ''
    }`}>
       <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold"></h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">Items per page:</span>
              {handleLimitChange ? (
  <select
    value={pagination.limit}
    onChange={handleLimitChange}
    className="border p-1 rounded text-sm"
  >
    <option value="5">5</option>
    <option value="10">10</option>
     </select>
) : (
  <select
    defaultValue={pagination.limit}
    className="border p-1 rounded text-sm"
    disabled
  >
    <option value={pagination.limit}>{pagination.limit}</option>
  </select>
)}
            </div>
          </div>
    <table className="w-full border border-gray-300  ">
      <thead>
        <tr>
          {headings.map((key) => {
               const formattedKey = key === "countryCode"
               ? "Country Code" : key === "Select Country" ? "Country" :key === "Select State" ? "State" : key === "Select City" ? "City" : key === "formattedAddress" ? "Address" :  key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            return (
            <th key={key} className={`border px-4 py-2 bg-gray-100 text-left text-lg  `}>
              {formattedKey}
            </th>
            )})}
         {actionMode !== "disable" &&<th className={`border px-4 py-2 bg-gray-100 text-left text-lg `}>Actions</th>}
        
        </tr>
        
      </thead>
       <tbody>
      {data.map((item) => (
        <tr key={item._id}>
          {headings.map((key) => (
            <td key={key} className="border px-4 py-2 transition-all duration-200 text-base">
              {key === 'formattedAddress'
  ? (typeof item[key] === 'string'
      ? (() => {
          const words = item[key].split(' ');
          return words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
        })()
      : '')
  : typeof item[key] === 'boolean'
  ? item[key] ? 'True' : 'False'
  : item[key] || "N/A"}
            </td>
          ))}
<td className="border px-4 py-2">
            <div className="flex gap-2">
              {actionMode !== "restore" &&<button onClick={() => handleEdit(item)} className="p-1 text-black hover:text-gray-700">
                <Pencil size={18} />
              </button>}
              <button onClick={() => handleAction(item)} className={`p-1 text-black ${actionMode === "delete" ? "hover:text-red-600" : " hover:text-green-500"} `}>
               {renderActionIcon()}
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
  );
};

export default TableProp;
