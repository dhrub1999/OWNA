import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything behind auth. None of it is reachable to a crawler anyway —
      // the proxy redirects — but saying so avoids wasted crawl budget on
      // redirect chains.
      disallow: [
        "/dashboard",
        "/editor",
        "/settings",
        "/preview",
        "/onboarding",
        "/auth/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
