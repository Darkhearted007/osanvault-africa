import { writeFileSync } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import axios from "axios";

const SITE_URL = "https://osanvaultafrica.com";

async function fetchDynamicContent() {
  const routes = [];
  const jsonldData = [];

  try {
    const res = await axios.get("https://api.osanvaultafrica.com/properties"); // Replace with your API
    for (const prop of res.data) {
      const slug = prop.slug || prop.id;
      const url = `/properties/${slug}`;
      routes.push({ url, changefreq: "weekly", priority: 0.9 });
      jsonldData.push({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": prop.name,
        "url": `${SITE_URL}${url}`,
        "description": prop.description || "",
        "image": prop.image || "",
        "brand": { "@type": "Organization", "name": "ÒsánVault Africa" },
        "offers": {
          "@type": "Offer",
          "price": prop.price || 0,
          "priceCurrency": "NGN",
          "url": `${SITE_URL}${url}`,
          "availability": "https://schema.org/InStock"
        }
      });
    }
  } catch (err) {
    console.error("⚠️ Property API fetch failed:", err.message);
  }

  return { routes, jsonldData };
}

export async function generateSEO() {
  try {
    const { routes, jsonldData } = await fetchDynamicContent();
    const stream = new SitemapStream({ hostname: SITE_URL });
    const sitemapXML = await streamToPromise(Readable.from(routes).pipe(stream));
    writeFileSync("public/sitemap.xml", sitemapXML.toString());
    console.log("✅ Sitemap generated at public/sitemap.xml");

    const jsonldScript = `<script type="application/ld+json">${JSON.stringify(jsonldData, null, 2)}</script>`;
    writeFileSync("public/jsonld.html", jsonldScript);
    console.log("✅ JSON-LD generated at public/jsonld.html");
  } catch (err) {
    console.error("❌ Error generating SEO:", err);
  }
}
