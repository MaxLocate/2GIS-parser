"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = require("fs/promises");
// Constants
var BASE_URL = "https://catalog.api.2gis.com/3.0";
var PHOTO_URL = "https://api.photo.2gis.com/3.0";
var MARKET_URL = "https://market-backend.api.2gis.ru/5.0";
var REVIEWS_URL = "https://public-api.reviews.2gis.com/2.0";
var API_KEY = "8be06704-a318-43ab-8510-b5d8bce96239"; // Replace with your actual API key
// Utility function to fetch data with error handling
var fetchData = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fetch(url, { headers: { "Content-Type": "application/json" } })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    console.error("Error fetching ".concat(url, ": ").concat(response.statusText));
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, response.json()];
            case 2:
                error_1 = _a.sent();
                console.error("Error fetching ".concat(url, ":"), error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Step 1: Parse organizations by rubric ID
var parseOrganizations = function (rubricId) { return __awaiter(void 0, void 0, void 0, function () {
    var url, data, ids;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = "".concat(BASE_URL, "/items?rubric_id=").concat(rubricId, "&key=").concat(API_KEY);
                return [4 /*yield*/, fetchData(url)];
            case 1:
                data = _a.sent();
                if (!data || !data.result || !data.result.items) {
                    console.error("Failed to retrieve organizations.");
                    return [2 /*return*/, []];
                }
                ids = data.result.items.map(function (item) { return item.id; });
                console.log("Found ".concat(ids.length, " organization IDs."));
                return [2 /*return*/, ids];
        }
    });
}); };
// Step 2: Fetch details for an organization
var fetchOrganizationDetails = function (organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    var mainInfoUrl, mainInfo, photosUrl, photos, productsUrl, products, reviewsUrl, reviews;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                mainInfoUrl = "".concat(BASE_URL, "/items/byid?id=").concat(organizationId, "&fields=items.name_ex,items.schedule,items.reviews,items.full_address_name&key=").concat(API_KEY);
                return [4 /*yield*/, fetchData(mainInfoUrl)];
            case 1:
                mainInfo = _b.sent();
                photosUrl = "".concat(PHOTO_URL, "/objects/").concat(organizationId, "/albums/all/photos?locale=ru_KZ&key=").concat(API_KEY, "&page_size=20");
                return [4 /*yield*/, fetchData(photosUrl)];
            case 2:
                photos = _b.sent();
                productsUrl = "".concat(MARKET_URL, "/product/items_by_branch?branch_id=").concat(organizationId, "&locale=ru_KZ&page=1&page_size=50");
                return [4 /*yield*/, fetchData(productsUrl)];
            case 3:
                products = _b.sent();
                reviewsUrl = "".concat(REVIEWS_URL, "/branches/").concat(organizationId, "/reviews?is_advertiser=true&fields=meta.branch_rating,meta.branch_reviews_count,meta.total_count&key=").concat(API_KEY, "&locale=ru_KZ");
                return [4 /*yield*/, fetchData(reviewsUrl)];
            case 4:
                reviews = _b.sent();
                return [2 /*return*/, {
                        id: organizationId,
                        mainInfo: ((_a = mainInfo === null || mainInfo === void 0 ? void 0 : mainInfo.result) === null || _a === void 0 ? void 0 : _a.items) || null,
                        photos: (photos === null || photos === void 0 ? void 0 : photos.result) || null,
                        products: (products === null || products === void 0 ? void 0 : products.result) || null,
                        reviews: (reviews === null || reviews === void 0 ? void 0 : reviews.reviews) || null,
                    }];
        }
    });
}); };
// Step 3: Save collected data to a JSON file
var saveToFile = function (data, filename) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, promises_1.writeFile)(filename, JSON.stringify(data, null, 2), "utf8")];
            case 1:
                _a.sent();
                console.log("Data successfully saved to ".concat(filename));
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error("Error writing to file:", error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Main function to execute the process
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rubricId, organizationIds, allDetails, _i, organizationIds_1, id, details;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                rubricId = "159";
                console.log("Fetching organization IDs...");
                return [4 /*yield*/, parseOrganizations(rubricId)];
            case 1:
                organizationIds = _a.sent();
                if (organizationIds.length === 0) {
                    console.error("No organizations found.");
                    return [2 /*return*/];
                }
                allDetails = [];
                _i = 0, organizationIds_1 = organizationIds;
                _a.label = 2;
            case 2:
                if (!(_i < organizationIds_1.length)) return [3 /*break*/, 5];
                id = organizationIds_1[_i];
                console.log("Fetching details for organization ID: ".concat(id));
                return [4 /*yield*/, fetchOrganizationDetails(id)];
            case 3:
                details = _a.sent();
                allDetails.push(details);
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: 
            // Save collected data to a file
            return [4 /*yield*/, saveToFile(allDetails, "organizations.json")];
            case 6:
                // Save collected data to a file
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// Start the app
main().catch(function (error) { return console.error("Error running the application:", error); });
