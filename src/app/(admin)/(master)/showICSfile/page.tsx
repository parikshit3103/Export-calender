'use client';

import { useState, useEffect } from 'react';
import ICAL from 'ical.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type CalendarEvent = {
  [key: string]: any;
};

type EditableCellProps = {
  value: any;
  onSave: (newValue: any) => void;
};

const EditableCell = ({ value, onSave }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border rounded px-2 py-1 text-sm w-full"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Save
          </button>
        </div>
      ) : (
        <div 
          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          onClick={() => setIsEditing(true)}
        >
          {value || '-'}
        </div>
      )}
    </td>
  );
};

export default function ICSViewerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newHeaderName, setNewHeaderName] = useState('');
  const eventsPerPage = 10;

  const flattenEventProperties = (event: any) => {
    const flattened: CalendarEvent = {};
    
    if (event.summary) flattened.summary = event.summary;
    if (event.description) flattened.description = event.description;
    if (event.location) flattened.location = event.location;
    
    if (event.startDate) {
      const start = event.startDate.toJSDate();
      flattened['start date'] = start.toLocaleDateString();
      flattened['start time'] = start.toLocaleTimeString();
    }
    
    if (event.endDate) {
      const end = event.endDate.toJSDate();
      flattened['end date'] = end.toLocaleDateString();
      flattened['end time'] = end.toLocaleTimeString();
    }
    
    if (event.component && event.component.getFirstProperty('rrule')) {
      const rrule = event.component.getFirstPropertyValue('rrule');
      flattened.recurrence = rrule.toString();
    }
    
    if (event.component) {
      event.component.getAllProperties().forEach((prop: any) => {
        const name = prop.name.toLowerCase();
        if (!['dtstart', 'dtend', 'summary', 'description', 'location'].includes(name)) {
          const value = prop.getFirstValue();
          if (value) {
            if (typeof value === 'object' && 'toJSDate' in value) {
              const date = value.toJSDate();
              flattened[`${name} date`] = date.toLocaleDateString();
              flattened[`${name} time`] = date.toLocaleTimeString();
            } else {
              flattened[name] = value.toString();
            }
          }
        }
      });
    }
    
    return flattened;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const jcalData = ICAL.parse(content);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const parsedEvents = vevents.map((vevent) => {
          const event = new ICAL.Event(vevent);
          return flattenEventProperties(event);
        });

        const allHeaders = new Set<string>();
        parsedEvents.forEach(event => {
          Object.keys(event).forEach(key => {
            allHeaders.add(key);
          });
        });

        const sortedHeaders = Array.from(allHeaders).sort((a, b) => {
          const standardFields = ['summary', 'description', 'location', 'start date', 'start time', 'end date', 'end time'];
          const aIndex = standardFields.indexOf(a);
          const bIndex = standardFields.indexOf(b);
          
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          
          return a.localeCompare(b);
        });

        setHeaders(sortedHeaders);
        setEvents(parsedEvents);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error parsing ICS file:', err);
        alert('Failed to parse the ICS file.');
      }
    };

    reader.readAsText(file);
  };

  const handleCellEdit = (rowIndex: number, header: string, newValue: any) => {
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents];
      updatedEvents[rowIndex][header] = newValue;
      return updatedEvents;
    });
  };

  const handleAddRow = () => {
    setEvents(prevEvents => {
      const newRow: CalendarEvent = {};
      headers.forEach(header => {
        newRow[header] = '';
      });
      return [...prevEvents, newRow];
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents];
      updatedEvents.splice(rowIndex, 1);
      return updatedEvents;
    });
  };

  const handleAddColumn = () => {
    if (!newHeaderName.trim()) return;
    
    setHeaders(prev => [...prev, newHeaderName.trim()]);
    setEvents(prevEvents => 
      prevEvents.map(event => ({
        ...event,
        [newHeaderName.trim()]: ''
      }))
    );
    setNewHeaderName('');
  };

  const handleDeleteColumn = (header: string) => {
    setHeaders(prev => prev.filter(h => h !== header));
    setEvents(prevEvents => 
      prevEvents.map(event => {
        const newEvent = { ...event };
        delete newEvent[header];
        return newEvent;
      })
    );
  };

  // Download functions
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(events);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Calendar Events");
    XLSX.writeFile(workbook, "calendar_events.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.text("Calendar Events", 14, 16);
    
    // Prepare data for the table
    const pdfHeaders = headers.map(header => ({
      title: header,
      dataKey: header
    }));
    
    const pdfData = events.map(event => {
      const row: any = {};
      headers.forEach(header => {
        row[header] = event[header] || '-';
      });
      return row;
    });
    
    // Add table
    (doc as any).autoTable({
      head: [headers],
      body: pdfData.map(row => headers.map(header => row[header])),
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 'auto' }
      }
    });
    
    doc.save("calendar_events.pdf");
  };

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ICS File Viewer & Editor</h1>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Upload ICS File
        </label>
        <input
          type="file"
          accept=".ics"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {events.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleAddRow}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add New Row
            </button>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newHeaderName}
                onChange={(e) => setNewHeaderName(e.target.value)}
                placeholder="New column name"
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={handleAddColumn}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Column
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={downloadExcel}
                className="bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <span>Download Excel</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={downloadPDF}
                className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <span>Download PDF</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap group"
                      >
                        <div className="flex items-center justify-between">
                          <span>{header}</span>
                          <button
                            onClick={() => handleDeleteColumn(header)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2"
                            title="Delete column"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEvents.map((event, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((header) => (
                        <EditableCell
                          key={`${rowIndex}-${header}`}
                          value={event[header] || ''}
                          onSave={(newValue) => handleCellEdit(indexOfFirstEvent + rowIndex, header, newValue)}
                        />
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteRow(indexOfFirstEvent + rowIndex)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete row"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstEvent + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastEvent, events.length)}
                      </span>{' '}
                      of <span className="font-medium">{events.length}</span> events
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>
                        &laquo;
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}