import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to parse CSV properly (handles quotes, commas, and linebreaks in cells)
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      result.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  
  if (cell || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }
  
  return result;
}

// Transform Google Sheets edit link to CSV export link
function getCsvUrl(inputUrl: string): string {
  // If it's already an export URL, return as-is
  if (inputUrl.includes('/export')) {
    return inputUrl;
  }
  
  // Find spreadsheet ID
  const matches = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (matches && matches[1]) {
    const spreadsheetId = matches[1];
    // We can also target specific sheet tabs if GID is present
    const gidMatches = inputUrl.match(/gid=([0-9]+)/);
    const gidParam = gidMatches ? `&gid=${gidMatches[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gidParam}`;
  }
  
  return inputUrl;
}

// API to Fetch and Parse Google Sheets CSV
app.get("/api/fetch-sheets", async (req, res) => {
  try {
    const sheetUrlQuery = req.query.url as string;
    const defaultUrl = "https://docs.google.com/spreadsheets/d/17hZOzgw66ztaV04E_lZfF9vwjSwQ4sSgfXkOym4FiN0/edit?usp=sharing";
    
    const targetUrl = getCsvUrl(sheetUrlQuery || defaultUrl);
    
    console.log(`Fetching spreadsheet data from: ${targetUrl}`);
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`Google Sheets returned status ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const rawRows = parseCSV(csvText);
    
    if (rawRows.length === 0) {
      return res.json({ success: true, items: [] });
    }
    
    // Extract headers to match dynamically
    const headers = rawRows[0].map(h => h.trim());
    
    // Find index of headers dynamically
    let monthIndex = headers.findIndex(h => h.includes('เดือน') || h.toLowerCase() === 'month');
    let dateIndex = headers.findIndex(h => h.includes('วัน') || h.toLowerCase().includes('date'));
    let categoryIndex = headers.findIndex(h => h.includes('ประเภท') || h.toLowerCase().includes('category'));
    let titleIndex = headers.findIndex(h => h.includes('รายการ') || h.toLowerCase().includes('title') || h.toLowerCase().includes('subject'));
    let statusIndex = headers.findIndex(h => h.includes('สถานะ') || h.toLowerCase() === 'status');
    let orderIndex = headers.findIndex(h => h.includes('order') || h.includes('Order') || h.toLowerCase().includes('order'));
    let descIndex = headers.findIndex(h => h.includes('desc') || h.includes('รายละเอียด') || h.includes('วาระ') || h.toLowerCase().includes('detail'));

    // Fallbacks if header names differ or if standard column order is used (A=0, B=1, C=2, D=3, E=4, F=5, G=6)
    if (monthIndex === -1) monthIndex = 0;
    if (dateIndex === -1) dateIndex = 1;
    if (categoryIndex === -1) categoryIndex = 2;
    if (titleIndex === -1) titleIndex = 3;
    if (statusIndex === -1) statusIndex = 4; // Column E
    if (orderIndex === -1) orderIndex = 5;  // Column F
    if (descIndex === -1) descIndex = 6;   // Column G
    
    const items = [];
    
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (row.length === 0 || !row.some(val => val && val.trim() !== '')) continue; // skip empty rows
      
      const rawMonth = row[monthIndex] !== undefined ? row[monthIndex].trim() : (row[0] || 'สิงหาคม');
      const rawDate = row[dateIndex] !== undefined ? row[dateIndex].trim() : (row[1] || '');
      // Column C is index 2 in 0-indexed row array
      const rawCategory = (row[2] !== undefined && row[2].trim() !== '') 
        ? row[2].trim() 
        : (row[categoryIndex] !== undefined && row[categoryIndex].trim() !== '' ? row[categoryIndex].trim() : 'ทั่วไป');
      const rawTitle = row[titleIndex] !== undefined ? row[titleIndex].trim() : (row[3] || 'ไม่มีหัวข้อ');
      const rawStatus = row[statusIndex] !== undefined ? row[statusIndex].trim() : (row[4] || '');
      const rawOrder = row[orderIndex] !== undefined ? row[orderIndex].trim() : (row[5] || '');
      const rawDesc = row[descIndex] !== undefined ? row[descIndex].trim() : (row[6] || '');
      
      // Basic formatting
      // Parse date to YYYY-MM-DD if possible (input formats like d/m/yyyy)
      let formattedDate = '';
      let calculatedWeek = 1;
      
      if (rawDate) {
        const dateParts = rawDate.split('/');
        if (dateParts.length === 3) {
          const d = parseInt(dateParts[0], 10);
          const m = parseInt(dateParts[1], 10);
          const y = parseInt(dateParts[2], 10);
          
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
            // pad day and month
            const paddedD = d.toString().padStart(2, '0');
            const paddedM = m.toString().padStart(2, '0');
            // If year is 2 digits or BE year, normalize (e.g. 2026)
            let normalizedY = y;
            if (y > 2500) {
              normalizedY = y - 543; // BE to CE
            }
            formattedDate = `${normalizedY}-${paddedM}-${paddedD}`;
            
            // Calculate week of month: Math.ceil(day / 7)
            calculatedWeek = Math.ceil(d / 7);
            if (calculatedWeek > 5) calculatedWeek = 5;
          }
        } else {
          // Check if ISO string
          const dateObj = new Date(rawDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().slice(0, 10);
            calculatedWeek = Math.ceil(dateObj.getDate() / 7);
            if (calculatedWeek > 5) calculatedWeek = 5;
          }
        }
      }
      
      // Parse status from Column E
      const statusLower = rawStatus.toLowerCase();
      const isCompleted = 
        statusLower.includes('complete') || 
        statusLower.includes('เสร็จ') || 
        statusLower.includes('สำเร็จ') ||
        statusLower === 'done';
      
      // Clean up month name (e.g. "สิงหาคม 2569" -> extract just "สิงหาคม" to match filters, or keep it)
      let cleanMonth = rawMonth;
      if (rawMonth) {
        const firstWord = rawMonth.split(' ')[0];
        if (firstWord) {
          cleanMonth = firstWord;
        }
      }
      
      items.push({
        id: `sheet-${i}-${Math.random().toString(36).substr(2, 5)}`,
        title: rawTitle || 'ไม่มีหัวข้อ',
        description: rawDesc,
        month: cleanMonth || 'สิงหาคม',
        week: calculatedWeek,
        category: rawCategory || 'ทั่วไป',
        responsible: 'ดึงข้อมูลจาก Google Sheets',
        status: (isCompleted ? 'completed' : 'pending') as 'completed' | 'pending',
        hours: 1, // default
        date: formattedDate || undefined,
        rawStatus: rawStatus || (isCompleted ? 'Completed' : 'On Process'), // Exact text from Column E
        orderNumber: rawOrder // Exact text from Column F
      });
    }
    
    res.json({
      success: true,
      items: items,
      sourceUrl: targetUrl
    });
    
  } catch (error: any) {
    console.error("Error fetching Google Sheets:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Google Sheets data"
    });
  }
});

// Serve Vite client app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
