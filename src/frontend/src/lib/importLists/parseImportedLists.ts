/**
 * Client-side parsing utilities for importing Party Names and Item Names from CSV/XLSX files.
 * Supports both CSV files with headers and XLSX files with separate "Parties" and "Items" sheets.
 */

interface ParseResult {
  parties: string[];
  items: string[];
  errors: string[];
}

/**
 * Parse an uploaded file (CSV or XLSX) and extract party and item names.
 */
export async function parseImportedLists(file: File): Promise<ParseResult> {
  const result: ParseResult = {
    parties: [],
    items: [],
    errors: [],
  };

  try {
    const fileExtension = file.name.toLowerCase().split('.').pop();

    if (fileExtension === 'csv') {
      return await parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return await parseXLSX(file);
    } else {
      result.errors.push(
        'Unsupported file format. Please upload a .csv or .xlsx file.'
      );
      return result;
    }
  } catch (error) {
    result.errors.push(
      `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return result;
  }
}

/**
 * Parse CSV file with headers like "party", "partyName", "item", or "itemName"
 */
async function parseCSV(file: File): Promise<ParseResult> {
  const result: ParseResult = {
    parties: [],
    items: [],
    errors: [],
  };

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length === 0) {
      result.errors.push('The CSV file is empty.');
      return result;
    }

    // Parse header row
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

    // Find party and item columns
    const partyColumnIndex = headers.findIndex((h) =>
      ['party', 'partyname', 'party name'].includes(h)
    );
    const itemColumnIndex = headers.findIndex((h) =>
      ['item', 'itemname', 'item name'].includes(h)
    );

    if (partyColumnIndex === -1 && itemColumnIndex === -1) {
      result.errors.push(
        'Could not find "party" or "item" columns in the CSV. Expected headers like "partyName" or "itemName".'
      );
      return result;
    }

    // Parse data rows
    const partiesSet = new Set<string>();
    const itemsSet = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = parseCSVLine(line);

      if (partyColumnIndex !== -1 && cells[partyColumnIndex]) {
        const value = cells[partyColumnIndex].trim();
        if (value) {
          partiesSet.add(value);
        }
      }

      if (itemColumnIndex !== -1 && cells[itemColumnIndex]) {
        const value = cells[itemColumnIndex].trim();
        if (value) {
          itemsSet.add(value);
        }
      }
    }

    result.parties = Array.from(partiesSet).sort();
    result.items = Array.from(itemsSet).sort();

    if (result.parties.length === 0 && result.items.length === 0) {
      result.errors.push('No valid party or item names found in the CSV file.');
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return result;
  }
}

/**
 * Simple CSV line parser that handles quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((cell) => cell.trim());
}

/**
 * Parse XLSX file looking for "Parties" and "Items" sheets
 */
async function parseXLSX(file: File): Promise<ParseResult> {
  const result: ParseResult = {
    parties: [],
    items: [],
    errors: [],
  };

  try {
    // Load XLSX library dynamically from CDN
    const XLSX = await loadXLSXLibrary();

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Look for "Parties" sheet
    const partiesSheet = workbook.Sheets['Parties'] || workbook.Sheets['parties'];
    if (partiesSheet) {
      const partiesData = XLSX.utils.sheet_to_json(partiesSheet, { header: 1 }) as any[][];
      const parties = extractValuesFromSheet(partiesData);
      result.parties = parties;
    }

    // Look for "Items" sheet
    const itemsSheet = workbook.Sheets['Items'] || workbook.Sheets['items'];
    if (itemsSheet) {
      const itemsData = XLSX.utils.sheet_to_json(itemsSheet, { header: 1 }) as any[][];
      const items = extractValuesFromSheet(itemsData);
      result.items = items;
    }

    if (!partiesSheet && !itemsSheet) {
      result.errors.push(
        'Could not find "Parties" or "Items" sheets in the Excel file. Please ensure your file has sheets named "Parties" and/or "Items".'
      );
    }

    if (result.parties.length === 0 && result.items.length === 0 && result.errors.length === 0) {
      result.errors.push('No valid party or item names found in the Excel file.');
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the file is a valid .xlsx file.`
    );
    return result;
  }
}

/**
 * Extract unique non-empty values from a sheet's data
 */
function extractValuesFromSheet(data: any[][]): string[] {
  const valuesSet = new Set<string>();

  // Skip header row, start from index 1
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // Get first non-empty cell in the row
    for (const cell of row) {
      if (cell !== null && cell !== undefined && cell !== '') {
        const value = String(cell).trim();
        if (value) {
          valuesSet.add(value);
          break; // Only take first non-empty value per row
        }
      }
    }
  }

  return Array.from(valuesSet).sort();
}

/**
 * Dynamically load XLSX library from CDN
 */
let xlsxLibraryPromise: Promise<any> | null = null;

function loadXLSXLibrary(): Promise<any> {
  if (xlsxLibraryPromise) {
    return xlsxLibraryPromise;
  }

  xlsxLibraryPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof (window as any).XLSX !== 'undefined') {
      resolve((window as any).XLSX);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
    script.async = true;

    script.onload = () => {
      if (typeof (window as any).XLSX !== 'undefined') {
        resolve((window as any).XLSX);
      } else {
        reject(new Error('XLSX library failed to load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load XLSX library from CDN'));
    };

    document.head.appendChild(script);
  });

  return xlsxLibraryPromise;
}
