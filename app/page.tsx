'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera, ChevronDown, Heart, MapPin, Plus, RotateCcw,
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

const picks: Pick[] = [
  { id: 'guanshanhu', type: '景点', area: '贵阳住处周边', title: '观山湖公园', note: '5500 亩城市绿地，湖心栈道和白鹭很适合抵达后的松弛傍晚。', tip: '免费 · 建议 1.5–2 小时', image: guiyangImage, query: '观山湖公园 拍照机位', mapCity: '贵阳' },
  { id: 'museum', type: '景点', area: '贵阳住处周边', title: '贵州省博物馆', note: '从民族服饰一路看到喀斯特山水，雨天安排也很舒服。', tip: '免费预约 · 周一闭馆', image: guiyangImage, query: '贵州省博物馆 打卡 攻略', mapCity: '贵阳' },
  { id: 'geology', type: '景点', area: '贵阳住处周边', title: '贵州省地质博物馆', note: '看贵州独特地貌、化石和矿物，适合喜欢自然与建筑的人。', tip: '免费 · 云潭南路 607 号', image: guiyangImage, query: '贵州省地质博物馆 拍照', mapCity: '贵阳' },
  { id: 'qingyun', type: '美食', area: '贵阳市区专程', title: '青云市集', note: '一次打卡多种贵州小吃，适合晚上去；它在市区，不算观山湖住处附近。', tip: '夜逛 · 预留往返车程', image: foodImage, query: '青云市集 必吃 贵阳', mapCity: '贵阳' },
  { id: 'siwawa', type: '美食', area: '贵阳住处周边', title: '丝娃娃', note: '薄饼裹满脆蔬菜，再灌一勺酸辣蘸水，第一口就很贵州。', tip: '清爽酸辣 · 可搜附近门店', image: foodImage, query: '观山湖 丝娃娃 好吃', mapCity: '贵阳' },
  { id: 'suantang', type: '美食', area: '贵阳住处周边', title: '红酸汤火锅', note: '番茄与木姜子发酵出的酸香，涮鱼、豆腐和蔬菜都很开胃。', tip: '适合第一晚聚餐', image: foodImage, query: '观山湖 酸汤火锅 推荐', mapCity: '贵阳' },
  { id: 'wanfenglin', type: '景点', area: '兴义', title: '万峰林', note: '两万多座锥状峰林铺进田野，九月沿纳灰河慢慢骑行很舒服。', tip: '建议半天 · 旺季 08:00–18:00', image: xingyiImage, query: '兴义万峰林 九月 路线', mapCity: '兴义' },
  { id: 'malinghe', type: '景点', area: '兴义', title: '马岭河峡谷', note: '瀑布、峭壁和地缝峡谷一路展开，雨后水量大时很壮观。', tip: '台阶较多 · 穿防滑鞋', image: xingyiImage, query: '马岭河峡谷 游玩路线', mapCity: '兴义' },
  { id: 'shuabatou', type: '美食', area: '兴义', title: '刷把头', note: '薄皮包住竹笋、肉末等馅料，形状像小刷把，蘸辣椒水吃。', tip: '兴义代表小吃', image: foodImage, query: '兴义 刷把头 老店', mapCity: '兴义' },
  { id: 'chicken-tangyuan', type: '美食', area: '兴义', title: '鸡肉汤圆', note: '咸口糯米皮包鸡肉馅，配鸡汤和芝麻酱，软糯鲜香。', tip: '百年地方风味', image: foodImage, query: '兴义 鸡肉汤圆 推荐', mapCity: '兴义' },
];

const itinerary = [
  { date: '09.25', title: '深圳北 → 贵阳北', detail: '抵达后入住观山湖区恒大帝景三期', badge: '已确定' },
  { date: '09.26', title: '贵阳 → 兴义', detail: '入住兴义九重院；交通方式和时间待补', badge: '已确定' },
  { date: '09.27+', title: '把收藏拖进每天', detail: '万峰林建议留出完整半天，峡谷另排半天', badge: '一起选' },
];

export default function Home() {
  const [filter, setFilter] = useState<'全部' | '景点' | '美食'>('全部');
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const touchStart = useRef<number | null>(null);

  const filtered = useMemo(
    () => picks.filter((pick) => filter === '全部' || pick.type === filter),
    [filter],
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

  function next() {
    setIndex((value) => (value + 1) % filtered.length);
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
            <a href="#quick-look">目的地</a>
            <a href="#my-list">心愿单</a>
          </div>
          <a className="liquid-glass nav-cta" href="#discover-card">开始旅程</a>
        </nav>
        <div className="hero-content">
          <p className="hero-kicker animate-fade-rise">SHENZHEN · GUIYANG · XINGYI</p>
          <h1 className="animate-fade-rise" style={{ fontFamily: "'Instrument Serif', serif" }}>让梦穿过寂静，<br /><em>落进贵州的山雾。</em></h1>
          <p className="hero-subtext animate-fade-rise-delay">九月二十五日，从深圳北出发。我们把想吃的、想看的和偶然心动的地方，都收进这趟旅程。</p>
          <a className="liquid-glass hero-cta animate-fade-rise-delay-2" href="#discover-card">开始挑选地点</a>
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
              <h1>刷到心动，<br />就去贵州吧！</h1>
              <div className="route-line"><TrainFront size={18} /><strong>深圳北</strong><span>→</span><strong>贵阳北</strong><span>→</span><strong>兴义</strong></div>
              <p className="intro-copy">按住处所在城区整理景点与美食。贵阳房源标题和地址存在差异，出发前请再用地图核对实际车程。</p>
              <div className="filter-row" aria-label="筛选卡片">
                {(['全部', '景点', '美食'] as const).map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => switchFilter(value)}>{value}</button>)}
              </div>
            </div>

            <div className="swipe-zone" aria-live="polite">
              <div className="card-shadow" />
              <article className="pick-card" key={current.id} onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}>
                <img src={current.image} alt={current.title} />
                <div className="image-wash" />
                <div className="type-sticker">{current.type === '景点' ? '🌿 去玩' : '🥢 去吃'}</div>
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
            </div>
          </section>
          <a className="scroll-cue" href="#quick-look"><span>往下看全部</span><ChevronDown /></a>
          <section className="quick-look" id="quick-look">
            <div className="section-heading"><p className="eyebrow">一眼看完</p><h2>景点和美食都在这里</h2></div>
            <div className="tile-grid">{picks.map((pick) => <article className="place-tile" key={pick.id}><img src={pick.image} alt="" /><div><span>{pick.area} · {pick.type}</span><h3>{pick.title}</h3><p>{pick.tip}</p><div className="tile-actions"><a href={`https://uri.amap.com/search?keyword=${encodeURIComponent(pick.title)}&city=${encodeURIComponent(pick.mapCity)}`} target="_blank" rel="noreferrer">地图</a><button aria-label={`收藏${pick.title}`} className={saved.includes(pick.id) ? 'selected' : ''} onClick={() => void setFavorite(pick.id, !saved.includes(pick.id))}><Heart size={18} fill={saved.includes(pick.id) ? 'currentColor' : 'none'} /></button></div></div></article>)}</div>
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

      <section className="source-note"><UtensilsCrossed /><p>资料参考贵州省博物馆、贵州省 A 级景区名录、万峰林景区官网和贵州广播电视台。小红书网页需登录才能读取搜索结果，站内保留了每个地点的精准搜索入口。</p></section>
      <footer>景观照片：Wikimedia Commons · Ryedamien / Philippe Semanaz · 美食图为原创生成</footer>
    </main>
  );
}
