## BGM FACTORY(BGM作成ツール)
ツール概要：
SunoAIで生成したBGMを、
YouTube向け動画として効率的に管理・生成・予約投稿するためのElectronアプリ

## Tech Stack

- Electron
- React
- TypeScript
- FFmpeg
- YouTube Data API

## Idea Tab
・タイトル管理<br>
・説明文管理<br>
・投稿アイデアストック<br>

<img width="944" height="1029" alt="image" src="https://github.com/user-attachments/assets/0b5ced6c-da93-40d1-af42-6931b902da0c" />

### Idea Tab Demo
IdeaTabで、jsonファイルをクリックすると、右タブにリストとして、表示される<br>
表示されたリストをクリックすると、Createタブに遷移し、メタデータに自動で入力されます<br>
<img width="939" height="972" alt="test1" src="https://github.com/user-attachments/assets/c6e3fa62-7e77-491a-bb31-a4519a3267b3" />

## Create Tab
・WAVファイル選択<br>
・ループ生成<br>
・MP4生成<br>
・サムネ設定<br>
・メタデータ入力<br>

<img width="943" height="1029" alt="image" src="https://github.com/user-attachments/assets/e49b6f46-7c20-4055-b349-f259b48be9ff" />

### Create Tab Demo
TRACKSリストの音声ファイルをクリックし、BUILD一覧に表示されます。<br>
BUILD一覧で任意のオプションを設定し、サムネイル画像、背景画像を選択します。<br>
METADATA一覧の設定項目を確認し、生成ボタンをクリックします。<br>
<img width="939" height="972" alt="test2" src="https://github.com/user-attachments/assets/e930467d-534c-4bc6-bb5f-b59037f5dc0b" />

## Schedule Tab
・投稿予定一覧表示<br>
・カレンダー管理<br>
・YouTube予約投稿<br>

<img width="942" height="1034" alt="スクリーンショット 2026-05-08 225917" src="https://github.com/user-attachments/assets/40da1152-6915-435f-9c2e-c86cc412e613" />

### Schedule Tab Demo
jSONファイル一覧にCreateタブで生成したメタデータが表示されます。<br>
メタデータをクリックすると、説明概要一覧に投稿内容の説明が表示されます。<br>
予約投稿ボタンをクリックし、投稿予約が完了すると、ラベルがpendingからscheduledに変わり、投稿予約が完了したことを確認できます。<br>
カレンダーには、投稿予約済であることがわかるチェックボタンが表示されます。
<img width="939" height="972" alt="test4" src="https://github.com/user-attachments/assets/c62aa03c-7f02-45f4-b587-ba151b644f98" />




