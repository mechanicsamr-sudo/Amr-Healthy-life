import { DRAWINGS, PHOTOS, type MediaCredit } from "@/data/photos";
import { VIDEOS, type VideoRef } from "@/data/videos";

export interface ResolvedMedia {
  video?: VideoRef;
  photo?: { src: string; credit: MediaCredit };
  drawings?: [{ src: string; credit: MediaCredit }, { src: string; credit: MediaCredit }];
}

export function mediaFor(id: string): ResolvedMedia {
  return { video: VIDEOS[id], photo: PHOTOS[id]?.[0], drawings: DRAWINGS[id] };
}

export function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function ytEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
}

export function ytWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}
