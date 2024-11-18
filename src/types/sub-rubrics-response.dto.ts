interface Meta {
    api_version: string;
    code: number;
    issue_date: string;
}

export interface SubRubric {
    alias: string;
    branch_count: number;
    caption: string;
    id: string;
    name: string;
    org_count: number;
    parent_id: string;
    seo_name?: string;
    title: string;
    type: string;
}

export interface IRubricDTO {
    alias: string;
    branch_count: number;
    id: string;
    name: string;
    org_count: number;
    rubrics: SubRubric[];
    type: string;
}

interface ISubRubricsResult {
    items: IRubricDTO[];
    total: number;
}

export interface ISubRubricsResponseDTO {
    meta: Meta;
    result: ISubRubricsResult;
}
