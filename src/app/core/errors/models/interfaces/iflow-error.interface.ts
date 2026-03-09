export interface IFlowErrorResponse {
    error: IFlowError;
}

export interface IFlowError {
    code: string;
    message: string;
    category: IFlowErrorCategory;
    status: number;
}

export type IFlowErrorCategory =
    | 'validation'
    | 'auth'
    | 'permission'
    | 'not_found'
    | 'business'
    | 'external'
    | 'infrastructure'
    | 'unexpected';
