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
