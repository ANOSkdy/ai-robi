import { create } from "zustand";

export type Profile = {
  name: string;
  nameKana?: string;
  birth: string;
  address: string;
  phone: string;
  email: string;
  avatarUrl?: string;
};

export type EducationStatus = "入学" | "卒業" | "中退";
export type EmploymentStatus = "入社" | "退社" | "開業" | "閉業";

export type EducationEntry = {
  school: string;
  degree?: string;
  start: string;
  end: string;
  status: EducationStatus;
};

export type EmploymentEntry = {
  company: string;
  role: string;
  start: string;
  end: string;
  status: EmploymentStatus;
};

export type LicenseEntry = {
  name: string;
  obtainedOn: string;
};

export type JobProfile = {
  title?: string;
  summary?: string;
  name?: string;
};

export type CvExperience = {
  company: string;
  role: string;
  period: string;
  achievements: string[];
};

export type CvState = {
  jobProfile: JobProfile;
  experiences: CvExperience[];
};

export type GeneratedCv = {
  summary: string;
  companies: Array<{
    name: string;
    term: string;
    roles: string[];
    tasks: string[];
    achievements: string[];
  }>;
  leverage: Array<{
    title: string;
    example: string;
  }>;
  selfPR: string;
};

type ResumeStore = {
  profile: Profile;
  education: EducationEntry[];
  employment: EmploymentEntry[];
  licenses: LicenseEntry[];
  prAnswers: string[];
  prText: string;
  cvText: string;
  cv: CvState;
  cvResult: GeneratedCv | null;
  setProfile: (profile: Profile) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  clearProfile: () => void;
  upsertEducation: (index: number, entry: EducationEntry) => void;
  addEducation: (entry?: Partial<EducationEntry>) => void;
  removeEducation: (index: number) => void;
  clearEducation: () => void;
  upsertEmployment: (index: number, entry: EmploymentEntry) => void;
  addEmployment: (entry?: Partial<EmploymentEntry>) => void;
  removeEmployment: (index: number) => void;
  clearEmployment: () => void;
  upsertLicense: (index: number, entry: LicenseEntry) => void;
  addLicense: (entry?: Partial<LicenseEntry>) => void;
  removeLicense: (index: number) => void;
  clearLicenses: () => void;
  setPrAnswers: (answers: string[]) => void;
  setPrAnswer: (index: number, value: string) => void;
  clearPrAnswers: () => void;
  setPrText: (text: string) => void;
  clearPrText: () => void;
  setCvText: (text: string) => void;
  clearCvText: () => void;
  updateJobProfile: (profile: Partial<JobProfile>) => void;
  upsertCvExperience: (index: number, experience: CvExperience) => void;
  addCvExperience: (experience?: Partial<CvExperience>) => void;
  removeCvExperience: (index: number) => void;
  clearCvExperiences: () => void;
  setCvState: (cv: CvState) => void;
  resetCv: () => void;
  setCvResult: (result: GeneratedCv | null) => void;
  resetAll: () => void;
};

const emptyProfile: Profile = {
  name: "",
  birth: "",
  address: "",
  phone: "",
  email: "",
};

const createEducation = (partial?: Partial<EducationEntry>): EducationEntry => ({
  school: "",
  degree: undefined,
  start: "",
  end: "",
  status: "入学",
  ...partial,
});

const createEmployment = (partial?: Partial<EmploymentEntry>): EmploymentEntry => ({
  company: "",
  role: "",
  start: "",
  end: "",
  status: "入社",
  ...partial,
});

const createLicense = (partial?: Partial<LicenseEntry>): LicenseEntry => ({
  name: "",
  obtainedOn: "",
  ...partial,
});

const createCvExperience = (partial?: Partial<CvExperience>): CvExperience => ({
  company: "",
  role: "",
  period: "",
  achievements: [],
  ...partial,
});

const initialState: ResumeStore = {
  profile: emptyProfile,
  education: [],
  employment: [],
  licenses: [],
  prAnswers: Array(5).fill(""),
  prText: "",
  cvText: "",
  cv: {
    jobProfile: {},
    experiences: [],
  },
  cvResult: null,
  setProfile: () => undefined,
  updateProfile: () => undefined,
  clearProfile: () => undefined,
  upsertEducation: () => undefined,
  addEducation: () => undefined,
  removeEducation: () => undefined,
  clearEducation: () => undefined,
  upsertEmployment: () => undefined,
  addEmployment: () => undefined,
  removeEmployment: () => undefined,
  clearEmployment: () => undefined,
  upsertLicense: () => undefined,
  addLicense: () => undefined,
  removeLicense: () => undefined,
  clearLicenses: () => undefined,
  setPrAnswers: () => undefined,
  setPrAnswer: () => undefined,
  clearPrAnswers: () => undefined,
  setPrText: () => undefined,
  clearPrText: () => undefined,
  setCvText: () => undefined,
  clearCvText: () => undefined,
  updateJobProfile: () => undefined,
  upsertCvExperience: () => undefined,
  addCvExperience: () => undefined,
  removeCvExperience: () => undefined,
  clearCvExperiences: () => undefined,
  setCvState: () => undefined,
  resetCv: () => undefined,
  setCvResult: () => undefined,
  resetAll: () => undefined,
};

export const useResumeStore = create<ResumeStore>()((set, get) => ({
  ...initialState,
  setProfile: (profile) =>
    set(() => ({ profile: { ...profile, nameKana: profile.nameKana || undefined, avatarUrl: profile.avatarUrl || undefined } })),
  updateProfile: (profile) =>
    set((state) => ({
      profile: {
        ...state.profile,
        ...profile,
        nameKana: profile.nameKana === "" ? undefined : profile.nameKana ?? state.profile.nameKana,
        avatarUrl: profile.avatarUrl === "" ? undefined : profile.avatarUrl ?? state.profile.avatarUrl,
      },
    })),
  clearProfile: () => set(() => ({ profile: { ...emptyProfile } })),
  upsertEducation: (index, entry) =>
    set((state) => {
      const next = [...state.education];
      next[index] = { ...entry, degree: entry.degree || undefined };
      return { education: next };
    }),
  addEducation: (entry) =>
    set((state) => ({ education: [...state.education, createEducation(entry)] })),
  removeEducation: (index) =>
    set((state) => ({ education: state.education.filter((_, i) => i !== index) })),
  clearEducation: () => set(() => ({ education: [] })),
  upsertEmployment: (index, entry) =>
    set((state) => {
      const next = [...state.employment];
      next[index] = { ...entry };
      return { employment: next };
    }),
  addEmployment: (entry) =>
    set((state) => ({ employment: [...state.employment, createEmployment(entry)] })),
  removeEmployment: (index) =>
    set((state) => ({ employment: state.employment.filter((_, i) => i !== index) })),
  clearEmployment: () => set(() => ({ employment: [] })),
  upsertLicense: (index, entry) =>
    set((state) => {
      const next = [...state.licenses];
      next[index] = { ...entry };
      return { licenses: next };
    }),
  addLicense: (entry) =>
    set((state) => ({ licenses: [...state.licenses, createLicense(entry)] })),
  removeLicense: (index) =>
    set((state) => ({ licenses: state.licenses.filter((_, i) => i !== index) })),
  clearLicenses: () => set(() => ({ licenses: [] })),
  setPrAnswers: (answers) => set(() => ({ prAnswers: [...answers] })),
  setPrAnswer: (index, value) =>
    set((state) => {
      const next = [...state.prAnswers];
      next[index] = value;
      return { prAnswers: next };
    }),
  clearPrAnswers: () => set(() => ({ prAnswers: Array(5).fill("") })),
  setPrText: (text) => set(() => ({ prText: text })),
  clearPrText: () => set(() => ({ prText: "" })),
  setCvText: (text) => set(() => ({ cvText: text })),
  clearCvText: () => set(() => ({ cvText: "" })),
  updateJobProfile: (profile) =>
    set((state) => ({ cv: { ...state.cv, jobProfile: { ...state.cv.jobProfile, ...profile } } })),
  upsertCvExperience: (index, experience) =>
    set((state) => {
      const next = [...state.cv.experiences];
      next[index] = { ...experience, achievements: [...experience.achievements] };
      return { cv: { ...state.cv, experiences: next } };
    }),
  addCvExperience: (experience) =>
    set((state) => ({
      cv: {
        ...state.cv,
        experiences: [...state.cv.experiences, createCvExperience(experience)],
      },
    })),
  removeCvExperience: (index) =>
    set((state) => ({
      cv: {
        ...state.cv,
        experiences: state.cv.experiences.filter((_, i) => i !== index),
      },
    })),
  clearCvExperiences: () =>
    set((state) => ({
      cv: {
        ...state.cv,
        experiences: [],
      },
    })),
  setCvState: (cv) => set(() => ({ cv: { jobProfile: { ...cv.jobProfile }, experiences: [...cv.experiences] } })),
  resetCv: () => set(() => ({ cv: { jobProfile: {}, experiences: [] }, cvText: "" })),
  setCvResult: (result) => set(() => ({ cvResult: result })),
  resetAll: () =>
    set(() => ({
      profile: { ...emptyProfile },
      education: [],
      employment: [],
      licenses: [],
      prAnswers: Array(5).fill(""),
      prText: "",
      cvText: "",
      cv: { jobProfile: {}, experiences: [] },
      cvResult: null,
    })),
}));
