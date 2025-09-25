import Handlebars from 'handlebars';
import type { TemplateDelegate } from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';

const TEMPLATE_ROOT = path.join(process.cwd(), 'templates');

const RESUME_QUESTIONS: Record<string, string> = {
  achievement: 'これまでの実務で最も成果を出した取り組み',
  strength: '成果を支えた強み',
  challenge: '困難を乗り越えた経験',
  evaluation: '周囲からの評価',
  applicability: '志望企業で活かせる経験・知見',
};

const EXPERIENCE_QUESTIONS: Record<string, string> = {
  roles: '担当した主な職務・役割',
  results: '実績（数値・成果）',
  initiatives: '成果を出すために実行した施策',
  team: 'チーム規模や関係者',
  issues: '代表的な課題と解決アプローチ',
};

const PROFILE_QUESTIONS: Record<string, string> = {
  education: '最終学歴と専攻',
  skills: '得意分野・専門スキル',
  preference: '希望職種・業界・働き方',
  strengthExample: '強みが活きた事例',
  future: '今後挑戦したい領域',
};

type TemplateName = 'resume' | 'cv';

type HistoryEntry = {
  year?: string;
  month?: string;
  description?: string;
  status?: string;
  type?: string;
};

type TemplateAnswer = {
  key: string;
  label: string;
  value: string;
};

type TemplateContext = {
  generatedAt: string;
  personal: Record<string, unknown>;
  histories: { formatted: string; type: string }[];
  historyEntries: { formatted: string }[];
  qualificationEntries: { formatted: string }[];
  resume: {
    selfPr: string;
    answers: TemplateAnswer[];
  };
  job: {
    document: string;
    experienceSummary: string;
    profileSummary: string;
    experienceAnswers: TemplateAnswer[];
    profileAnswers: TemplateAnswer[];
  };
  photo: {
    base64: string;
    warning: string;
  };
};

const templateCache = new Map<TemplateName, TemplateDelegate<TemplateContext>>();

Handlebars.registerHelper('breaklines', (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }
  const escaped = Handlebars.escapeExpression(value);
  const html = escaped.replace(/\r?\n/g, '<br />');
  return new Handlebars.SafeString(html);
});

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return Boolean(value) && typeof value === 'object';
}

function normalizeHistoryEntries(entries: unknown): HistoryEntry[] {
  if (!Array.isArray(entries)) {
    return [];
  }
  return entries.filter(isHistoryEntry).map((entry) => ({
    year: typeof entry.year === 'string' ? entry.year : '',
    month: typeof entry.month === 'string' ? entry.month : '',
    description: typeof entry.description === 'string' ? entry.description : '',
    status: typeof entry.status === 'string' ? entry.status : '',
    type: typeof entry.type === 'string' ? entry.type : '',
  }));
}

function formatHistoryEntry(entry: HistoryEntry): string {
  const segments: string[] = [];
  if (entry.year) {
    segments.push(`${entry.year}年`);
  }
  if (entry.month) {
    segments.push(`${entry.month}月`);
  }
  if (entry.status) {
    segments.push(`【${entry.status}】`);
  }
  if (entry.description) {
    segments.push(entry.description);
  }
  return segments.join(' ').trim();
}

function mapAnswers(
  source: unknown,
  labels: Record<string, string>
): TemplateAnswer[] {
  if (!source || typeof source !== 'object') {
    return [];
  }
  return Object.entries(source as Record<string, unknown>)
    .map(([key, value]) => {
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text) {
        return null;
      }
      return {
        key,
        label: labels[key] ?? key,
        value: text,
      } satisfies TemplateAnswer;
    })
    .filter((entry): entry is TemplateAnswer => Boolean(entry));
}

async function loadTemplate(name: TemplateName) {
  const cached = templateCache.get(name);
  if (cached) {
    return cached;
  }
  const filePath = path.join(TEMPLATE_ROOT, `${name}.html`);
  const source = await fs.readFile(filePath, 'utf8');
  const compiled = Handlebars.compile<TemplateContext>(source, {
    noEscape: true,
  });
  templateCache.set(name, compiled);
  return compiled;
}

function buildTemplateContext(data: Record<string, unknown>): TemplateContext {
  const histories = normalizeHistoryEntries(data.histories);
  const historyEntries = histories.filter((entry) => entry.type !== 'qualification');
  const qualificationEntries = histories.filter((entry) => entry.type === 'qualification');

  const personal = data.personal && typeof data.personal === 'object' ? data.personal : {};
  const resume = data.resume && typeof data.resume === 'object' ? data.resume : {};
  const job = data.job && typeof data.job === 'object' ? data.job : {};
  const photo = data.photo && typeof data.photo === 'object' ? data.photo : {};

  const generatedAt = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(new Date());

  const resumeAnswers = mapAnswers(
    (resume as Record<string, unknown>).answers,
    RESUME_QUESTIONS
  );

  const experienceAnswers = mapAnswers(
    ((job as Record<string, unknown>).experience as Record<string, unknown>)?.answers,
    EXPERIENCE_QUESTIONS
  );

  const profileAnswers = mapAnswers(
    ((job as Record<string, unknown>).profile as Record<string, unknown>)?.answers,
    PROFILE_QUESTIONS
  );

  const experienceSummary =
    ((job as Record<string, unknown>).experience as Record<string, unknown>)?.summary;
  const profileSummary =
    ((job as Record<string, unknown>).profile as Record<string, unknown>)?.summary;

  return {
    generatedAt,
    personal: personal as Record<string, unknown>,
    histories: histories.map((entry) => ({
      formatted: formatHistoryEntry(entry),
      type: entry.type ?? '',
    })),
    historyEntries: historyEntries.map((entry) => ({
      formatted: formatHistoryEntry(entry),
    })),
    qualificationEntries: qualificationEntries.map((entry) => ({
      formatted: formatHistoryEntry(entry),
    })),
    resume: {
      selfPr: typeof (resume as Record<string, unknown>).selfPr === 'string'
        ? ((resume as Record<string, unknown>).selfPr as string)
        : '',
      answers: resumeAnswers,
    },
    job: {
      document:
        typeof (job as Record<string, unknown>).document === 'string'
          ? ((job as Record<string, unknown>).document as string)
          : '',
      experienceSummary: typeof experienceSummary === 'string' ? experienceSummary : '',
      profileSummary: typeof profileSummary === 'string' ? profileSummary : '',
      experienceAnswers,
      profileAnswers,
    },
    photo: {
      base64:
        typeof (photo as Record<string, unknown>).base64 === 'string'
          ? ((photo as Record<string, unknown>).base64 as string)
          : '',
      warning:
        typeof (photo as Record<string, unknown>).warning === 'string'
          ? ((photo as Record<string, unknown>).warning as string)
          : '',
    },
  } satisfies TemplateContext;
}

export async function renderTemplate(
  type: TemplateName,
  data: Record<string, unknown>
): Promise<string> {
  const template = await loadTemplate(type);
  const context = buildTemplateContext(data);
  return template(context);
}
