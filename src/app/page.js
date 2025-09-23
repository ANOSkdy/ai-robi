'use client';

import React, { useEffect, useReducer, useRef, useState } from 'react';
import ButtonGroup from '@/components/ButtonGroup';
import LoadingModal from '@/components/LoadingModal';
import { isWithinAspectRatio } from '@/lib/photo';

const QUALIFICATION_SUFFIX = '取得';
const STATUS_OPTIONS = [
  '入学',
  '卒業',
  '中途退学',
  '入社',
  '退社',
  '開業',
  '閉業',
];

const resumeQuestionItems = [
  {
    key: 'achievement',
    label: 'これまでの実務で「最も成果を出した取り組み」は何ですか？（状況・行動・結果を簡潔に）',
  },
  {
    key: 'strength',
    label: 'その成果を支えたあなたの強み（スキル/資質）は何ですか？',
  },
  {
    key: 'challenge',
    label: '困難を乗り越えた経験は何ですか？どのように解決しましたか？',
  },
  {
    key: 'evaluation',
    label: '周囲からどのように評価されていますか？（具体的な声や数値があれば）',
  },
  {
    key: 'applicability',
    label: '志望企業（または業界）で特に活かせると考える経験/知見は何ですか？',
  },
];

const experienceQuestionItems = [
  {
    key: 'roles',
    label: '直近3〜5年間で担当した主な職務/役割は？',
  },
  {
    key: 'results',
    label: '実績（売上/コスト/KPIなど）の数値や成果は？',
  },
  {
    key: 'initiatives',
    label: 'その成果を出すために具体的に実行した施策は？',
  },
  {
    key: 'team',
    label: 'チーム規模/関わったステークホルダー/担当範囲は？',
  },
  {
    key: 'issues',
    label: '代表的な課題と解決アプローチは？',
  },
];

const profileQuestionItems = [
  {
    key: 'education',
    label: '最終学歴と専攻内容は？',
  },
  {
    key: 'skills',
    label: '得意分野/専門スキルは？（ツール・言語・資格など）',
  },
  {
    key: 'preference',
    label: '希望職種/業界/働き方の志向は？',
  },
  {
    key: 'strengthExample',
    label: '強みが活きた具体事例は？（第三者評価があれば）',
  },
  {
    key: 'future',
    label: '今後伸ばしたい領域や挑戦したいミッションは？',
  },
];

const initialState = {
  personal: {
    fullName: '',
    furigana: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
  },
  educationHistory: [
    { year: '', month: '', description: '', status: '' },
  ],
  qualifications: [
    { year: '', month: '', description: '' },
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_PERSONAL':
      return {
        ...state,
        personal: {
          ...state.personal,
          [action.field]: action.value,
        },
      };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        [action.field]: state[action.field].map((entry, index) =>
          index === action.index
            ? { ...entry, [action.key]: action.value }
            : entry
        ),
      };
    case 'ADD_ENTRY':
      return {
        ...state,
        [action.field]: [
          ...state[action.field],
          action.initialEntry || { year: '', month: '', description: '' },
        ],
      };
    case 'REMOVE_ENTRY': {
      const items = state[action.field];
      if (items.length <= 1) {
        return state;
      }
      return {
        ...state,
        [action.field]: items.filter((_, index) => index !== action.index),
      };
    }
    default:
      return state;
  }
}

function stripQualificationSuffix(value) {
  return value.replace(/\s*取得\s*$/u, '').trimEnd();
}

function formatQualificationDisplay(value) {
  const stripped = stripQualificationSuffix(value.trim());
  return stripped ? `${stripped} ${QUALIFICATION_SUFFIX}` : '';
}

function hasAllAnswers(items, answers) {
  return items.every((item) => (answers[item.key] || '').trim());
}

function buildSelfPrPrompt(answers) {
  const lines = resumeQuestionItems
    .map((item, index) => `${index + 1}) ${answers[item.key] || ''}`)
    .join('\n');
  return `以下の5つの回答内容を踏まえて、日本の転職市場で通用する「自己PR」を作成してください。\n■条件\n- 事実のみ。ハルシネーション禁止\n- 定量・定性を両方含める（定量がなければ無理に書かない）\n- 200〜300字程度\n- 決裁者が読んでも違和感のない文体\n- 見出し「■自己PR」を入れる\n\n【回答】\n${lines}`;
}

function buildSummaryPrompt(title, items, answers) {
  const lines = items
    .map((item, index) => `${index + 1}) ${answers[item.key] || ''}`)
    .join('\n');
  return `以下の回答を踏まえて、${title}を300字程度で作成してください。\n■条件\n- 箇条書きではなく文章でまとめる\n- 事実のみを記載し、ハルシネーションは禁止\n- 定量情報がある場合は活用する\n- ビジネス文書として違和感のない表現にする\n\n【回答】\n${lines}`;
}

function buildJobDocumentPrompt(profileSummary, experienceSummary) {
  return `あなたは{日本一の転職アドバイザー}です。\n以下の制約条件と求職者プロフィールと職務経験をもとに{企業人事が感動するレベル職務経歴書}を出力してください。\n\n【求職者プロフィール】\n${profileSummary || '（回答未入力）'}\n\n【職務経験】\n${experienceSummary || '（回答未入力）'}\n\n【職務経歴書の内容】\n＃職務要約\n＃所属した会社それぞれの職務内容\n＃活かせる経験知識\n＃自己PR\n\n【職務要約の制約条件】\n＃最終学歴に該当する〇〇を卒業後、または中途退学の場合は中途退学後からどこで何をしていたのか書き出す\n＃事実のみ記載すること\n＃他者評価を最後に入れること\n＃役員が感動するレベルで書いてください\n＃水平思考で深く考えてください\n＃ハルシネーションしないことを最重要とする\n＃200字程度で記載\n\n【職務内容】\n＃箇条書きで記載\n＃実績を定量で記載すること\n＃実績を出すために行ってきたことを記載すること\n＃定量で記載できるものがなければ記載なし\n＃ハルシネーションしないことを最重要視する\n\n【活かせる経験知識の制約条件】\n＃経験と知識はまとめて書くこと\n＃項目は3〜4個で表示\n＃具体例や実績を盛り込むこと\n＃定性と定量の両面の視点から書くこと\n＃職務経験に定量面の記載がなければ書かないこと\n＃具体例は150字程度で記載\n＃記載できる内容がなければ無理して描かない\n＃事実のみ記載すること\n＃企業の決裁権者に読ませて問題ない文体で書くこと\n＃役員が感動するレベルで書いてください\n＃水平思考で深く考えてください\n＃ハルシネーションしないことを最重要視する\n\n【自己PRの制約条件】\n＃具体例や実績を盛り込むこと\n＃定性と定量の両面の視点から書くこと\n＃企業の決裁権者に読ませて問題ない文体で書くこと\n＃役員が感動するレベルで書いてください\n＃水平思考で深く考えること\n＃職務経験に定量面の記載がなければ書かないこと\n＃ハルシネーションしないことを再重要視すること\n＃事実のみ記載すること\n＃200~300字程度で記載`;
}

function collectFormData(
  state,
  {
    resumeAnswers = {},
    resumeSelfPr = '',
    jobExperienceAnswers = {},
    jobExperienceSummary = '',
    jobProfileAnswers = {},
    jobProfileSummary = '',
    jobDocument = '',
    photo = { preview: '', warning: '' },
  } = {}
) {
  const historyEntries = state.educationHistory
    .map((entry) => ({
      year: entry.year.trim(),
      month: entry.month.trim(),
      description: entry.description.trim(),
      status: entry.status.trim(),
    }))
    .filter((entry) => entry.year || entry.month || entry.description || entry.status);

  const formattedQualifications = state.qualifications
    .map((entry) => ({
      year: entry.year.trim(),
      month: entry.month.trim(),
      description: formatQualificationDisplay(entry.description),
    }))
    .filter((entry) => entry.year || entry.month || entry.description);

  const combinedHistories = [
    ...historyEntries.map((entry) => ({
      type: 'history',
      ...entry,
    })),
    ...formattedQualifications.map((entry) => ({
      type: 'qualification',
      ...entry,
    })),
  ];

  return {
    personal: { ...state.personal },
    history: historyEntries,
    qualifications: formattedQualifications,
    histories: combinedHistories,
    resume: {
      answers: resumeAnswers,
      selfPr: resumeSelfPr,
    },
    job: {
      experience: {
        answers: jobExperienceAnswers,
        summary: jobExperienceSummary,
      },
      profile: {
        answers: jobProfileAnswers,
        summary: jobProfileSummary,
      },
      document: jobDocument,
    },
    photo,
  };
}

export default function Home() {
  const [appState, dispatch] = useReducer(reducer, initialState);
  const [screen, setScreen] = useState('form');
  const [activeTab, setActiveTab] = useState('resume');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelfPrLoading, setIsSelfPrLoading] = useState(false);
  const [isExperienceSummaryLoading, setIsExperienceSummaryLoading] = useState(false);
  const [isProfileSummaryLoading, setIsProfileSummaryLoading] = useState(false);
  const [isJobDocumentLoading, setIsJobDocumentLoading] = useState(false);
  const [resumeAnswers, setResumeAnswers] = useState(() =>
    resumeQuestionItems.reduce((acc, item) => {
      acc[item.key] = '';
      return acc;
    }, {})
  );
  const [experienceAnswers, setExperienceAnswers] = useState(() =>
    experienceQuestionItems.reduce((acc, item) => {
      acc[item.key] = '';
      return acc;
    }, {})
  );
  const [profileAnswers, setProfileAnswers] = useState(() =>
    profileQuestionItems.reduce((acc, item) => {
      acc[item.key] = '';
      return acc;
    }, {})
  );
  const [selfPrText, setSelfPrText] = useState('');
  const [jobExperienceSummary, setJobExperienceSummary] = useState('');
  const [jobProfileSummary, setJobProfileSummary] = useState('');
  const [jobDocument, setJobDocument] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoWarning, setPhotoWarning] = useState('');
  const formRef = useRef(null);
  const photoUrlRef = useRef('');
  const photoInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = '';
      }
    };
  }, []);

  const handleConfirm = () => {
    if (!formRef.current) return;
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setScreen('result');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGenerateSelfPr = async () => {
    if (!hasAllAnswers(resumeQuestionItems, resumeAnswers)) {
      alert('自己PRを生成する前に5つの質問へ回答してください。');
      return;
    }
    setIsSelfPrLoading(true);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: buildSelfPrPrompt(resumeAnswers),
          context: collectFormData(appState, {
            resumeAnswers,
            resumeSelfPr: selfPrText,
            jobExperienceAnswers: experienceAnswers,
            jobExperienceSummary,
            jobProfileAnswers: profileAnswers,
            jobProfileSummary,
            jobDocument,
            photo: { preview: photoPreview, warning: photoWarning },
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || '自己PRの生成に失敗しました。');
        return;
      }
      setSelfPrText(data.generatedText || '');
    } catch (error) {
      console.error('handleGenerateSelfPr error', error);
      alert('自己PRの生成中に問題が発生しました。');
    } finally {
      setIsSelfPrLoading(false);
    }
  };

  const handleSummarizeExperience = async () => {
    if (!hasAllAnswers(experienceQuestionItems, experienceAnswers)) {
      alert('職務経験の要約を作成する前に全ての質問に回答してください。');
      return;
    }
    setIsExperienceSummaryLoading(true);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: buildSummaryPrompt(
            '職務経験の要約',
            experienceQuestionItems,
            experienceAnswers
          ),
          context: collectFormData(appState, {
            resumeAnswers,
            resumeSelfPr: selfPrText,
            jobExperienceAnswers: experienceAnswers,
            jobExperienceSummary,
            jobProfileAnswers: profileAnswers,
            jobProfileSummary,
            jobDocument,
            photo: { preview: photoPreview, warning: photoWarning },
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || '職務経験の要約生成に失敗しました。');
        return;
      }
      setJobExperienceSummary(data.generatedText || '');
    } catch (error) {
      console.error('handleSummarizeExperience error', error);
      alert('職務経験の要約生成中に問題が発生しました。');
    } finally {
      setIsExperienceSummaryLoading(false);
    }
  };

  const handleSummarizeProfile = async () => {
    if (!hasAllAnswers(profileQuestionItems, profileAnswers)) {
      alert('求職者プロフィールの要約を作成する前に全ての質問に回答してください。');
      return;
    }
    setIsProfileSummaryLoading(true);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: buildSummaryPrompt(
            '求職者プロフィールの要約',
            profileQuestionItems,
            profileAnswers
          ),
          context: collectFormData(appState, {
            resumeAnswers,
            resumeSelfPr: selfPrText,
            jobExperienceAnswers: experienceAnswers,
            jobExperienceSummary,
            jobProfileAnswers: profileAnswers,
            jobProfileSummary,
            jobDocument,
            photo: { preview: photoPreview, warning: photoWarning },
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || '求職者プロフィール要約の生成に失敗しました。');
        return;
      }
      setJobProfileSummary(data.generatedText || '');
    } catch (error) {
      console.error('handleSummarizeProfile error', error);
      alert('求職者プロフィール要約の生成中に問題が発生しました。');
    } finally {
      setIsProfileSummaryLoading(false);
    }
  };

  const handleGenerateJobDocument = async () => {
    if (!jobExperienceSummary.trim() || !jobProfileSummary.trim()) {
      alert('職務経験と求職者プロフィールの要約を先に生成してください。');
      return;
    }
    setIsJobDocumentLoading(true);
    try {
      const response = await fetch('/api/generate-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: buildJobDocumentPrompt(jobProfileSummary, jobExperienceSummary),
          context: collectFormData(appState, {
            resumeAnswers,
            resumeSelfPr: selfPrText,
            jobExperienceAnswers: experienceAnswers,
            jobExperienceSummary,
            jobProfileAnswers: profileAnswers,
            jobProfileSummary,
            jobDocument,
            photo: { preview: photoPreview, warning: photoWarning },
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        alert(data?.error || '職務経歴書の生成に失敗しました。');
        return;
      }
      setJobDocument(data.generatedText || '');
    } catch (error) {
      console.error('handleGenerateJobDocument error', error);
      alert('職務経歴書の生成中に問題が発生しました。');
    } finally {
      setIsJobDocumentLoading(false);
    }
  };

  const handlePdfDownload = async (documentType) => {
    setIsLoading(true);
    try {
      const formData = collectFormData(appState, {
        resumeAnswers,
        resumeSelfPr: selfPrText,
        jobExperienceAnswers: experienceAnswers,
        jobExperienceSummary,
        jobProfileAnswers: profileAnswers,
        jobProfileSummary,
        jobDocument,
        photo: { preview: photoPreview, warning: photoWarning },
      });
      console.info('PDF payload preview', {
        ...formData,
        documentType,
      });
      alert('PDF生成は現在準備中です。');
    } catch (error) {
      console.error('handlePdfDownload error', error);
      alert('PDFの準備に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = (field, initialEntry) => {
    dispatch({ type: 'ADD_ENTRY', field, initialEntry });
  };

  const removeEntry = (field, index) => {
    dispatch({ type: 'REMOVE_ENTRY', field, index });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = '';
    }
    if (!file) {
      setPhotoPreview('');
      setPhotoWarning('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    photoUrlRef.current = objectUrl;
    setPhotoPreview(objectUrl);
    setPhotoWarning('');
    const image = new Image();
    image.onload = () => {
      const isValid = isWithinAspectRatio(
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
        3 / 4,
        0.02
      );
      if (!isValid) {
        setPhotoWarning('JIS規格（3:4）に近い比率の画像をアップロードしてください。');
      } else {
        setPhotoWarning('');
      }
    };
    image.onerror = () => {
      setPhotoWarning('画像の読み込みに失敗しました。別のファイルをお試しください。');
    };
    image.src = objectUrl;
  };

  const handlePhotoRemove = () => {
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = '';
    }
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
    setPhotoPreview('');
    setPhotoWarning('');
  };

  return (
    <main className="container">
      <header className="header">
        <div className="brand">AI-ROBI</div>
        <nav className="tabs" role="tablist" aria-label="書類タブ">
          <button
            type="button"
            id="resume-tab"
            role="tab"
            className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
            aria-selected={activeTab === 'resume'}
            aria-controls="resume-panel"
            onClick={() => setActiveTab('resume')}
          >
            履歴書
          </button>
          <button
            type="button"
            id="job-tab"
            role="tab"
            className={`tab ${activeTab === 'job' ? 'active' : ''}`}
            aria-selected={activeTab === 'job'}
            aria-controls="job-panel"
            onClick={() => setActiveTab('job')}
          >
            職務経歴書
          </button>
        </nav>
      </header>

      <section
        id="form-section"
        aria-hidden={screen !== 'form'}
        style={{ display: screen === 'form' ? 'block' : 'none' }}
      >
        <form
          id="resume-form"
          ref={formRef}
          onSubmit={(event) => event.preventDefault()}
          noValidate
        >
          <div
            id="resume-panel"
            role="tabpanel"
            aria-labelledby="resume-tab"
            hidden={activeTab !== 'resume'}
          >
            <fieldset>
              <legend>基本情報</legend>
              <div className="form-group">
                <label htmlFor="full-name">氏名</label>
                <input
                  id="full-name"
                  name="full_name"
                  type="text"
                  value={appState.personal.fullName}
                  onChange={(event) =>
                    dispatch({
                      type: 'UPDATE_PERSONAL',
                      field: 'fullName',
                      value: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="furigana">ふりがな</label>
                <input
                  id="furigana"
                  name="furigana"
                  type="text"
                  value={appState.personal.furigana}
                  onChange={(event) =>
                    dispatch({
                      type: 'UPDATE_PERSONAL',
                      field: 'furigana',
                      value: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="birth-date">生年月日</label>
                <input
                  id="birth-date"
                  name="birth_date"
                  type="date"
                  value={appState.personal.birthDate}
                  onChange={(event) =>
                    dispatch({
                      type: 'UPDATE_PERSONAL',
                      field: 'birthDate',
                      value: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">住所</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={appState.personal.address}
                  onChange={(event) =>
                    dispatch({
                      type: 'UPDATE_PERSONAL',
                      field: 'address',
                      value: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">電話番号</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={appState.personal.phone}
                  onChange={(event) =>
                    dispatch({
                      type: 'UPDATE_PERSONAL',
                      field: 'phone',
                      value: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={appState.personal.email}
                  onChange={(event) =>
                    dispatch({
                      type: 'UPDATE_PERSONAL',
                      field: 'email',
                      value: event.target.value,
                    })
                  }
                  required
                />
                </div>
              </fieldset>

              <fieldset>
                <legend>証明写真</legend>
                <div className="form-group">
                  <label htmlFor="photo-upload">写真アップロード（3:4 比率推奨）</label>
                  <input
                    id="photo-upload"
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="履歴書用写真のプレビュー"
                      className="photo-preview"
                    />
                  ) : (
                    <p className="photo-note">JIS規格サイズ（3:4比率）に近い画像をご用意ください。</p>
                  )}
                  {photoWarning ? (
                    <p className="photo-warning" role="alert">{photoWarning}</p>
                  ) : (
                    photoPreview && (
                      <p className="photo-note">画像は3:4比率判定を通過しました。</p>
                    )
                  )}
                  {photoPreview && (
                    <div className="photo-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={handlePhotoRemove}
                      >
                        写真を削除
                      </button>
                    </div>
                  )}
                </div>
              </fieldset>

            <fieldset>
              <legend>学歴・職歴</legend>
              {appState.educationHistory.map((entry, index) => (
                <div className="entry-group history-entry" key={`history-${index}`}>
                  <div className="form-group">
                    <label htmlFor={`history-year-${index}`}>年</label>
                    <input
                      id={`history-year-${index}`}
                      name={`history[${index}][year]`}
                      type="number"
                      inputMode="numeric"
                      value={entry.year}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'educationHistory',
                          index,
                          key: 'year',
                          value: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`history-month-${index}`}>月</label>
                    <input
                      id={`history-month-${index}`}
                      name={`history[${index}][month]`}
                      type="number"
                      inputMode="numeric"
                      value={entry.month}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'educationHistory',
                          index,
                          key: 'month',
                          value: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor={`history-desc-${index}`}>内容</label>
                    <input
                      id={`history-desc-${index}`}
                      name={`history[${index}][description]`}
                      type="text"
                      value={entry.description}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'educationHistory',
                          index,
                          key: 'description',
                          value: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`history-status-${index}`}>区分</label>
                    <select
                      id={`history-status-${index}`}
                      name={`history[${index}][status]`}
                      className="status-select"
                      value={entry.status}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'educationHistory',
                          index,
                          key: 'status',
                          value: event.target.value,
                        })
                      }
                      required
                    >
                      <option value="" disabled>
                        選択してください
                      </option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeEntry('educationHistory', index)}
                    aria-label={`学歴・職歴 ${index + 1} 行目を削除`}
                  >
                    削除
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-btn"
                onClick={() =>
                  addEntry('educationHistory', {
                    year: '',
                    month: '',
                    description: '',
                    status: '',
                  })
                }
              >
                ＋学歴・職歴を追加
              </button>
            </fieldset>

            <fieldset className="qualifications">
              <legend>免許・資格</legend>
              {appState.qualifications.map((entry, index) => (
                <div className="entry-group qualification-entry" key={`qualification-${index}`}>
                  <div className="form-group">
                    <label htmlFor={`qualification-year-${index}`}>年</label>
                    <input
                      id={`qualification-year-${index}`}
                      name={`qualification[${index}][year]`}
                      type="number"
                      inputMode="numeric"
                      value={entry.year}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'qualifications',
                          index,
                          key: 'year',
                          value: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`qualification-month-${index}`}>月</label>
                    <input
                      id={`qualification-month-${index}`}
                      name={`qualification[${index}][month]`}
                      type="number"
                      inputMode="numeric"
                      value={entry.month}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'qualifications',
                          index,
                          key: 'month',
                          value: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor={`qualification-desc-${index}`}>内容</label>
                    <input
                      id={`qualification-desc-${index}`}
                      name={`qualification[${index}][description]`}
                      type="text"
                      value={formatQualificationDisplay(entry.description)}
                      onChange={(event) => {
                        const { value } = event.target;
                        const sanitized = stripQualificationSuffix(value);
                        dispatch({
                          type: 'UPDATE_ENTRY',
                          field: 'qualifications',
                          index,
                          key: 'description',
                          value: sanitized,
                        });
                        const input = event.target;
                        const caret = sanitized.length;
                        requestAnimationFrame(() => {
                          try {
                            if (document.body.contains(input)) {
                              input.setSelectionRange(caret, caret);
                            }
                          } catch (error) {
                            // ignore caret positioning errors
                          }
                        });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeEntry('qualifications', index)}
                    aria-label={`免許・資格 ${index + 1} 行目を削除`}
                  >
                    削除
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-btn"
                onClick={() =>
                  addEntry('qualifications', {
                    year: '',
                    month: '',
                    description: '',
                  })
                }
              >
                ＋免許・資格を追加
              </button>
            </fieldset>

            <fieldset>
              <legend>自己PR（AI生成サポート）</legend>
              <div className="question-group">
                {resumeQuestionItems.map((item, index) => (
                  <div className="form-group" key={item.key}>
                    <label htmlFor={`resume-question-${item.key}`}>
                      {index + 1}. {item.label}
                    </label>
                    <textarea
                      id={`resume-question-${item.key}`}
                      value={resumeAnswers[item.key]}
                      onChange={(event) =>
                        setResumeAnswers((prev) => ({
                          ...prev,
                          [item.key]: event.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                id="generate-pr-button"
                className="primary-btn"
                onClick={handleGenerateSelfPr}
                disabled={isSelfPrLoading}
              >
                {isSelfPrLoading ? '生成中…' : '自己PRをAI生成'}
              </button>
              <div className="form-group">
                <label htmlFor="self-pr-text">自己PR（編集可能）</label>
                <textarea
                  id="self-pr-text"
                  value={selfPrText}
                  onChange={(event) => setSelfPrText(event.target.value)}
                  rows={6}
                />
              </div>
            </fieldset>
          </div>

          <div
            id="job-panel"
            role="tabpanel"
            aria-labelledby="job-tab"
            hidden={activeTab !== 'job'}
          >
            <fieldset>
              <legend>職務経験ヒアリング（5問）</legend>
              <div className="question-group">
                {experienceQuestionItems.map((item, index) => (
                  <div className="form-group" key={item.key}>
                    <label htmlFor={`experience-question-${item.key}`}>
                      {index + 1}. {item.label}
                    </label>
                    <textarea
                      id={`experience-question-${item.key}`}
                      value={experienceAnswers[item.key]}
                      onChange={(event) =>
                        setExperienceAnswers((prev) => ({
                          ...prev,
                          [item.key]: event.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSummarizeExperience}
                disabled={isExperienceSummaryLoading}
              >
                {isExperienceSummaryLoading ? '生成中…' : '職務経験を要約する'}
              </button>
              <div className="form-group">
                <label htmlFor="experience-summary">職務経験サマリ</label>
                <textarea
                  id="experience-summary"
                  value={jobExperienceSummary}
                  onChange={(event) => setJobExperienceSummary(event.target.value)}
                  rows={6}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>求職者プロフィールヒアリング（5問）</legend>
              <div className="question-group">
                {profileQuestionItems.map((item, index) => (
                  <div className="form-group" key={item.key}>
                    <label htmlFor={`profile-question-${item.key}`}>
                      {index + 1}. {item.label}
                    </label>
                    <textarea
                      id={`profile-question-${item.key}`}
                      value={profileAnswers[item.key]}
                      onChange={(event) =>
                        setProfileAnswers((prev) => ({
                          ...prev,
                          [item.key]: event.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSummarizeProfile}
                disabled={isProfileSummaryLoading}
              >
                {isProfileSummaryLoading ? '生成中…' : 'プロフィールを要約する'}
              </button>
              <div className="form-group">
                <label htmlFor="profile-summary">求職者プロフィールサマリ</label>
                <textarea
                  id="profile-summary"
                  value={jobProfileSummary}
                  onChange={(event) => setJobProfileSummary(event.target.value)}
                  rows={6}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>職務経歴書生成</legend>
              <button
                type="button"
                className="primary-btn"
                onClick={handleGenerateJobDocument}
                disabled={isJobDocumentLoading}
              >
                {isJobDocumentLoading ? '生成中…' : '専用プロンプトで経歴書生成'}
              </button>
              <div className="form-group">
                <label htmlFor="job-document-text">職務経歴書（編集可能）</label>
                <textarea
                  id="job-document-text"
                  value={jobDocument}
                  onChange={(event) => setJobDocument(event.target.value)}
                  rows={10}
                />
              </div>
            </fieldset>
          </div>

          <div className="button-group">
            <button
              type="button"
              id="confirm-button"
              className="primary-btn"
              onClick={handleConfirm}
            >
              入力内容を確定してPDF生成へ
            </button>
          </div>
        </form>
      </section>

      <section
        id="result-section"
        aria-hidden={screen !== 'result'}
        style={{ display: screen === 'result' ? 'block' : 'none' }}
      >
        <fieldset>
          <legend>AI生成結果</legend>
          <div className="form-group">
            <label htmlFor="result-self-pr">自己PR</label>
            <textarea id="result-self-pr" value={selfPrText} readOnly rows={8} />
          </div>
          <div className="form-group">
            <label htmlFor="result-experience-summary">職務経験サマリ</label>
            <textarea
              id="result-experience-summary"
              value={jobExperienceSummary}
              readOnly
              rows={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="result-profile-summary">求職者プロフィールサマリ</label>
            <textarea
              id="result-profile-summary"
              value={jobProfileSummary}
              readOnly
              rows={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="result-job-document">職務経歴書</label>
            <textarea
              id="result-job-document"
              value={jobDocument}
              readOnly
              rows={12}
            />
          </div>
        </fieldset>
        <ButtonGroup
          onDownloadResume={handlePdfDownload}
          onDownloadJob={handlePdfDownload}
          onBack={() => {
            setScreen('form');
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      </section>
      <LoadingModal loading={isLoading} message="PDFの準備をしています…" />
    </main>
  );
}
