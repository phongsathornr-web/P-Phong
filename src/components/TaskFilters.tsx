import React from 'react';
import { THAI_MONTHS, WORKLOAD_CATEGORIES, isAllowedCategory } from '../types';
import { Search, Filter, RefreshCw, X, Calendar, Layers, Table, CalendarDays } from 'lucide-react';

interface TaskFiltersProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedWeek: string; // "all" | "1" | "2" | "3" | "4" | "5"
  setSelectedWeek: (week: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories?: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetAllFilters: () => void;
  viewMode?: 'table' | 'calendar';
  setViewMode?: (mode: 'table' | 'calendar') => void;
}

export default function TaskFilters({
  selectedMonth,
  setSelectedMonth,
  selectedWeek,
  setSelectedWeek,
  selectedCategory,
  setSelectedCategory,
  categories = WORKLOAD_CATEGORIES,
  searchQuery,
  setSearchQuery,
  resetAllFilters,
  viewMode = 'table',
  setViewMode
}: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#F7C6D3] p-5 shadow-sm mb-6 space-y-5">
      {/* View Mode Switcher Header & Month Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-[#DE5983]" />
          <span className="text-sm font-semibold text-[#381A24]">เลือกรายเดือน</span>
        </div>

        {/* View Mode Switcher Buttons */}
        {setViewMode && (
          <div className="flex items-center bg-[#FDF0F3] p-1 rounded-xl border border-[#F7C6D3] gap-1 text-xs font-semibold">
            <button
              id="view-mode-table-btn"
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#DE5983] text-white shadow-xs'
                  : 'text-chula-gray hover:text-[#381A24]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>มุมมองตาราง</span>
            </button>

            <button
              id="view-mode-calendar-btn"
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#DE5983] text-white shadow-xs'
                  : 'text-chula-gray hover:text-[#381A24]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>มุมมองปฏิทิน</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. Month Quick Selection Carousel */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
          {["all", ...THAI_MONTHS].map((month) => {
            const isAll = month === "all";
            const isSelected = isAll
              ? (selectedMonth === "all" || selectedMonth === "ทั้งหมด")
              : selectedMonth === month;
            const displayLabel = isAll ? "ทั้งหมด" : month;
            return (
              <button
                key={month}
                id={isAll ? "month-btn-all" : `month-btn-${month}`}
                onClick={() => setSelectedMonth(isAll ? "all" : month)}
                className={`snap-start shrink-0 px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? "bg-[#DE5983] text-white border-[#DE5983] shadow-sm shadow-[#DE5983]/25 scale-[1.02]"
                    : "bg-white text-chula-gray border-gray-200 hover:border-[#F7C6D3] hover:text-[#381A24]"
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Week Selection Chips & Search Query */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
        {/* Week Chips (7 cols) */}
        <div className="lg:col-span-6">
          <label className="text-xs font-semibold text-[#381A24] uppercase tracking-wider block mb-2.5">
            เลือกรายสัปดาห์
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "1", "2", "3", "4", "5"].map((week) => {
              const isSelected = selectedWeek === week;
              const label = week === "all" ? "ทุกสัปดาห์" : `สัปดาห์ที่ ${week}`;
              return (
                <button
                  key={week}
                  id={`week-btn-${week}`}
                  onClick={() => setSelectedWeek(week)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all duration-150 border cursor-pointer ${
                    isSelected
                      ? "bg-[#B82852] text-white border-[#B82852] shadow-sm shadow-[#B82852]/20"
                      : "bg-[#FDF0F3] text-chula-gray border-gray-200 hover:border-[#F7C6D3] hover:text-[#381A24]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Dropdown (3 cols) */}
        <div className="lg:col-span-3">
          <label className="text-xs font-semibold text-[#381A24] uppercase tracking-wider block mb-2">
            ประเภทภาระงาน
          </label>
          <div className="relative">
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FDF0F3] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#381A24] focus:outline-none focus:ring-2 focus:ring-[#DE5983]/40 focus:border-[#DE5983] appearance-none cursor-pointer"
            >
              <option value="all">ทั้งหมด ทุกประเภท</option>
              {categories
                .filter(isAllowedCategory)
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-chula-gray">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search Query Input (3 cols) */}
        <div className="lg:col-span-3">
          <label className="text-xs font-semibold text-[#2d2a2b] uppercase tracking-wider block mb-2">
            ค้นหาภาระงาน / ผู้รับผิดชอบ
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="พิมพ์คำค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-sm placeholder-chula-gray/60 focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-chula-gray">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-chula-gray hover:text-chula-pink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Filter Reset & Status info */}
      {(selectedMonth !== "all" && selectedMonth !== "ทั้งหมด" || selectedCategory !== "all" || selectedWeek !== "all" || searchQuery) && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="text-chula-gray">
            กำลังกรองข้อมูลด้วยเงื่อนไขพิเศษ...
          </div>
          <button
            id="reset-filters-btn"
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-chula-pink hover:text-chula-bright font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}
