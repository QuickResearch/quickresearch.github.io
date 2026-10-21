# “快”科研联合声明 · Joint Statement on Quick Research

Source for <https://quickresearch.github.io>: a bilingual (中文 / English) static site for the Joint Statement on Quick Research, with a signatory list and a page for signing or suggesting revisions by email.

## 文件 Files

| 文件 File | 内容 Contents |
| --- | --- |
| `index.html` | 声明正文（中 / 英）、延伸阅读与联署名单 · Statement (zh / en), further reading, signatory list |
| `sign.html` | 联署与建议表单（经 Web3Forms 发送）· Sign & suggest form, delivered via Web3Forms |
| `static/signatories.js` | 联署名单数据 · Signatory data |
| `static/main.js` | 语言切换与名单渲染 · Language tabs and list rendering |
| `static/sign.js` | 表单校验与提交 · Form validation and submission |
| `static/style.css` | 样式 · Styles |

## 联署如何运作 How signing works

`sign.html` 把表单提交给 [Web3Forms](https://web3forms.com)，由它转发到发起人的邮箱；页面里只有 access key，不会暴露邮箱地址。未配置 key 时，会改为打开访客的邮件 App（收件地址在 `static/sign.js` 的 `INBOX` 中以字符编码保存，不以明文出现）。首次使用：在 web3forms.com 输入接收邮箱获取 access key，填入 `static/sign.js` 的 `ACCESS_KEY`。

`sign.html` posts the form to [Web3Forms](https://web3forms.com), which forwards it to the organizers' inbox. The page holds only an access key, never the address. Setup: get an access key at web3forms.com and put it in `ACCESS_KEY` in `static/sign.js`.

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

## 更换接收邮箱 Changing the inbox

为新邮箱申请一个 Web3Forms access key，替换 `static/sign.js` 中的 `ACCESS_KEY`。 Get a Web3Forms key for the new inbox and replace `ACCESS_KEY` in `static/sign.js`.

## 本地预览 Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## 部署 Deployment

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch**, then choose the branch to publish (for example `main`) and the `/ (root)` folder. The `.nojekyll` file tells Pages to serve the files as they are.
