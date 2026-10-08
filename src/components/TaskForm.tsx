import React, { useState, useEffect } from 'react';
import { WorkloadItem, THAI_MONTHS, WORKLOAD_CATEGORIES, STAFF_LIST, isAllowedCategory } from '../types';
import { Plus, X, Calendar, User, Tag, Clock, Check } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<WorkloadItem, 'id'> & { id?: string }) => void;
  editingItem?: WorkloadItem | null;
  defaultMonth: string;
  defaultWeek: string;
}

export default function TaskForm({
  isOpen,
  onClose,
  onSave,
  editingItem,
  defaultMonth,
  defaultWeek
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState('');
  const [week, setWeek] = useState(1);
  const [category, setCategory] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending'>('pending');
  const [hours, setHours] = useState(1);
  const [date, setDate] = useState('');

  // Update form fields when editingItem changes or when modal opens
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || '');
      setMonth(editingItem.month);
      setWeek(editingItem.week);
      setCategory(editingItem.category);
      setResponsible(editingItem.responsible);
      setStatus(editingItem.status);
      setHours(editingItem.hours || 1);
      setDate(editingItem.date || '');
    } else {
      // Clear fields for new item, but default to current filters
      setTitle('');
      setDescription('');
      setMonth(defaultMonth || 'กรกฎาคม');
      setWeek(defaultWeek === 'all' ? 1 : parseInt(defaultWeek, 10));
      setCategory(WORKLOAD_CATEGORIES[0]);
      setResponsible(STAFF_LIST[0]);
      setStatus('pending');
      setHours(2);
      setDate(new Date().toISOString().slice(0, 10)); // Default to today's date
    }
  }, [editingItem, isOpen, defaultMonth, defaultWeek]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่องานภาระงาน');
      return;
    }

    onSave({
      id: editingItem?.id,
      title,
      description,
      month,
      week,
      category,
      responsible,
      status,
      hours,
      date
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#F7C6D3] w-full max-w-lg p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-chula-gray hover:text-[#DE5983] transition-colors p-1.5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-[#381A24] flex items-center gap-2">
            <span className="p-1.5 bg-[#DE5983]/10 text-[#DE5983] rounded-lg">
              <Plus className="w-5 h-5" />
            </span>
            {editingItem ? 'แก้ไขข้อมูลภาระงาน' : 'เพิ่มภาระงานใหม่'}
          </h3>
          <p className="text-xs text-chula-gray mt-1">
            ระบุรายละเอียดงานเพื่อจัดระเบียบและแสดงความคืบหน้าบนแดชบอร์ด
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
              ชื่องานภาระงาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น บรรยายวิชา Oral Surgery II, ตรวจคลินิกบ่าย"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm placeholder-chula-gray/50 focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
              รายละเอียดเพิ่มเติม (ระบุสถานที่หรือเป้าหมาย)
            </label>
            <textarea
              placeholder="เช่น ตึกทันตรักษ์ ชั้น 4, นิสิตปี 4 กลุ่ม A"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm placeholder-chula-gray/50 focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink"
            />
          </div>

          {/* Month & Week */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
                ประจำเดือน
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#2d2a2b] focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink cursor-pointer"
              >
                {THAI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
                สัปดาห์ที่
              </label>
              <select
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value, 10))}
                className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#2d2a2b] focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map((w) => (
                  <option key={w} value={w}>
                    สัปดาห์ที่ {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
              หมวดหมู่งาน
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ระบุหมวดหมู่งาน..."
              className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#2d2a2b] focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink"
            />
          </div>

          {/* Responsible & Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
                ผู้รับผิดชอบหลัก
              </label>
              <select
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#2d2a2b] focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink cursor-pointer"
              >
                {STAFF_LIST.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
                ภาระงาน (ชั่วโมง)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#2d2a2b] focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink"
                required
              />
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
                วันที่ส่งงาน (ถ้ามี)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#fcf9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#2d2a2b] focus:outline-none focus:ring-2 focus:ring-chula-pink/40 focus:border-chula-pink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2d2a2b] uppercase block mb-1.5">
                สถานะเริ่มแรก
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`flex-1 py-2 text-xs rounded-xl font-medium border transition-colors cursor-pointer ${
                    status === 'pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-300'
                      : 'bg-white text-chula-gray border-gray-200'
                  }`}
                >
                  รอดำเนินการ
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`flex-1 py-2 text-xs rounded-xl font-medium border transition-colors cursor-pointer ${
                    status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                      : 'bg-white text-chula-gray border-gray-200'
                  }`}
                >
                  เสร็จสิ้นแล้ว
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 rounded-xl text-xs font-semibold text-chula-gray hover:bg-gray-100 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#DE5983] to-[#B82852] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm shadow-[#DE5983]/20 cursor-pointer"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
