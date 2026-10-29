/** Read the FIRST current owner directive; old backlog headings cannot grant work. */
export function currentExecutionAuthority(body) {
  const unknown = {
    mode: 'UNKNOWN',
    productWorkAuthorized: false,
    nextStep: 'Read the current owner instruction in the canonical Cartilla queue before any dispatch.',
  };
  if (typeof body !== 'string' || !body.trim()) return unknown;
  const heading = /^## CURRENT OWNER DIRECTIVE[^\r\n]*$/gim.exec(body);
  if (!heading) return unknown;
  if (/\bORGANIZATION ONLY\b/i.test(heading[0])) {
    return {
      mode: 'ORGANIZATION_ONLY',
      productWorkAuthorized: false,
      nextStep: 'Reconcile existing Cartilla and LANY assignments and source-of-truth records. Do not start product workers.',
    };
  }
  // The only currently authorized product scope is the existing Tutor #1073.
  // Do not treat this as approval to start other Cartilla or LANY work.
  if (/\bTUTOR\s*#1073\s+DEVELOPMENT AND QUALIFICATION ONLY\b/i.test(heading[0])) {
    return {
      mode: 'TUTOR_1073_ONLY',
      productWorkAuthorized: true,
      authorizedJobIds: [1073],
      nextStep: 'Qualify the existing Gretel Tutor #1073 Lección 1 on its original branch. Other product work remains paused; no merge or production release is authorized.',
    };
  }
  if (/\bPRODUCT DEVELOPMENT\b/i.test(heading[0])) {
    return {
      mode: 'PRODUCT_DEVELOPMENT',
      productWorkAuthorized: true,
      nextStep: 'Resume only approved existing product assignments from the canonical queue and exact GitHub revisions.',
    };
  }
  // Unknown/new directives are not automatic permission for a different AI model.
  return unknown;
}
