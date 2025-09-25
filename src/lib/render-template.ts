import Handlebars from 'handlebars';
import type { TemplateDelegate } from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';

export type DocumentType = 'resume' | 'cv';

type Birthdate = {
  year?: string;
  month?: string;
  day?: string;
};

type Profile = {
  name?: string;
  nameFurigana?: string;
  birthdate?: Birthdate;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
};

type History = {
  year?: string;
  month?: string;
  description?: string;
};

type License = {
  year?: string;
  month?: string;
  description?: string;
};

type JobDetail = {
  company?: string;
  detail?: string;
};

export type ResumeTemplateData = {
  profile?: Profile;
  histories?: History[];
  licenses?: License[];
  motivation?: string;
  selfPromotion?: string;
  requests?: string;
  jobSummary?: string;
  jobDetails?: JobDetail[];
};

type ResumeTemplateContext = {
  profile: Required<Profile> & { birthdate: Required<Birthdate> };
  histories: Required<History>[];
  licenses: Required<License>[];
  motivation: string;
  selfPromotion: string;
  requests: string;
  jobSummary: string;
  jobDetails: Required<JobDetail>[];
};

const TEMPLATE_ROOT = path.join(process.cwd(), 'templates');
const templateCache = new Map<DocumentType, TemplateDelegate<ResumeTemplateContext>>();

Handlebars.registerHelper('linebreaks', (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }
  const escaped = Handlebars.escapeExpression(value);
  return new Handlebars.SafeString(escaped.replace(/\r?\n/g, '<br />'));
});

function normalizeBirthdate(birthdate: Birthdate | undefined): Required<Birthdate> {
  return {
    year: birthdate?.year ?? '',
    month: birthdate?.month ?? '',
    day: birthdate?.day ?? '',
  };
}

function normalizeProfile(profile: Profile | undefined): ResumeTemplateContext['profile'] {
  return {
    name: profile?.name ?? '',
    nameFurigana: profile?.nameFurigana ?? '',
    birthdate: normalizeBirthdate(profile?.birthdate),
    address: profile?.address ?? '',
    contact: profile?.contact ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
  };
}

function normalizeHistories(histories: History[] | undefined): Required<History>[] {
  if (!Array.isArray(histories)) {
    return [];
  }
  return histories.map((history) => ({
    year: history?.year ?? '',
    month: history?.month ?? '',
    description: history?.description ?? '',
  }));
}

function normalizeLicenses(licenses: License[] | undefined): Required<License>[] {
  if (!Array.isArray(licenses)) {
    return [];
  }
  return licenses.map((license) => ({
    year: license?.year ?? '',
    month: license?.month ?? '',
    description: license?.description ?? '',
  }));
}

function normalizeJobDetails(jobDetails: JobDetail[] | undefined): Required<JobDetail>[] {
  if (!Array.isArray(jobDetails)) {
    return [];
  }
  return jobDetails.map((detail) => ({
    company: detail?.company ?? '',
    detail: detail?.detail ?? '',
  }));
}

function buildContext(data: ResumeTemplateData): ResumeTemplateContext {
  return {
    profile: normalizeProfile(data.profile),
    histories: normalizeHistories(data.histories),
    licenses: normalizeLicenses(data.licenses),
    motivation: data.motivation ?? '',
    selfPromotion: data.selfPromotion ?? '',
    requests: data.requests ?? '',
    jobSummary: data.jobSummary ?? '',
    jobDetails: normalizeJobDetails(data.jobDetails),
  };
}

async function loadTemplate(type: DocumentType) {
  const cached = templateCache.get(type);
  if (cached) {
    return cached;
  }

  const templatePath = path.join(TEMPLATE_ROOT, `${type}.html`);
  const source = await fs.readFile(templatePath, 'utf8');
  const compiled = Handlebars.compile<ResumeTemplateContext>(source, {
    noEscape: true,
  });
  templateCache.set(type, compiled);
  return compiled;
}

export async function renderTemplate(type: DocumentType, data: ResumeTemplateData) {
  const template = await loadTemplate(type);
  const context = buildContext(data);
  return template(context);
}
