export type ResumeProfile = {
  name: string; kana?: string; birth: string; // YYYY-MM-DD
  address: string; email?: string; phone?: string;
  photoBase64?: string; // 4:3, <=2MB
};
export type ResumeHistoryKind = "入学"|"卒業"|"中途退学"|"入社"|"退社"|"開業"|"閉業";
export type ResumeHistory = { yyyymm: string; org: string; detail?: string; kind: ResumeHistoryKind; };
export type ResumeLicense = { name: string; yyyymm?: string; note?: string };
export type ResumePR = { answers: string[]; generatedText?: string };
export type ResumeDoc = { profile: ResumeProfile; histories: ResumeHistory[]; licenses: ResumeLicense[]; hope?: string; pr: ResumePR; };

export type JobProfile = { summary?: string; strengths?: string[]; desiredRole?: string; };
export type JobExperience = { company: string; term: { from: string; to?: string }; role?: string; tasks?: string[]; achievements?: string[]; };
export type JobCV = {
  summary: string;
  companies: { name: string; term: string; roles: string[]; tasks: string[]; achievements: string[] }[];
  leverage: { title: string; example: string }[];
  selfPR: string;
};
