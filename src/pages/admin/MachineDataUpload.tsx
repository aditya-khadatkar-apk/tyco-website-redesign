import { useState } from 'react';

import * as XLSX from 'xlsx';
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { resolveStateId } from '../../data/stateMapping';

export default function MachineDataUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (uploadedFile: File) => {
    if (!uploadedFile.name.toLowerCase().endsWith('.xlsx') && !uploadedFile.name.toLowerCase().endsWith('.xls') && !uploadedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid Excel or CSV file.');
      return;
    }

    setError(null);
    setSuccess(null);
    processFile(uploadedFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      processSelectedFile(uploadedFile);
    }
  };

  const processFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON. The header is on row 2, so we might need to skip row 1 if it's a title.
      // Let's use range to skip the first row (title "2006-07 to 2025-26") if it exists.
      // We will just read raw data and find the header row.
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Find the primary header row (contains 'CLIENTS NAME')
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
        const row = rawJson[i];
        if (Array.isArray(row)) {
          const rowStr = row.map(cell => String(cell || '').toLowerCase().replace(/\\s+/g, ''));
          if (rowStr.some(cell => cell.includes('clientsname') || cell.includes('state'))) {
            headerRowIndex = i;
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        throw new Error("Could not find the header row containing 'CLIENTS NAME' or 'STATE'.");
      }

      const header1 = rawJson[headerRowIndex] || [];

      let srNoIdx = -1, dateIdx = -1, clientNameIdx = -1, areaIdx = -1, stateIdx = -1;
      let baggIdx = -1, pulvStart = -1, hamIdx = -1, airStart = -1;

      for (let col = 0; col < header1.length; col++) {
        const val = String(header1[col] || '').toLowerCase().replace(/\\s+/g, '_');
        if (val.includes('sr.no') || val.includes('sr_no') || val.includes('srno')) srNoIdx = col;
        else if (val.includes('date')) dateIdx = col;
        else if (val.includes('clients_name') || val.includes('clients name') || val.includes('clientname')) clientNameIdx = col;
        else if (val.includes('area')) areaIdx = col;
        else if (val.includes('state')) stateIdx = col;
        else if (val.includes('bagg')) baggIdx = col;
        else if (val.includes('pulveriser') || val.includes('pulverizor') || val.includes('pulv')) pulvStart = col;
        else if (val.includes('ham')) hamIdx = col;
        else if (val.includes('air class') || val.includes('airclass')) airStart = col;
      }

      if (stateIdx === -1 || clientNameIdx === -1) {
        throw new Error(`Missing required columns in header. Found: State at index ${stateIdx}, Client Name at index ${clientNameIdx}. Please check the spelling in row ${headerRowIndex + 1}.`);
      }

      // If some optional columns aren't found, we'll gracefully handle it.
      // Assuming layout: pulvStart to hamIdx-1 are pulverisers, airStart to end are air classifiers.

      // We slice immediately after the header row. 
      // If there's a sub-header row, it will safely be filtered out because it lacks a 'client_name' and 'state'.
      const dataRows = rawJson.slice(headerRowIndex + 1);

      const mappedData = dataRows.map((row: any[]) => {
        const stateName = (stateIdx !== -1 && row[stateIdx] ? row[stateIdx].toString().trim() : '');
        const stateId = resolveStateId(stateName);
        const clientName = (clientNameIdx !== -1 && row[clientNameIdx] ? row[clientNameIdx].toString().trim() : '');

        // Helper to sum a range of columns
        const sumCols = (start: number, end: number) => {
          if (start === -1 || end === -1 || start > end) return 0;
          let sum = 0;
          for (let c = start; c <= end; c++) {
            sum += parseInt(row[c]) || 0;
          }
          return sum;
        };

        const pulverisers = pulvStart !== -1 ? sumCols(pulvStart, (hamIdx !== -1 ? hamIdx - 1 : pulvStart + 4)) : 0;
        const airClassifiers = airStart !== -1 ? sumCols(airStart, Math.max(airStart + 1, row.length - 1)) : 0;

        return {
          sr_no: srNoIdx !== -1 ? parseInt(row[srNoIdx]) || null : null,
          date: dateIdx !== -1 ? row[dateIdx]?.toString() || null : null,
          client_name: clientName,
          area: areaIdx !== -1 ? row[areaIdx]?.toString() || null : null,
          state: stateName,
          state_id: stateId,
          bagging_mc: baggIdx !== -1 ? parseInt(row[baggIdx]) || 0 : 0,
          pulverisers,
          hammer_mill: hamIdx !== -1 ? parseInt(row[hamIdx]) || 0 : 0,
          air_classifiers: airClassifiers,
        };
      }).filter(row => row.state && row.client_name);

      if (mappedData.length === 0) {
        throw new Error(`Parsed 0 rows. Checked ${dataRows.length} rows, but none had both a State and a Client Name.`);
      }

      setParsedData(mappedData);
      setPreviewData(mappedData.slice(0, 10)); // Preview first 10 rows
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process the Excel file. Please ensure it matches the expected format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Delete existing data
      const { error: deleteError } = await supabase
        .from('client_machines')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) throw deleteError;

      // 2. Insert new data in batches of 100
      const batchSize = 100;
      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('client_machines')
          .insert(batch);

        if (insertError) throw insertError;

        setUploadProgress(Math.min(100, Math.round(((i + batchSize) / parsedData.length) * 100)));
      }

      setSuccess(`Successfully imported ${parsedData.length} records!`);
      setParsedData([]);
      setPreviewData([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to import data to database.');
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };



  return (
    <div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
          <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div
        className={`bg-white dark:bg-industrial-900 p-8 rounded-xl shadow-sm border mb-8 transition-colors ${isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
          : 'border-industrial-200 dark:border-industrial-800'
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) processSelectedFile(droppedFile);
        }}
      >
        <div className="max-w-2xl mx-auto">
          <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
            : 'border-industrial-300 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-950 hover:bg-industrial-100 dark:hover:bg-industrial-900'
            }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
              <FileSpreadsheet className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary-500' : 'text-industrial-400'}`} />
              <p className="mb-2 text-sm text-industrial-500 dark:text-industrial-400">
                <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-industrial-400">XLSX, XLS, or CSV files</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onClick={(e) => {
                (e.target as HTMLInputElement).value = '';
              }}
              onChange={handleFileUpload}
              disabled={isProcessing || isUploading}
            />
          </label>
        </div>
      </div>

      {isProcessing && (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-industrial-500">Processing file...</p>
        </div>
      )}

      {parsedData.length > 0 && !isProcessing && (
        <div className="bg-white dark:bg-industrial-900 rounded-xl shadow-sm border border-industrial-200 dark:border-industrial-800 overflow-hidden">
          <div className="p-6 border-b border-industrial-200 dark:border-industrial-800 flex justify-between items-center bg-industrial-50/50 dark:bg-industrial-950/50">
            <div>
              <h3 className="text-lg font-semibold text-industrial-900 dark:text-white">Preview Data</h3>
              <p className="text-sm text-industrial-500 dark:text-industrial-400 mt-1">
                Found {parsedData.length} valid rows. Showing first 10.
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={isUploading}
              className="flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Importing...' : 'Confirm & Import'}
            </button>
          </div>

          {isUploading && (
            <div className="p-6 bg-industrial-50 dark:bg-industrial-950 border-b border-industrial-200 dark:border-industrial-800">
              <div className="flex justify-between text-sm mb-2 text-industrial-600 dark:text-industrial-400">
                <span>Uploading to database...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-industrial-200 dark:bg-industrial-800 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-industrial-50 dark:bg-industrial-950 text-industrial-500 dark:text-industrial-400 font-medium">
                <tr>
                  <th className="px-6 py-3">Client Name</th>
                  <th className="px-6 py-3">State</th>
                  <th className="px-6 py-3">Mapped ID</th>
                  <th className="px-6 py-3">Bagging M/C</th>
                  <th className="px-6 py-3">Pulverisers</th>
                  <th className="px-6 py-3">Hammer Mill</th>
                  <th className="px-6 py-3">Air Class.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100 dark:divide-industrial-800">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-industrial-50 dark:hover:bg-industrial-800/50">
                    <td className="px-6 py-3 font-medium text-industrial-900 dark:text-industrial-100">{row.client_name}</td>
                    <td className="px-6 py-3 text-industrial-600 dark:text-industrial-300">{row.state}</td>
                    <td className="px-6 py-3">
                      {row.state_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {row.state_id}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Unmapped
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-industrial-600 dark:text-industrial-300">{row.bagging_mc}</td>
                    <td className="px-6 py-3 text-industrial-600 dark:text-industrial-300">
                      {row.pulverisers}
                    </td>
                    <td className="px-6 py-3 text-industrial-600 dark:text-industrial-300">{row.hammer_mill}</td>
                    <td className="px-6 py-3 text-industrial-600 dark:text-industrial-300">{row.air_classifiers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
