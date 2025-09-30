import { afterEach, describe, expect, it } from 'vitest';
import { useResumeStore, type EducationEntry, type CvExperience } from './resume';

afterEach(() => {
  useResumeStore.getState().resetAll();
});

describe('resume store basic operations', () => {
  it('updates profile and persists optional fields as undefined when empty', () => {
    useResumeStore.getState().setProfile({
      name: '山田 太郎',
      birth: '1990-01-01',
      address: '東京都渋谷区',
      phone: '090-0000-0000',
      email: 'taro@example.com',
      nameKana: '',
      avatarUrl: '',
    });
    const profile = useResumeStore.getState().profile;
    expect(profile.name).toBe('山田 太郎');
    expect(profile.nameKana).toBeUndefined();
    expect(profile.avatarUrl).toBeUndefined();
  });

  it('stores education, employment, and licenses arrays immutably', () => {
    const education: EducationEntry = {
      school: '東京大学',
      degree: '工学部',
      start: '2008-04',
      end: '2012-03',
      status: '卒業',
    };
    useResumeStore.setState(() => ({
      education: [education],
      employment: [
        {
          company: 'AIロボティクス株式会社',
          role: 'エンジニア',
          start: '2012-04',
          end: '2018-03',
          status: '退社',
        },
      ],
      licenses: [
        {
          name: '基本情報技術者',
          obtainedOn: '2011-04-15',
        },
      ],
    }));

    const state = useResumeStore.getState();
    expect(state.education).toHaveLength(1);
    expect(state.education[0].school).toBe('東京大学');
    expect(state.employment[0].company).toBe('AIロボティクス株式会社');
    expect(state.licenses[0].name).toBe('基本情報技術者');
  });

  it('records PR answers and generated text', () => {
    useResumeStore.getState().setPrAnswer(0, '強みは課題解決力です');
    useResumeStore.getState().setPrText('自己PRの生成結果');
    const state = useResumeStore.getState();
    expect(state.prAnswers[0]).toBe('強みは課題解決力です');
    expect(state.prText).toBe('自己PRの生成結果');
  });

  it('handles CV state updates with achievements arrays', () => {
    const experience: CvExperience = {
      company: 'Next Solutions',
      role: 'PM',
      period: '2018-04〜2024-03',
      achievements: ['年間売上を20%向上', '大型案件をリード'],
    };
    useResumeStore.getState().setCvState({
      jobProfile: { name: '山田 太郎', title: 'プロジェクトマネージャー' },
      experiences: [experience],
    });
    const state = useResumeStore.getState();
    expect(state.cv.jobProfile.title).toBe('プロジェクトマネージャー');
    expect(state.cv.experiences[0].achievements).toContain('年間売上を20%向上');
  });
});
