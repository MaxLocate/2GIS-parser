export interface Meta {
    api_version: string;
    code: number;
    issue_date: string;
}

export interface Region {
    id: string;
    name: string;
    type: string;
}

export interface Result {
    items: Region[];
    total: number;
}

export interface RegionsResponseDTO {
    meta: Meta;
    result: Result;
}


// ---------------------------------------------------------------------

export interface IRegionInfo {
    region_id: number;
    city: string;
}
