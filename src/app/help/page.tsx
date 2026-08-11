import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "使い方 | Timebox Planner",
  description: "Timebox Planner の使い方",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-1">{title}</h2>
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">使い方</h1>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          ← 戻る
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <Section title="このツールについて">
          <p>
            Timebox Plannerは、メンバー×日付のグリッドにタスクを配置して工数を計画するツールです。
            1日8時間という現実の稼働時間の中で、複数のタスクを並行してこなしていくと結果的に
            「いつ仕事が終わるか」が見えるようになる——それがこのツールの目的です。
            見積もりの合計時間だけでなく、各タスクの<strong>実際の完了予定日</strong>
            （最後に配置した日）を確認しながら計画できます。
          </p>
        </Section>

        <Section title="基本の流れ">
          <ol className="list-decimal list-inside space-y-1">
            <li>ヘッダーの「プロジェクト管理」「メンバー管理」で、プロジェクトと担当者候補を用意する</li>
            <li>「+ タスク追加」でタスクを作成する（プロジェクト・タスク名・総工数・期限を指定。担当者は未定でも作成可）</li>
            <li>タイムライン上の空セルをクリックし、タスクを選んで配置する（未定タスクを選ぶとそのメンバーが担当者に追加される）</li>
            <li>配置したタスクブロックをクリックすると、配置の追加・削除や担当者ごとの内訳を確認できる</li>
          </ol>
        </Section>

        <Section title="タイムライン操作">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>空セルをクリック</strong> — そのメンバー・日付にタスクを配置するダイアログを開く（既存タスクをプルダウンから選択）</li>
            <li><strong>タスクブロックをクリック</strong> — 配置管理ダイアログを開く（日ごとの配置一覧・追加・削除、編集・削除への導線）。予定時間・実績時間はその場で数値を書き換えて再設定できる</li>
            <li><strong>タスクブロックをドラッグ</strong> — マウスダウンしたまま同じ担当者の行を左右になぞると、同じ時間数でその日程まで配置を延伸できる</li>
            <li><strong>1日あたりの配置時間が8時間を超える</strong>と、そのセルが赤く強調表示される</li>
            <li><strong>完了予定日が期限を過ぎている</strong>タスクブロックは、赤い枠線で強調される</li>
            <li><strong>実績時間を入力したブロック</strong>は、予定時間に対する実績の割合ぶんだけ左から補色で塗りつぶされる</li>
          </ul>
        </Section>

        <Section title="表示期間とナビゲーション">
          <ul className="list-disc list-inside space-y-1">
            <li>ナビゲーションバーのプルダウンで、1日〜1年の表示期間を切り替えられる</li>
            <li>「← 過去へ」「未来へ →」は、選択中の表示期間の日数分だけ前後に移動する</li>
            <li>「今日」ボタンで今日を起点とした表示に戻る</li>
            <li>1か月（30日）までは画面幅に収まるよう自動調整される。3か月・半年・1年はその密度を保ったまま、はみ出た分を横スクロールで閲覧する</li>
            <li>「営業日のみ表示」をオンにすると、休業日（週末・祝日の設定に基づく）を非表示にできる。休業日でもタスクの配置自体は常に可能</li>
          </ul>
        </Section>

        <Section title="タスクの担当者">
          <p>
            1つのタスクに複数の担当者を割り当てられます。タスク編集画面の「担当者（複数選択可）」で
            トグル形式のチップから選択してください。各担当者は自分の作業時間を独立して配置でき、
            配置済み合計時間はタスクの総工数に対してカウントされます。
          </p>
        </Section>

        <Section title="タスクの色・テクスチャ">
          <p>
            タスク作成時に色とテクスチャ（ストライプ・ドット・グリッド・なし）がランダムに割り当てられ、
            同じプロジェクトのタスクでも見分けやすくなっています。タスク編集画面から手動で変更することも可能です。
          </p>
        </Section>

        <Section title="設定">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>週末（休業日）とする曜日</strong> — 会社によって異なる休業日の曜日をトグルで指定（初期値は土日）</li>
            <li><strong>祝日・休業日</strong> — 個別の日付を追加・削除できる。初期値として日本の国民の祝日（当年の前後1年分）が自動登録される</li>
            <li><strong>年度の開始月</strong> — 会社ごとに異なる年度定義を設定できる（現時点では表示には未反映）</li>
          </ul>
        </Section>

        <Section title="管理画面">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>プロジェクト管理</strong> — プロジェクトの追加・編集・削除に加え、プロジェクト憲章・開始日/終了日・予算（任意）を登録できる</li>
            <li><strong>メンバー管理</strong> — 姓名・会社名・部署名・役職・所属チーム・人日単価（任意）を登録できる。各メンバーの▲▼ボタンで並び順を変更でき、タイムラインの表示順にも反映される</li>
            <li><strong>チーム管理</strong>（メンバー管理内の「チーム管理」から） — チームの追加・編集・削除。メンバーの所属チームとして選択できる</li>
            <li><strong>タスク管理</strong> — 全タスクを一覧表示し、配置の有無に関わらず編集・削除できる</li>
          </ul>
        </Section>

        <Section title="プロジェクトダッシュボード（詳細）">
          <p>
            プロジェクト管理の各プロジェクトの「詳細」から、レポート/ダッシュボードとして以下を確認できます。
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>進捗率</strong> — 実績入力があれば実績時間、なければ予定時間を使い、見積時間との比率をバーで表示（超過時は100%を超えて表示）</li>
            <li><strong>積算費用</strong> — 各タスクの配置時間（h）を担当者の人日単価から人日換算して合計（人日単価が未設定の担当者分は計上されません）</li>
            <li><strong>予算・損益分岐点・利益率</strong> — プロジェクトの予算に対して積算費用がいくらか、黒字/赤字と利益率（％）をバー付きで表示</li>
            <li><strong>メンバー別工数・コスト</strong> — 担当者ごとの予定/実績時間・差分（％）・コストを一覧表示</li>
            <li><strong>タスクとプロジェクト期間の整合</strong> — 各タスクの期限・完了予定日がプロジェクトの開始日〜終了日に収まっているかを「期間内 / 期間外」で表示</li>
            <li><strong>Excel出力</strong> — 上記の概要・タスク一覧・メンバー別工数を3シート構成の.xlsxファイルとしてダウンロード</li>
          </ul>
        </Section>

        <Section title="メンバーの実績記入と消化率">
          <p>
            タスクの配置管理ダイアログで、配置済みの各日に「実績（h）」を入力できます。
            メンバー管理の「詳細」を開くと、実績を記入した配置のみを対象に、予定時間に対する実績時間の
            差分（±％）を確認できます。
          </p>
        </Section>

        <Section title="データ初期化">
          <p>
            ヘッダーの「データ初期化」ボタンで、すべてのデータ（プロジェクト・メンバー・タスク・設定）を
            初期状態に戻せます。この操作は元に戻せないため、確認ダイアログが表示されます。
          </p>
        </Section>

        <Section title="データの保存について">
          <p>
            入力したデータはブラウザのlocalStorageに保存されます。サーバーには送信されません。
            別のブラウザ・端末とはデータは共有されないため、ご注意ください。
          </p>
          <p>
            設定画面の「データの保存・読み込み」の「保存」「読み込み」から、データをJSONファイルでやり取りできます。
            バックアップや他の端末・ブラウザへの引き継ぎに利用してください。
          </p>
          <p>
            Chrome・Edgeなど対応ブラウザでは、「保存」で選んだファイルが以降の保存先として連携され、
            次回以降の「保存」はそのファイルに上書きされます（「読み込み」で選んだファイルも同様に連携されます）。
            連携はタブを閉じるとリセットされ、非対応ブラウザでは毎回ダウンロード／ファイル選択になります。
          </p>
        </Section>
      </main>
    </div>
  );
}
