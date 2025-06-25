'use client';
import { useState, useEffect } from 'react';
import ICAL from 'ical.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type CalendarEvent = {
  [key: string]: any;
};

type ICALEvent = {
  summary?: string;
  description?: string;
  location?: string;
  startDate?: { toJSDate: () => Date };
  endDate?: { toJSDate: () => Date };
  component?: {
    getFirstProperty: (name: string) => any;
    getFirstPropertyValue: (name: string) => any;
    getAllProperties: () => Array<{ name: string; getFirstValue: () => any }>;
  };
};

export default function ICSViewerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [visibleHeaders, setVisibleHeaders] = useState<string[]>([]);
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [history, setHistory] = useState<{ events: CalendarEvent[], headers: string[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newHeaderName, setNewHeaderName] = useState('');
  const eventsPerPage = 10;

  const flattenEventProperties = (event: any): CalendarEvent => {
    const flattened: CalendarEvent = {};
  
    // Handle ICS structure (ICAL.js events)
    if (event.startDate && typeof event.startDate.toJSDate === "function") {
      // Original ICS logic
      // ...
      return flattened; // ✅ Exit early for ICS events
    }
  
    // Handle Google API events (raw JSON)
    if (event.summary) flattened.summary = event.summary;
    if (event.description) flattened.description = event.description;
    if (event.location) flattened.location = event.location;
  
    if (event.start?.dateTime || event.start?.date) {
      const start = new Date(event.start.dateTime || event.start.date);
      flattened['start date'] = start.toLocaleDateString();
      flattened['start time'] = start.toLocaleTimeString();
    }
  
    if (event.end?.dateTime || event.end?.date) {
      const end = new Date(event.end.dateTime || event.end.date);
      flattened['end date'] = end.toLocaleDateString();
      flattened['end time'] = end.toLocaleTimeString();
    }
  
    if (event.recurrence) {
      flattened.recurrence = event.recurrence.join(", ");
    }
  
    if (event.organizer?.email) {
      flattened.organizer = event.organizer.email;
    }
  
    if (event.status) {
      flattened.status = event.status;
    }
  
    if (event.created) {
      flattened['created at'] = new Date(event.created).toLocaleString();
    }
  
    if (event.updated) {
      flattened['updated at'] = new Date(event.updated).toLocaleString();
    }
  
    if (event.attendees?.length) {
      flattened.attendees = event.attendees.map((a: any) => a.email).join(", ");
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

  const handleDeleteRow = (rowIndex: number) => {
    setHistory(prevHistory => [...prevHistory, { events, headers }]);
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents];
      updatedEvents.splice(rowIndex, 1);
      return updatedEvents;
    });
  };

 

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setEvents(lastState.events);
    setHeaders(lastState.headers);
    setHistory(prevHistory => prevHistory.slice(0, -1));
  };

  const downloadExcel = () => {
    const camelCaseHeaders = visibleHeaders.map(toCamelCase);
    const worksheetData = events.map(event =>
      Object.fromEntries(
        camelCaseHeaders.map((header, index) => [header, event[visibleHeaders[index]] || '-'])
      )
    );

    worksheetData.push({
      [camelCaseHeaders[0]]: 'Total Hours',
      ...Object.fromEntries(camelCaseHeaders.slice(1).map(() => ['-', '-'])),
      totalHours: calculateTotalHours(),
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Calendar Events");
    XLSX.writeFile(workbook, "calendar_events.xlsx");
  };

  const downloadPDF = () => {
    try {
      const camelCaseHeaders = visibleHeaders.map(toCamelCase);
      const tableData = events.map(event =>
        camelCaseHeaders.map((header, index) => event[visibleHeaders[index]] || '-')
      );

      tableData.push(
        camelCaseHeaders.map((header, index) =>
          index === 0 ? 'Total Hours' : index === camelCaseHeaders.length - 1 ? calculateTotalHours() : '-'
        )
      );

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Calendar Events", 14, 16);

      autoTable(doc, {
        head: [camelCaseHeaders],
        body: tableData,
        startY: 25,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
        },
      });

      doc.save("calendar_events.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const calculateTotalHours = () => {
    let totalHours = 0;

    events.forEach(event => {
      const start = event['start date'] && event['start time'] ? new Date(`${event['start date']} ${event['start time']}`) : null;
      const end = event['end date'] && event['end time'] ? new Date(`${event['end date']} ${event['end time']}`) : null;

      if (start && end) {
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });

    return totalHours.toFixed(2);
  };

  useEffect(() => {
    const stored = localStorage.getItem("googleEvents");
    if (stored) {
      const parsedEvents = JSON.parse(stored).map(flattenEventProperties);
      const allHeaders = new Set<string>();
      parsedEvents.forEach((event: CalendarEvent) => Object.keys(event).forEach((key) => allHeaders.add(key)));
      const sortedHeaders = Array.from(allHeaders).sort((a, b) => a.localeCompare(b)); // Sort headers alphabetically
      setHeaders(sortedHeaders);
      setVisibleHeaders(sortedHeaders); // Ensure all headers are visible
      setEvents(parsedEvents);
      setCurrentPage(1);
      localStorage.removeItem("googleEvents");
    }
  }, []); // Added useEffect for localStorage handling

  useEffect(() => {
    setVisibleHeaders(headers);
  }, [headers]);

  return (
    <div className="min-h-screen w-[100vw] p-4 sm:p-6 lg:p-8 flex items-start justify-center">
      <div className="w-full max-w-[90%]">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:text-3xl sm:mb-6">See Google Calendar Events</h1>

        
        {events.length > 0 && (
          <>
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:flex-wrap sm:gap-4 sm:mb-8 w-full">
           

              <div className="relative">
                <button
                  onClick={() => setShowHeaderDropdown((prev) => !prev)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto sm:px-5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                  </svg>
                  Select Columns
                </button>
                {showHeaderDropdown && (
                  <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-60 overflow-auto w-full sm:w-64">
                    {headers.map((header) => (
                      <label key={header} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleHeaders.includes(header)}
                          onChange={() => {
                            setVisibleHeaders((prev) =>
                              prev.includes(header)
                                ? prev.filter((h) => h !== header)
                                : [...prev, header]
                            );
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                        />
                        <span className="text-sm text-gray-700">{header}</span>
                      </label>
                    ))}
                    <button
                      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-lg w-full font-medium hover:bg-blue-600 transition-all"
                      onClick={() => setShowHeaderDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 sm:ml-auto">
                {history.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-sm sm:px-5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm1 10a1 1 0 11-2 0V8a1 1 0 112 0v5z" clipRule="evenodd" />
                    </svg>
                    Undo
                  </button>
                )}

                <button
                  onClick={downloadExcel}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-all flex items-center justify-center gap-2 shadow-sm sm:px-5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                  Download Excel
                </button>

                <button
                  onClick={downloadPDF}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-all flex items-center justify-center gap-2 shadow-sm sm:px-5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-50">
                    <tr>
                      {visibleHeaders.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider group sm:px-4 sm:py-3 whitespace-nowrap"
                        >
                          <div className="flex items-center justify-between">
                            <span>{toCamelCase(header)}</span>
                           
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">
                        Duration
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEvents.map((event, rowIndex) => {
                      const start = event['start date'] && event['start time'] ? new Date(`${event['start date']} ${event['start time']}`) : null;
                      const end = event['end date'] && event['end time'] ? new Date(`${event['end date']} ${event['end time']}`) : null;
                      const rowTotalHours = start && end ? ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2) : '-';

                      return (
                        <tr key={rowIndex} className="hover:bg-gray-50 transition-all">
                          {visibleHeaders.map((header) => (
                            <td key={`${rowIndex}-${header}`} className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100 sm:px-4 sm:py-3">
                              {event[header] || <span className="text-gray-400">-</span>}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-sm sm:px-4 sm:py-3 text-gray-700">{rowTotalHours}</td>
                          <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                            <button
                              onClick={() => handleDeleteRow(indexOfFirstEvent + rowIndex)}
                              className="text-red-500 hover:text-red-600 font-medium transition-all"
                              title="Delete row"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-b-xl sm:mt-6">
                <h2 className="text-base font-semibold text-gray-800 sm:text-lg">Consolidated Hour Summary</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total Hours: <span className="font-medium text-gray-800">{calculateTotalHours()}</span>
                </p>
              </div>

              {totalPages > 1 && (
                <div className="bg-white px-4 py-4 flex items-center justify-end border-t border-gray-100 sm:px-6">
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">First</span>
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Last</span>
                      »
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function toCamelCase(header: string) {
  return header
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, '');
}