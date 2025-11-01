'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import StampCard from '@/components/StampCard';
import OrganicDivider from '@/components/OrganicDivider';
import LeafIcon from '@/components/icons/Leaf';
import DropletIcon from '@/components/icons/Droplet';
import SunIcon from '@/components/icons/Sun';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Label from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

type ResumeDocxPayload = {
  template: 'resume';
  data: {
    date_created: string;
    name_furigana: string;
    name: string;
    birth_year: string;
    birth_month: string;
    birth_day: string;
    address_main: string;
    phone: string;
    email: string;
    generated_pr: string;
  };
};

type CvJson = Partial<Record<'職務概要' | '職務経歴' | '活かせる知識' | '自己PR', string>> & {
  [key: string]: unknown;
};

type CvDocxPayload = {
  template: 'cv';
  data: {
    date_created: string;
    name: string;
    work_summary: string;
    work_details: string;
    skills: string;
    self_pr_cv: string;
  };
};

export default function HomePage() {
  const cards = [
    {
      title: '履歴書の作成',
      description: '基本情報から資格・スキルまで、自然派トーンで整えたガイドに沿って入力。途中保存にも対応。',
      href: '/resume',
      icon: <LeafIcon width={16} height={16} aria-hidden />,
    },
    {
      title: '職務経歴書の作成',
      description: 'プロジェクトや成果を一歩ずつ整理。フォーカスリングとコントラストを最適化したUIで書きやすく。',
      href: '/work-history',
      icon: <DropletIcon width={16} height={16} aria-hidden />,
    },
  ];

  return (
    <div className="safe-area-px relative flex flex-col gap-14 pb-16">
      <section className="relative">
        <div className="container mx-auto max-w-screen-md px-4 text-center sm:px-6">
          <span className="leaf-clip-a absolute -left-8 top-4 h-14 w-14 bg-brand-earth1/20 sm:-left-12 sm:h-16 sm:w-16" aria-hidden />
          <span className="leaf-clip-b absolute -right-6 bottom-4 h-10 w-10 bg-brand-green2/20 sm:-right-10 sm:h-12 sm:w-12" aria-hidden />
          <p className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand-green2/40 bg-white/80 px-4 text-anywhere text-xs font-semibold uppercase tracking-[0.28em] text-brand-green1">
            自然派ワークフロー
          </p>
          <h1 className="mt-6 text-anywhere text-balance text-pretty font-semibold leading-tight text-brand-green1 [font-size:clamp(24px,6vw,40px)]">
            有機的なリズムで履歴書と職務経歴書を仕上げる
          </h1>
          <p className="mt-4 text-anywhere text-pretty leading-relaxed text-brand-earth2/90 [font-size:clamp(14px,3.8vw,18px)]">
            グリーンとアースのパレット、紙質のテクスチャ、手書きの区切りをまとったウィザードで、応募書類づくりを心地よくサポートします。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-brand-green1">
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/80 px-4 text-anywhere text-pretty">
              <SunIcon width={16} height={16} aria-hidden />
              フォーカスリングとコントラストの最適化
            </span>
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/80 px-4 text-anywhere text-pretty">
              <LeafIcon width={16} height={16} aria-hidden />
              Step-by-step ナビゲーション
            </span>
          </div>
        </div>
      </section>

      <OrganicDivider variant="vine" className="mx-auto max-w-4xl" />

      <div className="container mx-auto max-w-screen-sm md:max-w-screen-md px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {cards.map((card) => (
            <StampCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-brand-earth2/80">
        以前のダッシュボード体験は <strong>LegacyHomeExperience</strong> コンポーネントとして残してあります。
      </p>
    </div>
  );
}

export function LegacyHomeExperience() {
  const [tab, setTab] = useState<'resume' | 'cv'>('resume');
  const [status, setStatus] = useState('');
  const [selfpr, setSelfpr] = useState('');
  const [cv, setCv] = useState<CvJson>({});

  const tabBtn = (k: 'resume' | 'cv', label: string) => (
    <Button
      key={k}
      variant={tab === k ? 'primary' : 'secondary'}
      onClick={() => setTab(k)}
      className="min-w-[8rem]"
      aria-pressed={tab === k}
    >
      {label}
    </Button>
  );

  const genSelfPR = async () => {
    setStatus('AI 生成中…');
    const res = await fetch('/api/ai/selfpr', {
      method: 'POST',
      body: JSON.stringify({
        strengths: '粘り強さ',
        episode: 'SaaS を短期立ち上げ',
        values: '誠実/改善志向',
        contribution: '課題発見と推進',
        goal: '顧客価値最大化',
      }),
    });
    const json = await res.json();
    setSelfpr(json.text || '');
    setStatus('');
  };

  const genCv = async () => {
    setStatus('AI 生成中…');
    const res = await fetch('/api/ai/cv', {
      method: 'POST',
      body: JSON.stringify({
        summary: '経歴概要の素材',
        details: '職務詳細の素材',
        achievements: '実績の素材',
        peer_review: '他者評価の素材',
        expertise: '専門分野の素材',
      }),
    });
    const json = (await res.json()) as CvJson;
    setCv(json);
    setStatus('');
  };

  const payloadResume = useMemo(
    (): ResumeDocxPayload => ({
      template: 'resume',
      data: {
        date_created: '',
        name_furigana: 'やまだ たろう',
        name: '山田 太郎',
        birth_year: '1995',
        birth_month: '04',
        birth_day: '12',
        address_main: '札幌市…',
        phone: '090-xxxx-xxxx',
        email: 'taro@example.com',
        generated_pr: selfpr,
      },
    }),
    [selfpr]
  );

  const payloadCv = useMemo(
    (): CvDocxPayload => ({
      template: 'cv',
      data: {
        date_created: '',
        name: '山田 太郎',
        work_summary: cv?.['職務概要'] || '',
        work_details: cv?.['職務経歴'] || '',
        skills: cv?.['活かせる知識'] || '',
        self_pr_cv: cv?.['自己PR'] || '',
      },
    }),
    [cv]
  );

  const downloadDocx = async (payload: ResumeDocxPayload | CvDocxPayload) => {
    setStatus('ドキュメント生成中…');
    const res = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.headers.get('Content-Type')?.includes('pdf') ? 'generated.pdf' : 'filled.docx';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabBtn('resume', '履歴書')}
        {tabBtn('cv', '職務経歴書')}
        <span className="ml-auto text-sm text-muted-fg">{status}</span>
      </div>

      <Card className="border-dashed bg-neutral-50">
        <CardHeader className="border-none pb-0">
          <CardTitle>新しいウィザード版を試す</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-sm text-neutral-600">
            段階式フォーム + 自動保存付きの CV / 履歴書ウィザードを別タブで開けます。入力途中でも下書きが保存され、後から続きができます。
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link className="btn btn-primary" href="/cv/new">
              履歴書ウィザードを開く
            </Link>
            <Link className="btn btn-secondary" href="/resume/new">
              職務経歴書ウィザードを開く
            </Link>
          </div>
        </CardContent>
      </Card>

      {tab === 'resume' ? (
        <Card>
          <CardHeader>
            <CardTitle>履歴書</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">氏名</Label>
                <Input id="name" placeholder="山田 太郎" defaultValue="山田 太郎" />
              </div>
              <div>
                <Label htmlFor="kana">ふりがな</Label>
                <Input id="kana" placeholder="やまだ たろう" defaultValue="やまだ たろう" />
              </div>
              <div>
                <Label htmlFor="tel">電話</Label>
                <Input id="tel" placeholder="090-xxxx-xxxx" defaultValue="090-xxxx-xxxx" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" placeholder="taro@example.com" defaultValue="taro@example.com" type="email" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={genSelfPR}>自己PRをAI生成</Button>
              <Button variant="secondary" onClick={() => downloadDocx(payloadResume)}>
                履歴書（DOCX）生成
              </Button>
            </div>

            <div className="pt-4">
              <Label>自己PR（AI出力）</Label>
              <Textarea className="mt-1 h-40" value={selfpr} readOnly placeholder="ここに AI 生成結果が表示されます" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>職務経歴書</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Label>入力素材</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Textarea placeholder="経歴概要" />
                <Textarea placeholder="職務経験の詳細" />
                <Textarea placeholder="実績" />
                <Textarea placeholder="他者評価" />
                <Textarea placeholder="専門分野" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={genCv}>職務経歴JSONをAI生成</Button>
                <Button variant="secondary" onClick={() => downloadDocx(payloadCv)}>
                  職務経歴書（DOCX）生成
                </Button>
              </div>
              <div>
                <Label>AI 生成 JSON（プレビュー）</Label>
                <pre className="mt-1 whitespace-pre-wrap rounded-xl border bg-neutral-50 p-3 text-sm">
                  {JSON.stringify(cv, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-fg">
        Word テンプレは <code>/templates/resume.docx</code> / <code>/templates/cv.docx</code> に配置してください。
      </p>
    </div>
  );
}
