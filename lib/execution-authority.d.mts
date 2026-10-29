export type ExecutionMode = 'ORGANIZATION_ONLY' | 'PRODUCT_DEVELOPMENT' | 'UNKNOWN';
export type ExecutionAuthority = {mode: ExecutionMode; productWorkAuthorized: boolean; nextStep: string};
export function currentExecutionAuthority(body: unknown): ExecutionAuthority;
