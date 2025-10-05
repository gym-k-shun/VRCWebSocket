<h1>📡 VRChat Friend Watcher — ローカルダッシュボード</h1>

<h2>VRChat公式の WebSocket API を利用して、
フレンドのアクティビティをリアルタイムで監視できる軽量ダッシュボードです。</h2>

<h3>特徴</h3>

<ul>
  <li>🪄 リアルタイム更新：VRChat WebSocket から直接受信</li>
  <li>🔍 フレンドフィルタ：UID または displayName で絞り込み</li>
  <li>💾 ローカルキャッシュ：過去のイベントを一時保存</li>
  <li>🖼️ サムネイル付き表示：ワールド画像やアバターを自動表示</li>
  <li>🌐 完全ローカル動作：外部サーバ不要、プライバシー安全</li>
</ul>
<h3>🚀 セットアップ手順</h3>

`/users/friends.json`ファイルに、監視したいフレンドの ユーザーID (UID) を追加します:
(例)
```json
[
  "usr_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "usr_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
]
```
<h3>2️⃣ VRChat の認証トークンを取得</h3>
<p>
VRChat公式サイトにログイン
開発者ツール → Network → Fetch/XHR を開く<br>
https://api.vrchat.cloud/api/1/auth/user というリクエストを探す
リクエストヘッダ内の authcookie_ から始まる値 をコピー
.env ファイルを作成し、以下のように貼り付けます：
</p>
(例)

```env
AUTH_TOKEN=authcookie_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

<h3>3️⃣ サーバーを起動</h3>

```
node server.js
```
起動したら、ブラウザで `http://localhost:8080` にアクセス。
これで完了です！🎉
VRChat のライブイベントがローカルのダッシュボードにリアルタイムで表示されます。

<h3>🧠 補足</h3>

フレンドが プライベートワールド にいる場合、ワールド名の代わりに "private" と表示されます。
ダッシュボードは ws://localhost:8787/stream にて WebSocket 経由でデータを受信します。
「JSON注入」機能を使うと、VRChatに接続していなくてもUIをテストできます。
<h3>💻 技術スタック</h3>

Node.js（WebSocket中継サーバー）
HTML5 + CSS3 + Vanilla JavaScript
外部ライブラリ不要
