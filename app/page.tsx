'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera, Heart, MapPin, Plus, RotateCcw, Shuffle,
  Sparkles, Trash2, TrainFront, UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type Pick = {
  id: string;
  type: '景点' | '美食';
  area: '贵阳住处周边' | '贵阳市区专程' | '兴义';
  title: string;
  note: string;
  tip: string;
  image: string;
  query: string;
  mapCity: string;
};

type Wish = {
  id: string;
  title: string;
  area: string;
  category: string;
  note: string;
  imageUrl: string | null;
};

const guiyangImage = 'https://commons.wikimedia.org/wiki/Special:FilePath/Guiyang_Skyline.jpg?width=1600';
const xingyiImage = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wan_Feng_Lin_River.jpg?width=1600';
const foodImage = '/images/guizhou-foods.png';
const xhsKarst = '/images/xhs-karst.webp';
const xhsGuanshan = '/images/xhs-guanshan.webp';
const xhsChangpoling = '/images/xhs-changpoling.webp';
const xhsJilongbao = '/images/xhs-jilongbao.webp';
const xhsXingyi = '/images/xhs-xingyi.webp';
const xhsPuti = '/images/xhs-puti.webp';

const picks: Pick[] = [
  { id: 'guanshanhu', type: '景点', area: '贵阳住处周边', title: '观山湖公园', note: '5500 亩城市绿地，湖心栈道和白鹭很适合抵达后的松弛傍晚。', tip: '免费 · 建议 1.5–2 小时', image: xhsGuanshan, query: '观山湖公园 拍照机位', mapCity: '贵阳' },
  { id: 'museum', type: '景点', area: '贵阳住处周边', title: '贵州省博物馆', note: '从民族服饰一路看到喀斯特山水，雨天安排也很舒服。', tip: '免费预约 · 周一闭馆', image: guiyangImage, query: '贵州省博物馆 打卡 攻略', mapCity: '贵阳' },
  { id: 'geology', type: '景点', area: '贵阳住处周边', title: '贵州省地质博物馆', note: '看贵州独特地貌、化石和矿物，适合喜欢自然与建筑的人。', tip: '免费 · 云潭南路 607 号', image: guiyangImage, query: '贵州省地质博物馆 拍照', mapCity: '贵阳' },
  { id: 'karst-park', type: '景点', area: '贵阳住处周边', title: '贵阳喀斯特公园', note: '城区里的石林秘境，小红书近期笔记称它“石立千峰秀”，黄昏光线更柔和。', tip: '免费 · 适合散步拍照', image: xhsKarst, query: '贵阳 喀斯特公园 拍照', mapCity: '贵阳' },
  { id: 'changpoling', type: '景点', area: '贵阳住处周边', title: '长坡岭森林公园', note: '森林、湖面和草地组成的低强度去处，想在到达日吸氧放空可以选这里。', tip: '轻徒步 · 预留 2 小时', image: xhsChangpoling, query: '观山湖 长坡岭森林公园', mapCity: '贵阳' },
  { id: 'qingyun', type: '美食', area: '贵阳市区专程', title: '青云市集', note: '一次打卡多种贵州小吃，适合晚上去；它在市区，不算观山湖住处附近。', tip: '夜逛 · 预留往返车程', image: foodImage, query: '青云市集 必吃 贵阳', mapCity: '贵阳' },
  { id: 'guichu', type: '美食', area: '贵阳住处周边', title: '贵厨·观山湖店', note: '小红书观山湖搜索中反复出现的贵州菜选择，适合第一晚多人聚餐。', tip: '观山湖店 · 出发前预约', image: foodImage, query: '贵厨 观山湖店 必点', mapCity: '贵阳' },
  { id: 'daihuo', type: '美食', area: '贵阳住处周边', title: '逮火烤鸡', note: '观山湖笔记和评论都提到烤鸡与泡菜；旺季上菜和排队时间可能较长。', tip: '烤鸡 · 建议错峰', image: foodImage, query: '观山湖 逮火烤鸡', mapCity: '贵阳' },
  { id: 'wanfenglin', type: '景点', area: '兴义', title: '万峰林·下纳灰村', note: '想走进稻田可直接到下纳灰村；想俯瞰八卦田和福字田，再选景区观光车。', tip: '建议半天 · 九月看稻田', image: xingyiImage, query: '万峰林 下纳灰村 九月', mapCity: '兴义' },
  { id: 'fuyao-coffee', type: '景点', area: '兴义', title: '扶摇咖啡·吉隆堡机位', note: '小红书笔记推荐在这里拍与吉隆堡同框的城堡视角，适合顺路喝咖啡休息。', tip: '城堡机位 · 留意营业时间', image: xhsJilongbao, query: '兴义 扶摇咖啡 吉隆堡 机位', mapCity: '兴义' },
  { id: 'wanfenghu', type: '景点', area: '兴义', title: '万峰湖·吉隆堡', note: '湖面、孤峰和红顶城堡同框，适合与万峰林分开安排成另一段山水路线。', tip: '看湖拍城堡 · 关注天气', image: xhsJilongbao, query: '兴义 万峰湖 吉隆堡', mapCity: '兴义' },
  { id: 'malinghe', type: '景点', area: '兴义', title: '马岭河峡谷·打柴窝入口', note: '笔记推荐定位打柴窝入口，从桥上看瀑布群；九月雨后更壮观。', tip: '台阶较多 · 穿防滑鞋', image: xhsXingyi, query: '马岭河峡谷 打柴窝入口 瀑布', mapCity: '兴义' },
  { id: 'yuhuangding', type: '景点', area: '兴义', title: '玉皇顶·云上 House', note: '前夜下雨时更有机会看到云海，笔记建议清晨六点左右到云上 House 咖啡附近。', tip: '日出云海 · 早起看天气', image: xingyiImage, query: '玉皇顶 云上House 咖啡 日出云海', mapCity: '兴义' },
  { id: 'puti-village', type: '景点', area: '兴义', title: '普梯古寨', note: '小红书近期出现的少数民族古寨取景地，村落与山野感更安静，适合想避开主景区的人。', tip: '小众村寨 · 尊重当地生活', image: xhsPuti, query: '兴义 普梯古寨 打卡', mapCity: '兴义' },
  { id: 'maji-beef', type: '美食', area: '兴义', title: '马记小黄牛牛肉馆', note: '小红书兴义美食笔记的五星首推，干锅牛肉不辣、配菜足，也适合带小朋友。', tip: '干锅牛肉 · 人气较旺', image: foodImage, query: '兴义 马记小黄牛牛肉馆', mapCity: '兴义' },
  { id: 'jingshi', type: '美食', area: '兴义', title: '景氏烙锅', note: '烙锅中间带酸汤，可涮菜也可直接喝；笔记最推荐烤小肠。', tip: '烙锅 · 适合两三人', image: foodImage, query: '兴义 景氏烙锅', mapCity: '兴义' },
  { id: 'jiujiu-mutton', type: '美食', area: '兴义', title: '九九羊肉粉', note: '清汤偏酱香，薄荷和羊肉很搭；红烧口味微辣，想清爽可点清汤。', tip: '羊肉粉 · 本地早餐感', image: foodImage, query: '兴义 九九羊肉粉', mapCity: '兴义' },
  { id: 'liuji-pie', type: '美食', area: '兴义', title: '刘记油煎肉饼', note: '花椒香明显、馅料足，是适合边走边吃的小吃选择。', tip: '油煎肉饼 · 趁热吃', image: foodImage, query: '兴义 刘记油煎肉饼', mapCity: '兴义' },
  { id: 'shuabatou', type: '美食', area: '兴义', title: '刷把头', note: '薄皮包住竹笋、肉末等馅料，形状像小刷把，蘸辣椒水吃。', tip: '兴义代表小吃', image: foodImage, query: '兴义 刷把头 老店', mapCity: '兴义' },
];

const itinerary = [
  { date: '09.25', title: '深圳北 → 贵阳北', detail: '抵达后入住观山湖区恒大帝景三期', badge: '已确定' },
  { date: '09.26', title: '贵阳 → 兴义', detail: '入住兴义九重院；交通方式和时间待补', badge: '已确定' },
  { date: '09.27+', title: '把收藏拖进每天', detail: '万峰林建议留出完整半天，峡谷另排半天', badge: '一起选' },
];

export default function Home() {
  const [filter, setFilter] = useState<'全部' | '景点' | '美食'>('全部');
  const [areaFilter, setAreaFilter] = useState<'全部' | '贵阳' | '兴义'>('全部');
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const touchStart = useRef<number | null>(null);

  const filtered = useMemo(
    () => picks.filter((pick) => (filter === '全部' || pick.type === filter) && (areaFilter === '全部' || pick.mapCity === areaFilter)),
    [filter, areaFilter],
  );
  const current = filtered[index % filtered.length];
  const savedPicks = picks.filter((pick) => saved.includes(pick.id));

  useEffect(() => {
    fetch('/api/state')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const state = data as { favorites: string[]; wishes: Wish[] };
        setSaved(state.favorites);
        setWishes(state.wishes);
      })
      .catch(() => setMessage('当前先在页面里选择，发布后会自动长期保存。'));
  }, []);

  function switchFilter(value: string) {
    setFilter(value as typeof filter);
    setIndex(0);
  }

  function switchArea(value: '全部' | '贵阳' | '兴义') {
    setAreaFilter(value);
    setIndex(0);
  }

  function startChoosing(area: '全部' | '贵阳' | '兴义', type: '全部' | '景点' | '美食' = '全部') {
    setAreaFilter(area);
    setFilter(type);
    setIndex(0);
    document.getElementById('discover-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  function next() {
    setIndex((value) => (value + 1) % filtered.length);
  }

  function randomPick() {
    if (filtered.length < 2) return;
    setIndex((value) => {
      const currentIndex = value % filtered.length;
      const offset = 1 + Math.floor(Math.random() * (filtered.length - 1));
      return (currentIndex + offset) % filtered.length;
    });
  }

  async function setFavorite(id: string, shouldSave: boolean) {
    setSaved((value) => shouldSave ? [...new Set([...value, id])] : value.filter((item) => item !== id));
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ itemId: id, saved: shouldSave }),
      });
    } catch {
      setMessage('选择已显示在当前页面，网络恢复后再保存。');
    }
  }

  function loveCurrent() {
    void setFavorite(current.id, true);
    next();
  }

  function finishSwipe(endX: number) {
    if (touchStart.current === null) return;
    const distance = endX - touchStart.current;
    if (distance > 55) loveCurrent();
    if (distance < -55) next();
    touchStart.current = null;
  }

  async function addWish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const optimistic: Wish = {
      id: `draft-${Date.now()}`,
      title: String(data.get('title')),
      area: String(data.get('area')),
      category: String(data.get('category')),
      note: String(data.get('note')),
      imageUrl: data.get('image') instanceof File && (data.get('image') as File).size
        ? URL.createObjectURL(data.get('image') as File)
        : null,
    };
    setWishes((value) => [optimistic, ...value]);
    setDialogOpen(false);
    form.reset();
    try {
      const response = await fetch('/api/wishes', { method: 'POST', body: data });
      if (!response.ok) throw new Error();
      const savedWish = await response.json() as Wish;
      setWishes((value) => value.map((item) => item.id === optimistic.id ? savedWish : item));
      setMessage('新地点和照片已经收好啦！');
    } catch {
      setMessage('地点已放进当前清单；发布后可跨设备保存照片。');
    }
  }

  async function removeWish(id: string) {
    setWishes((value) => value.filter((item) => item.id !== id));
    if (!id.startsWith('draft-')) {
      await fetch(`/api/wishes?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => undefined);
    }
  }

  useEffect(() => {
    const context = (document as Document & {
      modelContext?: { registerTool?: (tool: Record<string, unknown>, options?: { signal: AbortSignal }) => void | Promise<void> };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'add_trip_wish',
      title: '添加旅行心愿',
      description: '把一个景点或美食添加到页面中的贵州旅行心愿清单。',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' }, area: { type: 'string' },
          category: { type: 'string', enum: ['景点', '美食'] }, note: { type: 'string' },
        },
        required: ['title', 'area', 'category'], additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input: unknown) => {
        const value = input as Partial<Wish>;
        if (!value.title || !value.area || !['景点', '美食'].includes(value.category ?? '')) throw new Error('地点信息不完整');
        const data = new FormData();
        data.set('title', value.title); data.set('area', value.area);
        data.set('category', value.category!); data.set('note', value.note ?? '');
        const response = await fetch('/api/wishes', { method: 'POST', body: data });
        if (!response.ok) throw new Error('保存失败');
        const wish = await response.json() as Wish;
        setWishes((items) => [wish, ...items]);
        return { id: wish.id, title: wish.title, saved: true };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main>
      <section className="cinematic-hero" id="top">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>
        <nav className="glass-nav" aria-label="主导航">
          <a className="cinematic-logo" href="#top" style={{ fontFamily: "'Instrument Serif', serif" }}>黔行纪<sup>®</sup></a>
          <div className="hero-links">
            <a className="active" href="#top">首页</a>
            <a href="#discover-card">灵感</a>
            <a href="#discover-card">目的地</a>
            <a href="#my-list">心愿单</a>
          </div>
          <a className="liquid-glass nav-cta" href="#discover-card">开始旅程</a>
        </nav>
        <div className="hero-content">
          <p className="hero-kicker animate-fade-rise">SHENZHEN · GUIYANG · XINGYI</p>
          <p className="hero-subtext animate-fade-rise-delay">九月二十五日，从深圳北出发。先凭感觉选一个方向，下一张卡片就替你打开。</p>
          <div className="hero-choices animate-fade-rise-delay-2" aria-label="选择第一站">
            <button className="liquid-glass" onClick={() => startChoosing('贵阳')}>贵阳附近</button>
            <button className="liquid-glass" onClick={() => startChoosing('兴义', '景点')}>兴义山野</button>
            <button className="liquid-glass" onClick={() => startChoosing('全部', '美食')}>先去吃饭</button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="discover" className="site-tabs" id="discover-card">
        <TabsList className="nav-tabs" aria-label="旅行栏目">
          <TabsTrigger value="discover">刷一刷</TabsTrigger>
          <TabsTrigger value="itinerary">行程</TabsTrigger>
          <TabsTrigger value="wishlist">我们的清单</TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          <section className="planner">
            <div className="intro">
              <p className="eyebrow"><Sparkles size={15} /> 2026 · 09.25 出发</p>
              <h1>黔</h1>
              <div className="route-line"><TrainFront size={18} /><strong>深圳北</strong><span>→</span><strong>贵阳北</strong><span>→</span><strong>兴义</strong></div>
              <p className="intro-copy">按住处所在城区整理景点与美食。贵阳房源标题和地址存在差异，出发前请再用地图核对实际车程。</p>
              <div className="filter-row" aria-label="筛选卡片">
                {(['全部', '景点', '美食'] as const).map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => switchFilter(value)}>{value}</button>)}
              </div>
              <div className="filter-row area-row" aria-label="筛选城市">
                {(['全部', '贵阳', '兴义'] as const).map((value) => <button key={value} className={areaFilter === value ? 'active' : ''} onClick={() => switchArea(value)}>{value === '全部' ? '全程' : value}</button>)}
              </div>
              <button className="random-button liquid-glass" onClick={randomPick}><Shuffle size={17} /> 随机抽一张</button>
            </div>

            <div className="swipe-zone" aria-live="polite">
              <div className="card-shadow" />
              <article className="pick-card" key={current.id} onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}>
                <img src={current.image} alt={current.title} />
                <div className="image-wash" />
                <div className="type-sticker">{current.type === '景点' ? '🌿 去玩' : '🥢 去吃'}</div>
                {current.image.includes('/images/xhs-') && <div className="xhs-sticker">小红书灵感图</div>}
                <div className="pick-copy">
                  <span className="place-tag"><MapPin size={14} /> {current.area}</span>
                  <h2>{current.title}</h2><p>{current.note}</p><span className="time-chip">{current.tip}</span>
                </div>
              </article>
              <div className="swipe-actions">
                <Button className="round-button skip" aria-label="换一个" onClick={next}><RotateCcw size={24} /></Button>
                <a className="xhs-link" href={`https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(current.query)}`} target="_blank" rel="noreferrer">小红书搜同款</a>
                <Button className="round-button love" aria-label="收藏这个地点" onClick={loveCurrent}><Heart size={25} fill="currentColor" /></Button>
              </div>
              <p className="gesture-tip">左滑换一个 · 右滑收进心愿单</p>
              <p className="card-progress">{(index % filtered.length) + 1} / {filtered.length}</p>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="itinerary">
          <section className="page-section itinerary-page">
            <div className="section-heading"><p className="eyebrow">路线先搭好</p><h1>从深圳，慢慢走进黔西南</h1><p>车次和贵阳至兴义的交通还没提供，所以保留成待补项。</p></div>
            <div className="itinerary-list">{itinerary.map((item) => <article key={item.date}><div className="date-bubble">{item.date}</div><div><span className="status">{item.badge}</span><h2>{item.title}</h2><p>{item.detail}</p></div></article>)}</div>
            <aside className="weather-note">🍃 九月底早晚温差和阵雨概率都值得留意，出发前一周再按天气微调峡谷与博物馆的顺序。</aside>
          </section>
        </TabsContent>

        <TabsContent value="wishlist">
          <section className="page-section wishlist-page" id="my-list">
            <div className="wishlist-top"><div className="section-heading"><p className="eyebrow">我们一起选</p><h1>心动清单</h1><p>收藏推荐，或者把自己刷到的地点和照片直接放进来。</p></div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger render={<Button className="add-button"><Plus /> 添加我的地点</Button>} /><DialogContent className="wish-dialog"><DialogHeader><DialogTitle>添加一个心动地点</DialogTitle></DialogHeader><form onSubmit={addWish} className="wish-form"><label>地点或店名<Input name="title" required placeholder="比如：某家酸汤鱼" /></label><label>在哪儿<Input name="area" required placeholder="贵阳 / 兴义 / 具体街区" /></label><label>分类<select name="category" defaultValue="景点"><option>景点</option><option>美食</option></select></label><label>想去的理由<Textarea name="note" placeholder="记下必点菜、拍照机位或开放时间" /></label><label className="upload-box"><Camera /><span>选一张图，就不用再找啦</span><Input name="image" type="file" accept="image/*" /></label><Button type="submit" className="submit-wish">放进清单</Button></form></DialogContent></Dialog>
            </div>
            {message && <p className="save-message" role="status">{message}</p>}
            <div className="saved-grid">
              {savedPicks.map((pick) => <article key={pick.id} className="saved-card"><img src={pick.image} alt={pick.title} /><div><span>{pick.area}</span><h2>{pick.title}</h2><button onClick={() => void setFavorite(pick.id, false)}><Trash2 size={16} />移除</button></div></article>)}
              {wishes.map((wish) => <article key={wish.id} className="saved-card custom"><div className="custom-image">{wish.imageUrl ? <img src={wish.imageUrl} alt={wish.title} /> : <span>{wish.category === '美食' ? '🥢' : '📍'}</span>}</div><div><span>{wish.area} · {wish.category}</span><h2>{wish.title}</h2><p>{wish.note}</p><button onClick={() => void removeWish(wish.id)}><Trash2 size={16} />移除</button></div></article>)}
              {!savedPicks.length && !wishes.length && <div className="empty-list"><Heart size={42} /><h2>清单还是空的</h2><p>去“刷一刷”点爱心，或者添加你自己的地点。</p></div>}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <section className="source-note"><UtensilsCrossed /><p>景点、美食与拍照机位已在 2026 年 9 月登录小红书检索并提炼；标注“小红书灵感图”的封面来自对应公开笔记，仅用于这份私人行程参考。每张卡片都保留精准搜索入口，价格、营业时间和天气请在出发前再确认。</p></section>
      <footer>景观照片：Wikimedia Commons · Ryedamien / Philippe Semanaz · 美食图为原创生成</footer>
    </main>
  );
}
