// scripts/lib/seo.mjs
// 全站 SEO 的两个纯函数。存在的理由：
//   ① 标题：原来每页都挂 "| AI Website Style Gallery"（27 字符），42 个页面超出 SERP 的
//      60 字符上限，后半截被 Google 切掉。这里按优先级挑「放得下的最长一条」。
//   ② 描述：原来是硬切到第 N 个字符再补省略号，会断在词中间（"A structured pro…"）。
//      Google 会自己重写描述，但一条带省略号的摘要天然显得敷衍。改成优先在句号收尾。

export const SITE = 'https://www.aiwebstyle.com';
export const BRAND = 'AI Web Style';
// 旧站名。只在结构化数据里作为 WebSite.alternateName 出现：
//   标题和导航早就换成 BRAND 了，但 og:site_name / 页脚 / isPartOf 一直是旧名，
//   等于把「站点叫什么」这个信号劈成两半。保留成别名而不是删掉 —— 老外链和分享卡片
//   仍可能用旧名指过来，给它一个 alternateName 比直接抹掉更安全。
export const BRAND_ALT = 'AI Website Style Gallery';
export const OG_DEFAULT = `${SITE}/img/og/default.jpg`;

/** 描述文本：≤max 原样返回；否则先找句末，再退到词边界，都不补省略号 */
export function clipMeta(text, max = 158) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const window = s.slice(0, max);
  const sentence = window.match(/^[\s\S]*[.!?](?=\s|$)/);
  if (sentence && sentence[0].trim().length >= 90) return sentence[0].trim();
  const word = window.replace(/[\s,;:–—-]+\S*$/, '').replace(/[\s,;:–—-]+$/, '');
  return (word || window).trim();
}

/** 标题：按顺序取第一条不超过 max 的；都超了取最短的那条（至少是完整语义） */
export function fitTitle(candidates, max = 60) {
  const list = (Array.isArray(candidates) ? candidates : [candidates]).filter(Boolean);
  if (!list.length) return '';
  for (const t of list) if (t.length <= max) return t;
  return list.reduce((a, b) => (b.length < a.length ? b : a), list[0]);
}
