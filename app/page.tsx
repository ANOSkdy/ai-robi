'use client';

import { useState } from 'react';

export default function Page(){
  const [selfpr,setSelfpr]=useState('');
  const [cv,setCv]=useState<any>({});
  const [status,setStatus]=useState('');

  const genSelfPR=async()=>{
    setStatus('生成中…');
    const res=await fetch('/api/ai/selfpr',{method:'POST',body:JSON.stringify({
      strengths:'粘り強さ',episode:'SaaSを短期立ち上げ',values:'誠実/改善志向',contribution:'課題発見と推進',goal:'顧客価値最大化'
    })});
    const json=await res.json(); setSelfpr(json.text||''); setStatus('');
  };

  const genCv=async()=>{
    setStatus('生成中…');
    const res=await fetch('/api/ai/cv',{method:'POST',body:JSON.stringify({
      summary:'経歴概要の素材',details:'職務詳細の素材',achievements:'実績の素材',peer_review:'他者評価の素材',expertise:'専門分野の素材'
    })});
    const json=await res.json(); setCv(json); setStatus('');
  };

  const dl=async(tpl:'resume'|'cv')=>{
    setStatus('生成中…');
    const payload = tpl==='resume'
      ? { template: 'resume', data: {
          date_created:'', name_furigana:'やまだ たろう', name:'山田 太郎',
          birth_year:'1995', birth_month:'04', birth_day:'12',
          address_main:'札幌市…', phone:'090-xxxx-xxxx', email:'taro@example.com',
          generated_pr: selfpr
        } }
      : { template: 'cv', data: {
          date_created:'', name:'山田 太郎',
          work_summary:  cv?.['職務概要']||'',
          work_details:  cv?.['職務経歴']||'',
          skills:        cv?.['活かせる知識']||'',
          self_pr_cv:    cv?.['自己PR']||''
        } };
    const res=await fetch('/api/pdf/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const blob=await res.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=res.headers.get('Content-Type')?.includes('pdf')?'generated.pdf':'filled.docx';
    a.click(); URL.revokeObjectURL(url); setStatus('');
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">AI 履歴書・職務経歴書ジェネレーター</h1>
      {status && <div className="text-sm text-gray-500">{status}</div>}

      <div className="space-x-2">
        <button className="px-3 py-2 rounded bg-black text-white" onClick={genSelfPR}>自己PRをAI生成</button>
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={genCv}>職務経歴JSONをAI生成</button>
      </div>

      <textarea className="w-full border p-2 h-40" value={selfpr} placeholder="自己PR（AI出力）" readOnly/>
      <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">{JSON.stringify(cv,null,2)}</pre>

      <div className="space-x-2">
        <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={()=>dl('resume')}>履歴書（DOCX）生成</button>
        <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={()=>dl('cv')}>職務経歴書（DOCX）生成</button>
      </div>

      <p className="text-xs text-gray-500">Word テンプレは /templates/resume.docx /templates/cv.docx に配置してください。</p>
    </main>
  );
}
