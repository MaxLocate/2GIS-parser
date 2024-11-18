import {IRubricDTO} from "./sub-rubrics-response.dto";

export interface IRubric {
    alias: string;
    branch_count: number;
    id: string;
    name: string;
    org_count: number;
    type: string;
}

export interface RubricsResult {
    items: IRubric[];
}

export interface IRubricsResponseDTO {
    result: RubricsResult;
}

// ---------------------------------------------------------------------

export interface IRubricInfo {
    rubric_id: number;
    subRubrics?: IRubricDTO[];
}
