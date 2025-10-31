'use server';

import { revalidatePath } from 'next/cache';
import {
  createDraftRepo,
  getDraftRepo,
  saveDraftRepo,
  submitDraftRepo,
} from '@/lib/drafts-repo';

export type { Draft, DraftPayload, DocType } from '@/lib/drafts-repo';

export async function createDraft(docType: DocType) {
  return createDraftRepo(docType);
}

export async function getDraft(draftId: string) {
  return getDraftRepo(draftId);
}

export async function saveDraft(draftId: string, payload: DraftPayload, progress?: number) {
  return saveDraftRepo(draftId, payload, progress);
}

export async function submitDraft(draftId: string) {
  const result = await submitDraftRepo(draftId);
  revalidatePath(`/cv/${draftId}/preview`);
  revalidatePath(`/resume/${draftId}/preview`);
  return result;
}
