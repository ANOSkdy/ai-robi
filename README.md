This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## PDF 生成ワークフロー

- クライアントは `window.google?.script?.run` が利用可能な場合は GAS 側の `generatePdfFromDoc` を呼び出し、それ以外は Next.js の `/api/pdf` に POST します。
- `/api/pdf` は `puppeteer-core` と `@sparticuz/chromium` を利用して HTML テンプレート (`templates/resume.html`, `templates/cv.html`) を PDF へ変換します。
- テンプレートは Handlebars でレンダリングされ、日本語フォント `public/fonts/NotoSansJP-Regular.ttf` を読み込みます。フォントファイルを配置できない場合は同名ファイルを配置してください。
- ローカル開発では `CHROME_EXECUTABLE_PATH` 環境変数に Chromium/Chrome のパスを指定することでブラウザが起動します。Vercel 環境では自動で Lambda 対応の Chromium が利用されます。
- 生成された PDF は `Content-Disposition: attachment` でストリーム返却され、フロントエンドで Blob + `URL.createObjectURL` を用いたダウンロードに切り替えています。
