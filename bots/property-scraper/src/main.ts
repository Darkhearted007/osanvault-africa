import { CheerioCrawler, log } from 'crawlee';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

log.setLevel(log.LEVELS.INFO);

const API_URL = process.env.OSANVAULT_API_URL || 'http://localhost:3001';
const QUEUE_SECRET = process.env.QUEUE_SECRET;

if (!QUEUE_SECRET) {
    log.error('QUEUE_SECRET environment variable is required');
    process.exit(1);
}

const propertyPipeline: unknown[] = [];

const PropertySchema = z.object({
    title: z.string(),
    location: z.string(),
    country: z.string(),
    total_value_usd: z.number(),
});

const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 20,

    async requestHandler({ $, request, enqueueLinks }) {
        const title = $('title').text();
        log.info(`Processing ${request.url} | Title: ${title}`);

        const listings = $('.single-room-sale');

        listings.each((_index, element) => {
            const card = $(element);

            const propertyTitle = card.find('.single-room-text > a > h3').text().trim() ||
                              card.find('.pro-title').text().trim();
            const location = card.find('.pro-location').text().trim();
            const priceRaw = card.find('.item-price').text().trim();

            const priceClean = priceRaw.replace(/[^0-9]/g, '');
            const priceNumber = parseInt(priceClean, 10);

            const imgElement = card.find('.single-room-img img');
            const imageUrl = imgElement.attr('src') || imgElement.attr('data-src');

            if (propertyTitle && priceNumber) {
                propertyPipeline.push({
                    title: propertyTitle,
                    location: location,
                    country: 'Nigeria',
                    original_currency: 'NGN',
                    raw_price: priceNumber,
                    total_value_usd: Math.round(priceNumber / 1500),
                    image_url: imageUrl,
                    scraped_at: new Date().toISOString(),
                    source_url: request.url,
                });
            }
        });

        await enqueueLinks({
            selector: '.pagination a',
            label: 'pagination',
        });
    },

    failedRequestHandler({ request }) {
        log.error(`Request ${request.url} failed twice.`);
    },
});

function signPayload(payload: unknown): string {
    return crypto
        .createHmac('sha256', QUEUE_SECRET!)
        .update(JSON.stringify(payload))
        .digest('hex');
}

async function ingestProperties(properties: unknown[]): Promise<{ success: boolean; ingested_count: number }> {
    const payload = JSON.stringify(properties);
    const signature = signPayload(properties);

    const response = await fetch(`${API_URL}/api/properties/ingest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-queue-signature': signature,
        },
        body: payload,
    });

    const result = await response.json() as { success?: boolean; ingested_count?: number };

    if (!response.ok) {
        throw new Error(`Ingestion failed: ${JSON.stringify(result)}`);
    }

    return { success: !!result.success, ingested_count: result.ingested_count ?? 0 };
}

async function main() {
    log.info('Starting ÒsánVault Africa Property Scraper...');
    log.info(`Target API: ${API_URL}`);

    await crawler.run(['https://www.propertypro.ng/property-for-sale/in/lagos']);

    log.info(`Scraping complete! Found ${propertyPipeline.length} properties.`);

    if (propertyPipeline.length === 0) {
        log.warning('No properties scraped — skipping ingestion.');
        return;
    }

    const outputPath = path.join(__dirname, '../scraped_properties.json');
    fs.writeFileSync(outputPath, JSON.stringify(propertyPipeline, null, 2));
    log.info(`Data saved to ${outputPath}`);

    if (propertyPipeline.length > 500) {
        log.warning(`Large batch (${propertyPipeline.length}) — consider running in smaller chunks.`);
    }

    try {
        const result = await ingestProperties(propertyPipeline);
        log.info(`Ingested ${result.ingested_count} properties.`);
    } catch (err) {
        log.error(`Ingestion failed: ${err}`);
    }
}

main().catch((err) => {
    log.error('Crawler failed', err);
    process.exit(1);
});