export type Language = 'en' | 'ur';

export interface AcademicSession {
  id: string;
  name: string;          // e.g. "2025-2026"
  startYear: number;
  endYear: number;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface RollNumberRange {
  id: string;
  department: 'school' | 'madrasa';
  className: string;
  rangeStart: number;
  rangeEnd: number;
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  dob: string;
  rollNo: string;
  cnic: string;
  phone: string;
  address: string;
  class: string;
  section: string;
  department: 'madrasa' | 'school';
  status: 'active' | 'inactive' | 'graduated';
  sessionId?: string;
}

export interface ZakatIncome {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  purpose: string;
  notes: string;
}

export interface ZakatExpense {
  id: string;
  amount: number;
  date: string;
  purpose: string;
  recipient: string;
  notes: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  phone: string;
  cnic: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  status: 'paid' | 'pending';
  description?: string;
}

export interface Announcement {
  id: string;
  title: { en: string; ur: string };
  content: { en: string; ur: string };
  date: string;
}

export interface Result {
  id: string;
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
  examDate: string;
  className?: string;
  sessionId?: string;
}

export interface InstitutionProfile {
  nameEn: string;
  nameUr: string;
  email: string;
  phone: string;
  address: string;
}

export interface SubjectConfig {
  id: string;
  department: 'madrasa' | 'school';
  className: string;
  subjects: string[];
  sessionId?: string;
}

export interface State {
  language: Language;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  students: Student[];
  teachers: Teacher[];
  feeRecords: FeeRecord[];
  zakatIncome: ZakatIncome[];
  zakatExpenses: ZakatExpense[];
  announcements: Announcement[];
  results: Result[];
  academicSessions: AcademicSession[];
  activeSessionId: string | null;
  viewSessionId: string | null;
  rollNumberRanges: RollNumberRange[];
  subjectConfigs: SubjectConfig[];
  adminPassword: string;
  institutionProfile: InstitutionProfile;
}

export const MADRASA_CLASSES = [
  'خاصہ سال اول',
  'خاصه ثاني',
  'عاليه اول',
  'عاليه ثاني',
  'عالميه اول',
  'عالميه ثاني',
  'تخصص بالفقه',
  'تخصص في التفسير',
] as const;

export const SCHOOL_CLASSES = [
  'Play Group', 'Nursery', 'KG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
] as const;

export const SCHOOL_SECTIONS = ['A', 'B'] as const;

// Default roll number ranges
export const DEFAULT_ROLL_RANGES: RollNumberRange[] = [
  { id: 'school-pg',  department: 'school',   className: 'Play Group', rangeStart: 1,    rangeEnd: 150  },
  { id: 'school-nr',  department: 'school',   className: 'Nursery',    rangeStart: 151,  rangeEnd: 300  },
  { id: 'school-kg',  department: 'school',   className: 'KG',         rangeStart: 301,  rangeEnd: 450  },
  { id: 'school-c1',  department: 'school',   className: 'Class 1',    rangeStart: 451,  rangeEnd: 600  },
  { id: 'school-c2',  department: 'school',   className: 'Class 2',    rangeStart: 601,  rangeEnd: 750  },
  { id: 'school-c3',  department: 'school',   className: 'Class 3',    rangeStart: 751,  rangeEnd: 900  },
  { id: 'school-c4',  department: 'school',   className: 'Class 4',    rangeStart: 901,  rangeEnd: 1050 },
  { id: 'school-c5',  department: 'school',   className: 'Class 5',    rangeStart: 1051, rangeEnd: 1200 },
  { id: 'school-c6',  department: 'school',   className: 'Class 6',    rangeStart: 1201, rangeEnd: 1350 },
  { id: 'school-c7',  department: 'school',   className: 'Class 7',    rangeStart: 1351, rangeEnd: 1500 },
  { id: 'school-c8',  department: 'school',   className: 'Class 8',    rangeStart: 1501, rangeEnd: 1650 },
  { id: 'school-c9',  department: 'school',   className: 'Class 9',    rangeStart: 1651, rangeEnd: 1800 },
  { id: 'school-c10', department: 'school',   className: 'Class 10',   rangeStart: 1801, rangeEnd: 1950 },
  { id: 'mad-k1',  department: 'madrasa', className: 'خاصہ سال اول',    rangeStart: 2000, rangeEnd: 2199 },
  { id: 'mad-k2',  department: 'madrasa', className: 'خاصه ثاني',       rangeStart: 2200, rangeEnd: 2399 },
  { id: 'mad-a1',  department: 'madrasa', className: 'عاليه اول',        rangeStart: 2400, rangeEnd: 2599 },
  { id: 'mad-a2',  department: 'madrasa', className: 'عاليه ثاني',       rangeStart: 2600, rangeEnd: 2799 },
  { id: 'mad-am1', department: 'madrasa', className: 'عالميه اول',       rangeStart: 2800, rangeEnd: 2999 },
  { id: 'mad-am2', department: 'madrasa', className: 'عالميه ثاني',      rangeStart: 3000, rangeEnd: 3199 },
  { id: 'mad-tf',  department: 'madrasa', className: 'تخصص بالفقه',      rangeStart: 3200, rangeEnd: 3399 },
  { id: 'mad-tt',  department: 'madrasa', className: 'تخصص في التفسير',  rangeStart: 3400, rangeEnd: 3599 },
];

const DEFAULT_SCHOOL_SUBJECTS = [
  'English',
  'Urdu',
  'Mathematics',
  'General Science',
  'Islamiat',
  'Social Studies',
  'Computer',
];

const DEFAULT_MADRASA_SUBJECTS = [
  'Quran (Nazira)',
  'Hifz',
  'Tajweed',
  'Hadees',
  'Fiqh',
  'Aqaid',
  'Arabic',
  'Urdu',
];

export const DEFAULT_SUBJECT_CONFIGS: SubjectConfig[] = [
  ...SCHOOL_CLASSES.map((className) => ({
    id: `subject-school-${className.toLowerCase().replace(/\s+/g, '-')}`,
    department: 'school' as const,
    className,
    subjects: [...DEFAULT_SCHOOL_SUBJECTS],
  })),
  ...MADRASA_CLASSES.map((className, idx) => ({
    id: `subject-madrasa-${idx + 1}`,
    department: 'madrasa' as const,
    className,
    subjects: [...DEFAULT_MADRASA_SUBJECTS],
  })),
];
