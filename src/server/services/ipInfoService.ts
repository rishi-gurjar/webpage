import https from 'https';

export type IpInfo = { isp?: string; country?: string; region?: string; city?: string };

function decodeEntities(input?: string): string {
  return (input || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseInfoFromHtml(html: string): IpInfo {
  const infoMap: Record<string, string> = {};
  const rowRe = /<p class="information">\s*<span>([^<:]+):<\/span>\s*<span>([\s\S]*?)<\/span>\s*<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(html)) !== null) {
    const label = decodeEntities(match[1]);
    const value = decodeEntities(match[2].replace(/<[^>]*>/g, ''));
    if (label) infoMap[label] = value;
  }
  return {
    isp: infoMap['ISP'],
    country: infoMap['Country'],
    region: infoMap['State/Region'],
    city: infoMap['City'],
  };
}

async function fetchFromIpwho(ip: string): Promise<IpInfo | null> {
  return await new Promise<IpInfo | null>((resolve) => {
    const req = https.request({
      hostname: 'ipwho.is',
      path: `/${encodeURIComponent(ip)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json && json.success !== false) {
            const info: IpInfo = {
              city: json.city,
              region: json.region,
              country: json.country,
              isp: json.connection?.isp || json.connection?.org,
            };
            if (info.city || info.region || info.country || info.isp) return resolve(info);
          }
        } catch {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(7000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}

async function fetchFromIpapiCo(ip: string): Promise<IpInfo | null> {
  return await new Promise<IpInfo | null>((resolve) => {
    const req = https.request({
      hostname: 'ipapi.co',
      path: `/${encodeURIComponent(ip)}/json/`,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (!json || json.error) return resolve(null);
          const info: IpInfo = {
            city: json.city,
            region: json.region,
            country: json.country_name,
            isp: json.org || json.asn?.name,
          };
          if (info.city || info.region || info.country || info.isp) return resolve(info);
        } catch {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(7000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}

export async function fetchIpInfo(ip: string): Promise<IpInfo> {
  // Prefer public JSON APIs to avoid anti-bot walls
  const a = await fetchFromIpwho(ip);
  if (a) return a;
  const b = await fetchFromIpapiCo(ip);
  if (b) return b;

  // Fallback: headless browser (puppeteer) to bypass interstitials
  // Lazy import so server can start without puppeteer present
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });
    const page = await browser.newPage();
    // Use a common iPhone UA to better mimic mobile browser
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://whatismyipaddress.com/'
    });

    const url = `https://whatismyipaddress.com/ip/${encodeURIComponent(ip)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Simple anti-detection tweaks
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      // @ts-ignore
      window.chrome = { runtime: {} };
      // @ts-ignore
      navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ? Promise.resolve({ state: 'denied' }) : Promise.resolve({ state: 'prompt' })
      );
    });

    // If there's a CF page, wait a bit and reload once
    await page.waitForTimeout(2000);
    const content1 = await page.content();
    if (content1.includes('Just a moment')) {
      await page.waitForTimeout(4000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }

    // Wait for at least one information row or timeout
    await page.waitForSelector('p.information', { timeout: 8000 }).catch(() => {});
    const html = await page.content();
    const result = parseInfoFromHtml(html);
    await browser.close();
    return result;
  } catch (e) {
    // If puppeteer is not installed or fails, return empty
    return {};
  }
}
