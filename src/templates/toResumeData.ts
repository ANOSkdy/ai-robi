import { useResumeStore, type CvState, type EducationEntry, type EmploymentEntry, type LicenseEntry } from "@/store/resume";
import type { ResumeData } from "@/templates/types";

type DateRangeItem = { start: string; end?: string; title: string; detail?: string; status?: string };
type LicenseItem = { name: string; acquiredOn?: string };
type PrSection = { generated?: string; answers?: string[] } | undefined;
type CareerSection = { generatedCareer?: string } | undefined;

type CareerSource = {
  cvText: string;
  cv: CvState;
};

const normalizeDate = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeText = (value: string | undefined): string => value?.trim() ?? "";

const normalizeOptionalText = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const mapEducation = (entries: EducationEntry[]): DateRangeItem[] =>
  entries.map((entry) => ({
    start: normalizeText(entry.start),
    end: normalizeDate(entry.end),
    title: normalizeText(entry.school),
    detail: normalizeOptionalText(entry.degree),
    status: normalizeOptionalText(entry.status),
  }));

const mapEmployment = (entries: EmploymentEntry[]): DateRangeItem[] =>
  entries.map((entry) => ({
    start: normalizeText(entry.start),
    end: normalizeDate(entry.end),
    title: normalizeText(entry.company),
    detail: normalizeOptionalText(entry.role),
    status: normalizeOptionalText(entry.status),
  }));

const mapLicenses = (entries: LicenseEntry[]): LicenseItem[] =>
  entries.map((entry) => ({
    name: normalizeText(entry.name),
    acquiredOn: normalizeDate(entry.obtainedOn),
  }));

const mapPr = (prText: string, prAnswers: string[]): PrSection => {
  const generated = normalizeOptionalText(prText);
  const answers = prAnswers
    .map((answer) => answer.trim())
    .filter((answer) => answer.length > 0);

  if (!generated && answers.length === 0) {
    return undefined;
  }

  return {
    generated,
    answers: answers.length > 0 ? answers : undefined,
  };
};

const buildCareerText = ({ cvText, cv }: CareerSource): string | undefined => {
  const explicitCareer = cvText.trim();
  if (explicitCareer.length > 0) {
    return explicitCareer;
  }

  const jobProfileParts = [
    normalizeOptionalText(cv.jobProfile.name) ? `氏名: ${normalizeText(cv.jobProfile.name)}` : null,
    normalizeOptionalText(cv.jobProfile.title) ? `タイトル: ${normalizeText(cv.jobProfile.title)}` : null,
    normalizeOptionalText(cv.jobProfile.summary) ? `要約: ${normalizeText(cv.jobProfile.summary)}` : null,
  ].filter((part): part is string => part !== null);

  const experienceParts = cv.experiences
    .map((experience) => {
      const achievements = experience.achievements
        .map((achievement) => normalizeOptionalText(achievement))
        .filter((achievement): achievement is string => Boolean(achievement));
      const achievementText = achievements.length > 0 ? `\n・${achievements.join("\n・")}` : "";
      const period = normalizeOptionalText(experience.period);
      const company = normalizeOptionalText(experience.company);
      const role = normalizeOptionalText(experience.role);
      const base = [period, company].filter((value): value is string => Boolean(value)).join(" ");
      const lineParts = [base, role ? `／${role}` : null].filter((value): value is string => Boolean(value));
      const line = lineParts.join("").trim();
      const content = `${line}${achievementText}`.trim();
      return content;
    })
    .filter((entry) => entry.length > 0);

  const sections = [...jobProfileParts, ...experienceParts];
  if (sections.length === 0) {
    return undefined;
  }

  return sections.join("\n\n");
};

const mapCareer = ({ cvText, cv }: CareerSource): CareerSection => {
  const generatedCareer = normalizeOptionalText(buildCareerText({ cvText, cv }));
  return generatedCareer ? { generatedCareer } : undefined;
};

export function toResumeData(): ResumeData {
  const state = useResumeStore.getState();
  const { profile, education, employment, licenses, prText, prAnswers, cvText, cv } = state;

  const data: ResumeData = {
    profile: {
      name: normalizeText(profile.name),
      nameKana: normalizeOptionalText(profile.nameKana),
      birth: normalizeDate(profile.birth),
      address: normalizeText(profile.address),
      phone: normalizeText(profile.phone),
      email: normalizeText(profile.email),
      avatarUrl: normalizeOptionalText(profile.avatarUrl),
    },
    education: mapEducation(education),
    work: mapEmployment(employment),
    licenses: mapLicenses(licenses),
  };

  const pr = mapPr(prText, prAnswers);
  if (pr) {
    data.pr = pr;
  }

  const career = mapCareer({ cvText, cv });
  if (career) {
    data.career = career;
  }

  return data;
}
