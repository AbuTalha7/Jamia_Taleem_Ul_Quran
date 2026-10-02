import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  State, Language, Student, Teacher, FeeRecord, Announcement, Result,
  AcademicSession, RollNumberRange, SubjectConfig, DEFAULT_ROLL_RANGES, DEFAULT_SUBJECT_CONFIGS, InstitutionProfile, ZakatIncome, ZakatExpense, Portal, SCHOOL_CLASSES,
} from '@/types';
import { MADRASA_CLASSES } from '@/types';
import { translations } from '@/lib/i18n';
import { stateApi } from '@/lib/api';

const LS_KEY = 'jamia_portal_v2';

function loadState(): Partial<State> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveState(state: State) {
  try {
    // Don't persist transient UI state
    const { sidebarOpen, viewSessionId, ...rest } = state;
    void sidebarOpen; void viewSessionId;
    localStorage.setItem(LS_KEY, JSON.stringify(rest));
  } catch { /* ignore */ }
}

// Create a default active session for the current year
function createDefaultSession(): AcademicSession {
  const now = new Date();
  const y = now.getFullYear();
  return {
    id: `session-${y}-${y + 1}`,
    name: `${y}-${y + 1}`,
    startYear: y,
    endYear: y + 1,
    status: 'active',
    createdAt: now.toISOString(),
  };
}

type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'LOGIN'; payload: Portal }
  | { type: 'LOGOUT' }
  | { type: 'HYDRATE_STATE'; payload: Partial<State> }
  | { type: 'SET_ADMIN_PASSWORD'; payload: string }
  | { type: 'SET_ADMIN_USERNAME'; payload: string }
  | { type: 'SAVE_INSTITUTION_PROFILE'; payload: InstitutionProfile }
  | { type: 'SET_SCHOOL_CLASSES'; payload: string[] }
  | { type: 'SET_SCHOOL_SUBJECTS'; payload: string[] }
  | { type: 'SET_SCHOOL_CLASS_SUBJECTS'; payload: { className: string; subjects: string[] } }
  | { type: 'SET_SCHOOL_ROLL_RANGE'; payload: { start: number; end: number } }
  | { type: 'SET_MADRASA_CLASSES'; payload: string[] }
  | { type: 'SET_MADRASA_CLASS_SUBJECTS'; payload: { className: string; subjects: string[] } }
  | { type: 'SET_MADRASA_CLASS_ROLL_RANGE'; payload: { className: string; rangeStart: number; rangeEnd: number } }
  // Students
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  // Teachers
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string }
  | { type: 'ADD_MADRASA_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_MADRASA_TEACHER'; payload: Teacher }
  | { type: 'DELETE_MADRASA_TEACHER'; payload: string }
  // Fee records
  | { type: 'ADD_FEE_RECORD'; payload: FeeRecord }
  | { type: 'UPDATE_FEE_RECORD'; payload: FeeRecord }
  | { type: 'DELETE_FEE_RECORD'; payload: string }
  // Chanda / Zakat
  | { type: 'ADD_ZAKAT_INCOME'; payload: ZakatIncome }
  | { type: 'UPDATE_ZAKAT_INCOME'; payload: ZakatIncome }
  | { type: 'DELETE_ZAKAT_INCOME'; payload: string }
  | { type: 'ADD_ZAKAT_EXPENSE'; payload: ZakatExpense }
  | { type: 'UPDATE_ZAKAT_EXPENSE'; payload: ZakatExpense }
  | { type: 'DELETE_ZAKAT_EXPENSE'; payload: string }
  // Announcements
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'UPDATE_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'DELETE_ANNOUNCEMENT'; payload: string }
  // Results
  | { type: 'ADD_RESULT'; payload: Result }
  | { type: 'SAVE_RESULTS'; payload: Result[] }
  | { type: 'UPDATE_RESULT'; payload: Result }
  | { type: 'DELETE_RESULT'; payload: string }
  // Sessions
  | { type: 'ADD_SESSION'; payload: AcademicSession }
  | { type: 'UPDATE_SESSION'; payload: AcademicSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_ACTIVE_SESSION'; payload: string }
  | { type: 'SET_VIEW_SESSION'; payload: string | null }
  // Roll Number Ranges
  | { type: 'UPDATE_ROLL_RANGE'; payload: RollNumberRange }
  | { type: 'SET_SCHOOL_CLASS_ROLL_RANGE'; payload: { className: string; rangeStart: number; rangeEnd: number } }
  | { type: 'RESET_ROLL_RANGES' }
  // Subject Configs
  | { type: 'UPSERT_SUBJECT_CONFIG'; payload: SubjectConfig }
  | { type: 'DELETE_SUBJECT_CONFIG'; payload: string };

const defaultSession = createDefaultSession();

const saved = loadState();
const defaultSchoolSubjects = ['English', 'Urdu', 'Mathematics', 'General Science', 'Islamiat', 'Social Studies', 'Computer'];
const defaultMadrasaSubjects = ['قرآن مجید', 'تجوید', 'حدیث', 'فقہ', 'عربی', 'اردو'];
const migratedSchoolSubjectsByClass = saved.schoolSubjectsByClass ?? Object.fromEntries(
  (saved.schoolClasses?.length ? saved.schoolClasses : SCHOOL_CLASSES).map(className => {
    const configured = saved.subjectConfigs?.find(config => config.department === 'school' && config.className === className && !config.sessionId)?.subjects;
    return [className, configured ?? saved.schoolSubjects ?? defaultSchoolSubjects];
  })
);
const migratedMadrasaSubjectsByClass = saved.madrasaSubjectsByClass ?? Object.fromEntries(
  (saved.madrasaClasses?.length ? saved.madrasaClasses : MADRASA_CLASSES).map(className => {
    const configured = saved.subjectConfigs?.find(config => config.department === 'madrasa' && config.className === className && !config.sessionId)?.subjects;
    return [className, configured ?? defaultMadrasaSubjects];
  })
);

const initialState: State = {
  language: saved.language ?? 'en',
  portal: saved.portal ?? null,
  isAuthenticated: saved.isAuthenticated ?? false,
  sidebarOpen: true,
  students: saved.students ?? [],
  teachers: saved.teachers ?? [],
  feeRecords: (saved.feeRecords ?? []).map(record => ({
    ...record,
    paidAmount: record.paidAmount ?? (record.status === 'paid' ? record.amount : 0),
    paymentDate: record.paymentDate ?? record.month,
    voucherNo: record.voucherNo ?? record.id,
    studentType: record.studentType ?? saved.students?.find(student => student.id === record.studentId)?.department,
  })),
  zakatIncome: saved.zakatIncome ?? [],
  zakatExpenses: saved.zakatExpenses ?? [],
  announcements: saved.announcements ?? [],
  results: saved.results ?? [],
  academicSessions: saved.academicSessions?.length
    ? saved.academicSessions
    : [defaultSession],
  activeSessionId: saved.activeSessionId ?? defaultSession.id,
  rollNumberRanges: saved.rollNumberRanges?.length
    ? saved.rollNumberRanges
    : DEFAULT_ROLL_RANGES,
  subjectConfigs: saved.subjectConfigs?.length
    ? saved.subjectConfigs
    : DEFAULT_SUBJECT_CONFIGS,
  adminPassword: saved.adminPassword ?? 'TalhaSaif123',
  adminUsername: saved.adminUsername ?? 'Talha',
  institutionProfile: saved.institutionProfile ?? {
    nameEn: 'Jamia Taleem-ul-Quran Lil-Banat',
    nameUr: 'جامعہ تعلیم القرآن للبنات',
    email: 'admin@jamia.edu.pk',
    phone: '+92 312 5654118',
    address: 'Peshawar, Pakistan',
  },
  schoolClasses: saved.schoolClasses?.length ? saved.schoolClasses : [...SCHOOL_CLASSES],
  schoolSubjects: saved.schoolSubjects?.length ? saved.schoolSubjects : defaultSchoolSubjects,
  schoolSubjectsByClass: migratedSchoolSubjectsByClass,
  schoolRollRange: saved.schoolRollRange ?? { start: 1, end: 1950 },
  madrasaClasses: saved.madrasaClasses?.length ? saved.madrasaClasses : [...MADRASA_CLASSES],
  madrasaSubjectsByClass: migratedMadrasaSubjectsByClass,
  madrasaTeachers: saved.madrasaTeachers ?? [],
  viewSessionId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LANGUAGE':   return { ...state, language: action.payload };
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'LOGIN':          return { ...state, isAuthenticated: true, portal: action.payload, language: action.payload === 'madrasa' ? 'ur' : 'en' };
    case 'LOGOUT':         return { ...state, isAuthenticated: false };
    case 'HYDRATE_STATE': return { ...state, ...action.payload, sidebarOpen: true, viewSessionId: null };
    case 'SET_ADMIN_PASSWORD': return { ...state, adminPassword: action.payload };
    case 'SET_ADMIN_USERNAME': return { ...state, adminUsername: action.payload };
    case 'SAVE_INSTITUTION_PROFILE': return { ...state, institutionProfile: action.payload };
    case 'SET_SCHOOL_CLASSES': return {
      ...state,
      schoolClasses: action.payload,
      schoolSubjectsByClass: Object.fromEntries(action.payload.map(className => [className, state.schoolSubjectsByClass[className] ?? []])),
    };
    case 'SET_SCHOOL_SUBJECTS': return { ...state, schoolSubjects: action.payload };
    case 'SET_SCHOOL_CLASS_SUBJECTS': return {
      ...state,
      schoolSubjectsByClass: { ...state.schoolSubjectsByClass, [action.payload.className]: action.payload.subjects },
    };
    case 'SET_SCHOOL_ROLL_RANGE': return { ...state, schoolRollRange: action.payload };
    case 'SET_MADRASA_CLASSES': return {
      ...state,
      madrasaClasses: action.payload,
      madrasaSubjectsByClass: Object.fromEntries(action.payload.map(className => [className, state.madrasaSubjectsByClass[className] ?? []])),
    };
    case 'SET_MADRASA_CLASS_SUBJECTS': return {
      ...state,
      madrasaSubjectsByClass: { ...state.madrasaSubjectsByClass, [action.payload.className]: action.payload.subjects },
    };
    case 'SET_MADRASA_CLASS_ROLL_RANGE': {
      const existing = state.rollNumberRanges.find(range => range.department === 'madrasa' && range.className === action.payload.className);
      const nextRange: RollNumberRange = {
        id: existing?.id ?? `madrasa-${action.payload.className.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        department: 'madrasa',
        className: action.payload.className,
        rangeStart: action.payload.rangeStart,
        rangeEnd: action.payload.rangeEnd,
      };
      return { ...state, rollNumberRanges: existing ? state.rollNumberRanges.map(range => range.id === existing.id ? nextRange : range) : [...state.rollNumberRanges, nextRange] };
    }

    case 'ADD_STUDENT':    return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT': return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STUDENT': return {
      ...state,
      students: state.students.filter(s => s.id !== action.payload),
      results: state.results.filter(result => result.studentId !== action.payload),
      feeRecords: state.feeRecords.filter(fee => fee.studentId !== action.payload),
    };

    case 'ADD_TEACHER':    return { ...state, teachers: [...state.teachers, action.payload] };
    case 'UPDATE_TEACHER': return { ...state, teachers: state.teachers.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TEACHER': return { ...state, teachers: state.teachers.filter(t => t.id !== action.payload) };
    case 'ADD_MADRASA_TEACHER': return { ...state, madrasaTeachers: [...state.madrasaTeachers, action.payload] };
    case 'UPDATE_MADRASA_TEACHER': return { ...state, madrasaTeachers: state.madrasaTeachers.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_MADRASA_TEACHER': return { ...state, madrasaTeachers: state.madrasaTeachers.filter(t => t.id !== action.payload) };

    case 'ADD_FEE_RECORD':    return { ...state, feeRecords: [...state.feeRecords, action.payload] };
    case 'UPDATE_FEE_RECORD': return { ...state, feeRecords: state.feeRecords.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'DELETE_FEE_RECORD': return { ...state, feeRecords: state.feeRecords.filter(f => f.id !== action.payload) };

    case 'ADD_ZAKAT_INCOME': return { ...state, zakatIncome: [...state.zakatIncome, action.payload] };
    case 'UPDATE_ZAKAT_INCOME': return { ...state, zakatIncome: state.zakatIncome.map(record => record.id === action.payload.id ? action.payload : record) };
    case 'DELETE_ZAKAT_INCOME': return { ...state, zakatIncome: state.zakatIncome.filter(record => record.id !== action.payload) };
    case 'ADD_ZAKAT_EXPENSE': return { ...state, zakatExpenses: [...state.zakatExpenses, action.payload] };
    case 'UPDATE_ZAKAT_EXPENSE': return { ...state, zakatExpenses: state.zakatExpenses.map(record => record.id === action.payload.id ? action.payload : record) };
    case 'DELETE_ZAKAT_EXPENSE': return { ...state, zakatExpenses: state.zakatExpenses.filter(record => record.id !== action.payload) };

    case 'ADD_ANNOUNCEMENT':    return { ...state, announcements: [...state.announcements, action.payload] };
    case 'UPDATE_ANNOUNCEMENT': return { ...state, announcements: state.announcements.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ANNOUNCEMENT': return { ...state, announcements: state.announcements.filter(a => a.id !== action.payload) };

    case 'ADD_RESULT':    return { ...state, results: [...state.results, action.payload] };
    case 'SAVE_RESULTS': {
      const savedById = new Map(action.payload.map(result => [result.id, result]));
      const existingIds = new Set(state.results.map(result => result.id));
      return {
        ...state,
        results: [
          ...state.results.map(result => savedById.get(result.id) ?? result),
          ...action.payload.filter(result => !existingIds.has(result.id)),
        ],
      };
    }
    case 'UPDATE_RESULT': return { ...state, results: state.results.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_RESULT': return { ...state, results: state.results.filter(r => r.id !== action.payload) };

    case 'ADD_SESSION':    return { ...state, academicSessions: [...state.academicSessions, action.payload] };
    case 'UPDATE_SESSION': return { ...state, academicSessions: state.academicSessions.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SESSION': {
      const remainingSessions = state.academicSessions.filter(s => s.id !== action.payload);
      const activeSessionId = state.activeSessionId === action.payload
        ? (remainingSessions.find(s => s.status === 'active')?.id ?? remainingSessions[0]?.id ?? null)
        : state.activeSessionId;
      const academicSessions = remainingSessions.map(session => ({
        ...session,
        status: session.id === activeSessionId ? 'active' : session.status === 'active' ? 'archived' : session.status,
      } as AcademicSession));
      return {
        ...state,
        academicSessions,
        activeSessionId,
        subjectConfigs: state.subjectConfigs.filter(config => config.sessionId !== action.payload),
        results: state.results.filter(result => result.sessionId !== action.payload),
      };
    }
    case 'SET_ACTIVE_SESSION': {
      const updated = state.academicSessions.map(s => ({
        ...s,
        status: (s.id === action.payload ? 'active' : s.status === 'active' ? 'archived' : s.status) as 'active' | 'archived',
      }));
      if (!state.academicSessions.some(session => session.id === action.payload)) return state;
      return { ...state, academicSessions: updated, activeSessionId: action.payload };
    }
    case 'SET_VIEW_SESSION': return { ...state, viewSessionId: action.payload };

    case 'UPDATE_ROLL_RANGE': return {
      ...state,
      rollNumberRanges: state.rollNumberRanges.map(r => r.id === action.payload.id ? action.payload : r),
    };
    case 'SET_SCHOOL_CLASS_ROLL_RANGE': {
      const existing = state.rollNumberRanges.find(range => range.department === 'school' && range.className === action.payload.className);
      const nextRange: RollNumberRange = {
        id: existing?.id ?? `school-${action.payload.className.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        department: 'school',
        className: action.payload.className,
        rangeStart: action.payload.rangeStart,
        rangeEnd: action.payload.rangeEnd,
      };
      return {
        ...state,
        rollNumberRanges: existing
          ? state.rollNumberRanges.map(range => range.id === existing.id ? nextRange : range)
          : [...state.rollNumberRanges, nextRange],
      };
    }
    case 'RESET_ROLL_RANGES': return { ...state, rollNumberRanges: DEFAULT_ROLL_RANGES };

    case 'UPSERT_SUBJECT_CONFIG': {
      const exists = state.subjectConfigs.some(c => c.id === action.payload.id);
      return {
        ...state,
        subjectConfigs: exists
          ? state.subjectConfigs.map(c => c.id === action.payload.id ? action.payload : c)
          : [...state.subjectConfigs, action.payload],
      };
    }
    case 'DELETE_SUBJECT_CONFIG':
      return { ...state, subjectConfigs: state.subjectConfigs.filter(c => c.id !== action.payload) };

    default: return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  t: (key: string) => string;
  login: (username: string, password: string, portal: Portal) => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  getDashboardStats: () => { totalStudents: number; activeTeachers: number; pendingFees: number };
  getFeeSummary: () => Array<FeeRecord & { studentName: string; rollNo: string; className: string }>;
  searchStudents: (q: string) => Student[];
  searchTeachers: (q: string) => Teacher[];
  autoAssignRollNo: (department: 'school' | 'madrasa', className: string) => string | null;
  getActiveSession: () => AcademicSession | null;
  getViewSession: () => AcademicSession | null;
  getStudentsForView: () => Student[];
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [remoteStatus, setRemoteStatus] = React.useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    stateApi.get()
      .then(remoteState => {
        if (remoteState) dispatch({ type: 'HYDRATE_STATE', payload: remoteState as Partial<State> });
        setRemoteStatus('ready');
      })
      .catch(() => setRemoteStatus('failed'));
  }, []);

  // Never push local/default state after a failed remote load.
  useEffect(() => {
    if (remoteStatus !== 'ready') return;
    saveState(state);
    const { sidebarOpen, viewSessionId, ...persistedState } = state;
    void sidebarOpen;
    void viewSessionId;
    stateApi.save(persistedState as unknown as Record<string, unknown>).catch(() => undefined);
  }, [state, remoteStatus]);

  const t = (key: string): string => {
    const lang = state.language;
    const dict = translations[lang] as Record<string, string>;
    return dict?.[key] ?? key;
  };

  const login = async (username: string, password: string, portal: Portal): Promise<boolean> => {
    if (username === state.adminUsername && password === state.adminPassword) {
      dispatch({ type: 'LOGIN', payload: portal });
      return true;
    }
    return false;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const setLanguage = (lang: Language) => dispatch({ type: 'SET_LANGUAGE', payload: lang });

  const toggleLanguage = () =>
    dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'ur' : 'en' });

  const getDashboardStats = () => {
    const filtered = state.viewSessionId
      ? state.students.filter(s => s.sessionId === state.viewSessionId)
      : state.students;
    const studentIds = new Set(filtered.map(student => student.id));
    const visibleFees = state.feeRecords.filter(fee => studentIds.has(fee.studentId));
    return {
      totalStudents: filtered.length,
      activeTeachers: state.teachers.length,
      pendingFees: visibleFees.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0),
    };
  };

  const getFeeSummary = () =>
    state.feeRecords.map(f => {
      const student = state.students.find(s => s.id === f.studentId);
      return {
        ...f,
        studentName: student?.name ?? 'Unknown',
        rollNo: student?.rollNo ?? '-',
        className: student?.class ?? '-',
      };
    });

  const searchStudents = (q: string) =>
    state.students.filter(s =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(q.toLowerCase())
    );

  const searchTeachers = (q: string) =>
    state.teachers.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));

  /** Auto-assign next available roll number for a class */
  const autoAssignRollNo = (department: 'school' | 'madrasa', className: string): string | null => {
    const range = state.rollNumberRanges.find(r => r.department === department && r.className === className);
    if (!range) return null;

    // Get all used roll numbers in this class (all sessions combined — roll numbers are globally unique)
    const usedNums = new Set(
      state.students
        .filter(s => s.department === department && s.class === className && s.rollNo)
        .map(s => parseInt(s.rollNo, 10))
        .filter(n => !isNaN(n))
    );

    for (let n = range.rangeStart; n <= range.rangeEnd; n++) {
      if (!usedNums.has(n)) return String(n);
    }
    return null; // range exhausted
  };

  const getActiveSession = (): AcademicSession | null =>
    state.academicSessions.find(s => s.id === state.activeSessionId) ?? null;

  const getViewSession = (): AcademicSession | null => {
    if (!state.viewSessionId) return null;
    return state.academicSessions.find(s => s.id === state.viewSessionId) ?? null;
  };

  /** Students filtered by current viewSessionId (if set) */
  const getStudentsForView = (): Student[] => {
    if (!state.viewSessionId) return state.students;
    return state.students.filter(s => s.sessionId === state.viewSessionId);
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      t,
      login,
      logout,
      setLanguage,
      toggleLanguage,
      getDashboardStats,
      getFeeSummary,
      searchStudents,
      searchTeachers,
      autoAssignRollNo,
      getActiveSession,
      getViewSession,
      getStudentsForView,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
