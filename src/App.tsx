import React, { useState, useEffect } from 'react';
import { WorkloadItem, WORKLOAD_CATEGORIES, THAI_MONTHS, isAllowedCategory } from './types';
import { INITIAL_WORKLOADS } from './mockData';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskTable from './components/TaskTable';
import TaskCalendar from './components/TaskCalendar';
import TaskForm from './components/TaskForm';
import ImportExport from './components/ImportExport';
import { Plus, RefreshCw, Sparkles, BookOpen, Layers, FileSpreadsheet, Settings2, Loader2, AlertCircle, Check } from 'lucide-react';

const getCurrentThaiMonth = (): string => {
  const monthIndex = new Date().getMonth();
  return THAI_MONTHS[monthIndex] || 'สิงหาคม';
};

export default function App() {
  const [workloads, setWorkloads] = useState<WorkloadItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentThaiMonth);
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkloadItem | null>(null);

  // Google Sheets integration state
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('dent_chula_sheet_url') || "https://docs.google.com/spreadsheets/d/17hZOzgw66ztaV04E_lZfF9vwjSwQ4sSgfXkOym4FiN0/edit?usp=sharing";
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('dent_chula_last_sync') || null;
  });
  const [syncMode, setSyncMode] = useState<'overwrite' | 'append'>('overwrite');
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState<boolean>(false);

  const handleSyncSheets = async (targetUrl = sheetUrl, mode = syncMode, isFirstLoad = false) => {
    setIsSyncing(true);
    setSyncError(null);
    if (!isFirstLoad) {
      setSyncSuccess(null);
    }
    try {
      const response = await fetch(`/api/fetch-sheets?url=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !data.items) {
        throw new Error(data.message || "ไม่สามารถดึงหรือวิเคราะห์ข้อมูลจาก Google Sheets ได้");
      }

      const fetchedItems = data.items;
      if (mode === 'overwrite') {
        setWorkloads(fetchedItems);
        localStorage.setItem('dent_chula_workloads', JSON.stringify(fetchedItems));
      } else {
        const combined = [...fetchedItems, ...workloads];
        setWorkloads(combined);
        localStorage.setItem('dent_chula_workloads', JSON.stringify(combined));
      }

      localStorage.setItem('dent_chula_sheet_url', targetUrl);
      const nowStr = new Date().toLocaleString('th-TH');
      localStorage.setItem('dent_chula_last_sync', nowStr);
      
      setSheetUrl(targetUrl);
      setLastSyncTime(nowStr);
      setSyncSuccess(`เชื่อมต่อดึงข้อมูลจาก Google Sheets สำเร็จ! (นำเข้าทั้งหมด ${fetchedItems.length} รายการ)`);
      
      setTimeout(() => setSyncSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncError(`เกิดข้อผิดพลาดในการดึงข้อมูลชีต: ${err.message || 'โปรดตรวจสอบสิทธิ์การแชร์ลิงก์ของ Google Sheets'}`);
      
      // On failure, if there are no items in state, fall back to initials
      const saved = localStorage.getItem('dent_chula_workloads');
      if (!saved || saved === "[]") {
        setWorkloads(INITIAL_WORKLOADS);
        localStorage.setItem('dent_chula_workloads', JSON.stringify(INITIAL_WORKLOADS));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Load workloads from localStorage or sync from sheet on first launch
  useEffect(() => {
    const saved = localStorage.getItem('dent_chula_workloads');
    const lastSync = localStorage.getItem('dent_chula_last_sync');
    if (saved && saved !== "[]") {
      try {
        setWorkloads(JSON.parse(saved));
        if (lastSync) setLastSyncTime(lastSync);
      } catch (e) {
        handleSyncSheets(sheetUrl, 'overwrite', true);
      }
    } else {
      // First time opening the app! Let's auto-sync from their sheet!
      handleSyncSheets(sheetUrl, 'overwrite', true);
    }
  }, []);

  // Sync back to localStorage whenever workloads change
  const saveWorkloads = (updated: WorkloadItem[]) => {
    setWorkloads(updated);
    localStorage.setItem('dent_chula_workloads', JSON.stringify(updated));
  };

  // Status toggle handler
  const handleToggleStatus = (id: string) => {
    const password = prompt('กรุณาใส่รหัสผ่านเพื่อเปลี่ยนสถานะงาน:');
    if (password !== 'alovedentmu') {
      alert('รหัสผ่านไม่ถูกต้อง ไม่สามารถเปลี่ยนสถานะงานได้');
      return;
    }

    const updated = workloads.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
        const nextRawStatus = nextStatus === 'completed' ? 'Completed' : 'On Process';
        return { 
          ...item, 
          status: nextStatus as 'completed' | 'pending',
          rawStatus: nextRawStatus
        };
      }
      return item;
    });
    saveWorkloads(updated);
  };

  // Add or edit save handler
  const handleSaveItem = (itemData: Omit<WorkloadItem, 'id'> & { id?: string }) => {
    if (itemData.id) {
      // Edit mode
      const updated = workloads.map((item) => {
        if (item.id === itemData.id) {
          return { ...item, ...itemData } as WorkloadItem;
        }
        return item;
      });
      saveWorkloads(updated);
    } else {
      // Add mode
      const newItem: WorkloadItem = {
        ...itemData,
        id: Math.random().toString(36).substr(2, 9),
      };
      saveWorkloads([newItem, ...workloads]);
    }
    setEditingItem(null);
  };

  // Delete item handler
  const handleDeleteItem = (id: string) => {
    const updated = workloads.filter((item) => item.id !== id);
    saveWorkloads(updated);
  };

  // Duplicate item handler (quick repeat)
  const handleDuplicateItem = (item: WorkloadItem) => {
    const duplicated: WorkloadItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      title: `${item.title} (สำเนา)`,
      status: 'pending' // Default copies to pending
    };
    saveWorkloads([duplicated, ...workloads]);
  };

  // Update a single field inline (For Live Edit Mode)
  const handleUpdateField = (id: string, field: keyof WorkloadItem, value: any) => {
    if (field === 'rawStatus' || field === 'status') {
      const password = prompt('กรุณาใส่รหัสผ่านเพื่อเปลี่ยนสถานะงาน:');
      if (password !== 'alovedentmu') {
        alert('รหัสผ่านไม่ถูกต้อง ไม่สามารถเปลี่ยนสถานะงานได้');
        return;
      }
    }
    const updated = workloads.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    saveWorkloads(updated);
  };

  // Appending batch workloads from Excel/TSV
  const handleAppendWorkloads = (newItems: WorkloadItem[]) => {
    saveWorkloads([...newItems, ...workloads]);
  };

  // Overwriting entire workloads from JSON
  const handleSetWorkloads = (newItems: WorkloadItem[]) => {
    saveWorkloads(newItems);
  };

  // Reset to initial mock workloads
  const handleResetToDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (ข้อมูลที่บันทึกไว้ในเบราว์เซอร์จะถูกเขียนทับ)')) {
      saveWorkloads(INITIAL_WORKLOADS);
    }
  };

  // Filter workloads based on selection
  const filteredWorkloads = workloads.filter((item) => {
    // 1. Month filter
    const matchesMonth =
      selectedMonth === 'all' ||
      selectedMonth === 'ทั้งหมด' ||
      item.month === selectedMonth;
    
    // 2. Week filter
    const matchesWeek = selectedWeek === 'all' || item.week === parseInt(selectedWeek, 10);
    
    // 3. Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // 4. Search query filter
    const matchesSearch = 
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMonth && matchesWeek && matchesCategory && matchesSearch;
  });

  const resetAllFilters = () => {
    setSelectedMonth(getCurrentThaiMonth());
    setSelectedWeek('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // Unique categories derived from Google Sheets Column C & default list
  const availableCategories = Array.from(
    new Set([
      ...WORKLOAD_CATEGORIES,
      ...workloads.map((w) => w.category).filter(Boolean)
    ])
  ).filter(isAllowedCategory);

  return (
    <div id="app-root-container" className="min-h-screen bg-[#FAF4F6] text-[#381A24] font-sans pb-16">
      
      {/* 1. BRAND HEADER (Dent Chula Pink Theme) */}
      <header className="bg-white border-b border-[#F7C6D3]/60 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-11 h-11 bg-gradient-to-br from-[#DE5983] to-[#B82852] rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-[#DE5983]/25 shrink-0">
              DENT
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] bg-[#DE5983]/10 text-[#DE5983] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  ระบบภายใน
                </span>
                <span className="text-[10px] bg-[#B82852]/10 text-[#B82852] px-2.5 py-0.5 rounded-full font-bold">
                  Dent Chula
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#381A24] mt-0.5">
                ฝ่ายวิชาการและบัณฑิตศึกษา • ระบบติดตามภาระงานคณะทันตแพทยศาสตร์ จุฬาฯ
              </h1>
              <p className="text-[11px] text-chula-gray">
                Faculty of Dentistry, Chulalongkorn University • Workload Dashboard
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ImportExport
              workloads={workloads}
              setWorkloads={handleSetWorkloads}
              appendWorkloads={handleAppendWorkloads}
            />
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#DE5983]/10 via-[#F8D7E0]/40 to-[#B82852]/10 border border-[#F7C6D3] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#381A24] flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#DE5983]" />
              ยินดีต้อนรับเข้าสู่ระบบจัดการและติดตามภาระงานบุคลากร
            </h2>
            <p className="text-xs text-chula-gray">
              คณะทันตแพทยศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
            </p>
          </div>
          <div className="text-xs text-[#B82852] font-bold bg-white border border-[#F7C6D3] px-3.5 py-1.5 rounded-xl shadow-2xs">
            ปีการศึกษา 2569 (2026)
          </div>
        </div>

        {/* GOOGLE SHEETS SYNC STATUS PANEL */}
        <div id="google-sheets-sync-panel" className="bg-white border border-[#F7C6D3] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#DE5983]/10 rounded-xl flex items-center justify-center text-[#DE5983] shrink-0 border border-[#F7C6D3]">
                <FileSpreadsheet className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-0.5 max-w-md sm:max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#381A24]">
                    เชื่อมต่อ Google Sheets ภาระงานของคณะแล้ว
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    ซิงค์ข้อมูลแล้ว
                  </span>
                </div>

                {lastSyncTime && (
                  <p className="text-[11px] text-[#B82852] font-medium flex items-center gap-1 mt-0.5">
                    <span className="inline-block">🔄 อัปเดตล่าสุด: {lastSyncTime}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="sync-sheet-now-btn"
                disabled={isSyncing}
                onClick={() => handleSyncSheets()}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#DE5983] to-[#B82852] hover:opacity-95 disabled:opacity-75 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs disabled:cursor-not-allowed cursor-pointer"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'ดึงข้อมูลใหม่จาก Google Sheets'}
              </button>
            </div>

          </div>

          {/* Sync Alerts */}
          {syncError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <div>{syncError}</div>
            </div>
          )}

          {syncSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <div>{syncSuccess}</div>
            </div>
          )}

          {/* Settings Panel Drawer */}
          {isSheetSettingsOpen && (
            <div className="bg-[#fcf9fa] border border-gray-150 p-4 rounded-xl space-y-3 mt-2">
              <h4 className="text-xs font-bold text-[#2d2a2b] flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-chula-pink" />
                ตั้งค่าการเชื่อมต่อ Google Sheets ภาระงาน
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="col-span-1 md:col-span-7 space-y-1">
                  <label className="text-[10px] font-bold text-chula-gray block uppercase">
                    ลิงก์ Google Sheets (ต้องตั้งค่าแชร์แบบ: ทุกคนที่มีลิงก์มีสิทธิ์อ่าน / Anyone with link can view)
                  </label>
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-chula-pink font-mono"
                  />
                </div>

                <div className="col-span-1 md:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-chula-gray block uppercase">
                    วิธีการซิงค์ข้อมูล
                  </label>
                  <div className="flex bg-gray-150 p-0.5 rounded-xl text-xs border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSyncMode('overwrite')}
                      className={`flex-1 py-1.5 rounded-lg font-medium text-center transition-colors cursor-pointer ${
                        syncMode === 'overwrite' ? 'bg-white text-[#2d2a2b] shadow-xs font-semibold' : 'text-chula-gray'
                      }`}
                    >
                      เขียนทับข้อมูลเดิม
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncMode('append')}
                      className={`flex-1 py-1.5 rounded-lg font-medium text-center transition-colors cursor-pointer ${
                        syncMode === 'append' ? 'bg-white text-[#2d2a2b] shadow-xs font-semibold' : 'text-chula-gray'
                      }`}
                    >
                      เพิ่มต่อจากเดิม
                    </button>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleSyncSheets(sheetUrl, syncMode)}
                    disabled={isSyncing}
                    className="w-full py-2 bg-chula-pink hover:bg-chula-bright text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-chula-pink/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? 'กำลังบันทึก...' : 'บันทึกและซิงค์'}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-chula-gray leading-relaxed">
                💡 <b>คำแนะนำ:</b> แนะนำให้ใช้โหมด <b>เขียนทับข้อมูลเดิม</b> เพื่อให้ตารางระบบจัดการภาระงานตรงกับไฟล์ Google Sheets ของคณะ 100% (เป็น Single Source of Truth) คุณยังสามารถเพิ่ม/ลบรายการ หรือสลับเครื่องหมายถูก "เสร็จสิ้นแล้ว" ได้อย่างอิสระบนหน้าจอนี้ โดยระบบจะบันทึกสถานะการทำเครื่องหมายลงในเบราว์เซอร์ของคุณไว้เสมอ!
              </p>
            </div>
          )}
        </div>

        {/* STATS OVERVIEW */}
        <TaskStats
          filteredWorkloads={filteredWorkloads}
          allWorkloads={workloads}
          currentMonth={selectedMonth}
          currentWeek={selectedWeek}
        />

        {/* SEARCH & FILTERS PANEL */}
        <TaskFilters
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={availableCategories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resetAllFilters={resetAllFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* INTERACTIVE WORKLOADS GRID: TABLE VS CALENDAR VIEW */}
        {viewMode === 'table' ? (
          <TaskTable
            workloads={workloads}
            filteredWorkloads={filteredWorkloads}
            onToggleStatus={handleToggleStatus}
            onDeleteItem={handleDeleteItem}
            onEditItem={(item) => {
              setEditingItem(item);
              setIsFormOpen(true);
            }}
            onDuplicateItem={handleDuplicateItem}
            onUpdateField={handleUpdateField}
          />
        ) : (
          <TaskCalendar
            workloads={workloads}
            filteredWorkloads={filteredWorkloads}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
          />
        )}

        {/* ACCESSIBLE FOOTER BRAND NOTES */}
        <footer className="pt-4 text-center border-t border-gray-200">
          <div className="flex justify-center items-center gap-2 text-chula-gray text-xs">
            <BookOpen className="w-4 h-4 text-chula-pink" />
            <span>ฝ่ายวิชาการเเละบัณฑิตศึกษา คณะทันตแพทยศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย</span>
          </div>

        </footer>

      </main>

      {/* 3. POPUP MODAL FORM */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        defaultMonth={selectedMonth}
        defaultWeek={selectedWeek}
      />

    </div>
  );
}
