// scripts/lib/validate.mjs
// 数据层守卫：在生成任何页面之前，先把 data/ 下的内容检查一遍。
//
// 为什么需要它：
//   1) 漏字段不会报错，只会在生成器里变成 TypeError: Cannot read properties of undefined
//      （对比页就因为 5 个 JSON 缺 cssDelta 而中断，只生成了 6 页）
//   2) 字段名打错（cssDeltas / notices）不会报错，会被静默忽略，页面少一块内容
//   3) 配方里 {{TOKEN}} 与控件不对应，下拉框能选但正文不变，肉眼看不出来
//   4) 内容里粘了中文、留了 TODO，纯英文站守卫只管 HTML，管不到 JSON
//
// 用法（生成器里）：
//   import { Report, assertClean, validateCompares } from './lib/validate.mjs';
//   const rep = new Report('compares');
//   validateCompares(list, { previewIds, recipeSlugs }, rep);
//   assertClean(rep);
//
// 本模块是纯函数，不读文件、不管 cwd，方便在生成器和 CLI 里复用。

/* ---------- 问题收集 ---------- */

export class Report {
    constructor(label) {
        this.label = label;
        this.items = [];
    }

    error(where, msg) {
        this.items.push({ level: 'error', where, msg });
        return this;
    }

    warn(where, msg) {
        this.items.push({ level: 'warn', where, msg });
        return this;
    }

    get errors() {
        return this.items.filter((i) => i.level === 'error');
    }

    get warnings() {
        return this.items.filter((i) => i.level === 'warn');
    }

    print() {
        const lines = [];
        for (const i of this.errors) lines.push(`  ✗ ${i.where} — ${i.msg}`);
        for (const i of this.warnings) lines.push(`  ! ${i.where} — ${i.msg}`);
        if (lines.length) console.log(lines.join('\n'));
    }
}

/** 有 error 就退出构建；只有 warn 时打印但继续 */
export function assertClean(rep, { quiet = false } = {}) {
    if (rep.items.length && !quiet) rep.print();
    if (rep.errors.length) {
        console.error(
            `\n✗ ${rep.label} 数据校验失败：${rep.errors.length} 个错误` +
                (rep.warnings.length ? `，${rep.warnings.length} 个提醒` : '') +
                '\n  修好 data/ 里的内容再跑构建，不要绕过。\n'
        );
        process.exit(1);
    }
    return rep.errors.length + rep.warnings.length;
}

/* ---------- 类型说明符 ---------- */

export const T = {
    /** 普通文本。min 是提醒阈值，低于其 60% 视为错误（明显是占位/截断） */
    text: (opts = {}) => ({ kind: 'text', ...opts }),
    /** kebab-case 标识 */
    slug: (opts = {}) => ({ kind: 'slug', ...opts }),
    /** 整数 */
    int: (opts = {}) => ({ kind: 'int', ...opts }),
    /** 数字（允许小数，用于分钟数这类） */
    num: (opts = {}) => ({ kind: 'num', ...opts }),
    /** 布尔 */
    bool: (opts = {}) => ({ kind: 'bool', ...opts }),
    /** 枚举 */
    oneOf: (values, opts = {}) => ({ kind: 'oneOf', values, ...opts }),
    /** 数组 */
    list: (of, opts = {}) => ({ kind: 'list', of, ...opts }),
    /** 对象 */
    obj: (fields, opts = {}) => ({ kind: 'obj', fields, ...opts }),
};

const CJK = /[\u4e00-\u9fff]/;
const PLACEHOLDER = /\b(TODO|TBD|FIXME|lorem ipsum|xxx+)\b/i;
const TOKEN = /\{\{(\w+)\}\}/g;

const isBlank = (v) =>
    v === undefined ||
    v === null ||
    (typeof v === 'string' && v.trim() === '') ||
    (Array.isArray(v) && v.length === 0);

/* ---------- 单值校验 ---------- */

function check(value, spec, where, rep) {
    if (isBlank(value)) {
        if (spec.required !== false) rep.error(where, '缺少必填内容');
        return;
    }

    switch (spec.kind) {
        case 'text': {
            if (typeof value !== 'string') {
                rep.error(where, `应该是字符串，实际是 ${Array.isArray(value) ? 'array' : typeof value}`);
                return;
            }
            const v = value.trim();
            const len = v.length;

            if (spec.template || spec.mayMentionPlaceholder) {
                // 给模型的指令里会出现 “No lorem ipsum” 这类句子，只拦整值就是占位符的情况
                if (/^(TODO|TBD|FIXME|lorem ipsum|xxx+)$/i.test(v)) {
                    rep.error(where, '整段就是占位文本');
                }
            } else {
                if (PLACEHOLDER.test(v)) rep.error(where, '含占位文本（TODO / TBD / lorem ipsum）');
            }
            if (!spec.template) {
                const m = v.match(/\{\{\w+\}\}/);
                if (m) rep.error(where, `残留模板占位符 ${m[0]}（这个字段不参与变量替换）`);
            }
            if (spec.english !== false && CJK.test(v)) {
                rep.error(where, `英文站字段里出现中文：“${v.match(CJK) ? v.slice(0, 24) : ''}…”`);
            }
            if (spec.includes !== undefined) {
                const need = Array.isArray(spec.includes) ? spec.includes : [spec.includes];
                for (const n of need) {
                    if (!v.includes(n)) rep.error(where, `必须包含 “${n}”`);
                }
            }
            if (spec.startsWith && !v.startsWith(spec.startsWith)) {
                rep.error(where, `应以 “${spec.startsWith}” 开头，实际是 “${v.slice(0, 40)}”`);
            }
            if (spec.min !== undefined) {
                if (len < Math.floor(spec.min * 0.6)) {
                    rep.error(where, `只有 ${len} 字符，明显不完整（预期 ≥ ${spec.min}）`);
                } else if (len < spec.min) {
                    rep.warn(where, `${len} 字符，偏短（参考值 ≥ ${spec.min}）`);
                }
            }
            if (spec.max !== undefined && len > spec.max) {
                rep.warn(where, `${len} 字符，超出建议上限 ${spec.max}`);
            }
            break;
        }

        case 'slug': {
            if (typeof value !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
                rep.error(where, `应为 kebab-case 标识，实际是 “${value}”`);
            }
            break;
        }

        case 'int': {
            if (!Number.isInteger(value)) {
                rep.error(where, `应为整数，实际是 “${value}”`);
            } else if (spec.min !== undefined && value < spec.min) {
                rep.error(where, `${value} 小于最小值 ${spec.min}`);
            }
            break;
        }

        case 'num': {
            if (typeof value !== 'number' || !Number.isFinite(value)) {
                rep.error(where, `应为数字，实际是 “${value}”`);
            } else if (spec.min !== undefined && value < spec.min) {
                rep.error(where, `${value} 小于最小值 ${spec.min}`);
            }
            break;
        }

        case 'bool': {
            if (typeof value !== 'boolean') {
                rep.error(where, `应为 true/false，实际是 “${value}”`);
            }
            break;
        }

        case 'oneOf': {
            if (!spec.values.includes(value)) {
                rep.error(where, `“${value}” 不在允许值内：${spec.values.join(' / ')}`);
            }
            break;
        }

        case 'list': {
            if (!Array.isArray(value)) {
                rep.error(where, `应为数组，实际是 ${typeof value}`);
                return;
            }
            if (spec.min !== undefined && value.length < spec.min) {
                rep.error(where, `只有 ${value.length} 项，至少需要 ${spec.min} 项`);
            }
            if (spec.max !== undefined && value.length > spec.max) {
                rep.warn(where, `${value.length} 项，超出建议上限 ${spec.max}`);
            }
            value.forEach((v, i) => check(v, spec.of, `${where}[${i}]`, rep));

            if (spec.uniqueBy) {
                const seen = new Map();
                value.forEach((v, i) => {
                    const k = spec.uniqueBy(v);
                    if (k === undefined || k === null) return;
                    if (seen.has(k)) {
                        rep.error(`${where}[${i}]`, `“${k}” 与第 ${seen.get(k) + 1} 项重复`);
                    } else {
                        seen.set(k, i);
                    }
                });
            }
            break;
        }

        case 'obj': {
            if (typeof value !== 'object' || Array.isArray(value)) {
                rep.error(where, `应为对象，实际是 ${Array.isArray(value) ? 'array' : typeof value}`);
                return;
            }
            for (const [k, s] of Object.entries(spec.fields)) {
                check(value[k], s, `${where}.${k}`, rep);
            }
            if (spec.strict !== false) {
                for (const k of Object.keys(value)) {
                    if (k in spec.fields) continue;
                    const near = closest(k, Object.keys(spec.fields));
                    rep.warn(
                        `${where}.${k}`,
                        near ? `未知字段，是不是想写 “${near}”？` : '未知字段，会被生成器忽略'
                    );
                }
            }
            break;
        }
    }
}

/* ---------- 拼写建议 ---------- */

function distance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return dp[m][n];
}

function closest(word, candidates) {
    let best = null;
    let bestD = Infinity;
    for (const c of candidates) {
        const d = distance(word.toLowerCase(), c.toLowerCase());
        if (d < bestD) {
            bestD = d;
            best = c;
        }
    }
    return bestD <= 3 ? best : null;
}

/* ---------- 集合级通用校验 ---------- */

function validateList({ label, items, schema, key, rep, orderUnique = true }) {
    if (!Array.isArray(items)) {
        rep.error(label, '应为数组');
        return;
    }
    if (!items.length) rep.error(label, '集合为空');

    const seenKey = new Map();
    const seenOrder = new Map();

    items.forEach((item, i) => {
        const id = item?.[key] ?? item?.styleId ?? item?.id;
        const where = id ? `${label}[${id}]` : `${label}[${i}]`;

        check(item, schema, where, rep);

        if (id !== undefined) {
            if (seenKey.has(id)) rep.error(where, `标识 “${id}” 与第 ${seenKey.get(id) + 2} 条重复`);
            else seenKey.set(id, i);
        }
        if (orderUnique && Number.isInteger(item?.order)) {
            if (seenOrder.has(item.order)) {
                rep.error(where, `order=${item.order} 与 “${seenOrder.get(item.order)}” 冲突`);
            } else {
                seenOrder.set(item.order, id ?? i);
            }
        }
    });
}

/* ---------- 各集合的 schema ---------- */

const STYLE_SCHEMA = T.obj({
    id: T.slug({ required: true }),
    slug: T.slug({ required: true }),
    name: T.obj({ en: T.text({ required: true, min: 2, max: 60 }) }),
    description: T.obj({ en: T.text({ required: true, min: 20, max: 260 }) }),
    prompt: T.obj({ en: T.text({ required: true, min: 120 }) }),
    summaryLong: T.text({ required: true, min: 150 }),
    summaryKey: T.text({ required: false }),
    // 少数老风格的下载包改名过（如 maximalism-collage.zip），用这个字段登记例外
    zipFile: T.text({ required: false, min: 3 }),
    isNew: T.bool({ required: false }),
});

const PREVIEW_SCHEMA = T.obj({
    styleId: T.slug({ required: true }),
    name: T.text({ required: true, min: 2, max: 60 }),
    blurb: T.text({ required: true, min: 40, max: 200 }),
    standalone: T.bool({ required: true }),
    analysis: T.text({ required: true, min: 300 }),
    notice: T.list(T.text({ required: true, min: 20, max: 140 }), {
        required: true,
        min: 3,
        max: 5,
    }),
    breaks: T.text({ required: true, min: 90 }),
    tech: T.text({ required: true, min: 25, includes: '·' }),
});

const MOTION_SCHEMA = T.obj({
    slug: T.slug({ required: true }),
    name: T.text({ required: true, min: 2, max: 60 }),
    trigger: T.oneOf(['load', 'scroll', 'cursor', 'interaction', 'navigation'], {
        required: true,
    }),
    tech: T.text({ required: true, min: 5, english: true }),
    summary: T.text({ required: true, min: 80 }),
    order: T.int({ required: true, min: 1 }),
    status: T.oneOf(['published', 'draft'], { required: true }),
    updatedAt: T.text({ required: true, min: 8 }),
    zh: T.text({ required: false, english: false }),
    summaryZh: T.text({ required: false, english: false }),
});

const RECIPE_SCHEMA = T.obj({
    slug: T.slug({ required: true }),
    name: T.text({ required: true, min: 2, max: 60 }),
    category: T.oneOf(['marketing', 'personal', 'commerce', 'app', 'content'], {
        required: true,
    }),
    order: T.int({ required: true, min: 1 }),
    status: T.oneOf(['published', 'draft'], { required: false }),
    updatedAt: T.text({ required: true, min: 8 }),
    readingTime: T.num({ required: false, min: 1 }),
    summary: T.text({ required: true, min: 100 }),
    lede: T.text({ required: true, min: 150 }),
    brief: T.list(T.text({ required: true, min: 180 }), { required: true, min: 2 }),
    sections: T.list(
        T.obj({
            name: T.text({ required: true, min: 2, max: 60 }),
            why: T.text({ required: true, min: 60 }),
        }),
        { required: true, min: 5, uniqueBy: (s) => s?.name }
    ),
    // 空字符串是合法的段落分隔，模板本来就靠空行组织；非空行才做文本检查
    promptLines: T.list(T.text({ required: false, template: true, min: 1 }), {
        required: true,
        min: 10,
    }),
    controls: T.list(
        T.obj({
            id: T.text({ required: true, min: 2, max: 30 }),
            label: T.text({ required: true, min: 3 }),
            options: T.list(
                T.obj({
                    label: T.text({ required: true, min: 1 }),
                    // 选项值会拼进 prompt，属于指令文本，允许提到 “lorem ipsum”
                    value: T.text({ required: true, min: 1, mayMentionPlaceholder: true }),
                    hint: T.text({ required: false, min: 5, mayMentionPlaceholder: true }),
                }),
                { required: true, min: 2 }
            ),
        }),
        { required: true, min: 3, uniqueBy: (c) => c?.id }
    ),
    change: T.list(
        T.obj({
            token: T.text({ required: true, min: 2 }),
            note: T.text({ required: true, min: 60 }),
        }),
        { required: true, min: 3 }
    ),
    builders: T.list(
        T.obj({
            name: T.text({ required: true, min: 2, max: 40 }),
            note: T.text({ required: true, min: 60 }),
        }),
        { required: true, min: 3, uniqueBy: (b) => b?.name }
    ),
    failures: T.list(
        T.obj({
            title: T.text({ required: true, min: 5, max: 80 }),
            body: T.text({ required: true, min: 100 }),
        }),
        { required: true, min: 3 }
    ),
    styles: T.list(T.slug({ required: true }), { required: true, min: 1 }),
    motions: T.list(T.slug({ required: true }), { required: true, min: 1 }),
});

const COMPARE_SCHEMA = T.obj({
    slug: T.slug({ required: true }),
    a: T.slug({ required: true }),
    b: T.slug({ required: true }),
    title: T.text({ required: true, min: 5, max: 80 }),
    order: T.int({ required: true, min: 1 }),
    status: T.oneOf(['published', 'draft'], { required: false }),
    updatedAt: T.text({ required: true, min: 8 }),
    lede: T.text({ required: true, min: 90 }),
    verdict: T.text({ required: true, min: 120 }),
    brief: T.list(T.text({ required: true, min: 150 }), { required: true, min: 2 }),
    dimensions: T.list(
        T.obj({
            name: T.text({ required: true, min: 3, max: 60 }),
            a: T.text({ required: true, min: 1 }),
            b: T.text({ required: true, min: 1 }),
            edge: T.oneOf(['a', 'b', 'tie'], { required: true }),
        }),
        { required: true, min: 4, uniqueBy: (d) => d?.name }
    ),
    cssDelta: T.list(
        T.obj({
            label: T.text({ required: true, min: 3, max: 60 }),
            a: T.text({ required: true, min: 1 }),
            b: T.text({ required: true, min: 1 }),
        }),
        { required: true, min: 3, uniqueBy: (d) => d?.label }
    ),
    whenA: T.list(T.text({ required: true, min: 45 }), { required: true, min: 2 }),
    whenB: T.list(T.text({ required: true, min: 45 }), { required: true, min: 2 }),
    promptDelta: T.text({ required: true, min: 300 }),
    recipes: T.list(T.slug({ required: true }), { required: false }),
});

const NEW_STYLE_SCHEMA = T.obj({
    id: T.slug({ required: true }),
    name: T.text({ required: true, min: 2, max: 60 }),
    tagline: T.text({ required: true, min: 40 }),
    summary: T.text({ required: true, min: 30 }),
    longDescription: T.list(T.text({ required: true, min: 180 }), { required: true, min: 2 }),
    features: T.list(
        T.obj({
            title: T.text({ required: true, min: 4, max: 80 }),
            detail: T.text({ required: true, min: 40 }),
        }),
        { required: true, min: 3, uniqueBy: (f) => f?.title }
    ),
    prompt: T.text({ required: true, min: 500 }),
    tokens: T.list(T.text({ required: true, min: 4 }), { required: true, min: 3 }),
    themeCss: T.text({ required: true, min: 80, startsWith: `body.theme-` }),
    cssNote: T.text({ required: true, min: 80 }),
    whenToUse: T.list(T.text({ required: true, min: 30 }), { required: true, min: 2 }),
    whenNot: T.list(T.text({ required: true, min: 30 }), { required: true, min: 2 }),
    cardCss: T.text({ required: true, min: 60, includes: 'data-style-id=' }),
});

/* ---------- 对外校验入口 ---------- */

export function validateStyles(styles, rep) {
    validateList({
        label: 'styles',
        items: styles,
        schema: STYLE_SCHEMA,
        key: 'id',
        rep,
        orderUnique: false,
    });
    for (const s of styles || []) {
        if (s?.id && s?.slug && s.id !== s.slug) {
            rep.error(`styles[${s.id}]`, `slug “${s.slug}” 与 id 不一致，详情页链接会指向不存在的文件`);
        }
    }
}

export function validatePreviews(previews, { styleIds } = {}, rep) {
    validateList({
        label: 'previews',
        items: previews,
        schema: PREVIEW_SCHEMA,
        key: 'styleId',
        rep,
        orderUnique: false,
    });

    for (const p of previews || []) {
        const where = `previews[${p?.styleId}]`;
        if (styleIds && p?.styleId && !styleIds.has(p.styleId)) {
            rep.error(where, `previews 里有这一条，但 styles.json 里没有对应风格`);
        }
        if (Array.isArray(p?.notice) && p.notice.length !== 3) {
            rep.warn(where, `notice 有 ${p.notice.length} 条，页面按 3 条排版`);
        }
        // 英文标题与风格名应一致，否则对比页上同一个风格会有两个名字
        if (p?.tech && !/·/.test(p.tech)) {
            rep.warn(where, 'tech 建议用 “ · ” 分隔，页面按这个符号断行');
        }
    }
}

export function validateMotions(motions, rep) {
    validateList({
        label: 'motions',
        items: motions,
        schema: MOTION_SCHEMA,
        key: 'slug',
        rep,
    });
}

export function validateRecipes(recipes, { styleIds, motionSlugs } = {}, rep) {
    validateList({
        label: 'recipes',
        items: recipes,
        schema: RECIPE_SCHEMA,
        key: 'slug',
        rep,
    });

    for (const r of recipes || []) {
        const where = `recipes[${r?.slug}]`;
        const lines = Array.isArray(r?.promptLines) ? r.promptLines.join('\n') : '';
        const tokens = new Set([...lines.matchAll(TOKEN)].map((m) => m[1]));
        const ids = new Set((r?.controls || []).map((c) => c?.id).filter(Boolean));

        // 空行不算内容：一份只有空行的 prompt 也能凑够 10 项
        const filled = (r?.promptLines || []).filter((l) => String(l).trim()).length;
        if (filled < 10) {
            rep.error(`${where}.promptLines`, `去掉空行后只剩 ${filled} 行，prompt 不完整`);
        }

        // 这一条是真的踩过：控件在、能选，但正文不变
        for (const t of tokens) {
            if (!ids.has(t)) {
                rep.error(
                    `${where}.promptLines`,
                    `模板变量 {{${t}}} 没有对应控件，用户无法修改它`
                );
            }
        }
        for (const id of ids) {
            if (!tokens.has(id)) {
                rep.error(
                    `${where}.controls`,
                    `控件 “${id}” 没有出现在 promptLines 里，改了它正文不会变`
                );
            }
        }

        // change 段落解释的是哪个控件
        for (const [i, c] of (r?.change || []).entries()) {
            if (c?.token && ids.size && !ids.has(c.token)) {
                rep.warn(`${where}.change[${i}]`, `token “${c.token}” 不是任何控件的 id`);
            }
        }

        for (const [i, c] of (r?.controls || []).entries()) {
            const vals = (c?.options || []).map((o) => o?.value);
            if (new Set(vals).size !== vals.length) {
                rep.error(`${where}.controls[${i}]`, '选项有重复 value，选中后视觉上无差别');
            }
            if (c?.id && !/^[A-Z][A-Z0-9_]*$/.test(c.id)) {
                rep.warn(`${where}.controls[${i}]`, `控件 id 建议用大写下划线：${c.id}`);
            }
        }

        for (const s of r?.styles || []) {
            if (styleIds && !styleIds.has(s)) {
                rep.error(`${where}.styles`, `引用了不存在的风格 “${s}”`);
            }
        }
        for (const m of r?.motions || []) {
            if (motionSlugs && !motionSlugs.has(m)) {
                rep.error(`${where}.motions`, `引用了不存在的动效 “${m}”`);
            }
        }
    }
}

export function validateCompares(compares, { previewIds, recipeSlugs } = {}, rep) {
    validateList({
        label: 'compares',
        items: compares,
        schema: COMPARE_SCHEMA,
        key: 'slug',
        rep,
    });

    for (const c of compares || []) {
        const where = `compares[${c?.slug}]`;
        if (c?.a && c?.b && c.a === c.b) {
            rep.error(where, 'a 与 b 是同一个风格，对比没有意义');
        }
        for (const side of ['a', 'b']) {
            if (previewIds && c?.[side] && !previewIds.has(c[side])) {
                rep.error(where, `${side} 指向的 “${c[side]}” 没有对应预览页，iframe 会 404`);
            }
        }
        for (const r of c?.recipes || []) {
            if (recipeSlugs && !recipeSlugs.has(r)) {
                rep.error(`${where}.recipes`, `引用了不存在的配方 “${r}”`);
            }
        }
        // 同一对风格不应出现两次（顺序无关）
        const dims = new Set();
        for (const [i, d] of (c?.dimensions || []).entries()) {
            const k = String(d?.name || '').toLowerCase();
            if (dims.has(k)) rep.error(`${where}.dimensions[${i}]`, `维度 “${d.name}” 重复`);
            dims.add(k);
        }
    }

    const pairs = new Map();
    for (const c of compares || []) {
        if (!c?.a || !c?.b) continue;
        const k = [c.a, c.b].sort().join('|');
        if (pairs.has(k)) rep.error(`compares[${c.slug}]`, `与 “${pairs.get(k)}” 是同一对风格`);
        else pairs.set(k, c.slug);
    }
}

export function validateNewStyles(list, rep) {
    validateList({
        label: 'new-styles',
        items: list,
        schema: NEW_STYLE_SCHEMA,
        key: 'id',
        rep,
        orderUnique: false,
    });

    for (const s of list || []) {
        const where = `new-styles[${s?.id}]`;
        if (s?.id && s?.themeCss && !s.themeCss.trimStart().startsWith(`body.theme-${s.id}`)) {
            rep.error(where, `themeCss 必须以 body.theme-${s.id} 开头，否则全站换肤不会生效`);
        }
        if (s?.id && s?.cardCss && !s.cardCss.includes(`data-style-id="${s.id}"`)) {
            rep.error(where, `cardCss 没有选中 [data-style-id="${s.id}"]，首页卡片不会有样式`);
        }
        // tokens 主要是「键: 值」形式，用来在详情页展示关键参数
        const toks = (s?.tokens || []).filter((t) => String(t).includes(':')).length;
        if (s?.tokens?.length && toks * 2 < s.tokens.length) {
            rep.warn(where, `tokens 里只有 ${toks} 条是 “键: 值” 形式，其余可能写成句子了`);
        }
    }
}
