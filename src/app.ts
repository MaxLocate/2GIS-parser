import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const BASE_URL = "https://catalog.api.2gis.com/3.0";
const PHOTO_URL = "https://api.photo.2gis.com/3.0";
const MARKET_URL = "https://market-backend.api.2gis.ru/5.0";
const REVIEWS_URL = "https://public-api.reviews.2gis.com/2.0";
const API_KEY = "8be06704-a318-43ab-8510-b5d8bce96239"; // Replace with your actual API key
const PHOTOS_KEY = "gYu1s9N1wP"; // Replace with your actual API key
const REVIEWS_KEY = "b0209295-ae15-48b2-acb2-58309b333c37"; // Replace with your actual API key

const INPUT_FILE = path.resolve(__dirname, '../city.json');
const OUTPUT_FILE = path.resolve(__dirname, '../city_full.json');

// Utility function: Log with timestamp
const log = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

// Utility function: Retry logic for fetch
const fetchWithRetries = async (url: string, retries = 3, delay = 1000): Promise<any> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            log(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
            }
        }
    }
};

// Utility function: Read JSON file and handle BOM
const cleanJSONFile = async (filePath: string): Promise<string> => {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1); // Remove BOM
        return content;
    } catch (error) {
        throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
};

// Utility function: Parse JSON safely
const parseJSONFile = async (filePath: string): Promise<any> => {
    try {
        const cleanedContent = await cleanJSONFile(filePath);
        return JSON.parse(cleanedContent);
    } catch (error) {
        throw new Error(`Error parsing JSON file ${filePath}: ${error.message}`);
    }
};

// Fetch details for an organization
const fetchOrganizationDetails = async (organizationId: string) => {
    try {
        const urls = {
            mainInfo: `${BASE_URL}/items/byid?id=${organizationId}&fields=items.name_ex,items.schedule,items.reviews,items.full_address_name,items.attribute_groups&key=${API_KEY}`,
            photos: `${PHOTO_URL}/objects/${organizationId}/albums/all/photos?locale=ru_KZ&key=${PHOTOS_KEY}&preview_size=656x340,328x170,232x232,176x176,116x116,88x88&page_size=20&search_ctx=0:r%3D946&search_keyword=%D0%91%D0%B0%D0%BD%D0%B8+%D0%B8+%D1%81%D0%B0%D1%83%D0%BD%D1%8B`,
            products: `${MARKET_URL}/product/items_by_branch?branch_id=${organizationId}&locale=ru_KZ&page=1&page_size=50`,
            reviews: `${REVIEWS_URL}/branches/${organizationId}/reviews?is_advertiser=true&fields=meta.branch_rating,meta.branch_reviews_count,meta.total_count&key=${REVIEWS_KEY}&locale=ru_KZ`,
        };

        const [mainInfo, photos, products, reviews] = await Promise.all([
            fetchWithRetries(urls.mainInfo),
            fetchWithRetries(urls.photos),
            fetchWithRetries(urls.products),
            fetchWithRetries(urls.reviews),
        ]);

        return {
            id: organizationId,
            mainInfo: mainInfo?.result?.items || null,
            photos: photos || null,
            products: products?.result || null,
            reviews: reviews?.reviews || null,
        };
    } catch (error) {
        log(`Error fetching details for organization ID ${organizationId}: ${error.message}`);
        return null;
    }
};

// Main function
const processOrganizations = async () => {
    try {
        const organizations = await parseJSONFile(INPUT_FILE);
        if (!Array.isArray(organizations)) {
            throw new Error('Input data must be an array of organizations.');
        }

        const totalOrganizations = organizations.length;
        log(`Found ${totalOrganizations} organizations in the input file.`);

        const updatedOrganizations = [];
        for (const [index, organization] of organizations.entries()) {
            const progress = `[${index + 1} of ${totalOrganizations}]`;

            const organizationId = organization.id.match(/^\d+/)?.[0];
            if (!organizationId) {
                log(`${progress} Skipping invalid organization entry: ${JSON.stringify(organization)}`);
                continue;
            }

            log(`${progress} Processing organization ID: ${organizationId}`);
            const details = await fetchOrganizationDetails(organizationId);
            updatedOrganizations.push({ ...organization, details });

            // Optional: Delay to respect API rate limits
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(updatedOrganizations, null, 2), 'utf-8');
        log(`Updated data saved to ${OUTPUT_FILE}`);
    } catch (error) {
        log(`Critical error during processing: ${error.message}`);
    }
};

// Run script
processOrganizations();
