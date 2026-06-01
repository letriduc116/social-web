export type GiphyMediaKind = 'gif' | 'sticker';

export type GiphyMedia = {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width?: number;
  height?: number;
};

type GiphyImage = {
  url?: string;
  width?: string;
  height?: string;
};

type GiphyItem = {
  id?: string;
  title?: string;
  images?: {
    original?: GiphyImage;
    downsized?: GiphyImage;
    fixed_width?: GiphyImage;
    fixed_width_small?: GiphyImage;
    fixed_height_small?: GiphyImage;
  };
};

type GiphyResponse = {
  data?: GiphyItem[];
};

const GIPHY_API_BASE = 'https://api.giphy.com/v1';

export const getGiphyApiKey = () => String(import.meta.env.VITE_GIPHY_API_KEY || '').trim();

const toNumber = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toMedia = (item: GiphyItem, kind: GiphyMediaKind): GiphyMedia | null => {
  const original = item.images?.original || item.images?.downsized || item.images?.fixed_width;
  const preview = item.images?.fixed_width_small || item.images?.fixed_height_small || item.images?.fixed_width || original;
  const url = original?.url || preview?.url || '';
  const previewUrl = preview?.url || url;

  if (!item.id || !url || !previewUrl) return null;

  return {
    id: item.id,
    title: item.title || (kind === 'sticker' ? 'Sticker' : 'GIF'),
    url,
    previewUrl,
    width: toNumber(original?.width || preview?.width),
    height: toNumber(original?.height || preview?.height),
  };
};

export async function fetchGiphyMedia(kind: GiphyMediaKind, query: string): Promise<GiphyMedia[]> {
  const apiKey = getGiphyApiKey();

  if (!apiKey) {
    return [];
  }

  const collection = kind === 'sticker' ? 'stickers' : 'gifs';
  const normalizedQuery = query.trim();
  const endpoint = normalizedQuery ? 'search' : 'trending';
  const url = new URL(`${GIPHY_API_BASE}/${collection}/${endpoint}`);

  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('limit', '24');
  url.searchParams.set('rating', 'g');
  url.searchParams.set('lang', 'vi');

  if (normalizedQuery) {
    url.searchParams.set('q', normalizedQuery);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Không tải được ${kind === 'sticker' ? 'sticker' : 'GIF'} từ GIPHY`);
  }

  const payload = (await response.json()) as GiphyResponse;
  return (payload.data || [])
    .map((item) => toMedia(item, kind))
    .filter((item): item is GiphyMedia => Boolean(item));
}
