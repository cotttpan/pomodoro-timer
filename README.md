# Build

```
git clone
yarn install
yarn run bundle:prod
yarn run server
```

# Architecture

* clean archtecture を意識して model を中心に依存を作る
* command を使って MVI architecture を表現
  * `view(store(servive(model(event))))`
* model
  * domain state は redux に依存せず on-memory の repository(`lib/storage.ts`)で管理
  * `ACTION COMMAND`を購読して repository の更新と model の内部 event を`RESULT COMMAND`を返す
  * 外部 API の呼び出しもここでやる
* service
  * domain model を動かすための依存注入レイヤ
  * domain をまたぐ依存注入
  * INTENT -> ACTION
  * domain model を動かすことに集中する
* infra
  * model に定義された外部 API の実装
  * servive で依存を注入
* view
  * container に state と action を発行する event handler を定義
  * project は container を使った SFC template で分割
  * style は project component 毎に定義

# Pros and Cons (v1.0.0)

* どこに何を書くべきかはっきりするので迷わない(clean architecture)
  * redux の Action としている command を`Intent`と`Action`にわけることで、なにに依存して発行される command なのかがはっきりする
  * model をドメインロジックに集中、service を依存注入に集中させることで無理のない依存関係をつくることができた
* domain を redux から切り離すことができた
* redux の state は view state or domain repository state?
  * 今回は container 単位の view state として作った
  * view の state がどの event によって作られるのかはっきりする
  * form の状態は model を通さず intent -> reducer で view state を作っている
  * model としてつくるのがダルい...
  * domain repository state として redux.connect で map するほうがよいのかわからない
