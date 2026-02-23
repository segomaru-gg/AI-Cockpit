export interface AeternumItem {
  id: string;
  name: string;
  category: string;
  era: string;
  story: string;
  status: 'Available' | 'Reserved' | 'Sold Out' | 'Archived';
  price: number | null;
  tags: string[];
  mediaType: 'image' | 'sound' | 'text';
  images: string[];
}

export const AERTERNUM_TAGS = [
  { id: 'nostalgic', label: 'Nostalgic' },
  { id: 'calm', label: 'Calm' },
  { id: 'weighty', label: 'Weighty' },
  { id: 'inherited', label: 'Inherited' },
  { id: 'raw', label: 'Raw' },
  { id: 'out-of-time', label: 'Out of Time' },
  { id: 'structure-reference', label: 'Structure' }
];

export const AERTERNUM_ITEMS: AeternumItem[] = [
  {
    id: "item_001",
    name: "琥珀色のデザートグラス",
    category: "Tableware",
    era: "1970s, Showa Japan",
    story: "夕暮れの光をその身に宿したような、深みのある琥珀色。\nかつて日本の家庭で広く愛された「アデリア」の製品と思われる。\n\n量産品でありながら、そのガラスの厚みとゆらぎには、\n高度成長期の熱気と、家族団欒の安らぎが同居している。\n冷たい氷菓を盛るだけでなく、光を透過させて眺める時間そのものを味わうための器。",
    status: "Available",
    price: 3800,
    tags: ["nostalgic", "inherited"],
    mediaType: "image",
    images: ["/assets/items/1771054410510-スクリーンショット 2026-02-14 16.13.06.png"]
  },
  {
    id: "item_002",
    name: "ミッドセンチュリーのデスクランプ",
    category: "Lighting",
    era: "1960s, Unknown Origin",
    story: "機能主義と有機的なフォルムの融合。\n金属の冷たさを、柔らかな曲線のシェードが中和している。\n\nスイッチを入れると、ただ部屋を明るくするのではなく、\n「書く」「読む」という行為のための結界を張るように、\n手元だけに静かな光だまりを作る。",
    status: "Available",
    price: 24000,
    tags: ["calm", "structure-reference"],
    mediaType: "image",
    images: ["/assets/items/1771053940446-スクリーンショット 2026-02-14 16.12.37.png"]
  },
  {
    id: "item_003",
    name: "雨音のフィールドレコーディング",
    category: "Sound / Atmosphere",
    era: "2024, Kobe",
    story: "神戸・北野の異人館街で録音された、梅雨の雨音。\n石畳を叩く音、遠くで鳴る教会の鐘、湿った空気の振動。\n\n音楽ではなく、空間そのものを切り取った時間の標本。\n作業用BGMとしてではなく、\nただ「そこに雨が降っている」ことを感じるための音。",
    status: "Available",
    price: 1500,
    tags: ["calm", "out-of-time", "raw"],
    mediaType: "sound",
    images: ["/assets/items/rain_sound_placeholder.jpg"]
  },
  {
    id: "item_004",
    name: "投函されなかった手紙",
    category: "Document",
    era: "1990s, Tokyo",
    story: "宛名はあるが、切手は貼られていない。\n封は閉じられているが、糊付けは甘い。\n\n書くことで昇華され、送る必要を失ったのか、\nそれとも送る勇気がなかったのか。\n\n内容は誰にも読まれるべきではないが、\n「伝えようとした意思」の重みだけが、紙の厚みに残っている。",
    status: "Archived",
    price: null,
    tags: ["weighty"],
    mediaType: "text",
    images: ["/assets/items/letter_placeholder.jpg"]
  },
  {
    id: "item_005",
    name: "欠けた陶片",
    category: "Fragment",
    era: "Edo Period?",
    story: "海岸で拾われた、青磁の欠片。\n波に洗われ、角は丸くなり、宝石のような滑らかさを持つ。\n\nもとはどのような皿だったのか、誰に使われていたのか。\n全体性を失うことで、逆に無限の想像を受け入れる「余白」となった。\n\n箸置きとして、あるいはただ、掌で転がすために。",
    status: "Available",
    price: 800,
    tags: ["raw"],
    mediaType: "image",
    images: ["/assets/items/fragment_placeholder.jpg"]
  }
];
