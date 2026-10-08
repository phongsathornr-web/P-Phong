export type WorkloadStatus = 'completed' | 'pending';

export interface WorkloadItem {
  id: string;
  title: string;
  description?: string;
  month: string;       // e.g., "กรกฎาคม", "สิงหาคม"
  week: number;        // 1, 2, 3, 4, 5
  category: string;    // e.g., "งานสอน", "งานบริการคลินิก", "งานวิจัย", "งานบริหาร", "งานทั่วไป"
  responsible: string; // e.g., "อ.ดร.สมชาย", "ทพญ.วิไล"
  status: WorkloadStatus;
  hours?: number;      // ภาระงาน (ชั่วโมง)
  date?: string;       // วันที่เจาะจง (ถ้ามี เช่น YYYY-MM-DD)
  rawStatus?: string;  // สถานะดั้งเดิมจาก Google Sheets (เช่น "On Process", "Reject")
  orderNumber?: string; // เลข Order จาก Google Sheets (เช่น "03658/2569")
}

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม"
];

export const EXCLUDED_CATEGORY_TERMS = [
  "สอน (Lecture/Lab)",
  "บริการรักษา (คลินิก)",
  "วิจัยและวิชาการ",
  "บริหารและการประชุม",
  "บริการสังคมและทั่วไป"
];

export const isAllowedCategory = (cat: string): boolean => {
  if (!cat) return false;
  const trimmed = cat.trim();
  if (trimmed.startsWith('งาน')) return false;
  return !EXCLUDED_CATEGORY_TERMS.some(term => trimmed.includes(term) || term.includes(trimmed));
};

export const WORKLOAD_CATEGORIES: string[] = [];

export const STAFF_LIST = [
  "ศ.ทพ.ดร. อรุณ (คณบดี)",
  "รศ.ทพญ. พรทิพย์",
  "ผศ.ทพ. สมเกียรติ",
  "อ.ทพญ. นิสา",
  "อ.ทพ. นพดล",
  "ทพญ. วิมลฉัตร"
];
