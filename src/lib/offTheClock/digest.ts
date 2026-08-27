// Digest data now lives in digest.json (plain data, no TypeScript syntax) so
// the weekly automation script can overwrite it directly. This file just
// supplies the types and re-exports it as a typed constant for the app.

import digestData from "./digest.json";

export interface OtcPick {
  title: string;
  meta: string;
  body: string;
  link: string;
  linkLabel: string;
}

export interface OtcAlbumPick {
  artist: string;
  title: string;
  genre: string;
  body: string;
  link: string;
}

export interface OtcNewsItem {
  headline: string;
  tag: string;
  body: string;
  sourceName: string;
  sourceUrl: string;
}

export interface OtcDigest {
  week: string;
  dateRange: string;
  standfirst: string;
  movies: OtcPick[];
  albums: OtcAlbumPick[];
  tvPick: OtcPick;
  catchUp: OtcPick[];
  worldNews: OtcNewsItem[];
  auNews: OtcNewsItem[];
}

export const OTC_DIGEST: OtcDigest = digestData as OtcDigest;
