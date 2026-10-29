export type ExecutionMode = 'ORGANIZATION_ONLY' | 'PRODUCT_DEVELOPMENT' | 'TUTOR_1073_ONLY' | 'UNKNOWN';
export type ExecutionAuthority = {mode: ExecutionMode; productWorkAuthorized: boolean; authorizedJobIds?: number[]; nextStep: string};
export function currentExecutionAuthority(body: unknown): ExecutionAuthority;
