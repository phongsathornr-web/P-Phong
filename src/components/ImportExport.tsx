import React, { useState } from 'react';
import { WorkloadItem, THAI_MONTHS, WORKLOAD_CATEGORIES } from '../types';
import { Clipboard, Download, Upload, Check, AlertCircle, FileText, Info } from 'lucide-react';

interface ImportExportProps {
  workloads: WorkloadItem[];
  setWorkloads: (items: WorkloadItem[]) => void;
  appendWorkloads: (items: WorkloadItem[]) => void;
}

export default function ImportExport({
  workloads,
  setWorkloads,
  appendWorkloads
}: ImportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Example Excel template data for copy-paste demonstration
  const sampleExcelText = 
`เดือน\tสัปดาห์\tหมวดหมู่\tชื่องาน\tผู้รับผิดชอบ\tชั่วโมง\tวันที่\tสถานะ
กรกฎาคม\t1\tงานสอน (Lecture/Lab)\tบรรยายวิชาทันตกรรมร่วมสมัย\tรศ.ทพญ. พรทิพย์\t2\t2026-07-01\tpending
กรกฎาคม\t2\tงานบริการรักษา (คลินิก)\tผ่าฟันคุดเคสพิเศษบ่าย\tอ.ทพ. นพดล\t3\t2026-07-08\tcompleted
สิงหาคม\t1\tงานวิจัยและวิชาการ\tเขียนบทความวิจัย Oral Biology\tผ่าฟันคุด\t5\t2026-08-04\tpending`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleExcelText);
    alert('คัดลอกรูปแบบตาราง Excel ตัวอย่างแล้ว! คุณสามารถนำไปวางใน Excel เพื่อทดลองแก้ไขข้อมูลได้');
  };

  const handleImportPaste = () => {
    setImportError(null);
    setImportSuccess(null);

    if (!pasteText.trim()) {
      setImportError('กรุณาวางข้อมูลจาก Excel หรือ Google Sheets ก่อนกดบันทึก');
      return;
    }

    try {
      const lines = pasteText.trim().split('\n');
      if (lines.length === 0) {
        throw new Error('ไม่พบข้อมูลใดๆ');
      }

      // Check for headers (optional, let's look at the first line)
      let startIndex = 0;
      const firstLineLower = lines[0].toLowerCase();
      if (
        firstLineLower.includes('เดือน') || 
        firstLineLower.includes('สัปดาห์') || 
        firstLineLower.includes('month') || 
        firstLineLower.includes('week')
      ) {
        startIndex = 1; // skip header line
      }

      const parsedItems: WorkloadItem[] = [];

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // split by tab (Excel/Google Sheets default) or fallback to comma
        const columns = line.split(line.includes('\t') ? '\t' : ',');

        // Expected format: Month, Week, Category, Title, Responsible, Hours, Date, Status
        if (columns.length < 4) {
          throw new Error(`บรรทัดที่ ${i + 1} มีข้อมูลไม่ครบถ้วน (ต้องการอย่างน้อย เดือน, สัปดาห์, หมวดหมู่, ชื่องาน)`);
        }

        const rawMonth = columns[0]?.trim();
        const rawWeek = parseInt(columns[1]?.trim() || '1', 10);
        const rawCategory = columns[2]?.trim();
        const rawTitle = columns[3]?.trim();
        const rawResponsible = columns[4]?.trim() || 'ไม่ระบุ';
        const rawHours = parseInt(columns[5]?.trim() || '1', 10);
        const rawDate = columns[6]?.trim() || '';
        const rawStatus = columns[7]?.trim().toLowerCase() === 'completed' || columns[7]?.trim() === 'เสร็จแล้ว' ? 'completed' : 'pending';

        // Validate month
        let validMonth = 'กรกฎาคม';
        const matchedMonth = THAI_MONTHS.find(m => m.includes(rawMonth) || rawMonth.includes(m));
        if (matchedMonth) {
          validMonth = matchedMonth;
        } else if (rawMonth) {
          validMonth = rawMonth; // Allow customized months if any
        }

        // Validate Category
        let validCategory = WORKLOAD_CATEGORIES[4]; // Default "ทั่วไป"
        const matchedCategory = WORKLOAD_CATEGORIES.find(cat => cat.includes(rawCategory) || rawCategory.includes(cat));
        if (matchedCategory) {
          validCategory = matchedCategory;
        } else if (rawCategory) {
          validCategory = rawCategory;
        }

        parsedItems.push({
          id: Math.random().toString(36).substr(2, 9),
          title: rawTitle,
          description: '',
          month: validMonth,
          week: isNaN(rawWeek) ? 1 : rawWeek,
          category: validCategory,
          responsible: rawResponsible,
          status: rawStatus as 'completed' | 'pending',
          hours: isNaN(rawHours) ? 1 : rawHours,
          date: rawDate
        });
      }

      if (parsedItems.length === 0) {
        throw new Error('ไม่สามารถถอดรหัสแถวข้อมูลได้ โปรดตรวจสอบความถูกต้อง');
      }

      if (importMode === 'replace') {
        setWorkloads(parsedItems);
      } else {
        appendWorkloads(parsedItems);
      }

      setImportSuccess(`อัปโหลดสำเร็จ! นำเข้าข้อมูลจำนวน ${parsedItems.length} รายการเรียบร้อยแล้ว`);
      setPasteText('');
      
      // Auto close modal after brief delay
      setTimeout(() => {
        setIsOpen(false);
        setImportSuccess(null);
      }, 2000);

    } catch (err: any) {
      setImportError(err.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล กรุณาตรวจสอบรูปแบบคอลัมน์');
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workloads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Dent_Chula_Workloads_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const triggerJsonUpload = () => {
    const fileInput = document.getElementById('json-file-input');
    fileInput?.click();
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setWorkloads(parsed);
          alert(`อัปโหลดไฟล์ JSON และอัปเดตข้อมูล ${parsed.length} รายการเรียบร้อยแล้ว`);
          setIsOpen(false);
        } else {
          alert('รูปแบบไฟล์ไม่ถูกต้อง ไฟล์ JSON ต้องเป็นอาร์เรย์ของภาระงาน');
        }
      } catch (err) {
        alert('ไม่สามารถอ่านไฟล์ได้ โปรดตรวจสอบว่าเป็นไฟล์ JSON ที่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex gap-2">
        <button
          id="import-export-trigger-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl font-semibold border border-[#DE5983]/30 text-[#DE5983] hover:bg-[#DE5983]/5 cursor-pointer transition-colors"
        >
          <Clipboard className="w-4 h-4" />
          นำเข้า/ส่งออกข้อมูลด่วน (Excel/CSV)
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#2d2a2b]">เครื่องมือนำเข้าและส่งออกข้อมูล (Excel, Sheets, JSON)</h3>
                <p className="text-xs text-chula-gray">คัดลอกตารางจาก Excel หรือ Google Sheets มาวางเพื่ออัปเดตข้อมูลทั้งหมดได้ทันที</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-chula-gray hover:text-chula-pink font-semibold p-1.5 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-[#fcf9fa] border border-[#F2C1C8]/40 rounded-xl p-4 text-xs text-[#2d2a2b] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-chula-pink">
                <Info className="w-4 h-4" />
                <span>วิธีการนำเข้าข้อมูลภาระงานจาก Excel หรือ Google Sheets</span>
              </div>
              <p className="pl-6">
                1. ออกแบบตารางใน Excel หรือ Google Sheets ให้มีคอลัมน์เรียงลำดับดังนี้:
              </p>
              <div className="pl-6 overflow-x-auto">
                <code className="bg-white px-2 py-1 rounded border border-gray-200 text-chula-pink font-mono block w-max">
                  เดือน {"\t"} สัปดาห์ {"\t"} หมวดหมู่ {"\t"} ชื่องาน {"\t"} ผู้รับผิดชอบ {"\t"} ชั่วโมง {"\t"} วันที่ (YYYY-MM-DD) {"\t"} สถานะ (completed / pending)
                </code>
              </div>
              <p className="pl-6">
                2. ลากคลุมเลือกแถวข้อมูลเหล่านั้นใน Excel แล้วกด <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">Ctrl+C</kbd> (คัดลอก)
              </p>
              <p className="pl-6">
                3. นำมาวางลงในกล่องข้อความด้านล่าง แล้วกดปุ่ม <b>"บันทึกและนำเข้าข้อมูล"</b>
              </p>
              <button
                onClick={handleCopyTemplate}
                className="mt-2 text-chula-pink hover:underline font-semibold flex items-center gap-1 cursor-pointer pl-6"
              >
                <Clipboard className="w-3.5 h-3.5" />
                คัดลอกตัวอย่างเทมเพลต Excel ไปทดลองวาง
              </button>
            </div>

            {/* Paste Text Area */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#2d2a2b] block">
                วางข้อมูลตารางที่คัดลอกมาจาก Excel / Sheets
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="วางข้อมูลคัดลอก (Copy-Paste) ตรงนี้..."
                rows={6}
                className="w-full font-mono text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink focus:bg-white"
              />
            </div>

            {/* Import Mode Selection */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#fcf9fa] p-3.5 rounded-xl border border-gray-150">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#2d2a2b] block">ตัวเลือกการนำเข้า</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-chula-gray cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-chula-pink focus:ring-chula-pink"
                    />
                    <span>นำเข้าเพิ่มจากของเดิม (Append)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-chula-gray cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-chula-pink focus:ring-chula-pink"
                    />
                    <span className="text-rose-600 font-semibold">ล้างของเก่าและเขียนทับทั้งหมด (Replace)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleImportPaste}
                className="w-full sm:w-auto px-5 py-2.5 bg-chula-pink text-white rounded-xl text-xs font-bold hover:bg-chula-bright shadow-sm transition-colors cursor-pointer"
              >
                บันทึกและนำเข้าข้อมูล
              </button>
            </div>

            {/* Error/Success Feedbacks */}
            {importError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs border border-rose-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs border border-emerald-100">
                <Check className="w-4 h-4 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Downloader/Backup Section */}
            <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h4 className="text-xs font-bold text-[#2d2a2b]">สำรองข้อมูลภาระงานหลัก (JSON)</h4>
                <p className="text-[10px] text-chula-gray">ดาวน์โหลดข้อมูลทั้งหมดเก็บไว้บนคอมพิวเตอร์ของคุณ หรือกู้คืนได้ทุกเวลา</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {/* JSON File Uploader hidden */}
                <input
                  type="file"
                  id="json-file-input"
                  accept=".json"
                  onChange={handleJsonFileChange}
                  className="hidden"
                />
                <button
                  onClick={triggerJsonUpload}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-chula-gray hover:bg-gray-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  อัปโหลดไฟล์สำรอง (.json)
                </button>

                <button
                  onClick={exportToJson}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดข้อมูลทั้งหมด
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
