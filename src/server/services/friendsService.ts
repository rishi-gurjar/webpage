import { sheets } from '../config';

type DailyFriend = {
  dateEt: string; // YYYY-MM-DD in America/New_York
  name: string | null;
  message: string;
};

const FRIENDS_SHEET_ID = process.env.FRIENDS_SHEET_ID || '';
const FRIENDS_RANGE = process.env.FRIENDS_RANGE || 'A2:A'; // names under header in col A

let currentDailyFriend: DailyFriend | null = null;
let lastPickedYmdEt: string | null = null;

function getNowEtParts(): { year: number; month: number; day: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const byType = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const year = Number(byType.year);
  const month = Number(byType.month);
  const day = Number(byType.day);
  const hour = Number(byType.hour);
  const minute = Number(byType.minute);
  return { year, month, day, hour, minute };
}

function ymd({ year, month, day }: { year: number; month: number; day: number }): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

async function fetchFriendNames(): Promise<string[]> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: FRIENDS_SHEET_ID,
      range: FRIENDS_RANGE,
    });
    const values = res.data.values || [];
    // Flatten first column values, trim, drop empties and header remnants
    const names = values
      .map(row => (row && row[0] ? String(row[0]).trim() : ''))
      .filter(Boolean);
    return names;
  } catch (e) {
    console.error('Failed to fetch friend from Sheets:', e);
    return [];
  }
}

function chooseRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

async function pickAndStoreDailyFriend(): Promise<DailyFriend> {
  const nowParts = getNowEtParts();
  const today = ymd(nowParts);
  const names = await fetchFriendNames();
  const name = chooseRandom(names);
  const messageName = name || 'someone you care about';
  const message = `You should reach out to ${messageName} today - just ask to hang out`;
  const pick = { dateEt: today, name, message };
  currentDailyFriend = pick;
  lastPickedYmdEt = today;
  console.log(`Daily friend picked for ${today} ET: ${name ?? 'N/A'}`);
  return pick;
}

export function getDailyFriend(): DailyFriend {
  if (currentDailyFriend) return currentDailyFriend;
  const nowParts = getNowEtParts();
  const today = ymd(nowParts);
  return {
    dateEt: today,
    name: null,
    message: 'Daily friend not picked yet for today. Check back soon.',
  };
}

export function scheduleDailyFriendPicker(): void {
  // Safety: pick immediately if after 12:00 ET and we have not picked today
  (async () => {
    try {
      const nowParts = getNowEtParts();
      const today = ymd(nowParts);
      if (nowParts.hour >= 12 && lastPickedYmdEt !== today) {
        await pickAndStoreDailyFriend();
      }
    } catch {}
  })();

  // Lightweight scheduler: check every 30 seconds for 12:00 ET
  setInterval(async () => {
    try {
      const nowParts = getNowEtParts();
      const today = ymd(nowParts);
      if (nowParts.hour === 12 && nowParts.minute === 0) {
        if (lastPickedYmdEt !== today) {
          await pickAndStoreDailyFriend();
        }
      }
    } catch (e) {
      console.error('friend scheduler error:', e);
    }
  }, 30 * 1000);
}


