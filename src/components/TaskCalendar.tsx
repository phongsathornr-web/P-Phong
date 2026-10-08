import React, { useState } from 'react';
import { WorkloadItem, THAI_MONTHS } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  User, 
  Tag, 
  Layers, 
  Info, 
  CheckCircle2, 
  X,
  FileText,
  Lock,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface TaskCalendarProps {
  workloads: WorkloadItem[];
  filteredWorkloads: WorkloadItem[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedWeek: string;
  setSelectedWeek: (week: string) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onEditItem?: (item: WorkloadItem) => void;
  onAddNewForDate?: (month: string, week: number, dateStr?: string) => void;
}

const THAI_DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

const getMonthIndex = (monthName: string): number => {
  const index = THAI_MONTHS.indexOf(monthName);
  return index !== -1 ? index : 7; // default August if not found
};

export default function TaskCalendar({
  filteredWorkloads,
  selectedMonth,
  setSelectedMonth,
  selectedWeek,
  setSelectedWeek
}: TaskCalendarProps) {
  const [selectedTask, setSelectedTask] = useState<WorkloadItem | null>(null);

  // Active month for calendar computation
  const currentMonthName = (selectedMonth === 'all' || selectedMonth === 'ทั้งหมด')
    ? 'สิงหาคม'
    : selectedMonth;

  const monthIdx = getMonthIndex(currentMonthName);
  const year = 2026; // Academic year 2026

  // Days in month calculation
  const firstDayOfMonth = new Date(year, monthIdx, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  // Create array of day objects
  const calendarDays = [];
  // Padding for previous month days
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ isCurrentMonth: false, dayNum: 0 });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ isCurrentMonth: true, dayNum: d });
  }

  // Helper to get week number (1..5) for a day of month
  const getWeekForDay = (dayNum: number): number => {
    return Math.min(5, Math.ceil(dayNum / 7));
  };

  // Group workloads by date or day of month
  const getTasksForDay = (dayNum: number) => {
    if (dayNum <= 0) return [];

    // Format date string for matching e.g. "2026-08-05" or day matching
    const monthFormatted = String(monthIdx + 1).padStart(2, '0');
    const dayFormatted = String(dayNum).padStart(2, '0');
    const fullDateStr = `${year}-${monthFormatted}-${dayFormatted}`;

    const weekForThisDay = getWeekForDay(dayNum);

    return filteredWorkloads.filter(item => {
      // 1. Must match current active month (or if month is 'all', match item's month)
      const matchesMonth = selectedMonth === 'all' || selectedMonth === 'ทั้งหมด' 
        ? item.month === currentMonthName 
        : item.month === selectedMonth;

      if (!matchesMonth) return false;

      // 2. Week filter match
      if (selectedWeek !== 'all' && item.week !== parseInt(selectedWeek, 10)) {
        return false;
      }

      // 3. Exact date match if item has a specific date
      if (item.date) {
        // Match full date string (YYYY-MM-DD) or day number at end
        if (item.date === fullDateStr) return true;
        
        // Match day number if format is DD or D or DD/MM/YYYY
        const dateParts = item.date.split(/[-/]/);
        if (dateParts.length === 3) {
          const itemDay = parseInt(dateParts[2], 10) || parseInt(dateParts[0], 10);
          if (itemDay === dayNum) return true;
        }
      }

      // 4. Fallback if item does not have specific date: distribute by item's week
      if (!item.date && item.week === weekForThisDay) {
        const charCode = item.title.charCodeAt(0) || 0;
        const targetDayOffset = (charCode % 5) + 1; // Mon - Fri offset (1 to 5)
        const dayInWeek = (weekForThisDay - 1) * 7 + targetDayOffset;
        if (dayInWeek === dayNum || (dayNum === 1 && targetDayOffset === 1)) {
          return true;
        }
      }

      return false;
    }).sort((a, b) => {
      const aDone = a.status === 'completed';
      const bDone = b.status === 'completed';
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return 0;
    });
  };

  // Unassigned / general tasks for the month that didn't fit a specific day
  const unassignedMonthTasks = filteredWorkloads.filter(item => {
    const matchesMonth = selectedMonth === 'all' || selectedMonth === 'ทั้งหมด' 
      ? item.month === currentMonthName 
      : item.month === selectedMonth;
    if (!matchesMonth) return false;
    
    // Check if task appears in calendar
    for (let d = 1; d <= daysInMonth; d++) {
      if (getTasksForDay(d).some(t => t.id === item.id)) return false;
    }
    return true;
  }).sort((a, b) => {
    const aDone = a.status === 'completed';
    const bDone = b.status === 'completed';
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return 0;
  });

  const handlePrevMonth = () => {
    const prevIdx = (monthIdx - 1 + 12) % 12;
    setSelectedMonth(THAI_MONTHS[prevIdx]);
  };

  const handleNextMonth = () => {
    const nextIdx = (monthIdx + 1) % 12;
    setSelectedMonth(THAI_MONTHS[nextIdx]);
  };

  return (
    <div id="calendar-view-container" className="bg-white rounded-2xl border border-[#F7C6D3] shadow-sm p-5 mb-8">
      
      {/* 1. READ-ONLY SECURITY NOTICE BANNER */}
      <div className="mb-4 bg-[#FDF0F3] border border-[#F7C6D3] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C1438]">
          <Lock className="w-4 h-4 text-[#DE5983] shrink-0" />
          <span>มุมมองปฏิทิน (โหมดอ่านอย่างเดียว): ดึงข้อมูลจากฐานข้อมูล Google Sheets คณะทันตแพทยศาสตร์ จุฬาฯ เท่านั้น</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#DE5983] bg-white px-2.5 py-1 rounded-lg border border-[#F7C6D3]/70 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ป้องกันการแก้ไขจากภายนอก</span>
        </div>
      </div>

      {/* 2. CALENDAR HEADER NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#DE5983]/10 text-[#DE5983] rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#381A24] flex items-center gap-2">
              ปฏิทินภาระงานประจำเดือน {currentMonthName} {year + 543}
            </h3>
            <p className="text-xs text-chula-gray">
              แสดงภาระงานแยกตามวันและสัปดาห์ • คลิกที่รายการเพื่อดูรายละเอียดภาระงาน
            </p>
          </div>
        </div>

        {/* Month Switcher Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 text-[#381A24] rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold px-3 py-1.5 bg-[#FDF0F3] border border-[#F7C6D3] text-[#DE5983] rounded-xl">
            {currentMonthName} {year + 543}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 text-[#381A24] rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. CALENDAR WEEKDAYS HEADER */}
      <div className="grid grid-cols-7 gap-1.5 my-3 text-center">
        {THAI_DAY_NAMES.map((day, idx) => (
          <div 
            key={day}
            className={`py-2 text-xs font-bold rounded-lg ${
              idx === 0 || idx === 6 
                ? 'bg-rose-50/60 text-rose-600' 
                : 'bg-[#FDF0F3]/60 text-[#381A24]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 4. CALENDAR GRID DAYS */}
      <div className="grid grid-cols-7 gap-1.5 auto-rows-fr">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div 
                key={`empty-${idx}`} 
                className="min-h-[110px] p-2 bg-gray-50/40 rounded-xl border border-dashed border-gray-100/80 text-gray-300"
              />
            );
          }

          const dayNum = cell.dayNum;
          const dayTasks = getTasksForDay(dayNum);
          const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

          return (
            <div
              key={`day-${dayNum}`}
              className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between group ${
                isWeekend 
                  ? 'bg-rose-50/20 border-rose-100/60 hover:border-rose-200' 
                  : 'bg-white border-gray-150 hover:border-[#DE5983]/40 hover:shadow-xs'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  isWeekend ? 'text-rose-600 bg-rose-100/50' : 'text-[#381A24] bg-[#FDF0F3]'
                }`}>
                  {dayNum}
                </span>

                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-chula-gray font-medium">
                    {dayTasks.length} รายการ
                  </span>
                )}
              </div>

              {/* Tasks List in Day Cell */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[105px] scrollbar-none">
                {dayTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-1.5 rounded-lg text-[11px] leading-tight border transition-all cursor-pointer group/task ${
                        isCompleted
                          ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800 hover:border-emerald-400'
                          : 'bg-white border-gray-200 text-[#381A24] hover:border-[#DE5983]/60 hover:shadow-2xs'
                      }`}
                      title="คลิกเพื่อดูรายละเอียด"
                    >
                      <div className="flex items-start gap-1">
                        <span className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                        </span>

                        <span className={`line-clamp-2 font-medium ${isCompleted ? 'line-through text-emerald-700/80' : ''}`}>
                          {task.title}
                        </span>
                      </div>

                      {/* Responsible or Hours pill */}
                      <div className="flex items-center gap-1.5 mt-1 text-[9.5px] text-chula-gray font-normal">
                        {task.responsible && (
                          <span className="truncate max-w-[80px]">
                            {task.responsible.split(' ')[0]}
                          </span>
                        )}
                        {task.hours && (
                          <span className="shrink-0 bg-gray-100 text-gray-600 px-1 rounded">
                            {task.hours}ชม.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state hint when no task */}
              {dayTasks.length === 0 && (
                <div className="text-[10px] text-gray-300 italic text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  ไม่มีภาระงาน
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. UNASSIGNED MONTH TASKS SECTION */}
      {unassignedMonthTasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#DE5983]" />
            <h4 className="text-xs font-bold text-[#381A24]">
              ภาระงานประจำเดือน {currentMonthName} อื่นๆ (ไม่ระบุวันที่เจาะจง) ({unassignedMonthTasks.length} รายการ)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unassignedMonthTasks.map(task => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                      : 'bg-[#FAF4F6]/50 border-gray-200 text-[#381A24] hover:border-[#DE5983]/40'
                  }`}
                  title="คลิกเพื่อดูรายละเอียด"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 w-4 h-4 rounded flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                    </span>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${isCompleted ? 'line-through text-emerald-700/80' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-chula-gray flex items-center gap-2 mt-0.5">
                        <span>สัปดาห์ที่ {task.week}</span>
                        {task.responsible && <span>• {task.responsible}</span>}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-chula-gray">
                    {task.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. READ-ONLY TASK DETAIL POPUP MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#F7C6D3] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#FAF4F6] px-5 py-4 border-b border-[#F7C6D3]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  selectedTask.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedTask.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      เสร็จสิ้นแล้ว
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      อยู่ระหว่างดำเนินการ
                    </>
                  )}
                </span>
                <span className="text-xs font-semibold text-[#DE5983] bg-white border border-[#F7C6D3] px-2.5 py-0.5 rounded-lg">
                  {selectedTask.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 text-chula-gray hover:text-[#381A24] hover:bg-gray-200/50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-[#381A24]">
              <div>
                <h3 className="text-base font-bold text-[#381A24] mb-1">
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className="text-chula-gray text-xs leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="text-chula-gray text-[10px] uppercase font-bold block">ช่วงเวลา</span>
                  <p className="font-semibold flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#DE5983]" />
                    เดือน{selectedTask.month} • สัปดาห์ที่ {selectedTask.week}
                  </p>
                  {selectedTask.date && (
                    <p className="text-chula-gray text-[11px]">วันที่: {selectedTask.date}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-chula-gray text-[10px] uppercase font-bold block">ผู้รับผิดชอบ</span>
                  <p className="font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#DE5983]" />
                    {selectedTask.responsible || 'ไม่ระบุ'}
                  </p>
                </div>

                {selectedTask.hours && (
                  <div className="space-y-1">
                    <span className="text-chula-gray text-[10px] uppercase font-bold block">ภาระงาน (ชั่วโมง)</span>
                    <p className="font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#DE5983]" />
                      {selectedTask.hours} ชั่วโมง
                    </p>
                  </div>
                )}

                {selectedTask.orderNumber && (
                  <div className="space-y-1">
                    <span className="text-chula-gray text-[10px] uppercase font-bold block">เลขที่เอกสาร</span>
                    <p className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded inline-block">
                      {selectedTask.orderNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Read-only Data Source Notice */}
              <div className="p-3 bg-[#FDF0F3] rounded-xl border border-[#F7C6D3] flex items-center gap-2 text-[11px] text-[#8C1438]">
                <FileSpreadsheet className="w-4 h-4 text-[#DE5983] shrink-0" />
                <span>ข้อมูลภาระงานนี้ซิงค์ตรงจากฐานข้อมูล Google Sheets ของคณะ (อ่านอย่างเดียว)</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-chula-gray font-medium">
                <Lock className="w-3.5 h-3.5 text-[#DE5983]" />
                <span>โหมดแสดงผล (Read-Only)</span>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#DE5983] to-[#B82852] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm shadow-[#DE5983]/20 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
