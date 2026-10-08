import React from 'react';
import { WorkloadItem } from '../types';
import { Check, Clock, AlertCircle, Calendar } from 'lucide-react';

interface TaskStatsProps {
  filteredWorkloads: WorkloadItem[];
  allWorkloads: WorkloadItem[];
  currentMonth: string;
  currentWeek: string; // "all" or "1" | "2" | "3" | "4" | "5"
}

export default function TaskStats({
  filteredWorkloads,
  allWorkloads,
  currentMonth,
  currentWeek
}: TaskStatsProps) {
  // Stats calculations for the current view filter
  const totalInView = filteredWorkloads.length;
  const completedInView = filteredWorkloads.filter(item => item.status === 'completed').length;
  const pendingInView = totalInView - completedInView;
  
  const totalHours = filteredWorkloads.reduce((sum, item) => sum + (item.hours || 0), 0);
  const completedHours = filteredWorkloads
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + (item.hours || 0), 0);

  const completionRate = totalInView > 0 ? Math.round((completedInView / totalInView) * 100) : 0;

  // General app-wide stats for context
  const totalAll = allWorkloads.length;
  const completedAll = allWorkloads.filter(item => item.status === 'completed').length;

  const isAllMonths = currentMonth === 'all' || currentMonth === 'ทั้งหมด';
  const displayMonthText = isAllMonths ? 'ทุกเดือน' : `เดือน${currentMonth}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Tasks Card */}
      <div id="stat-total-tasks" className="bg-white p-5 rounded-2xl border border-[#F7C6D3] shadow-sm flex items-center justify-between transition-all hover:border-[#DE5983]/30 hover:shadow-md">
        <div>
          <span className="text-xs text-chula-gray font-medium uppercase tracking-wider block mb-1">
            ภาระงานทั้งหมด ({displayMonthText} {currentWeek !== 'all' ? `สัปดาห์ที่ ${currentWeek}` : 'ทุกสัปดาห์'})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#381A24]">{totalInView}</span>
            <span className="text-sm text-chula-gray">รายการ</span>
          </div>
          <span className="text-xs text-chula-gray mt-2 block">
            รวมทั้งปี: {totalAll} รายการ (เสร็จแล้ว {completedAll})
          </span>
        </div>
        <div className="p-3 bg-[#DE5983]/10 text-[#DE5983] rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Completed Status Card */}
      <div id="stat-completed-tasks" className="bg-white p-5 rounded-2xl border border-[#F7C6D3] shadow-sm flex items-center justify-between transition-all hover:border-[#DE5983]/30 hover:shadow-md">
        <div>
          <span className="text-xs text-chula-gray font-medium uppercase tracking-wider block mb-1">
            เสร็จสิ้นแล้ว ({displayMonthText})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{completedInView}</span>
            <span className="text-sm text-chula-gray">/ {totalInView} รายการ</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-2 block">
            คิดเป็น {completionRate}% ของภาระงาน{displayMonthText}
          </span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Check className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Pending Status Card */}
      <div id="stat-pending-tasks" className="bg-white p-5 rounded-2xl border border-[#F7C6D3] shadow-sm flex items-center justify-between transition-all hover:border-[#DE5983]/30 hover:shadow-md">
        <div>
          <span className="text-xs text-chula-gray font-medium uppercase tracking-wider block mb-1">
            ยังไม่ได้ดำเนินการ ({displayMonthText})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{pendingInView}</span>
            <span className="text-sm text-chula-gray">รายการ</span>
          </div>
          <span className="text-xs text-amber-600 font-medium mt-2 block">
            คิดเป็น {totalInView > 0 ? 100 - completionRate : 0}% ของภาระงาน{displayMonthText}
          </span>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Total Workload Hours Card */}
      <div id="stat-workload-hours" className="bg-white p-5 rounded-2xl border border-[#F7C6D3] shadow-sm flex items-center justify-between transition-all hover:border-[#DE5983]/30 hover:shadow-md">
        <div>
          <span className="text-xs text-chula-gray font-medium uppercase tracking-wider block mb-1">
            รวมเวลาภาระงาน ({displayMonthText})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#381A24]">{totalHours}</span>
            <span className="text-sm text-chula-gray">ชั่วโมง</span>
          </div>
          <span className="text-xs text-emerald-600 mt-2 block">
            เสร็จสิ้นแล้ว {completedHours} ชม. ({totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0}%) ของ{displayMonthText}
          </span>
        </div>
        <div className="p-3 bg-[#DE5983]/10 text-[#DE5983] rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
