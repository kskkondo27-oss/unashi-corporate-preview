# お問い合わせフォーム設定メモ

## 推奨方針

現在のLP builder / SlideflowのフォームAPIは、LP builder契約終了後に動作保証ができないため再利用しません。
新サイトは静的HTML/CSS/JSのまま公開し、お問い合わせフォームの送信処理だけFormspreeに切り出す構成を推奨します。

## 業者様への設定依頼

1. Formspreeで `info@unashi.com` 宛のフォームを作成してください。
2. Formspree管理画面で発行されるエンドポイントを控えてください。
   - 例: `https://formspree.io/f/xxxxxxxx`
3. `assets/js/site-data.js` の以下を差し替えてください。

```js
form: {
  provider: "Formspree",
  endpoint: "https://formspree.io/f/xxxxxxxx",
  fallbackEmail: "info@unashi.com"
}
```

4. 本番URLで送信テストを行い、`info@unashi.com` に通知メールが届くことを確認してください。
5. 迷惑メール対策として、Formspree側でドメイン制限・スパム対策を有効化してください。

## 現在のHTML側実装

- フォームHTML: `contact/index.html`
- 送信処理JS: `assets/js/main.js`
- 送信先設定: `assets/js/site-data.js`

`form.endpoint` が空の状態では、プレビュー用として送信を停止します。
本番公開前に必ずFormspreeのエンドポイントを設定してください。
