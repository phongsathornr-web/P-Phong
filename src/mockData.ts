import { WorkloadItem } from './types';

export const INITIAL_WORKLOADS: WorkloadItem[] = [
  // --- กรกฎาคม (July 2026) ---
  {
    id: "1",
    title: "บรรยายหัวข้อ Oral Surgery I (นิสิตปี 4)",
    description: "ตึกทันตรักษ์ ห้องบรรยาย 301 เตรียมสื่อการสอนระบบดิจิทัล",
    month: "กรกฎาคม",
    week: 1,
    category: "การเรียนการสอน",
    responsible: "ผศ.ทพ. สมเกียรติ",
    status: "completed",
    hours: 3,
    date: "2026-07-02"
  },
  {
    id: "2",
    title: "ตรวจรักษาผู้ป่วย คลินิกศัลยศาสตร์ช่องปาก (บ่าย)",
    description: "คลินิกศัลยกรรมช่องปาก ชั้น 4",
    month: "กรกฎาคม",
    week: 1,
    category: "บริการผู้ป่วย",
    responsible: "อ.ทพ. นพดล",
    status: "completed",
    hours: 4,
    date: "2026-07-03"
  },
  {
    id: "3",
    title: "ควบคุมการฝึกปฏิบัติงาน Lab ทันตกรรมประดิษฐ์",
    description: "แล็บรวม ชั้น 5 นิสิตกลุ่ม A",
    month: "กรกฎาคม",
    week: 2,
    category: "การเรียนการสอน",
    responsible: "รศ.ทพญ. พรทิพย์",
    status: "completed",
    hours: 4,
    date: "2026-07-08"
  },
  {
    id: "4",
    title: "ประชุมคณะกรรมการหลักสูตรทวิปริญญา ครั้งที่ 7",
    description: "ห้องประชุมสำนักงานคณบดี ตึกวาจวิทยาวัฑฒน์",
    month: "กรกฎาคม",
    week: 2,
    category: "การประชุม",
    responsible: "ศ.ทพ.ดร. อรุณ (คณบดี)",
    status: "completed",
    hours: 2,
    date: "2026-07-09"
  },
  {
    id: "5",
    title: "ตรวจประเมินผลงานวิจัยโครงงานนิสิตทันตแพทย์ขั้นสูง",
    description: "ผ่านระบบออนไลน์ MS Teams",
    month: "กรกฎาคม",
    week: 3,
    category: "วิชาการ",
    responsible: "ผศ.ทพ. สมเกียรติ",
    status: "pending",
    hours: 6,
    date: "2026-07-15"
  },
  {
    id: "6",
    title: "ตรวจคนไข้พิเศษวิชา Endodontics คลินิกบ่าย",
    description: "ควบคุมงานและตรวจงานรักษาของนิสิตวิชาฟันรักษาราก",
    month: "กรกฎาคม",
    week: 3,
    category: "บริการผู้ป่วย",
    responsible: "อ.ทพญ. นิสา",
    status: "completed",
    hours: 4,
    date: "2026-07-16"
  },
  {
    id: "7",
    title: "ตรวจคนไข้ใหม่ คลินิกรวมประสานงานทันตกรรม",
    description: "รับส่งต่อผู้ป่วย และวินิจฉัยโรคช่องปาก",
    month: "กรกฎาคม",
    week: 4,
    category: "บริการผู้ป่วย",
    responsible: "ทพญ. วิมลฉัตร",
    status: "pending",
    hours: 4,
    date: "2026-07-22"
  },
  {
    id: "8",
    title: "สัมมนาทบทวนวรรณกรรมปริทันตวิทยา (Journal Club)",
    description: "ห้องสัมมนา 1 ตึกพรีคลินิก",
    month: "กรกฎาคม",
    week: 4,
    category: "วิชาการ",
    responsible: "รศ.ทพญ. พรทิพย์",
    status: "pending",
    hours: 2,
    date: "2026-07-23"
  },
  {
    id: "9",
    title: "ตรวจรักษาคนไข้ฉุกเฉินและอุบัติเหตุกระดูกใบหน้า",
    description: "เวรประจำสัปดาห์ สนับสนุน รพ.จุฬาลงกรณ์",
    month: "กรกฎาคม",
    week: 5,
    category: "บริการผู้ป่วย",
    responsible: "อ.ทพ. นพดล",
    status: "pending",
    hours: 8,
    date: "2026-07-29"
  },
  {
    id: "10",
    title: "ประชุมสัมมนาประจำปีคณะทันตแพทยศาสตร์ จุฬาฯ",
    description: "จัดที่หอประชุมใหญ่ คณะทันตแพทยศาสตร์",
    month: "กรกฎาคม",
    week: 5,
    category: "การประชุม",
    responsible: "ศ.ทพ.ดร. อรุณ (คณบดี)",
    status: "pending",
    hours: 12,
    date: "2026-07-30"
  },

  // --- สิงหาคม (August 2026) ---
  {
    id: "11",
    title: "บรรยายวิชาทันตกรรมป้องกันและทันตสาธารณสุข",
    description: "ตึกปกเกล้า ชั้น 2 บรรยายรวมนิสิตปี 3",
    month: "สิงหาคม",
    week: 1,
    category: "การเรียนการสอน",
    responsible: "อ.ทพญ. นิสา",
    status: "pending",
    hours: 3,
    date: "2026-08-04"
  },
  {
    id: "12",
    title: "ออกหน่วยทันตกรรมเคลื่อนที่พระราชทานฯ ณ จ.น่าน",
    description: "ช่วยเหลือบริการประชาชนในพื้นที่ห่างไกล",
    month: "สิงหาคม",
    week: 2,
    category: "บริการสังคม",
    responsible: "ศ.ทพ.ดร. อรุณ (คณบดี)",
    status: "pending",
    hours: 24,
    date: "2026-08-11"
  },
  {
    id: "13",
    title: "คุมสอบกลางภาค รายวิชา Dental Materials",
    description: "ห้องสอบรวม ตึกบรมนาถศรีนครินทร์",
    month: "สิงหาคม",
    week: 3,
    category: "การเรียนการสอน",
    responsible: "ทพญ. วิมลฉัตร",
    status: "pending",
    hours: 3,
    date: "2026-08-18"
  },
  {
    id: "14",
    title: "ตรวจวิเคราะห์ข้อมูลวิจัยผู้ป่วยโรคมะเร็งช่องปาก",
    description: "เขียนสรุปรายงานเพื่อส่งตีพิมพ์วารสารต่างประเทศ",
    month: "สิงหาคม",
    week: 4,
    category: "วิชาการ",
    responsible: "ผศ.ทพ. สมเกียรติ",
    status: "pending",
    hours: 8,
    date: "2026-08-25"
  }
];
