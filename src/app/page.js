'use client';

import React, { useReducer, useRef, useState } from 'react';
import ButtonGroup from '@/components/ButtonGroup';
import LoadingModal from '@/components/LoadingModal';

const initialState = {
  personal: {
    fullName: '',
    furigana: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
  },
  aiPromptInput: '',
  workHistoryDetailed: '',
  educationHistory: [
    { year: '', month: '', description: '' },
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
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
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
          { year: '', month: '', description: '' },
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

function parseLineData(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/(\d{4}).*?(\d{1,2}).*?(.*)/);
      if (match) {
        return {
          year: match[1],
          month: match[2],
          desc: match[3].trim(),
        };
      }
      return {
        year: '',
        month: '',
        desc: line,
      };
    });
}

function collectFormData(state) {
  const histories = [
    ...state.educationHistory.map((entry) => ({
      type: 'entry',
      year: entry.year,
      month: entry.month,
      description: entry.description,
    })),
    ...state.qualifications.map((entry) => ({
      type: 'entry',
      year: entry.year,
      month: entry.month,
      description: entry.description,
    })),
  ];

  return {
    personal: { ...state.personal },
    aiPromptInput: state.aiPromptInput,
    workHistoryDetailed: state.workHistoryDetailed,
    histories,
  };
}

export default function Home() {
  const [appState, dispatch] = useReducer(reducer, initialState);
  const [screen, setScreen] = useState('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isPrLoading, setIsPrLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [generatedPR, setGeneratedPR] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const formRef = useRef(null);

  const handleConfirm = () => {
    if (!formRef.current) return;
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePr = async () => {
    const promptSource = appState.aiPromptInput.trim();
    if (!promptSource) {
      alert('AI生成に必要な情報を入力してください。');
      return;
    }
    setIsPrLoading(true);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `以下の要件に基づいて、日本の就職・転職活動で使える「自己PR」「志望動機」「職務要約」を1つの連続した文章として作成してください。各項目は見出し（例: ■自己PR）で区切ってください。\n\n要件：\n${promptSource}`,
          keywords: promptSource,
          context: collectFormData(appState),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || 'AI文章の生成に失敗しました。');
        return;
      }
      setGeneratedPR(data.generatedText || '');
    } catch (error) {
      console.error('handleGeneratePr error', error);
      alert('AI文章の生成中に問題が発生しました。');
    } finally {
      setIsPrLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    const historyText = appState.workHistoryDetailed.trim();
    if (!historyText) {
      alert('職務経歴を入力してください。');
      return;
    }
    setIsSummaryLoading(true);
    try {
      const parsedLines = parseLineData(historyText).map((entry) => ({
        type: 'entry',
        year: entry.year,
        month: entry.month,
        description: entry.desc,
      }));
      const response = await fetch('/api/generate-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workHistory: historyText,
          keywords: appState.aiPromptInput.trim(),
          context: { histories: parsedLines },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        alert(data?.error || '職務要約の生成に失敗しました。');
        return;
      }
      const detailLines = Array.isArray(data.details)
        ? data.details
            .map((item) => [item.company, item.detail].filter(Boolean).join(': '))
            .filter(Boolean)
        : [];
      const combined = [data.summary, detailLines.join('\n')]
        .filter(Boolean)
        .join('\n\n');
      setGeneratedSummary(combined);
    } catch (error) {
      console.error('handleGenerateSummary error', error);
      alert('職務要約の生成中に問題が発生しました。');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handlePdfDownload = async (documentType) => {
    setIsLoading(true);
    try {
      const formData = collectFormData(appState);
      const parsedHistory = parseLineData(appState.workHistoryDetailed);
      console.info('PDF payload preview', {
        ...formData,
        documentType,
        parsedHistory,
      });
      alert('PDF生成は現在準備中です。');
      // TODO: /api/generate-pdf エンドポイントが提供されたら fetch での処理に差し替える。
    } catch (error) {
      console.error('handlePdfDownload error', error);
      alert('PDFの準備に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = (field) => {
    dispatch({ type: 'ADD_ENTRY', field });
  };

  const removeEntry = (field, index) => {
    dispatch({ type: 'REMOVE_ENTRY', field, index });
  };

  return (
    <main className="container">
      <h1>AI履歴書ジェネレーター</h1>
      <section
        id="form-section"
        aria-hidden={screen !== 'form'}
        style={{ display: screen === 'form' ? 'block' : 'none' }}
      >
        <form
          id="resume-form"
          ref={formRef}
          onSubmit={(event) => event.preventDefault()}
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
            <legend>学歴・職歴</legend>
            {appState.educationHistory.map((entry, index) => (
              <div className="entry-group" key={`history-${index}`}>
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
              onClick={() => addEntry('educationHistory')}
            >
              ＋学歴・職歴を追加
            </button>
          </fieldset>

          <fieldset>
            <legend>免許・資格</legend>
            {appState.qualifications.map((entry, index) => (
              <div className="entry-group" key={`qualification-${index}`}>
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
                    value={entry.description}
                    onChange={(event) =>
                      dispatch({
                        type: 'UPDATE_ENTRY',
                        field: 'qualifications',
                        index,
                        key: 'description',
                        value: event.target.value,
                      })
                    }
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
              onClick={() => addEntry('qualifications')}
            >
              ＋免許・資格を追加
            </button>
          </fieldset>

          <fieldset>
            <legend>AI生成サポート</legend>
            <div className="form-group">
              <label htmlFor="ai-prompt-input">AI文章生成の要件</label>
              <textarea
                id="ai-prompt-input"
                name="ai_prompt_input"
                value={appState.aiPromptInput}
                onChange={(event) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'aiPromptInput',
                    value: event.target.value,
                  })
                }
                required
                rows={4}
              />
            </div>
            <button
              type="button"
              id="generate-pr-button"
              className="primary-btn"
              onClick={handleGeneratePr}
              disabled={isPrLoading}
            >
              {isPrLoading ? '生成中…' : 'AIで文章を生成する'}
            </button>
            <div className="form-group">
              <label htmlFor="work-history-detailed">職務経歴（詳細）</label>
              <textarea
                id="work-history-detailed"
                name="work_history_detailed"
                value={appState.workHistoryDetailed}
                onChange={(event) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'workHistoryDetailed',
                    value: event.target.value,
                  })
                }
                rows={6}
                required
              />
            </div>
            <button
              type="button"
              id="generate-summary-button"
              className="primary-btn"
              onClick={handleGenerateSummary}
              disabled={isSummaryLoading}
            >
              {isSummaryLoading ? '生成中…' : 'AIで職務要約を生成'}
            </button>
          </fieldset>

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
            <label htmlFor="generated-pr">自己PR・志望動機・職務要約</label>
            <textarea
              id="generated-pr"
              value={generatedPR}
              readOnly
              rows={10}
            />
          </div>
          <div className="form-group">
            <label htmlFor="generated-summary">職務要約</label>
            <textarea
              id="generated-summary"
              value={generatedSummary}
              readOnly
              rows={10}
            />
          </div>
        </fieldset>
        <ButtonGroup
          onDownloadResume={handlePdfDownload}
          onDownloadJob={handlePdfDownload}
          onBack={() => {
            setScreen('form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </section>
      <LoadingModal loading={isLoading} message="PDFの準備をしています…" />
    </main>
  );
}
