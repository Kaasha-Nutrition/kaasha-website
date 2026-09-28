import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/data";

const BASE_URL = "https://www.kaasha.in";

function parsePostDate(d: string): Date {
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/sports-nutrition`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 }
  ];

  const blogRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: parsePostDate(p.date),
    changeFrequency: "yearly",
    priority: 0.5
  }));

  return [...staticRoutes, ...blogRoutes];
}
