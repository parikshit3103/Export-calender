'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function AddExcelPage() {
  const [data, setData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const bstr = event.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setData(jsonData);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleSubmit = async () => {
    if (data.length === 0) return alert('No data to upload!');

    const res = await fetch('/api/excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: data }),
    });

    const result = await res.json();
    alert(result.message || 'Upload complete!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Excel File</h1>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="mb-4" />

      {data.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <div className="overflow-auto max-h-[400px] border rounded">
            <table className="min-w-full table-auto border-collapse border">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="border px-2 py-1 bg-gray-100">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="border px-2 py-1">{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Save to Database
          </button>
        </>
      )}
    </div>
  );
}
