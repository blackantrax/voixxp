import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/compte", "/connexion", "/auth/", "/merci", "/paiement"] },
    sitemap: "https://www.voixxp.com/sitemap.xml",
  };
}
