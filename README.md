# “快”科研联合声明 · Joint Statement on Quick Research

Source for <https://quickresearch.github.io>: a bilingual (中文 / English) static site for the Joint Statement on Quick Research, with a signatory list and a page for signing or suggesting revisions by email.

## 文件 Files

| 文件 File | 内容 Contents |
| --- | --- |
| `index.html` | 声明正文（中 / 英）、延伸阅读与联署名单 · Statement (zh / en), further reading, signatory list |
| `sign.html` | 联署与建议页：生成一封发往联络邮箱的邮件 · Sign & suggest page that composes an email |
| `static/signatories.js` | 联署名单数据 · Signatory data |
| `static/main.js` | 语言切换与名单渲染 · Language tabs and list rendering |
| `static/sign.js` | 表单与邮件生成 · Form and email composition |
| `static/style.css` | 样式 · Styles |

## 联署如何运作 How signing works

本站是纯静态网站，不收集任何数据。访客在 `sign.html` 填写姓名、单位、身份、简历与建议后，页面生成一封邮件（主题以 `[Quick Research]` 开头），由访客从自己的邮箱发送至 kunlunz097@gmail.com。发件邮箱本身即可用于核实身份。

The site is fully static and collects nothing. `sign.html` turns the form (name, institute, position, CV, suggestions) into an email whose subject starts with `[Quick Research]`, which the visitor sends from their own mailbox to kunlunz097@gmail.com. The sender address doubles as identity verification.

## 添加联署者 Adding a signatory

核实邮件后，在 `static/signatories.js` 的数组中添加一项，页面会自动排序并更新人数：

After verifying an email, add an entry to the array in `static/signatories.js`. The page sorts the list and updates the count:

```js
window.QR_SIGNATORIES = [
  {
    name: "张三", name_en: "San Zhang",
    position: "博士生", position_en: "PhD Student",
    institute: "清华大学", institute_en: "Tsinghua University",
  },
  { anonymous: true }, // 匿名联署：只计入人数 / anonymous: counted, never listed
];
```

`_en` 字段可省略，省略时英文版显示中文字段。 `_en` fields are optional; the base field is shown when they are missing.

## 修改声明 Revising the statement

- 中英文正文都在 `index.html` 中（`data-panel="zh"` 与 `data-panel="en"`），修改时请保持两版同步。
  Both versions live in `index.html` (`data-panel="zh"` and `data-panel="en"`); keep them in sync.
- 发布新版本时，更新两处文末的版本行（`doc-meta`）以及 `sign.html` 中表单的 `data-version`。
  When releasing a new version, update the `doc-meta` line at the end of both versions and the form's `data-version` in `sign.html`.

## 更换联络邮箱 Changing the contact email

邮箱出现在 `static/sign.js`（`TO`）、`sign.html`（说明文字与收件人）和两个页面的页脚中。

The address appears in `static/sign.js` (`TO`), in `sign.html` (instructions and recipient), and in both page footers.

## 本地预览 Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## 部署 Deployment

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch**, then choose the branch to publish (for example `main`) and the `/ (root)` folder. The `.nojekyll` file tells Pages to serve the files as they are.
