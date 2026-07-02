// =====================================================
// ウナシ プラットフォーム 案件データ
// -----------------------------------------------------
// このファイルは「Googleシート未接続時の表示元」かつ「変換済みデータの保管庫」。
// 案件を追加・更新するときはこのファイルだけ編集すればよい。
// 1案件 = 1オブジェクト。チャンネル名・URLは掲載しない（問い合わせ後に開示）。
//
// 出所：ドライブ「ノンネーム　リスト」の実案件を、ノンネームシートv2の
//   身バレ防止ルール（ジャンルぼかし・数字の丸め・特定回避）で変換したもの。
//   2026-06-11 変換。チャンネル名・URL・開設日・出演者等は一切含めていない。
//
// scores: 六角形チャートの6軸（各1〜5）。ノンネーム情報からの暫定評価。
//   面談時に実データで精緻化する前提。
//   scale=規模 / profit=収益性 / growth=成長性 /
//   handsfree=手離れ度 / stability=安定性 / repeat=運営の再現性
// directorStatus: "D付き" | "D候補あり" | "応相談"
// status: "募集中" | "交渉中" | "成約済"
// subscribers / monthlyViews が null の案件は「面談で開示」と表示される。
// trend が null の案件は推移グラフを表示しない（数字を作らない）。
// =====================================================

const DEALS = [
  {
    id: "U-0202",
    title: "月売上2,000万円超 金融・投資系YouTubeチャンネル",
    category: "ビジネス・投資",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 2288,
    price: 15000,
    directorStatus: "D付き",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益", "バックエンド商品", "企業案件"],
    status: "募集中",
    isNew: false,
    summary:
      "広告収益に加えてバックエンド商品が多数あり、収益源が多角化している大型案件です。競合優位性と参入障壁の高い、需要が安定したビジネスです。ディレクター体制を含めて引き継ぎ可能です（統括ディレクターを除く）。",
    audience: "",
    postingPace: "",
    team: "ディレクター体制あり（統括ディレクターを除き引き継ぎ可）",
    strengths: [
      "広告収益＋バックエンド商品で収益が多角化している",
      "参入障壁が高く、需要が安定したジャンル",
      "ディレクター体制を含めて引き継げる",
    ],
    risks: [
      "1.5億円規模の大型案件のため、買主側に相応の運営体制が必要",
      "バックエンド商品の収益は運営方針に左右される面がある",
    ],
    scope: [
      "チャンネル本体（アカウント一式）",
      "ディレクター体制（統括ディレクターを除く）",
      "バックエンド商品の収益スキーム",
    ],
    reason: "",
    comment:
      "当サイト最大の案件です。収益の柱が複数あり数字は非常に強い一方、価格に見合う運営体制を買主さま側で持てるかが論点になります。大型案件として個別に並走します。",
    scores: { scale: 5, profit: 5, growth: 3, handsfree: 4, stability: 5, repeat: 3 },
    trend: null,
  },
  {
    id: "U-0205",
    title: "スポーツ（野球）系のYouTubeチャンネル",
    category: "スポーツ",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 100,
    price: 1500,
    directorStatus: "応相談",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益"],
    status: "募集中",
    isNew: false,
    summary:
      "後発ながら成長中のジャンルで、月の利益が100万円規模の案件です。AIを活用して編集を効率化しており、ネタに枯渇がないのが特長です。",
    audience: "",
    postingPace: "",
    team: "",
    strengths: [
      "後発でも成長を続けているジャンル",
      "AI活用で編集が効率化されている",
      "話題が続きやすく、ネタに枯渇しにくい",
    ],
    risks: [
      "特定の選手・話題に依存する面があり、トレンド終息の影響を受けうる",
      "ディレクター体制は未整備で、引き継ぎ方法は相談が必要",
    ],
    scope: ["チャンネル本体（アカウント一式）", "編集の運用フロー"],
    reason: "",
    comment:
      "利益率が高く（月売上104万に対し利益100万）数字は魅力的です。ただし話題への依存度は正直あるので、安定して続けられる体制づくりが買収後の鍵になります。",
    scores: { scale: 4, profit: 4, growth: 4, handsfree: 3, stability: 3, repeat: 4 },
    trend: null,
  },
  {
    id: "U-0207",
    title: "解説・社会系（高年齢層向け）のYouTubeチャンネル",
    category: "解説・教育",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 62,
    price: 800,
    directorStatus: "応相談",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益"],
    status: "募集中",
    isNew: false,
    summary:
      "高年齢層向けに伸びているジャンルで、1日2本＋総集編の投稿スタイルで再生を積み上げています。AIを活用した制作で、量産体制ができています。",
    audience: "高年齢層中心",
    postingPace: "1日2本＋総集編",
    team: "",
    strengths: [
      "1日2本＋総集編の量産体制ができている",
      "高年齢層の固定視聴者で再生が安定しやすい",
      "AI活用で制作の属人性が低い",
    ],
    risks: [
      "投稿量が多く、制作リソースの維持が前提になる",
      "類似ジャンルのチャンネルが増えている",
    ],
    scope: ["チャンネル本体（アカウント一式）", "制作・投稿の運用フロー"],
    reason: "",
    comment:
      "量産の型ができていて再生は安定的。投稿本数が多い分、編集リソースを含めた収支で見ていただくのが現実的です。",
    scores: { scale: 3, profit: 4, growth: 4, handsfree: 3, stability: 4, repeat: 4 },
    trend: null,
  },
  {
    id: "U-0206",
    title: "オカルト・都市伝説系のYouTubeチャンネル",
    category: "エンタメ",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 57,
    price: 600,
    directorStatus: "応相談",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益"],
    status: "募集中",
    isNew: false,
    summary:
      "AIを活用して属人性を排した運営ができている案件です。中高年男性を中心とした安定した視聴層があり、著作権リスクの低いコンテンツ制作体制が整っています。",
    audience: "中高年男性中心",
    postingPace: "",
    team: "",
    strengths: [
      "AI活用で属人性が低く、引き継ぎやすい",
      "著作権リスクの低い制作フロー",
      "中高年男性の安定した視聴層",
    ],
    risks: [
      "ジャンル全体の流行に左右される面がある",
      "ディレクター体制は未整備で、引き継ぎ方法は相談が必要",
    ],
    scope: ["チャンネル本体（アカウント一式）", "制作マニュアル・運用フロー"],
    reason: "",
    comment:
      "AIで属人性を抜いてある分、引き継いだ人が同じ品質で続けやすい案件です。再現性の高さを評価しています。",
    scores: { scale: 3, profit: 4, growth: 3, handsfree: 4, stability: 4, repeat: 5 },
    trend: null,
  },
  {
    id: "U-0204",
    title: "ネタが枯渇しにくいジャンルのYouTubeチャンネル",
    category: "その他",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 31,
    price: 550,
    directorStatus: "D候補あり",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益"],
    status: "募集中",
    isNew: false,
    summary:
      "ネタが豊富で投稿を拡大できる余地があり、ファン化によるコミュニティ活用が見込めるジャンルです。現在ディレクターを教育中で、体制ごとの引き渡しに向けてウナシが支援できます。",
    audience: "",
    postingPace: "",
    team: "ディレクターを教育中（体制構築をウナシが支援）",
    strengths: [
      "ネタが豊富で投稿を拡大できる余地がある",
      "ファン化によるコミュニティ活用が見込める",
      "ディレクターを教育中で、体制づくりを支援できる",
    ],
    risks: [
      "ディレクター体制はまだ構築途中",
      "投稿拡大には追加の制作リソースが必要",
    ],
    scope: ["チャンネル本体（アカウント一式）", "教育中のディレクター体制"],
    reason: "",
    comment:
      "今まさにディレクター体制を作っている最中の案件です。ウナシの支援込みで、体制付きに近い形での引き渡しを目指せます。",
    scores: { scale: 3, profit: 3, growth: 4, handsfree: 3, stability: 3, repeat: 4 },
    trend: null,
  },
  {
    id: "U-0203",
    title: "1本あたりの再生数がジャンル上位のYouTubeチャンネル",
    category: "解説・教育",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 25,
    price: 300,
    directorStatus: "応相談",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益"],
    status: "募集中",
    isNew: false,
    summary:
      "1本あたりの再生数が同ジャンルで上位の案件です。高品質な動画と中高年視聴者による高単価の広告収益が強みで、追加の収益モデルによる成長も見込めます。",
    audience: "中高年中心",
    postingPace: "",
    team: "",
    strengths: [
      "1本あたりの再生数がジャンル上位",
      "中高年視聴者による高単価の広告収益",
      "追加の収益モデルで成長の余地がある",
    ],
    risks: [
      "広告収益が中心で、収益源の多角化はこれから",
      "ディレクター体制は未整備で、引き継ぎ方法は相談が必要",
    ],
    scope: ["チャンネル本体（アカウント一式）"],
    reason: "",
    comment:
      "1本ごとの再生効率が良く、広告単価の高い視聴者層を抱えています。収益源を足していく余地があるので、伸ばしたい買主さまに向きます。",
    scores: { scale: 3, profit: 3, growth: 4, handsfree: 3, stability: 4, repeat: 3 },
    trend: null,
  },
  {
    id: "U-0201",
    title: "時事・社会系の解説YouTubeチャンネル",
    category: "解説・教育",
    format: "長尺中心",
    subscribers: null,
    monthlyViews: null,
    monthlyProfit: 5.4,
    price: 200,
    directorStatus: "応相談",
    ownerHours: null,
    ageMonths: null,
    monetization: ["広告収益"],
    status: "募集中",
    isNew: false,
    summary:
      "月1本の動画投稿でも再生数が取れているのが特長の案件です。AIを利用した動画編集を行っており、少ない稼働で運営できます。小さく始めたい方に向いた価格帯です。",
    audience: "",
    postingPace: "月1本でも再生が取れる",
    team: "",
    strengths: [
      "月1本の投稿でも再生数が取れている",
      "AI活用で編集の手間が少ない",
      "200万円台で始めやすい価格帯",
    ],
    risks: [
      "月の利益は5万円台で、規模は小さい",
      "回収目安が長め（約37ヶ月）。値づけは相談の余地あり",
    ],
    scope: ["チャンネル本体（アカウント一式）", "AI編集の運用フロー"],
    reason: "",
    comment:
      "規模は小さいですが、少ない稼働で回る作りが魅力です。1本目のチャンネル買収や、複数運営の入口として現実的な案件だと見ています。",
    scores: { scale: 2, profit: 2, growth: 2, handsfree: 4, stability: 3, repeat: 3 },
    trend: null,
  },
];
