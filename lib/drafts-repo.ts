import crypto from 'node:crypto';

type DraftStatus = 'draft' | 'submitted';
export type DocType = 'cv' | 'resume';
export type DraftPayload = Record<string, unknown>;
export type Draft = {
  draftId: string;
  docType: DocType;
  payload: DraftPayload;
  progress: number;
  status: DraftStatus;
  updatedAt: string;
};

type AirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
};

type AirtableResponse = {
  records: AirtableRecord[];
};

type UpdateResult = { ok: true; updatedAt: string };

const memoryStore = new Map<string, Draft>();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_DRAFTS_TABLE ?? 'Drafts';
const AIRTABLE_ENDPOINT = process.env.AIRTABLE_ENDPOINT_URL ?? 'https://api.airtable.com/v0';

const hasAirtable = Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);

function nowISO() {
  return new Date().toISOString();
}

function generateId() {
  return crypto.randomUUID();
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

type AirtableRequestOptions = RequestInit & { query?: URLSearchParams };

async function airtableRequest<T>(
  options: AirtableRequestOptions,
  path = ''
): Promise<T> {
  if (!hasAirtable) {
    throw new Error('Airtable is not configured');
  }

  const headers = new Headers({
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  });
  if (options.headers) {
    const provided = new Headers(options.headers);
    provided.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const queryString = options.query && options.query.toString().length > 0 ? `?${options.query.toString()}` : '';
  const url = `${AIRTABLE_ENDPOINT}/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}${path}${queryString}`;

  const requestInit: RequestInit = {
    cache: 'no-store',
    ...options,
    headers,
  };

  let attempt = 0;
  while (true) {
    const response = await fetch(url, requestInit);
    if (response.status === 429 || response.status >= 500) {
      if (attempt >= 2) {
        const text = await response.text();
        throw new Error(`Airtable temporary error: ${response.status} ${text}`);
      }
      const backoff = Math.pow(2, attempt) * 250;
      await sleep(backoff);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Airtable request failed: ${response.status} ${text}`);
    }

    if (response.status === 204) {
      // No content
      return null as T;
    }

    const json = (await response.json()) as T;
    return json;
  }
}

function toDraftFromRecord(record: AirtableRecord): Draft {
  const fields = record.fields as Record<string, unknown>;
  return {
    draftId: String(fields.draftId ?? ''),
    docType: (fields.docType as DocType) ?? 'cv',
    payload: safeParseJson(fields.payload) ?? {},
    progress: typeof fields.progress === 'number' ? fields.progress : Number(fields.progress ?? 0) || 0,
    status: (fields.status as DraftStatus) ?? 'draft',
    updatedAt: typeof fields.updatedAt === 'string' ? fields.updatedAt : record.createdTime,
  };
}

export async function createDraftRepo(docType: DocType): Promise<Draft> {
  const draft: Draft = {
    draftId: generateId(),
    docType,
    payload: {},
    progress: 0,
    status: 'draft',
    updatedAt: nowISO(),
  };

  if (hasAirtable) {
    await airtableRequest<AirtableResponse>({
      method: 'POST',
      body: JSON.stringify({
        records: [
          {
            fields: {
              draftId: draft.draftId,
              docType: draft.docType,
              payload: JSON.stringify(draft.payload),
              progress: draft.progress,
              status: draft.status,
              updatedAt: draft.updatedAt,
            },
          },
        ],
      }),
    });
  } else {
    memoryStore.set(draft.draftId, draft);
  }

  return draft;
}

export async function getDraftRepo(draftId: string): Promise<Draft | null> {
  if (!draftId) return null;

  if (hasAirtable) {
    const params = new URLSearchParams();
    params.set('filterByFormula', `{draftId} = "${draftId}"`);
    params.set('maxRecords', '1');
    params.set('pageSize', '1');
    const fields = ['draftId', 'docType', 'payload', 'progress', 'status', 'updatedAt'];
    fields.forEach((field) => params.append('fields[]', field));

    const result = await airtableRequest<AirtableResponse>({ method: 'GET', query: params });
    const record = result.records?.[0];
    if (!record) return null;
    return toDraftFromRecord(record);
  }

  return memoryStore.get(draftId) ?? null;
}

export async function saveDraftRepo(
  draftId: string,
  payload: DraftPayload,
  progress = 0
): Promise<UpdateResult> {
  const updatedAt = nowISO();

  if (hasAirtable) {
    const params = new URLSearchParams();
    params.set('filterByFormula', `{draftId} = "${draftId}"`);
    params.set('maxRecords', '1');
    params.set('pageSize', '1');
    params.append('fields[]', 'draftId');
    const result = await airtableRequest<AirtableResponse>({ method: 'GET', query: params });
    const record = result.records?.[0];
    if (!record) {
      throw new Error('Draft not found');
    }

    await airtableRequest<AirtableResponse>(
      {
        method: 'PATCH',
        body: JSON.stringify({
          records: [
            {
              id: record.id,
              fields: {
                payload: JSON.stringify(payload ?? {}),
                progress,
                updatedAt,
              },
            },
          ],
        }),
      },
      ''
    );
  } else {
    const current = memoryStore.get(draftId);
    if (!current) {
      throw new Error('Draft not found');
    }
    memoryStore.set(draftId, {
      ...current,
      payload: payload ?? {},
      progress,
      updatedAt,
    });
  }

  return { ok: true, updatedAt };
}

export async function submitDraftRepo(draftId: string): Promise<UpdateResult> {
  const updatedAt = nowISO();

  if (hasAirtable) {
    const params = new URLSearchParams();
    params.set('filterByFormula', `{draftId} = "${draftId}"`);
    params.set('maxRecords', '1');
    params.set('pageSize', '1');
    params.append('fields[]', 'draftId');
    const result = await airtableRequest<AirtableResponse>({ method: 'GET', query: params });
    const record = result.records?.[0];
    if (!record) {
      throw new Error('Draft not found');
    }

    await airtableRequest<AirtableResponse>({
      method: 'PATCH',
      body: JSON.stringify({
        records: [
          {
            id: record.id,
            fields: {
              status: 'submitted',
              updatedAt,
            },
          },
        ],
      }),
    });
  } else {
    const current = memoryStore.get(draftId);
    if (!current) {
      throw new Error('Draft not found');
    }
    memoryStore.set(draftId, {
      ...current,
      status: 'submitted',
      updatedAt,
    });
  }

  return { ok: true, updatedAt };
}

function safeParseJson(value: unknown) {
  if (typeof value !== 'string') return (value as DraftPayload) ?? {};
  try {
    return JSON.parse(value) as DraftPayload;
  } catch (error) {
    console.error('Failed to parse draft payload', error);
    return {};
  }
}
