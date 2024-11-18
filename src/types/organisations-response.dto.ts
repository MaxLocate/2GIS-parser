interface IOrganisationsByRubricIdDTO {
    meta: Meta;
    result: {
        items: OrganisationItem[];
        total: number;
    };
}

interface Meta {
    api_version: string;
    code: number;
}

interface OrganisationItem {
    address_comment?: string;
    address_name: string;
    id: string;
    name: string;
    type: string;
    building_name?: string;
    full_name?: string;
    purpose_name?: string;
}
