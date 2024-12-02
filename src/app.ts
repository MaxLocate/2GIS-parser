import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const cleanJSONFile = async (filePath: string): Promise<string> => {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        // Remove BOM if it exists
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        return content;
    } catch (error) {
        console.error(`Error reading the file: ${error.message}`);
        throw error;
    }
};

const parseJSONFile = async (filePath: string): Promise<any> => {
    try {
        const cleanedContent = await cleanJSONFile(filePath);
        return JSON.parse(cleanedContent);
    } catch (error) {
        console.error(`Error parsing JSON: ${error.message}`);
        throw error;
    }
};

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

// Utility function to fetch data from API
const fetchData = async (url: string): Promise<any> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch: ${url}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
};

// Step 2: Fetch details for an organization
const fetchOrganizationDetails = async (organizationId: string) => {
    try {
        // Fetch main info
        const mainInfoUrl = `${BASE_URL}/items/byid?id=${organizationId}&fields=items.name_ex,items.schedule,items.reviews,items.full_address_name,items.attribute_groups&key=${API_KEY}`;
        const mainInfo = await fetchData(mainInfoUrl);

        // Fetch photos
        const photosUrl = `${PHOTO_URL}/objects/${organizationId}/albums/all/photos?locale=ru_KZ&key=${PHOTOS_KEY}&preview_size=656x340,328x170,232x232,176x176,116x116,88x88&page_size=20&search_ctx=0:r%3D946&search_keyword=%D0%91%D0%B0%D0%BD%D0%B8+%D0%B8+%D1%81%D0%B0%D1%83%D0%BD%D1%8B`;
        const photos = await fetchData(photosUrl);

        // Fetch products
        const productsUrl = `${MARKET_URL}/product/items_by_branch?branch_id=${organizationId}&locale=ru_KZ&page=1&page_size=50`;
        const products = await fetchData(productsUrl);

        // Fetch reviews
        const reviewsUrl = `${REVIEWS_URL}/branches/${organizationId}/reviews?is_advertiser=true&fields=meta.branch_rating,meta.branch_reviews_count,meta.total_count&key=${REVIEWS_KEY}&locale=ru_KZ`;
        const reviews = await fetchData(reviewsUrl);

        return {
            id: organizationId,
            mainInfo: mainInfo?.result?.items || null,
            photos: photos || null,
            products: products?.result || null,
            reviews: reviews?.reviews || null,
        };
    } catch (error) {
        console.error(`Error fetching details for organization ID ${organizationId}:`, error);
        return null;
    }
};

// Main function
const processOrganizations = async () => {
    try {
        // Step 1: Read the input file
        const organizations = await parseJSONFile(INPUT_FILE);

        if (!Array.isArray(organizations)) {
            throw new Error('Invalid data format: expected an array of organizations.');
        }

        // Step 2: Process each organization
        for (const organization of organizations) {
            const organizationId = organization.id.match(/^\d+/)?.[0];
            if (!organizationId) {
                console.warn('Skipping organization without ID.');
                continue;
            }

            console.log(`Fetching details for organization ID: ${organizationId}`);
            // Save fetched details into the organization
            organization.details = await fetchOrganizationDetails(organizationId);

            // Optional: Add a delay between requests to avoid API rate limits
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Step 3: Save updated data back to a new file
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(organizations, null, 2), 'utf-8');
        console.log(`Updated data has been saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error processing organizations:', error);
    }
};

// Run the script
processOrganizations();
