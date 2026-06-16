import type { AgentScript } from '../engine'
import type { ContentSection } from '@/lib/types'

export interface DraftSuggestion {
  id: string
  type: 'suggestion' | 'gap'
  label: string
  targetSectionId: string
  body: string
}

export interface DraftingOutput {
  templateSections: ContentSection[]
  draftResolution: string
  regulatoryRefs: string[]
  suggestions: DraftSuggestion[]
  gaps: DraftSuggestion[]
}

// ─── PPC εισήγηση — 11 mandatory sections ──────────────────────────────────
// s1–s5 and s9–s11 are pre-filled from the business need and PPC template.
// s6, s7, s8 are stubs awaiting assisted-drafting input.

// The operative resolution is NOT drafted by the Recommendation Assistant. The assistant only
// scaffolds the structural placeholder (RESOLUTION_STUB) in section 10; the Resolution Assistant
// (step 3) generates and inserts the full DRAFT_RESOLUTION. Exported for the Resolution Assistant.
export const DRAFT_RESOLUTION = `Subject: Approval of Bilateral Energy Trading Framework Agreement — PPC S.A. / Complexul Energetic Oltenia S.A. (CEO S.A.)

The Board of Directors, having regard to:
a) Recommendation no. EIS-2026-0042 of the Trading & Origination Division, dated 9 June 2026;
b) the discussion at this meeting,

RESOLVES:

1. To approve the entry by PPC S.A. into a Bilateral Master Electricity Trading Agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) for up to 500 GWh/year across the Greek–Romanian interconnector. Tenor: 24 months, annual renewal option. Price indexation: HUPX/HEnEx. Maximum annual notional value: EUR 40,000,000. Governing law: Greek law.

2. Contract signature is subject to: (i) ACER written acknowledgement of REMIT Art. 4 pre-trade notification on file; (ii) RAAEY prior notification under L.4001/2011 Art. 11 acknowledged; (iii) Credit Support Annex (EUR 5M threshold) executed by both parties.

3. Within 30 days of signature, Treasury shall execute the EMIR OTC derivative addendum designating REGIS-TR as trade repository; EMIR Art. 10 clearing threshold representation in force.

4. The CEO of PPC S.A. is authorised to execute all documents up to EUR 40M notional. The CTO may sub-delegate EMIR addendum execution to the Group Treasurer. The BoD shall be informed within 10 business days of execution and satisfaction of conditions.

Attachments: (A) Draft Master Agreement; (B) Credit Support Annex; (C) KYC Report — CEO S.A., 3 June 2026; (D) Finance/Treasury Confirmation Note, 7 June 2026.`

// Structural placeholder the Co-Pilot leaves in section 10 — the operative resolution is blank
// until the Resolution Assistant populates it.
export const RESOLUTION_STUB = `Subject: [Approval of the proposed arrangement — to be confirmed by the Resolution Assistant]

The Board of Directors, having regard to:
a) the recommendation of the proposing Business Unit;
b) the discussion at this meeting,

RESOLVES:

[ Operative resolution pending — run the Resolution Assistant (step 3) to generate the recommended
resolution wording, including the conditions precedent (ACER acknowledgement, RAAEY notification,
Credit Support Annex) and delegated-authority clauses. ]`

// Section 1 is split so the "Attachments" paragraph can be regenerated from the documents the
// user actually attaches via the Evidence Collection Assistant (see buildSection1Body).
export const S1_PREFIX = `Subject: New Cross-Border Energy Trading Framework Agreement — PPC S.A. / Complexul Energetic Oltenia S.A. (CEO S.A.)

Related documents: (a) Feasibility study — Greece–Romania cross-border trading capacity utilisation, Trading & Origination, March 2026; (b) Board decision no. ΔΣ-2024-031 authorising exploratory negotiations with Romanian counterparties; (c) Group Authorisation Matrix (GAM) — bilateral trading agreements, revision 2025.`

export const S1_ATTACHMENTS_PLACEHOLDER =
  'Attachments (to follow): to be collected and attached via the Evidence Collection Assistant.'

// Rebuilds the section-1 body: prefix + an attachments paragraph derived from attached document
// titles (lettered A, B, C…), or the "(to follow)" placeholder when nothing is attached yet.
export function buildSection1Body(attachmentTitles: string[]): string {
  const para =
    attachmentTitles.length > 0
      ? 'Attachments: ' +
        attachmentTitles.map((t, i) => `(${String.fromCharCode(65 + i)}) ${t}`).join('; ') +
        '.'
      : S1_ATTACHMENTS_PLACEHOLDER
  return `${S1_PREFIX}\n\n${para}`
}

const templateSections: ContentSection[] = [
  {
    id: 's1',
    title: 'Subject / Related Documents / Attachments',
    body: buildSection1Body([]),
  },
  {
    id: 's2',
    title: 'Necessity (Why)',
    body: 'PPC S.A. seeks to capitalise on its cross-border transmission capacity between Greece and Romania (ENTSO-E NTC: 400 MW) by entering into a bilateral energy trading framework with Complexul Energetic Oltenia S.A. (CEO S.A.) covering up to 500 GWh/year. The arrangement is linked to PPC\'s 2026–2030 Business Plan (target: grow cross-border trading margins by 15% p.a.) and addresses the recurring operational need to balance seasonal load curves across the Greek–Romanian interconnector. A prior BoD decision (no. ΔΣ-2024-031) authorised exploratory negotiations with Romanian counterparties.\n\nRegulatory framework: preliminary assessment indicates applicability of REMIT, EMIR Refit, RAAEY prior notification, and MiFID II classification review — see Legal review for details.\n\nConsequences of not deciding: failure to capture EUR 3.5–4.5M p.a. net trading margin; loss of first-mover advantage ahead of HEnEx–HUPX market coupling (2027); risk that CEO S.A. concludes a competing arrangement with a third party.',
  },
  {
    id: 's3',
    title: 'Object (What)',
    body: 'Scope: PPC S.A. seeks BoD authorisation to enter into a Bilateral Master Electricity Trading Agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) for the physical exchange of up to 500 GWh/year of electricity across the Greek–Romanian interconnector (400 MW NTC). Tenor: 24 months with annual renewal option. Price indexation: HUPX/HEnEx quarterly average. Governing law: Greek law. Dispute resolution: Athens Court of First Instance (commercial disputes panel).\n\nAlternatives considered: (1) Exchange-based trading via HEnEx/HUPX — excluded due to insufficient liquidity for volumes above 200 GWh/year on the cross-border order book; (2) Capacity auction via ENTSO-E coordinated allocation — excluded as this mechanism does not support bilateral price indexation; (3) No-action — excluded due to identified commercial opportunity (EUR 3.5–4.5M p.a. net margin).\n\nKey transaction terms: Duration 24 months, annual renewal option. Penalty clauses: EUR 500,000 per occurrence for force majeure abuse. Option rights: annual volume uplift option of +100 GWh with 60-day notice.',
  },
  {
    id: 's4',
    title: 'Location (Where)',
    body: 'Primary transaction location: Greek–Romanian high-voltage interconnector, operating under the ENTSO-E regional coordination framework (NTC: 400 MW). Physical delivery point: the Greek side of the interconnection, per ENTSO-E capacity allocation rules.\n\nPPC S.A. registered address: Chalkokondyli 30, Athens 104 32, Greece. CEO S.A. registered address: Str. Republicii Nr. 1, Târgu Jiu, Gorj, Romania.',
  },
  {
    id: 's5',
    title: 'Implementation Method (How)',
    body: 'Procurement procedure: this agreement is concluded directly under the bilateral commercial framework governed by PPC\'s Trading Policy v4.2 and the Group Authorisation Matrix. No competitive tender is required, as the arrangement is a bilateral commercial trading agreement with a specific counterparty identified through market intelligence and prior board-authorised negotiations (Board decision no. ΔΣ-2024-031).\n\nCompliance with internal regulations: confirmed compliance with PPC Group Trading Policy v4.2 (Schedule A permitted instruments), the Group Authorisation Matrix (bilateral agreements above EUR 10M require BoD approval), and the Group Anti-Bribery & Corruption Policy. Group Policy Approval level: BoD (consistent with EUR 32.5M p.a. notional and 24-month tenor). No opinion from an independent committee is required for commercial trading agreements of this type.',
  },
  {
    id: 's6',
    title: 'Timeline (When)',
    body: 'Implementation timeline pending Legal review and regulatory filing confirmation.',
  },
  {
    id: 's7',
    title: 'Budget / Expense (How much)',
    body: '[Pending Finance/Treasury confirmation — quantified values required]',
  },
  {
    id: 's8',
    title: 'Counterparty & Authorizations (Who)',
    body: '[Pending KYC completion and authorizations confirmation]',
  },
  {
    id: 's9',
    title: 'Proposal for Decision',
    body: 'The Trading & Origination Division recommends that the Board of Directors approve the entry by PPC S.A. into a Bilateral Master Electricity Trading Agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) on the terms described herein, and adopts a decision as per the draft resolution set out in section 10 below.',
  },
  {
    id: 's10',
    title: 'Draft BoD Resolution',
    body: RESOLUTION_STUB,
  },
  {
    id: 's11',
    title: 'Signatures & Approvals',
    body: '[Signature block — 8 slots across 5 tiers (Hierarchy, Parallel Bodies, Chairman, Group General Directors, Legal Counsel / GD Corp Gov). Slots populate progressively as each function — and the Chairman — approves.]',
  },
]

// ─── Assisted-drafting items ──────────────────────────────────────────────────
// 3 suggested integrations (sug-1→s2, sug-2→s6, sug-3→s3)
// 2 information gaps (gap-1→s7, gap-2→s8)

const suggestions: DraftSuggestion[] = [
  {
    id: 'sug-1',
    type: 'suggestion',
    label: 'Regulatory framework — REMIT / EMIR / ACER / RAAEY / MiFID II',
    targetSectionId: 's2',
    body: 'PPC S.A. seeks to capitalise on its cross-border transmission capacity between Greece and Romania (ENTSO-E NTC: 400 MW) by entering into a bilateral energy trading framework with Complexul Energetic Oltenia S.A. (CEO S.A.) covering up to 500 GWh/year. The arrangement is linked to PPC\'s 2026–2030 Business Plan (target: grow cross-border trading margins by 15% p.a.) and addresses the recurring operational need to balance seasonal load curves across the Greek–Romanian interconnector. A prior BoD decision (no. ΔΣ-2024-031) authorised exploratory negotiations with Romanian counterparties.\n\nApplicable legislative & regulatory framework:\n• REMIT Art. 4 (Regulation EU 1227/2011): mandatory pre-trade notification to ACER before contract signature — hard condition precedent built into the draft resolution;\n• EMIR Refit Art. 2(7) (Regulation EU 2019/834): the bilateral electricity forward qualifies as an OTC derivative; a reporting addendum designating REGIS-TR as trade repository and an EMIR Art. 10 clearing threshold non-excess representation are required;\n• RAAEY — L.4001/2011 Art. 11: prior notification to the Regulatory Authority for Energy required given the cross-border nature of the arrangement;\n• MiFID II Art. 2(1)(j): commodity derivative exemption assessed as applicable (physical delivery, commercial hedging purpose) — confirmed by Legal;\n• Legea energiei 123/2012 (Romania): CEO S.A. must obtain ANRE approval for cross-border bilateral agreements exceeding 100 GWh/year — counterparty representation and warranty included in the agreement.\n\nExpected benefits: EUR 3.5–4.5M p.a. net trading margin; enhanced Greece–Romania market position ahead of HEnEx–HUPX coupling (2027). Consequences of not deciding: foregone margin; loss of first-mover advantage; CEO S.A. may engage a competitor.',
  },
  {
    id: 'sug-2',
    type: 'suggestion',
    label: 'Implementation milestones — Q3 2026 to mid-2027',
    targetSectionId: 's6',
    body: 'Q3 2026: Contract negotiation and term sheet finalisation; REMIT Art. 4 pre-trade notification filed with ACER (target: written acknowledgement received before Board meeting); RAAEY prior notification filed under L.4001/2011 Art. 11.\nQ4 2026: Contract signature — conditional on ACER written acknowledgement on file and RAAEY notification acknowledged; commencement of first physical delivery period (Greek–Romanian interconnector, 400 MW NTC).\nQ1 2027: EMIR OTC derivative addendum executed, designating REGIS-TR as trade repository; EMIR Art. 10 clearing threshold non-excess representation in force; initial EMIR compliance review completed.\nMid-2027: Review of arrangement ahead of HEnEx–HUPX market coupling milestone; Trading & Origination to provide updated market impact assessment to the Board 6 months before coupling go-live.',
  },
  {
    id: 'sug-3',
    type: 'suggestion',
    label: 'Object: risk analysis & mitigation — 4-risk framework',
    targetSectionId: 's3',
    body: 'Scope: PPC S.A. seeks BoD authorisation to enter into a Bilateral Master Electricity Trading Agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) for the physical exchange of up to 500 GWh/year of electricity across the Greek–Romanian interconnector (400 MW NTC). Tenor: 24 months with annual renewal option. Price indexation: HUPX/HEnEx quarterly average. Governing law: Greek law. Dispute resolution: Athens Court of First Instance (commercial disputes panel).\n\nAlternatives considered: (1) Exchange-based trading via HEnEx/HUPX — excluded due to insufficient liquidity for volumes above 200 GWh/year on the cross-border order book; (2) Capacity auction via ENTSO-E coordinated allocation — excluded as this mechanism does not support bilateral price indexation; (3) No-action — excluded due to identified commercial opportunity (EUR 3.5–4.5M p.a. net margin).\n\nKey transaction terms: Duration 24 months, annual renewal option. Penalty clauses: EUR 500,000 per occurrence for force majeure abuse. Option rights: annual volume uplift option of +100 GWh with 60-day notice.\n\nRisk analysis & mitigation: (1) Regulatory — REMIT/EMIR non-compliance (Likelihood: Low, Impact: High) — mitigated by conditions precedent in draft resolution requiring ACER acknowledgement and RAAEY notification before signature; (2) Financial — EUR/RON FX basis ~2.3% (Likelihood: Medium, Impact: Medium) — mitigated by Treasury forward hedging programme (EUR 750K cost, within budget); (3) Commercial — CEO S.A. Fitch BB+ default (Likelihood: Low, Impact: Medium) — mitigated by Credit Support Annex (EUR 5M threshold); (4) Operational — interconnector curtailment (Likelihood: Low, Impact: Low) — mitigated by force majeure clause and quarterly capacity review clause.',
  },
]

const gaps: DraftSuggestion[] = [
  {
    id: 'gap-1',
    type: 'gap',
    label: 'Budget: quantified values required (sec. 7)',
    targetSectionId: 's7',
    body: 'Estimated annual notional value: EUR 32.5M (500 GWh × EUR 65/MWh, HUPX/HEnEx Q3 2026 forward curve, confirmed by Finance/Treasury on 7 June 2026). Classification: OPEX (commercial trading activity). Cost centre: CT-2400 (Trading & Origination). Account number: 6720.004 (bilateral energy purchases/sales).\n\nFX hedging cost: EUR 750,000 p.a. (EUR/RON forward programme, within Treasury risk appetite). Total budget envelope: EUR 40,000,000 p.a. — within the 2026 bilateral trading budget (BoD resolution ΔΣ-2025-047). Expected net contribution margin: EUR 3.5–4.5M p.a. under base-case forward curves.\n\nEMIR initial margin requirement: estimated EUR 1.2M — within available collateral facility headroom of EUR 8.4M. Counterparty credit risk (CEO S.A., Fitch BB+): acceptable under PPC Counterparty Risk Framework; Credit Support Annex with EUR 5M threshold required.',
  },
  {
    id: 'gap-2',
    type: 'gap',
    label: 'Counterparty: KYC & authorizations missing (sec. 8)',
    targetSectionId: 's8',
    body: '8.1 Counterparty Identification: Complexul Energetic Oltenia S.A. (CEO S.A.), registered in Romania (Registration No. J28/11/1998, VAT RO 2814214). Ownership: Romanian state via Ministry of Energy 77.15%; listed on Bucharest Stock Exchange (ticker: OLT). Credit rating: Fitch BB+ (stable outlook), confirmed June 2026.\n\nKYC completed 3 June 2026: AML screening — PASS; international sanctions (EU/UN/OFAC) — CLEAR; anti-corruption due diligence — NO adverse findings. Related-Party check: NOT a Related Party per PPC Group Related-Party Policy (confirmed Group Legal, 5 June 2026).\n\n8.2 Authorizations: The CEO of PPC S.A. is authorised to execute all transaction documents up to EUR 40M notional. The CTO is authorised to execute the EMIR OTC derivative addendum; sub-delegation to Group Treasurer is permitted in writing. The Board of Directors shall be informed within 10 business days of execution and satisfaction of all conditions precedent set out in the draft resolution.',
  },
]

// ─── Agent script ─────────────────────────────────────────────────────────────

export const draftingAgentScript: AgentScript = {
  agentId: 'recommendation-assistant',
  agentName: 'Recommendation Assistant',
  activityType: 'Reinvented with AI',
  cognition: ['Perceive', 'Reason', 'Act'],
  steps: [
    'Loading PPC recommendation template — 11-section εισήγηση format',
    'Parsing business need: Greece–Romania interconnector, 500 GWh/year',
    'Pre-filling sections 1–5 and 9–11 from business need and PPC template',
    'Identifying REMIT Art. 4 wholesale market disclosure obligations',
    'Flagging EMIR Refit OTC derivative reporting threshold',
    'Referencing ACER guidance on cross-border capacity allocation',
    'Adding RAAEY prior notification requirement (L.4001/2011 Art. 11)',
    'Scaffolding the draft-resolution section (10) — handed off to the Resolution Assistant',
    'Inserting signature skeleton — 8 slots across 5 tiers (incl. mandatory Chairman), populates as approvals are collected',
    'Identifying sections requiring completion — sections 6, 7, 8',
  ],
  result: `Template scaffolded across 11 sections (PPC εισήγηση format). Sections 1–5 and 9–11 are fully drafted. Sections 6, 7, and 8 require completion.

5 drafting suggestions ready: full regulatory framework with REMIT/EMIR/RAAEY/MiFID II (→ sec. 2), implementation milestones Q3 2026–mid-2027 (→ sec. 6), 4-risk framework with mitigants (→ sec. 3), budget and cost centre details (→ sec. 7), and counterparty KYC & authorizations (→ sec. 8).

The draft-resolution section (sec. 10) has been scaffolded with structural headers only — the operative resolution is intentionally left blank and is handed off to the Resolution Assistant, which proposes resolution options and inserts the recommended wording with its conditions precedent. Signature block (sec. 11) scaffolded — 8 pending slots across 5 tiers (incl. mandatory Chairman); slots fill progressively as each function and the Chairman approves.

Click "Apply" on each item to insert the pre-written content, or click "Auto-complete draft" to resolve all at once. Run the Resolution Assistant below to populate section 10.`,
  structuredOutput: {
    templateSections,
    // Left blank — the Resolution Assistant populates the resolution (and section 10).
    draftResolution: '',
    regulatoryRefs: [
      'REMIT Art. 4',
      'EMIR Refit',
      'ACER Guidance 2025',
      'RAAEY L.4001/2011 Art. 11',
      'MiFID II Art. 2(1)(j)',
      'HEnEx Market Coupling Rules',
    ],
    suggestions,
    gaps,
  } satisfies DraftingOutput,
  sources: [
    { id: 'pb-4', relevance: 'Section structure and regulatory scaffolding modelled on this precedent' },
    { id: 'pb-5', relevance: 'Bilateral offtake template and draft resolution wording' },
    { id: 'pb-2', relevance: 'FX exposure section and Treasury sign-off language' },
    { id: 'pb-10', relevance: 'Full 11-section PPC εισήγηση format reference; tranche payment and KPI structure' },
  ],
}
