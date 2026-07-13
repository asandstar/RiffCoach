#!/usr/bin/env node

/**
 * RiffCoach Bilibili metadata synchronizer.
 *
 * 功能：
 * 1. 从 src/data/defaultData.ts 提取固定视频资源 id、当前标题和 BVID。
 * 2. 使用正常 Chromium 浏览器打开每个 B 站视频页面。
 * 3. 获取真实标题、简介、封面、选集名称、时长和 CID。
 * 4. 下载封面到 public/video-covers/。
 * 5. 生成 src/data/biliMetadata.generated.json。
 *
 * 说明：
 * - 本脚本不会绕过验证码或访问控制。
 * - 若 B 站显示验证页面，请在可见浏览器中正常完成验证，再重新运行。
 * - 默认使用可见浏览器，便于处理登录或验证。
 *
 * 安装：
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *
 * 运行：
 *   node riffcoach-bili-sync/sync-bili-metadata.mjs
 *
 * 可选环境变量：
 *   HEADLESS=1       无界面模式。默认 0。
 *   FORCE=1          强制重新下载已存在的封面。默认 0。
 *   DELAY_MS=3000    每个唯一 BVID 之间的等待时间。默认 2500。
 *   TIMEOUT_MS=45000 页面导航超时时间。默认 45000。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');

const DEFAULT_DATA_PATH = path.join(
  REPO_ROOT,
  'src/data/defaultData.ts',
);

const OUTPUT_JSON_PATH = path.join(
  REPO_ROOT,
  'src/data/biliMetadata.generated.json',
);

const COVER_DIR = path.join(
  REPO_ROOT,
  'public/video-covers',
);

const PROFILE_DIR = path.join(
  REPO_ROOT,
  '.cache/bili-sync-profile',
);

const HEADLESS = process.env.HEADLESS === '1';
const FORCE = process.env.FORCE === '1';

const DELAY_MS = parsePositiveInteger(
  process.env.DELAY_MS,
  2500,
);

const TIMEOUT_MS = parsePositiveInteger(
  process.env.TIMEOUT_MS,
  45000,
);

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanBilibiliTitle(value) {
  return normalizeText(value)
    .replace(/[_\-｜|]\s*哔哩哔哩.*$/u, '')
    .replace(/\s*-\s*bilibili.*$/iu, '')
    .trim();
}

function normalizeUrl(value) {
  const url = normalizeText(value);

  if (!url) {
    return '';
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  return url.replace(/^http:/i, 'https:');
}

function contentTypeToExtension(contentType) {
  const value = String(contentType ?? '').toLowerCase();

  if (value.includes('image/webp')) {
    return '.webp';
  }

  if (value.includes('image/png')) {
    return '.png';
  }

  if (value.includes('image/gif')) {
    return '.gif';
  }

  return '.jpg';
}

/**
 * 从 defaultVideoResources 区段中提取固定视频资源。
 */
function extractFixedVideos(source) {
  const start = source.indexOf('const baseVideoResources');

  if (start < 0) {
    throw new Error(
      'Could not find baseVideoResources in src/data/defaultData.ts',
    );
  }

  const section = source.slice(start);

  const itemPattern =
    /\bid:\s*['"](vid_[^'"]+)['"][\s\S]*?\btitle:\s*['"]([^'"]+)['"][\s\S]*?\bbvid:\s*['"](BV[A-Za-z0-9]{10})['"]/g;

  const videos = [];
  const seenIds = new Set();

  let match;

  while ((match = itemPattern.exec(section)) !== null) {
    const [, id, currentTitle, bvid] = match;

    if (seenIds.has(id)) {
      continue;
    }

    seenIds.add(id);

    videos.push({
      id,
      currentTitle: normalizeText(currentTitle),
      bvid,
      url: `https://www.bilibili.com/video/${bvid}`,
    });
  }

  if (videos.length === 0) {
    throw new Error(
      'No fixed Bilibili video resources were extracted.',
    );
  }

  return videos;
}

/**
 * 从 B 站页面读取标题、封面、简介和选集。
 */
async function readPageMetadata(page) {
  const metadata = await page.evaluate(() => {
    const getMeta = (...selectors) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        const content = element?.getAttribute('content');

        if (content) {
          return content;
        }
      }

      return '';
    };

    const initialState = window.__INITIAL_STATE__ || {};

    const videoData =
      initialState.videoData ||
      initialState.videoInfo ||
      initialState.video ||
      {};

    const rawPages = Array.isArray(videoData.pages)
      ? videoData.pages
      : Array.isArray(initialState.pages)
        ? initialState.pages
        : [];

    const pages = rawPages
      .map((item, index) => {
        const pageNumber = Number(
          item?.page ??
          item?.p ??
          index + 1,
        );

        const title = String(
          item?.part ??
          item?.title ??
          item?.name ??
          `P${pageNumber}`,
        )
          .replace(/\s+/g, ' ')
          .trim();

        const duration = Number(
          item?.duration ??
          item?.length ??
          0,
        );

        const cid = Number(
          item?.cid ??
          0,
        );

        return {
          page: pageNumber,
          title,
          duration:
            Number.isFinite(duration) && duration >= 0
              ? duration
              : 0,
          cid:
            Number.isFinite(cid) && cid > 0
              ? cid
              : null,
        };
      })
      .filter((item) => {
        return (
          Number.isInteger(item.page) &&
          item.page > 0
        );
      })
      .sort((a, b) => a.page - b.page);

    const heading =
      document.querySelector('h1.video-title')?.textContent ||
      document.querySelector('h1[title]')?.getAttribute('title') ||
      '';

    return {
      documentTitle: document.title,

      heading,

      ogTitle:
        videoData.title ||
        getMeta(
          'meta[property="og:title"]',
          'meta[name="title"]',
          'meta[itemprop="name"]',
        ),

      cover:
        videoData.pic ||
        videoData.cover ||
        getMeta(
          'meta[property="og:image"]',
          'meta[itemprop="image"]',
          'meta[name="thumbnail"]',
        ),

      description:
        videoData.desc ||
        getMeta(
          'meta[property="og:description"]',
          'meta[name="description"]',
        ),

      owner:
        videoData.owner?.name ||
        videoData.author ||
        '',

      pages,

      bodyPreview:
        document.body?.innerText?.slice(0, 800) ||
        '',
    };
  });

  return {
    title: cleanBilibiliTitle(
      metadata.ogTitle ||
      metadata.heading ||
      metadata.documentTitle,
    ),

    coverUrl: normalizeUrl(metadata.cover),

    description: normalizeText(
      metadata.description,
    ),

    owner: normalizeText(
      metadata.owner,
    ),

    pages: Array.isArray(metadata.pages)
      ? metadata.pages
      : [],

    bodyPreview: normalizeText(
      metadata.bodyPreview,
    ),
  };
}

function looksBlocked(metadata) {
  const haystack =
    `${metadata.title} ${metadata.bodyPreview}`
      .toLowerCase();

  return (
    haystack.includes('412') ||
    haystack.includes('访问异常') ||
    haystack.includes('请求被拦截') ||
    haystack.includes('precondition failed') ||
    haystack.includes('captcha') ||
    haystack.includes('安全验证')
  );
}

async function findExistingCover(bvid) {
  try {
    const files = await fs.readdir(COVER_DIR);

    const match = files.find((name) => {
      return name.startsWith(`${bvid}.`);
    });

    return match
      ? path.join(COVER_DIR, match)
      : null;
  } catch {
    return null;
  }
}

/**
 * 使用真实 Chromium 页面下载封面。
 *
 * Playwright 的 APIRequestContext 使用 Node 证书信任链，
 * 在代理、VPN 或 HTTPS 检查环境下可能报自签名证书错误。
 */
async function downloadCover(
  context,
  coverUrl,
  bvid,
  videoUrl,
) {
  if (!coverUrl) {
    return null;
  }

  const existing = await findExistingCover(bvid);

  if (existing && !FORCE) {
    return `/video-covers/${path.basename(existing)}`;
  }

  /*
   * B 站可能返回：
   * xxx.jpg@100w_100h_1c.png
   *
   * 去掉 @ 后面的图片处理参数，下载原始封面。
   */
  const originalCoverUrl = coverUrl.split('@')[0];

  const coverPage = await context.newPage();

  try {
    await coverPage.setExtraHTTPHeaders({
      Accept:
        'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      Referer: videoUrl,
    });

    const response = await coverPage.goto(
      originalCoverUrl,
      {
        waitUntil: 'commit',
        timeout: TIMEOUT_MS,
      },
    );

    if (!response) {
      throw new Error(
        'cover browser request returned no response',
      );
    }

    if (!response.ok()) {
      throw new Error(
        `cover browser HTTP ${response.status()}`,
      );
    }

    const contentType =
      response.headers()['content-type'] || '';

    if (
      !contentType
        .toLowerCase()
        .startsWith('image/')
    ) {
      throw new Error(
        `cover is not an image: ${
          contentType || 'unknown'
        }`,
      );
    }

    const extension =
      contentTypeToExtension(contentType);

    const fileName =
      `${bvid}${extension}`;

    const outputPath =
      path.join(COVER_DIR, fileName);

    await fs.writeFile(
      outputPath,
      await response.body(),
    );

    return `/video-covers/${fileName}`;
  } finally {
    await coverPage.close();
  }
}

async function main() {
  let chromium;

  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error(
      [
        'Playwright is not installed.',
        'Run:',
        '  npm install --save-dev playwright',
        '  npx playwright install chromium',
      ].join('\n'),
    );

    process.exitCode = 1;
    return;
  }

  const source = await fs.readFile(
    DEFAULT_DATA_PATH,
    'utf8',
  );

  const resources =
    extractFixedVideos(source);

  const uniqueByBvid = new Map();

  for (const resource of resources) {
    const list =
      uniqueByBvid.get(resource.bvid) || [];

    list.push(resource);

    uniqueByBvid.set(
      resource.bvid,
      list,
    );
  }

  await fs.mkdir(
    COVER_DIR,
    { recursive: true },
  );

  await fs.mkdir(
    path.dirname(OUTPUT_JSON_PATH),
    { recursive: true },
  );

  await fs.mkdir(
    PROFILE_DIR,
    { recursive: true },
  );

  console.log(
    `Extracted ${resources.length} records and ` +
    `${uniqueByBvid.size} unique BVIDs.`,
  );

  const context =
    await chromium.launchPersistentContext(
      PROFILE_DIR,
      {
        headless: HEADLESS,

        viewport: {
          width: 1440,
          height: 1000,
        },

        locale: 'zh-CN',

        /*
         * 只作用于这次本地同步使用的 Chromium。
         * 用于兼容代理、VPN 或 HTTPS 检查产生的证书链问题。
         */
        ignoreHTTPSErrors: true,
      },
    );

  context.setDefaultTimeout(
    TIMEOUT_MS,
  );

  const resultsByBvid = new Map();

  try {
    const page =
      context.pages()[0] ||
      await context.newPage();

    for (
      const [bvid, linkedResources]
      of uniqueByBvid.entries()
    ) {
      const videoUrl =
        `https://www.bilibili.com/video/${bvid}`;

      const resourceIds =
        linkedResources
          .map((item) => item.id)
          .join(', ');

      console.log(
        `\n[${bvid}] ${resourceIds}`,
      );

      const result = {
        bvid,
        url: videoUrl,
        status: 'failed',
        title: '',
        description: '',
        owner: '',
        coverUrl: '',
        coverPath: null,
        pages: [],
        error: null,
      };

      try {
        const response =
          await page.goto(
            videoUrl,
            {
              waitUntil: 'domcontentloaded',
              timeout: TIMEOUT_MS,
            },
          );

        /*
         * 给页面初始化数据一点加载时间。
         * window.__INITIAL_STATE__ 通常会在这段时间内可用。
         */
        await page.waitForTimeout(2500);

        const metadata =
          await readPageMetadata(page);

        if (looksBlocked(metadata)) {
          throw new Error(
            'Bilibili displayed a verification ' +
            'or blocked-access page. ' +
            'Complete any visible verification ' +
            'in the browser, then rerun.',
          );
        }

        if (!metadata.title) {
          throw new Error(
            'No title was found in the page metadata.',
          );
        }

        result.title =
          metadata.title;

        result.description =
          metadata.description;

        result.owner =
          metadata.owner;

        result.coverUrl =
          metadata.coverUrl;

        result.pages =
          metadata.pages;

        result.status =
          response?.ok() === false
            ? 'partial'
            : 'ok';

        if (metadata.coverUrl) {
          try {
            result.coverPath =
              await downloadCover(
                context,
                metadata.coverUrl,
                bvid,
                videoUrl,
              );
          } catch (error) {
            result.status = 'partial';

            result.error =
              `Title and episodes fetched; ` +
              `cover download failed: ${
                error instanceof Error
                  ? error.message
                  : String(error)
              }`;
          }
        } else {
          result.status = 'partial';

          result.error =
            'Title and episodes fetched; ' +
            'no cover URL was found.';
        }

        console.log(
          `Title: ${result.title}`,
        );

        console.log(
          `Owner: ${
            result.owner || 'unknown'
          }`,
        );

        console.log(
          `Cover: ${
            result.coverPath ||
            'not downloaded'
          }`,
        );

        console.log(
          `Episodes: ${result.pages.length}`,
        );

        for (const episode of result.pages) {
          console.log(
            `  P${episode.page}: ` +
            `${episode.title} ` +
            `(${episode.duration}s)`,
          );
        }
      } catch (error) {
        result.error =
          error instanceof Error
            ? error.message
            : String(error);

        console.warn(
          `Failed: ${result.error}`,
        );
      }

      resultsByBvid.set(
        bvid,
        result,
      );

      await sleep(DELAY_MS);
    }
  } finally {
    await context.close();
  }

  const videos = {};

  for (const resource of resources) {
    const fetched =
      resultsByBvid.get(resource.bvid);

    videos[resource.id] = {
      bvid: resource.bvid,
      url: resource.url,

      previousTitle:
        resource.currentTitle,

      title:
        fetched?.title ||
        resource.currentTitle,

      description:
        fetched?.description ||
        '',

      owner:
        fetched?.owner ||
        '',

      cover:
        fetched?.coverPath ||
        null,

      sourceCoverUrl:
        fetched?.coverUrl ||
        '',

      pages:
        fetched?.pages ||
        [],

      status:
        fetched?.status ||
        'failed',

      error:
        fetched?.error ||
        null,
    };
  }

  const duplicateBvids =
    Object.fromEntries(
      [...uniqueByBvid.entries()]
        .filter(([, entries]) => {
          return entries.length > 1;
        })
        .map(([bvid, entries]) => {
          return [
            bvid,
            entries.map((entry) => entry.id),
          ];
        }),
    );

  const output = {
    generatedAt:
      new Date().toISOString(),

    sourceFile:
      path.relative(
        REPO_ROOT,
        DEFAULT_DATA_PATH,
      ),

    recordCount:
      resources.length,

    uniqueBvidCount:
      uniqueByBvid.size,

    duplicateBvids,

    videos,
  };

  await fs.writeFile(
    OUTPUT_JSON_PATH,
    `${JSON.stringify(
      output,
      null,
      2,
    )}\n`,
    'utf8',
  );

  const values =
    Object.values(videos);

  const okCount =
    values.filter((item) => {
      return item.status === 'ok';
    }).length;

  const partialCount =
    values.filter((item) => {
      return item.status === 'partial';
    }).length;

  const failedCount =
    values.filter((item) => {
      return item.status === 'failed';
    }).length;

  console.log('\nDone.');

  console.log(
    `Metadata: ${
      path.relative(
        REPO_ROOT,
        OUTPUT_JSON_PATH,
      )
    }`,
  );

  console.log(
    `Covers:   ${
      path.relative(
        REPO_ROOT,
        COVER_DIR,
      )
    }/`,
  );

  console.log(
    `Results:  ok=${okCount}, ` +
    `partial=${partialCount}, ` +
    `failed=${failedCount}`,
  );

  if (failedCount > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
