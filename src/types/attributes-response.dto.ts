export interface IOrganisationAttributesResponse {
    meta: {
        api_version: string;
        code: number;
        issue_date: string;
    };
    result: {
        items: Item[];
        total: number;
    };
}

interface Item {
    address_name: string;
    attribute_groups: AttributeGroup[];
    building_name: string;
    full_name: string;
    id: string;
    name: string;
    purpose_name: string;
    type: string;
}

export interface AttributeGroup {
    attributes: Attribute[];
    icon_url?: string;
    is_context?: boolean;
    is_primary?: boolean;
    name: string;
    rubric_ids: string[];
}

export interface Attribute {
    id: string;
    name: string;
    tag: string;
}
