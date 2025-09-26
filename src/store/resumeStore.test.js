import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockStorage = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

vi.stubGlobal('localStorage', mockStorage);

const { useResumeStore } = await import('./resumeStore');

beforeEach(() => {
  useResumeStore.setState({
    jobSummary: '',
    jobDetails: [],
    jobCompanyDetail: '',
    jobKnowledge: '',
    jobSelfPr: '',
    histories: [
      { id: 'h1', type: 'header', year: '', month: '', description: '職 歴' },
      {
        id: 'h2',
        type: 'entry',
        year: '',
        month: '',
        description: 'A社 入社',
        status: '入社',
      },
      {
        id: 'h3',
        type: 'entry',
        year: '',
        month: '',
        description: 'B社 入社',
        status: '入社',
      },
      { id: 'h4', type: 'footer', year: '', month: '', description: '以 上' },
    ],
    licenses: [
      { id: 'l1', year: '2020', month: '4', description: '基本情報技術者（取得）' },
    ],
  });
});

describe('resumeStore job fields', () => {
  it('normalizes details to company list', () => {
    const {
      setJobSummary,
      setJobDetails,
      upsertJobDetail,
      setJobKnowledge,
      setJobCompanyDetail,
      setJobSelfPr,
    } =
      useResumeStore.getState();
    setJobSummary('summary');
    setJobDetails([{ company: 'A社', detail: 'a' }]);
    upsertJobDetail(1, 'updated');
    setJobKnowledge('knowledge');
    setJobCompanyDetail('company detail');
    setJobSelfPr('selfpr');
    const state = useResumeStore.getState();
    expect(state.jobSummary).toBe('summary');
    expect(state.jobDetails).toEqual([
      { company: 'A社', detail: 'a' },
      { company: 'B社', detail: 'updated' },
    ]);
    expect(state.jobKnowledge).toBe('knowledge');
    expect(state.jobCompanyDetail).toBe('company detail');
    expect(state.jobSelfPr).toBe('selfpr');
  });
});

describe('resumeStore licenses', () => {
  it('appends suffix when updating license description', () => {
    const { updateLicense } = useResumeStore.getState();
    updateLicense('l1', 'description', '応用情報技術者');
    const { licenses } = useResumeStore.getState();
    expect(licenses[0].description).toBe('応用情報技術者（取得）');
  });
});
