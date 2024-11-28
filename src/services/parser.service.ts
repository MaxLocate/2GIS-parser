import {
    API_KEYS,
    API_URL_V2,
    API_URL_V3, GENERAL_RUBRIC_IDS,
    MAX_REQUESTS_PER_KEY,
    ORGANIZATIONS_IDS,
    REGIONS_IDS, RUBRIC_IDS
} from "../constants/constants";
import * as fs from "node:fs";
import {AttributeGroup, IOrganisationAttributesResponse} from "../types/attributes-response.dto";
import {IKeyItems} from "../types/keys";
import {IRegionInfo, RegionsResponseDTO} from "../types/regions-response.dto";
import {IRubricDTO, ISubRubricsResponseDTO} from "../types/sub-rubrics-response.dto";

export class ParserService {
    private apiKey: string = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
    private requestCounter: number = 0;

    constructor() {
        this.apiKey = this.getAnyActiveKey()
    }

    public async retrieveOrganisationAttributes(): Promise<void> {
        const organizationAttributes: AttributeGroup[] = [];

        for (const organizationId of ORGANIZATIONS_IDS) {
            const organizationAttributesGroup: IOrganisationAttributesResponse = await this.getOrganizationAttributesGroup(organizationId);

            if (organizationAttributesGroup.meta.code !== 200) {
                console.error(`The organization with id - ${organizationId}`, organizationAttributesGroup.meta.code);
                continue;
            }

            console.log(`Fetched ${organizationAttributesGroup.result?.items[0]?.attribute_groups?.length} organization attributes by id ${organizationId}`);

            const attributeGroupToAdd = organizationAttributesGroup.result.items[0]?.attribute_groups || [];

            for (const attributeGroup of attributeGroupToAdd) {
                const existingGroup = organizationAttributes.find((attr) => attr.name === attributeGroup.name);

                if (existingGroup) {
                    const existingAttributeNames = new Set(existingGroup.attributes.map(attr => attr.name));
                    const newAttributes = attributeGroup.attributes.filter(attr => !existingAttributeNames.has(attr.name));
                    existingGroup.attributes.push(...newAttributes);
                } else {
                    organizationAttributes.push(attributeGroup);  // Add unique group
                }
            }
        }

        this.writeOrganisationAttributesToJSON(organizationAttributes);
    }

    private async getOrganizationAttributesGroup(organization_id: number): Promise<IOrganisationAttributesResponse | null> {
        try {
            if (this.requestCounter >= MAX_REQUESTS_PER_KEY) {
                console.log('Request limit reached. Changing API key...')
                this.changeKeyState(this.apiKey)
                this.apiKey = this.getAnyActiveKey()
            }

            const organization_url: string = `${API_URL_V3}/items/byid?id=${organization_id}&fields=items.attribute_groups&key=${this.apiKey}`
            const response = await fetch(organization_url)

            // Increment request counter
            this.requestCounter++

            return await response.json()
        } catch (error) {
            console.error('Error occurred while fetching organization attributes', error)
            return null
        }
    }

    private writeOrganisationAttributesToJSON(organizationAttributes: AttributeGroup[]): void {
        const json = JSON.stringify(organizationAttributes, null, 2)
        fs.writeFileSync('2gis-organisations-attributes.json', json)
    }

    /**
     * Method to fetch all organization id's by rubric id
     * @private
     * @deprecated
     */
    private async retrieveOrganisationIds(): Promise<void> {
        const organisationIds: number[] = [];

        for (const rubricId of RUBRIC_IDS) {
            const organizations: IOrganisationsByRubricIdDTO = await this.getOrganizationsByRubricId(rubricId)

            console.log(`Fetched ${organizations.result?.items?.length} organizations by rubric id ${rubricId}`)

            // Skip if no organizations found
            if (organizations.meta.code !== 200 || !organizations.result.items) {
                console.error('No organizations found by rubric id', rubricId)
                continue
            }

            for (const item of organizations.result.items) {
                organisationIds.push(parseInt(item.id))
            }
        }

        this.writeOrganisationIdsToJSON(organisationIds)
    }

    private async getOrganizationsByRubricId(rubricId: number): Promise<IOrganisationsByRubricIdDTO> {
        try {
            if (this.requestCounter >= MAX_REQUESTS_PER_KEY) {
                console.log('Request limit reached. Changing API key...')
                this.apiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)]
            }

            const organizations_url: string = `${API_URL_V3}/items?rubric_id=${rubricId}&key=${this.apiKey}`
            const response = await fetch(organizations_url)

            // Increment request counter
            this.requestCounter++

            return await response.json()
        } catch (error) {
            console.error('Error occurred while fetching organizations by rubric id', error)
            return null
        }
    }

    private writeOrganisationIdsToJSON(organisationIds: number[]): void {
        const json = JSON.stringify(organisationIds, null, 2)
        fs.writeFileSync('2gis-organisation-ids.json', json)
    }

    // ------------------ RUBRICS ------------------

    public async retrieveRubrics(): Promise<void> {
        const rubrics: IRubricDTO[] = [];

        for (const regionId of REGIONS_IDS) {
            for (const rubricId of GENERAL_RUBRIC_IDS) {
                // Check if in rubrics array already exists rubric with the same id, if so - skip
                if (rubrics.find(rubric => parseInt(rubric.id) === rubricId)) continue
                const subRubric = await this.getRubricId(regionId, rubricId)

                if (subRubric) rubrics.push(subRubric.result.items[0])
            }
        }

        this.writeRubricsResponseToJSON(rubrics)
        // this.writeRubricsIdsToJSON(rubrics)
    }

    private async getRubricId(regionId: number, rubricId: number): Promise<ISubRubricsResponseDTO | null> {
        try {
            if (this.requestCounter >= MAX_REQUESTS_PER_KEY) {
                console.log('Request limit reached. Changing API key...')
                this.changeKeyState(this.apiKey)
                this.apiKey = this.getAnyActiveKey()
            }

            const subRubrics_url: string = `${API_URL_V2}/catalog/rubric/get?region_id=${regionId}&id=${rubricId}&fields=items.rubrics&key=${this.apiKey}`
            const response = await fetch(subRubrics_url)

            // Increment request counter
            this.requestCounter++

            return await response.json()
        } catch (error) {
            console.error('Error occurred while fetching rubric id', error)
            return null
        }
    }

    private writeRubricsResponseToJSON(rubrics: IRubricDTO[]): void {
        const json = JSON.stringify(rubrics, null, 2)
        fs.writeFileSync('2gis-rubrics.json', json)
    }

    /**
     * Method to fetch all region id's by country code
     * @returns Promise<IRegionInfo[]> - Array of region id's
     * @deprecated
     */
    private async getRegionIds(): Promise<IRegionInfo[]> {
        const regions_url: string = `${API_URL_V2}/region/list?country_code_filter=kz&key=${this.apiKey}`

        try {
            const response = await fetch(regions_url)
            const respJson: RegionsResponseDTO = await response.json()

            return respJson.result.items.map(region => {
                return {
                    region_id: parseInt(region.id),
                    city: region.name
                }
            })
        } catch (error) {
            console.error('Error occurred while fetching region ids', error)
            return []
        }
    }

    // -------------------- KEYS -------------------
    public getAnyActiveKey(): string {
        const keys: IKeyItems = JSON.parse(fs.readFileSync('keys.json', 'utf-8'))
        const activeKeys = keys.items.filter(key => key.active)

        if (activeKeys.length > 0) return activeKeys[0].id

        throw new Error('No active keys found')
    }

    public changeKeyState(id: string): void {
        const keys: IKeyItems = JSON.parse(fs.readFileSync('keys.json', 'utf-8'))
        const key = keys.items.find(key => key.id === id)

        if (key) {
            key.active = false
            key.count = this.requestCounter

            // Reset request counter
            this.requestCounter = 0

            fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2))
        }
    }

}
