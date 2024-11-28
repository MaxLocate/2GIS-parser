import {writeFile} from "fs/promises";
import fs from "fs";
import path from "path";

// Constants
const BASE_URL = "https://catalog.api.2gis.com/3.0";
const PHOTO_URL = "https://api.photo.2gis.com/3.0";
const MARKET_URL = "https://market-backend.api.2gis.ru/5.0";
const REVIEWS_URL = "https://public-api.reviews.2gis.com/2.0";
const API_KEY = "8be06704-a318-43ab-8510-b5d8bce96239"; // Replace with your actual API key
const PHOTOS_KEY = "gYu1s9N1wP"; // Replace with your actual API key
const REVIEWS_KEY = "b0209295-ae15-48b2-acb2-58309b333c37"; // Replace with your actual API key

// Load the JSON file
const inputFilePath = path.resolve(__dirname, "organizations.json");
const outputFilePath = path.resolve(__dirname, "organizations.csv");

const convertJsonToCsv = async () => {
    try {
        // Read the JSON file
        const data = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));

        // Define the CSV headers
        const headers = [
            "ID",
            "Name",
            "Primary Category",
            "Address",
            "Rating",
            "Review Count",
            "Attributes",
            "Schedule",
            "Photo Count",
        ];

        // Process each organization and structure data for CSV
        const rows = data.map((org: any) => {
            const mainInfo = org.mainInfo[0] || {};
            const photos = org.photos?.albums || [];
            const attributes =
                mainInfo.attribute_groups
                    ?.flatMap((group: any) => group.attributes.map((attr: any) => attr.name))
                    .join("; ") || "N/A";

            const schedule = Object.entries(mainInfo.schedule || {})
                .map(([day, hours]: [string, any]) =>
                    `${day}: ${hours.working_hours.map((h: any) => `${h.from}-${h.to}`).join(", ")}`
                )
                .join("; ");

            return {
                ID: org.id || "N/A",
                Name: mainInfo.name || "N/A",
                "Primary Category": mainInfo.name_ex?.extension || "N/A",
                Address: mainInfo.full_address_name || "N/A",
                Rating: mainInfo.reviews?.org_rating || "N/A",
                "Review Count": mainInfo.reviews?.org_review_count || 0,
                Attributes: attributes,
                Schedule: schedule,
                "Photo Count": photos.length,
            };
        });

        // Combine headers and rows
        const csvContent =
            [headers.join(",")]
                .concat(
                    rows.map((row: any) =>
                        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
                    )
                )
                .join("\n");

        // Write to a CSV file
        fs.writeFileSync(outputFilePath, csvContent, "utf8");
        console.log(`CSV file created at: ${outputFilePath}`);
    } catch (error) {
        console.error("Error converting JSON to CSV:", error);
    }
};


// Utility function to fetch data with error handling
const fetchData = async (url: string): Promise<any> => {
    try {
        console.log(`Fetching: ${url}`);
        const response = await fetch(url, {headers: {"Content-Type": "application/json"}});
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error body: ${errorBody}`);
            return null;
        }
        // console.log(`Response data:`, JSON.stringify(data, null, 2));
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
};


// Step 1: Parse organizations by rubric ID
const parseOrganizations = async (rubricId: string): Promise<string[]> => {
    const url = `${BASE_URL}/items?rubric_id=${rubricId}&key=${API_KEY}`;
    const data = await fetchData(url);

    if (!data || !data.result || !data.result.items) {
        console.error("Failed to retrieve organizations.");
        return [];
    }

    const ids = data.result.items.map((item: any) => item.id);
    console.log(`Found ${ids.length} organization IDs.`);
    return ids;
};

// Step 2: Fetch details for an organization
const fetchOrganizationDetails = async (organizationId: string) => {
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
};

// Step 3: Save collected data to a JSON file
const saveToFile = async (data: any, filename: string) => {
    try {
        await writeFile(filename, JSON.stringify(data, null, 2), "utf8");
        console.log(`Data successfully saved to ${filename}`);
    } catch (error) {
        console.error("Error writing to file:", error);
    }
};

// Main function to execute the process
const main = async () => {
    const rubricId = "159"; // Example rubric ID
    console.log("Fetching organization IDs...");
    const organizationIds = await parseOrganizations(rubricId);

    if (organizationIds.length === 0) {
        console.error("No organizations found.");
        return;
    }

    const allDetails: any[] = [];
    for (const id of organizationIds) {
        console.log(`Fetching details for organization ID: ${id}`);
        const details = await fetchOrganizationDetails(id);
        allDetails.push(details);
    }

    // Save collected data to a file
    await saveToFile(allDetails, "organizations.json");
};

// Start the app
main().catch((error) => console.error("Error running the application:", error));
