import type { ReviewRequest } from '@/hq/types';

export const REVIEW_CONTENT_WORKFLOW_ID = 'wf-1';

export interface ReviewContentPackage {
  subjectReference: string;
  subjectDescription: string;
  matchedCandidateReference: string;
  matchedCandidateDescription: string;
  nostroAmount: string;
  vostroAmount: string;
  discrepancyAmount: string;
  tag: string;
  finalExplanation: string;
  judgeExplanation: string;
}

const REVIEW_CONTENT_PACKAGES: ReviewContentPackage[] = [
  {
    subjectReference: 'ENBD-TXN-20260304-001',
    subjectDescription: 'Inward Transfer from ADCB - Export Proceeds',
    matchedCandidateReference: 'ADCB-TXN-20260304-456',
    matchedCandidateDescription: 'Outward Transfer to ENBD - Export Proceeds',
    nostroAmount: '18,000.00',
    vostroAmount: '19,500.00',
    discrepancyAmount: '1,500.00',
    tag: 'AMOUNT_MISMATCH',
    finalExplanation: 'The Nostro and Vostro transactions share the same value date, mirrored directions, and matching business purpose ("Export Proceeds"). However, the amounts differ: the Nostro shows a credit of 18,000.0 while the Vostro shows a debit of 19,500.0. The discrepancy of 1,500.0 precludes reconciliation as a match, so this is classified as an AMOUNT_MISMATCH rather than a perfect match or missing counterpart. No exact reconciliation is possible until the amounts align or an explanation for the difference is found, such as fees or currency differences unaccounted for here. The best possible match is noted, but a discrepancy remains to be resolved by further investigation or manual review of documentation to explain the 1,500.0 difference.',
    judgeExplanation: 'Both reviewers were entirely aligned on the reasoning for this entry. The decisive factors were matching value dates, mirrored payment descriptions, and opposite-sided entries, but a 1,500 difference in amounts. Both reviewers classified this as AMOUNT_MISMATCH.',
  },
  {
    subjectReference: 'ENBD-TXN-20260305-001',
    subjectDescription: 'Outward Interbank Transfer to ADCB - Payroll Funding',
    matchedCandidateReference: 'ADCB-TXN-20260305-456',
    matchedCandidateDescription: 'Inward Interbank Transfer from ENBD - Payroll Funding',
    nostroAmount: '63,000.00',
    vostroAmount: '65,500.00',
    discrepancyAmount: '2,500.00',
    tag: 'AMOUNT_MISMATCH',
    finalExplanation: 'The Nostro and Vostro entries both share the same value date, have mirrored descriptions and transaction direction, and reference the same business activity ("Payroll Funding"). However, there is a 2,500 difference between the Nostro debit (63,000.0) and the Vostro credit (65,500.0) amounts. This means the transactions are potential counterparts but cannot be reconciled as a match until the source of the difference is known. As such, the best designation for these transactions is AMOUNT_MISMATCH. Further investigation into bank charges, currency differences, or corrections might resolve the discrepancy, but with available information, it is unresolved.',
    judgeExplanation: 'Both reviewers provided matching field selections and rationales on this item. The same candidate is selected, and classification as AMOUNT_MISMATCH is correct due to the clear amount discrepancy despite all other matching parameters.',
  },
  {
    subjectReference: 'ENBD-TXN-20260309-001',
    subjectDescription: 'Outward Interbank Transfer to ADCB - Margin Call',
    matchedCandidateReference: '—',
    matchedCandidateDescription: '—',
    nostroAmount: '28,000.00',
    vostroAmount: '0.00',
    discrepancyAmount: '0.00',
    tag: 'MISSING_COUNTERPART',
    finalExplanation: 'There is no candidate on the Vostro side for the Nostro transaction dated 2026-03-09 involving an outward transfer for "Margin Call." No entries in the Vostro ledger on or after that date have a matching description, amount, or opposite direction and value date. As such, there is no plausible counterpart, so this transaction is marked as MISSING_COUNTERPART.',
    judgeExplanation: 'Both reviewers reached an identical and correct result, choosing MISSING_COUNTERPART with supporting field values. One reviewer used -1/-1.0/-1.0 for missing entries, while the other used 0.0, but both explanations arrived at the correct classification. The standardized approach uses 0.0 for unmatched amounts and discrepancies.',
  },
  {
    subjectReference: 'ENBD-TXN-20260313-001',
    subjectDescription: 'Outward Interbank Transfer to ADCB - Insurance Premium',
    matchedCandidateReference: 'ADCB-TXN-20260313-456',
    matchedCandidateDescription: 'Inward Interbank Transfer from ENBD - Insurance Premium',
    nostroAmount: '11,000.00',
    vostroAmount: '13,000.00',
    discrepancyAmount: '2,000.00',
    tag: 'AMOUNT_MISMATCH',
    finalExplanation: 'The subject Nostro and candidate Vostro transactions have the same value date, mirrored directions, and matching business purpose ("Insurance Premium"), but there is a difference of 2,000 between the amounts (Nostro debit 11,000.0 vs. Vostro credit 13,000.0). The transactions are almost certainly intended as counterparts but cannot be reconciled due to the amount discrepancy. Therefore, they are classified as AMOUNT_MISMATCH.',
    judgeExplanation: 'Both reviewers provided identical candidate matches and field assignments. Their detailed explanations match the evidence. Minor field default differences were standardized, but the reasoning and classification remain unchanged.',
  },
  {
    subjectReference: 'ENBD-TXN-20260318-001',
    subjectDescription: 'Inward Transfer from ADCB - VAT Refund Distribution',
    matchedCandidateReference: '—',
    matchedCandidateDescription: '—',
    nostroAmount: '22,000.00',
    vostroAmount: '0.00',
    discrepancyAmount: '0.00',
    tag: 'MISSING_COUNTERPART',
    finalExplanation: 'No transaction appears on the Vostro side that matches the date, amount, description, or payment direction for the Nostro\'s "Inward Transfer from ADCB - VAT Refund Distribution." Thus, this transaction cannot be matched and is classified as MISSING_COUNTERPART.',
    judgeExplanation: 'Both reviewers correctly selected MISSING_COUNTERPART, noting the complete lack of plausible counterparts based on all given evidence. Unmatched amounts were standardized to 0.0.',
  },
  {
    subjectReference: 'ENBD-TXN-20260320-001',
    subjectDescription: 'Inward Transfer from ADCB - Syndicated Loan Proceeds',
    matchedCandidateReference: 'ADCB-TXN-20260320-456',
    matchedCandidateDescription: 'Outward Transfer to ENBD - Syndicated Loan Proceeds',
    nostroAmount: '31,000.00',
    vostroAmount: '28,500.00',
    discrepancyAmount: '2,500.00',
    tag: 'AMOUNT_MISMATCH',
    finalExplanation: 'The comparative transactions have the same date, clear mirrored descriptions ("Syndicated Loan Proceeds"), and opposite directions as expected (Nostro credit, Vostro debit), but the amounts differ: 31,000.0 (Nostro) vs. 28,500.0 (Vostro). This difference of 2,500.0 means the entries cannot be reconciled unless the disparity is explained elsewhere. The best classification is AMOUNT_MISMATCH.',
    judgeExplanation: 'The evidence in both reviewer outputs is consistent and correct, matching on every field. Their explanations are explicit and in agreement with the documents. No further nuance was required.',
  },
  {
    subjectReference: 'ENBD-TXN-20260325-001',
    subjectDescription: 'Outward Interbank Transfer to ADCB - Interbank Lending',
    matchedCandidateReference: 'ADCB-TXN-20260325-456',
    matchedCandidateDescription: 'Inward Interbank Transfer from ENBD - Interbank Lending',
    nostroAmount: '40,000.00',
    vostroAmount: '43,000.00',
    discrepancyAmount: '3,000.00',
    tag: 'AMOUNT_MISMATCH',
    finalExplanation: 'The Nostro and Vostro transactions match in value date, business description ("Interbank Lending"), and have mirrored transaction directions, but the amounts are not the same (40,000.0 vs. 43,000.0). Until this 3,000.0 discrepancy is justified or corrected, these cannot be considered reconciled, and the correct label is AMOUNT_MISMATCH.',
    judgeExplanation: 'Both reviewers listed identical candidate indices, amount fields, and rationale. The evidence, a 3,000 difference despite otherwise matching details, is decisive for AMOUNT_MISMATCH.',
  },
  {
    subjectReference: 'ENBD-TXN-20260331-001',
    subjectDescription: 'Outward Interbank Transfer to ADCB - Month-End Settlement',
    matchedCandidateReference: 'ADCB-TXN-20260331-456',
    matchedCandidateDescription: 'Inward Interbank Transfer from ENBD - Month-End Settlement',
    nostroAmount: '106,000.00',
    vostroAmount: '109,500.00',
    discrepancyAmount: '3,500.00',
    tag: 'AMOUNT_MISMATCH',
    finalExplanation: 'The candidate and subject have clearly matching content: same value date, corresponding transaction directions, and the identical purpose of "Month-End Settlement." However, the amounts differ by 3,500. Until this difference is accounted for and resolved, this must be classified as AMOUNT_MISMATCH. There is no evidence for exact reconciliation, though the match is likely intended aside from the unresolved discrepancy.',
    judgeExplanation: 'There is consensus among both reviewers on every field. Their analysis matches the documentation and transaction data. The outputs are accepted as accurate with no need for alteration.',
  },
];

export function getReviewContent(review: ReviewRequest | { id: string }) {
  const numeric = Number.parseInt(review.id.replace(/\D/g, ''), 10);
  const index = Number.isNaN(numeric) ? 0 : (numeric - 1) % REVIEW_CONTENT_PACKAGES.length;
  return REVIEW_CONTENT_PACKAGES[index];
}

export function hasReviewContent(review: Pick<ReviewRequest, 'workflowId'>) {
  return review.workflowId === REVIEW_CONTENT_WORKFLOW_ID;
}
