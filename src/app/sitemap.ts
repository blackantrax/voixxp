import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.voixxp.com";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/studio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/clonage`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/conditions`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/remboursement`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
