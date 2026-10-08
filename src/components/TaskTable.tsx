import React, { useState } from 'react';
import { WorkloadItem, WORKLOAD_CATEGORIES, STAFF_LIST, THAI_MONTHS } from '../types';
import { Check, Clock, Edit2, Trash2, SlidersHorizontal, AlertCircle, Bookmark, Copy, Grid, FileText, CheckCircle2, Circle } from 'lucide-react';

interface TaskTableProps {
  workloads: WorkloadItem[];
  filteredWorkloads: WorkloadItem[];
  onToggleStatus: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: WorkloadItem) => void;
  onDuplicateItem: (item: WorkloadItem) => void;
  onUpdateField: (id: string, field: keyof WorkloadItem, value: any) => void;
}

export default function TaskTable({
  workloads,
  filteredWorkloads,
  onToggleStatus,
  onDeleteItem,
  onEditItem,
  onDuplicateItem,
  onUpdateField
}: TaskTableProps) {
  const [isLiveEdit, setIsLiveEdit] = useState(false);
  const [sortBy, setSortBy] = useState<'week' | 'hours' | 'category'>('week');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Handle local sorting (completed/Done tasks are always pushed to the bottom)
  const sortedWorkloads = [...filteredWorkloads].sort((a, b) => {
    const aDone = a.status === 'completed';
    const bDone = b.status === 'completed';

    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;

    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (sortBy === 'week') {
      fieldA = a.week;
      fieldB = b.week;
    } else if (sortBy === 'hours') {
      fieldA = a.hours || 0;
      fieldB = b.hours || 0;
    } else if (sortBy === 'category') {
      fieldA = a.category;
      fieldB = b.category;
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'week' | 'hours' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Helper to color-code category tags nicely using Dent Chula colors
  const getCategoryStyles = (cat: string) => {
    if (cat.includes('งานสอน')) {
      return 'bg-pink-50 text-chula-pink border-pink-100';
    } else if (cat.includes('บริการรักษา') || cat.includes('คลินิก')) {
      return 'bg-blue-50 text-blue-600 border-blue-100';
    } else if (cat.includes('วิจัย')) {
      return 'bg-purple-50 text-purple-600 border-purple-100';
    } else if (cat.includes('บริหาร')) {
      return 'bg-[#B17FAF]/10 text-lotus border-[#B17FAF]/20';
    } else {
      return 'bg-gray-50 text-chula-gray border-gray-150';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F2C1C8]/40 shadow-sm overflow-hidden mb-6">
      {/* Table Header / Action Area */}
      <div className="p-5 border-b border-gray-150 bg-gradient-to-r from-white to-[#fcf9fa] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#2d2a2b] flex items-center gap-2">
            <SlidersHorizontal className="w-4.5 h-4.5 text-chula-pink" />
            ตารางรายการภาระงานที่พบ ({sortedWorkloads.length} รายการ)
          </h3>
          <p className="text-xs text-chula-gray mt-1">
            {isLiveEdit 
              ? '💡 คุณอยู่ในโหมดแก้ไขสด คลิกที่ช่องข้อมูลใดๆ เพื่อพิมพ์แก้ไขโดยตรงได้ทันที!' 
              : 'คลิกสวิตช์สถานะเพื่อระบุงานเสร็จสิ้นได้ทันที หรือกดโหมดแก้ไขสดเพื่อเปลี่ยนเนื้อหาอย่างรวดเร็ว'
            }
          </p>
        </div>

        {/* Live Edit Mode Switch & Sorting Options */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Sort controls */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
            <span className="text-[10px] text-chula-gray font-bold px-2">จัดเรียงตาม:</span>
            <button
              id="sort-week-btn"
              onClick={() => toggleSort('week')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                sortBy === 'week' ? 'bg-white text-[#2d2a2b] shadow-xs' : 'text-chula-gray hover:text-[#2d2a2b]'
              }`}
            >
              สัปดาห์
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sortedWorkloads.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-[#F2C1C8]/20 text-chula-pink rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-[#2d2a2b]">ไม่พบข้อมูลภาระงานที่ตรงตามเงื่อนไข</h4>
          <p className="text-xs text-chula-gray max-w-sm mx-auto">
            กรุณาเปลี่ยนเดือน/สัปดาห์ หรือพิมพ์ค้นหาด้วยคำอื่น หรือกดปุ่ม "เพิ่มภาระงาน" เพื่อเริ่มต้นป้อนข้อมูลของคุณเอง
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#fcf9fa] border-b border-gray-150 text-[11px] font-bold text-chula-gray uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">สัปดาห์</th>
                  <th className="py-3 px-3 w-28 text-center">เลขที่เอกสาร</th>
                  <th className="py-3 px-4 w-[38%]">ชื่องานและรายละเอียด</th>
                  <th className="py-3 px-3 w-[20%]">หมวดหมู่</th>
                  <th className="py-3 px-3 w-28 text-center">วันที่ส่งงาน</th>
                  <th className="py-3 px-3 w-32 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {sortedWorkloads.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const displayStatus = item.rawStatus || (isCompleted ? 'เสร็จสิ้นแล้ว' : 'รอดำเนินการ');
                  const statusLower = displayStatus.toLowerCase();
                  
                  let statusBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-300';
                  if (statusLower.includes('reject') || statusLower.includes('ยกเลิก')) {
                    statusBadgeStyle = 'bg-rose-50 text-rose-700 border-rose-300';
                  } else if (statusLower.includes('process') || statusLower.includes('progress') || statusLower.includes('กำลังดำเนินการ')) {
                    statusBadgeStyle = 'bg-blue-50 text-blue-700 border-blue-300';
                  } else if (statusLower.includes('complete') || statusLower.includes('done') || statusLower.includes('เสร็จ') || statusLower.includes('สำเร็จ')) {
                    statusBadgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold shadow-2xs';
                  }

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors duration-150 ${
                        isCompleted ? 'bg-emerald-50/85 hover:bg-emerald-100/80' : 'hover:bg-[#FAF4F6]/50'
                      }`}
                    >
                      {/* 1. Week */}
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-chula-gray">
                        {isLiveEdit ? (
                          <select
                            value={item.week}
                            onChange={(e) => onUpdateField(item.id, 'week', parseInt(e.target.value, 10))}
                            className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-chula-pink"
                          >
                            {[1, 2, 3, 4, 5].map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        ) : (
                          item.week
                        )}
                      </td>

                      {/* 2. Order Number (Column F) */}
                      <td className="py-3.5 px-3 text-center">
                        {isLiveEdit ? (
                          <input
                            type="text"
                            value={item.orderNumber || ''}
                            onChange={(e) => onUpdateField(item.id, 'orderNumber', e.target.value)}
                            placeholder="เลขที่เอกสาร"
                            className="w-full bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-chula-pink"
                          />
                        ) : (
                          item.orderNumber ? (
                            <span className="inline-block font-mono text-xs font-semibold text-slate-700 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded-md">
                              {item.orderNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )
                        )}
                      </td>

                      {/* 3. Title & Description (Column D & G) */}
                      <td className="py-3.5 px-4">
                        {isLiveEdit ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => onUpdateField(item.id, 'title', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-chula-pink font-medium"
                            />
                            <input
                              type="text"
                              value={item.description || ''}
                              placeholder="รายละเอียด (ถ้ามี)"
                              onChange={(e) => onUpdateField(item.id, 'description', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-chula-pink text-chula-gray"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className={`font-semibold text-[#2d2a2b] ${isCompleted ? 'line-through text-chula-gray/70' : ''}`}>
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-xs text-chula-gray mt-0.5 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 4. Category */}
                      <td className="py-3.5 px-3">
                        {isLiveEdit ? (
                          <select
                            value={item.category}
                            onChange={(e) => onUpdateField(item.id, 'category', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-chula-pink"
                          >
                            {WORKLOAD_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getCategoryStyles(item.category)}`}>
                            {item.category.split(' ')[0]} {/* short code */}
                            <span className="opacity-80"> {item.category.split(' ').slice(1).join(' ')}</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Specific Date */}
                      <td className="py-3.5 px-3 text-center text-xs font-medium text-chula-gray">
                        {isLiveEdit ? (
                          <input
                            type="date"
                            value={item.date || ''}
                            onChange={(e) => onUpdateField(item.id, 'date', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-chula-pink"
                          />
                        ) : (
                          item.date ? new Date(item.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'
                        )}
                      </td>

                      {/* 6. Status Column (Column E from Google Sheets) */}
                      <td className="py-3.5 px-3 text-center">
                        {isLiveEdit ? (
                          <input
                            type="text"
                            value={item.rawStatus || ''}
                            onChange={(e) => onUpdateField(item.id, 'rawStatus', e.target.value)}
                            placeholder="สถานะ"
                            className="w-full bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-chula-pink font-medium"
                          />
                        ) : (
                          <button
                            id={`toggle-status-desktop-${item.id}`}
                            onClick={() => onToggleStatus(item.id)}
                            title="แตะเพื่อสลับสถานะ"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shadow-2xs select-none active:scale-95 ${statusBadgeStyle}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span>{displayStatus}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE RESPONSIVE CARD VIEW (Visible only on small screens) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {sortedWorkloads.map((item) => {
              const isCompleted = item.status === 'completed';
              const displayStatus = item.rawStatus || (isCompleted ? 'เสร็จสิ้นแล้ว' : 'รอดำเนินการ');
              const statusLower = displayStatus.toLowerCase();
              
              let statusBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-300';
              if (statusLower.includes('reject') || statusLower.includes('ยกเลิก')) {
                statusBadgeStyle = 'bg-rose-50 text-rose-700 border-rose-300';
              } else if (statusLower.includes('process') || statusLower.includes('progress') || statusLower.includes('กำลังดำเนินการ')) {
                statusBadgeStyle = 'bg-blue-50 text-blue-700 border-blue-300';
              } else if (statusLower.includes('complete') || statusLower.includes('done') || statusLower.includes('เสร็จ') || statusLower.includes('สำเร็จ')) {
                statusBadgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold shadow-2xs';
              }

              return (
                <div 
                  key={item.id} 
                  className={`p-4 space-y-3.5 transition-colors ${
                    isCompleted ? 'bg-emerald-50/85 border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Card Header (Week, Order & Category) */}
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-chula-pink bg-pink-50 border border-pink-100 px-2 py-0.5 rounded">
                        สัปดาห์ที่ {item.week}
                      </span>
                      {item.orderNumber && (
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          เลขที่เอกสาร: {item.orderNumber}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getCategoryStyles(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h4 className={`text-sm font-bold text-[#2d2a2b] ${isCompleted ? 'line-through text-chula-gray/70' : ''}`}>
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-chula-gray mt-1">{item.description}</p>
                    )}
                  </div>

                  {/* Key Details: Specific Date & Status */}
                  <div className="grid grid-cols-2 gap-2 bg-[#fcf9fa] p-2.5 rounded-xl border border-gray-150 text-xs">
                    <div>
                      <span className="text-[10px] text-chula-gray block uppercase font-medium">สถานะ</span>
                      <button
                        id={`toggle-status-mobile-${item.id}`}
                        onClick={() => onToggleStatus(item.id)}
                        title="แตะเพื่อสลับสถานะ"
                        className={`inline-flex items-center gap-1 mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer active:scale-95 transition-all ${statusBadgeStyle}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                        <span>{displayStatus}</span>
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] text-chula-gray block uppercase font-medium">วันที่ส่งงาน</span>
                      <span className="font-medium text-[#2d2a2b] block mt-1">
                        {item.date ? new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}
                      </span>
                    </div>
                  </div>


                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
