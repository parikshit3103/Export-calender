import React from 'react'
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';

interface TableProps {
    title: string;
    columns: string[];
    data: any[];
    pagination: {
        limit: number;
        currentPage: number;
        totalItems: number;
        totalPages: number;
    };
    onLimitChange: (limit: number) => void;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    onPageChange: (page: number) => void;
}

const ContentTable: React.FC<TableProps> = ({
    title,
    columns,
    data,
    pagination,
    onLimitChange,
    onEdit,
    onDelete,
    onPageChange,
}) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="flex items-center gap-2"></div>
                    <span className="text-sm">Items per page:</span>
                    <select
                        value={pagination.limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="border p-1 rounded text-sm"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            <table className="w-full table-auto border-collapse mb-4">
                <thead className="text-left">
                    <tr className="bg-gray-200">
                        {columns.map((column, index) => (
                            <th key={index} className="border p-2">
                                {column}
                            </th>
                        ))}
                        <th className="border p-2">Actions</th>
                    </tr>
                    </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className="border p-2">
                                    {item[column.toLowerCase()]}
                                </td>
                            ))}
                            <td className="border p-2">
                                <div className="flex gap-2">
                                    <button
                                        className="p-1 text-black hover:text-gray-700"
                                        onClick={() => onEdit(item)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item)}
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
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                    Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
                    {pagination.totalItems} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={pagination.currentPage === 1}
                        className={`p-2 rounded ${
                            pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'
                        }`}
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`p-2 rounded ${
                            pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'
                        }`}
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
                                onClick={() => onPageChange(pageNum)}
                                className={`p-2 rounded w-10 ${
                                    pagination.currentPage === pageNum ? 'bg-gray-300 font-medium' : 'text-black hover:bg-gray-200'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`p-2 rounded ${
                            pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'
                        }`}
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => onPageChange(pagination.totalPages)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`p-2 rounded ${
                            pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'
                        }`}
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>
            </div>
    );
};

export default ContentTable;