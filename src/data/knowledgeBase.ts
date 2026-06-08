export interface PrecedentSnippet {
  id: string
  label: string
  text: string
}

export interface PastRecommendation {
  id: string
  title: string
  businessUnit: string
  date: string
  summary: string
  regulatoryRefs: string[]
  resolution: string
  outcome: 'Approved' | 'Approved with conditions' | 'Deferred'
  snippets: PrecedentSnippet[]
}

export const PAST_RECOMMENDATIONS: PastRecommendation[] = [
  {
    id: 'pb-1',
    title: 'REMIT-compliant bilateral power swap with ČEZ a.s.',
    businessUnit: 'Procurement',
    date: '2024-09-15',
    outcome: 'Approved with conditions',
    regulatoryRefs: ['REMIT Art. 4', 'ACER Guidance 2025', 'EMIR Refit'],
    summary:
      'Bilateral power exchange arrangement with ČEZ a.s. (Czech Republic) for 350 MW NTC on the Greek–Bulgarian interconnector. ACER pre-trade notification under REMIT Art. 4 was identified as a hard condition precedent; the Board resolution made contract signature contingent on written ACER acknowledgement being on file. EMIR derivative addendum was required within 30 days of signing.',
    resolution:
      'The Board approved the bilateral power exchange arrangement with ČEZ a.s. subject to: (i) ACER pre-trade notification being formally acknowledged and on file before contract signature; and (ii) execution of the EMIR derivative addendum within 30 days of signing.',
    snippets: [
      {
        id: 'pb-1-s1',
        label: 'ACER condition precedent',
        text: 'Contract signature is a condition precedent to the submission and formal written acknowledgement of a REMIT Art. 4 pre-trade notification to the Agency for the Cooperation of Energy Regulators (ACER). A copy of the ACER acknowledgement letter shall be filed with the Corporate Secretary and with Regulatory Affairs no later than five business days prior to the scheduled Board meeting.',
      },
      {
        id: 'pb-1-s2',
        label: 'EMIR addendum commitment',
        text: 'Within 30 calendar days of contract signature, Treasury shall execute an EMIR OTC derivative reporting addendum with the counterparty, designating an EU-registered trade repository for the reporting of this bilateral arrangement under EMIR Refit Art. 2(7). The addendum shall include a clearing threshold non-excess representation pursuant to EMIR Art. 10.',
      },
      {
        id: 'pb-1-s3',
        label: 'REMIT reporting delegation',
        text: 'Regulatory Affairs is delegated authority to file, maintain and amend REMIT Art. 4 pre-trade notifications on behalf of PPC in connection with this arrangement. All correspondence with ACER relating to REMIT compliance shall be copied to the General Counsel.',
      },
    ],
  },
  {
    id: 'pb-2',
    title: 'EUR/RON currency hedging framework for cross-border operations',
    businessUnit: 'Finance / Treasury',
    date: '2023-11-20',
    outcome: 'Approved',
    regulatoryRefs: ['MiFID II Art. 2(1)(j)', 'EMIR Refit'],
    summary:
      'Approval of a structured EUR/RON hedging programme to manage FX exposure arising from PPC\'s cross-border energy trading activities in Romania. Treasury was authorised to execute forward contracts and FX options up to EUR 50M notional within the Board-approved risk appetite. Legal confirmed the instruments qualify for the MiFID II Art. 2(1)(j) commercial exemption.',
    resolution:
      'The Board approved the EUR/RON currency hedging framework for cross-border trading operations, authorising Treasury to execute forward contracts and options up to EUR 50M notional within the approved risk appetite. Legal confirmed MiFID II Art. 2(1)(j) exemption applies.',
    snippets: [
      {
        id: 'pb-2-s1',
        label: 'FX hedging authority',
        text: 'Treasury is authorised to execute EUR/RON forward contracts and vanilla FX options up to an aggregate notional of EUR 50,000,000, solely for the purpose of hedging commercial FX exposure arising from cross-border energy trading activities. No speculative positions are permitted. All hedging transactions shall be reported to the CFO on a monthly basis.',
      },
      {
        id: 'pb-2-s2',
        label: 'FX risk appetite statement',
        text: 'PPC targets a minimum hedge ratio of 70% on EUR/RON exposures exceeding EUR 5M arising from any single cross-border trading arrangement with a duration exceeding 12 months. Treasury may deviate from this target with the prior written approval of the CFO where market conditions make hedging cost-prohibitive.',
      },
    ],
  },
  {
    id: 'pb-3',
    title: 'EMIR derivative reporting programme — OTC energy instruments',
    businessUnit: 'Finance / Treasury',
    date: '2023-06-10',
    outcome: 'Approved',
    regulatoryRefs: ['EMIR Refit Art. 2(7)', 'MiFID II Art. 2(1)(j)'],
    summary:
      'Establishment of a group-wide EMIR-compliant OTC derivative reporting programme, covering bilateral electricity and gas forwards that qualify as OTC derivatives under EMIR Refit Art. 2(7). REGIS-TR was designated as trade repository. The programme includes clearing threshold monitoring under EMIR Art. 10 and an annual review mechanism.',
    resolution:
      'The Board approved the establishment of an EMIR-compliant OTC derivative reporting programme, designating REGIS-TR as trade repository and authorising the CFO to execute the necessary service agreements and delegation letters.',
    snippets: [
      {
        id: 'pb-3-s1',
        label: 'REGIS-TR designation clause',
        text: 'REGIS-TR S.A. is hereby designated as PPC\'s trade repository for the purposes of EMIR Refit Art. 9 reporting obligations in respect of OTC derivative contracts. Treasury is authorised to execute the REGIS-TR participant agreement and any amendments thereto on behalf of PPC. Alternative trade repositories may be designated by CFO resolution in the event of material service disruption.',
      },
      {
        id: 'pb-3-s2',
        label: 'EMIR Art. 10 clearing threshold representation',
        text: 'PPC hereby represents and warrants on the date of each transaction that its aggregate OTC derivative positions (excluding contracts entered into for hedging purposes as defined in EMIR Art. 10(3)) do not exceed the applicable clearing thresholds specified in Commission Delegated Regulation (EU) 2016/2251. A clearing threshold non-excess representation shall be included in all relevant EMIR addenda.',
      },
      {
        id: 'pb-3-s3',
        label: 'Annual EMIR compliance review',
        text: 'Legal and Treasury shall conduct an annual review of PPC\'s EMIR compliance status, including clearing threshold recalculation, trade repository reporting accuracy, and any changes to regulatory requirements arising from EMIR Refit amendments. Results shall be reported to the Audit Committee.',
      },
    ],
  },
  {
    id: 'pb-4',
    title: 'HEnEx market participation expansion — day-ahead and intraday',
    businessUnit: 'Trading & Origination',
    date: '2024-03-05',
    outcome: 'Approved',
    regulatoryRefs: ['HEnEx Market Coupling Rules', 'REMIT Art. 4', 'RAAEY L.4001/2011 Art. 11'],
    summary:
      'Expansion of PPC\'s participation on the Hellenic Energy Exchange (HEnEx) to include intraday and cross-border capacity auctions, in addition to existing day-ahead market activities. The recommendation provided the template for bilateral trading agreement section structure and the standard draft resolution format for energy trading approvals. All 7 content sections were validated against HEnEx membership rules.',
    resolution:
      'The Board approved PPC\'s expanded market participation on HEnEx, authorising participation in all intraday and cross-border capacity auction products and granting the Chief Trading Officer authority to execute any required membership amendments.',
    snippets: [
      {
        id: 'pb-4-s1',
        label: 'Standard energy trading authority',
        text: 'The Chief Trading Officer (or designated delegate) is authorised to execute energy trading agreements, capacity nominations, and related ancillary documents within the parameters approved herein, without further Board approval, for a period of [X] years from the date of this resolution.',
      },
      {
        id: 'pb-4-s2',
        label: 'HEnEx market coupling transition provision',
        text: 'This arrangement is subject to review upon the implementation of the HEnEx–HUPX market coupling milestone anticipated in mid-2027. Trading & Origination shall provide the Board with an updated impact assessment no later than 6 months prior to the coupling go-live date.',
      },
    ],
  },
  {
    id: 'pb-5',
    title: 'Power Purchase Agreement with Mytilinaios S.A. (120 MW, 10-year)',
    businessUnit: 'Procurement',
    date: '2023-08-22',
    outcome: 'Approved with conditions',
    regulatoryRefs: ['REMIT Art. 4', 'RAAEY L.4001/2011 Art. 11', 'ACER Guidance 2025'],
    summary:
      'Ten-year Power Purchase Agreement with Mytilinaios S.A. for 120 MW of renewable output indexed to HUPX quarterly average. RAAEY prior notification under L.4001/2011 Art. 11 was a mandatory condition before signature. The Board resolution and draft resolution format from this precedent are directly reusable for bilateral procurement arrangements.',
    resolution:
      'The Board approved the 10-year PPA with Mytilinaios S.A. (120 MW, HUPX-indexed) subject to RAAEY prior notification under L.4001/2011 Art. 11 being filed and formally acknowledged by RAAEY before contract signature.',
    snippets: [
      {
        id: 'pb-5-s1',
        label: 'RAAEY prior notification condition',
        text: 'Contract signature is conditioned upon the filing and formal acknowledgement of a prior notification to RAAEY (Regulatory Authority for Energy) pursuant to L.4001/2011 Art. 11. Regulatory Affairs shall file the notification no later than 20 business days prior to the targeted signing date and shall provide the Board Secretary with a copy of the RAAEY acknowledgement letter immediately upon receipt.',
      },
      {
        id: 'pb-5-s2',
        label: 'Bilateral PPA standard terms reference',
        text: 'The agreement shall incorporate PPC\'s standard bilateral PPA terms and conditions (version 3.1, approved by the Board on [date]), save as varied by the specific commercial terms set out in the term sheet annexed hereto. Any material deviation from the standard terms requires the prior written approval of the General Counsel.',
      },
    ],
  },
  {
    id: 'pb-6',
    title: 'Greek–North Macedonia cross-border capacity allocation (300 MW)',
    businessUnit: 'Procurement',
    date: '2024-01-18',
    outcome: 'Approved',
    regulatoryRefs: ['REMIT Art. 4', 'ACER Guidance 2025', 'RAAEY L.4001/2011 Art. 11'],
    summary:
      'Long-term cross-border capacity allocation agreement on the Greek–North Macedonia interconnector (300 MW NTC). This precedent established the BoD pack structure and readiness checklist used for cross-border capacity approvals: 6-item pack including regulatory compliance matrix, legal opinion, ACER notification, and grid access confirmation.',
    resolution:
      'The Board approved the long-term cross-border capacity allocation agreement on the Greek–North Macedonia interconnector (300 MW NTC) and authorised the CEO to execute the grid access and transmission agreements with ADMIE and ESM.',
    snippets: [
      {
        id: 'pb-6-s1',
        label: 'Cross-border capacity BoD pack checklist',
        text: 'The BoD submission pack for any cross-border capacity arrangement exceeding 100 MW or 12 months\' duration shall include: (i) executed recommendation document with all 7 sections complete; (ii) ACER REMIT pre-trade notification acknowledgement; (iii) RAAEY prior notification acknowledgement; (iv) legal opinion on enforceability; (v) regulatory compliance matrix; and (vi) grid access confirmation from ADMIE or the relevant TSO.',
      },
      {
        id: 'pb-6-s2',
        label: 'Long-term capacity commitment clause',
        text: 'PPC commits to the long-term capacity allocation for the full contracted term, subject to force majeure provisions. Regulatory Affairs shall file annual compliance reports with RAAEY and ACER covering capacity utilisation, revenue sharing, and any material changes to the interconnector\'s technical or regulatory status.',
      },
    ],
  },
  {
    id: 'pb-7',
    title: 'RAAEY prior-notification framework for bilateral energy agreements',
    businessUnit: 'Regulatory Affairs',
    date: '2023-04-14',
    outcome: 'Approved',
    regulatoryRefs: ['RAAEY L.4001/2011 Art. 11', 'REMIT Art. 4'],
    summary:
      'Establishment of a standardised RAAEY prior-notification procedure applicable to all bilateral energy trading agreements requiring regulatory filing under L.4001/2011 Art. 11. The framework includes a standard filing template, a 20-business-day lead time requirement, and a delegation of authority to the Director of Regulatory Affairs. This precedent is cited in all subsequent bilateral agreement recommendations.',
    resolution:
      'The Board approved the standardised RAAEY prior-notification procedure for bilateral energy trading agreements and delegated to the Director of Regulatory Affairs the authority to file, maintain and amend notifications with RAAEY on PPC\'s behalf.',
    snippets: [
      {
        id: 'pb-7-s1',
        label: 'RAAEY filing delegation and timeline',
        text: 'The Director of Regulatory Affairs is delegated authority to file prior notifications with RAAEY pursuant to L.4001/2011 Art. 11 for all bilateral energy trading agreements with a term exceeding 12 months or an annual volume exceeding 100 GWh. Notifications shall be filed at least 20 business days before the targeted contract signature date. Filing confirmation and the RAAEY acknowledgement shall be uploaded to the Board portal within 2 business days of receipt.',
      },
      {
        id: 'pb-7-s2',
        label: 'RAAEY notification standard content',
        text: 'Each RAAEY prior notification shall include: (i) counterparty details and ownership structure; (ii) contract duration, volume profile, and price formula; (iii) confirmation of REMIT Art. 4 pre-trade notification status; (iv) regulatory compliance summary covering applicable EU and Greek law; and (v) a declaration that the arrangement does not constitute a concentrative merger under the HCC Competition Act.',
      },
    ],
  },
  {
    id: 'pb-8',
    title: 'CEO S.A. (Romania) counterparty risk and credit framework',
    businessUnit: 'Finance / Treasury',
    date: '2024-05-07',
    outcome: 'Approved with conditions',
    regulatoryRefs: ['EMIR Refit', 'MiFID II Art. 2(1)(j)'],
    summary:
      'Approval of a bilateral counterparty risk and credit framework governing PPC\'s trading exposure to CEO S.A. (Complexul Energetic Oltenia S.A., Romanian state-owned electricity producer, Fitch BB+). The framework set a EUR 40M maximum exposure limit, required a credit support annex as a condition of any bilateral agreement, and confirmed that CEO S.A.\'s Fitch BB+ rating is within PPC\'s approved risk appetite.',
    resolution:
      'The Board approved the credit risk framework for bilateral energy trading with CEO S.A. (Fitch BB+), setting a EUR 40M maximum bilateral exposure limit and requiring a credit support annex (CSA) before any contract execution. CEO S.A.\'s Fitch BB+ rating was confirmed within PPC\'s risk appetite for non-investment-grade counterparties.',
    snippets: [
      {
        id: 'pb-8-s1',
        label: 'CEO S.A. credit limit and CSA requirement',
        text: 'Maximum bilateral trading exposure to CEO S.A. (Complexul Energetic Oltenia S.A.) is set at EUR 40,000,000 notional (mark-to-market). A credit support annex (CSA) with a two-way threshold of EUR 5M and minimum transfer amount of EUR 500,000 shall be executed prior to the commencement of trading. CEO S.A.\'s Fitch BB+ external rating has been assessed as within PPC\'s approved risk appetite for non-investment-grade energy counterparties.',
      },
      {
        id: 'pb-8-s2',
        label: 'Romanian counterparty ANRE representation',
        text: 'PPC shall require CEO S.A. to represent and warrant, as at the date of each transaction, that it holds all requisite approvals from the Romanian National Energy Regulatory Authority (ANRE) for cross-border bilateral energy transactions of the relevant type and volume. A termination right shall be included in the agreement in the event that ANRE approval is withdrawn or suspended.',
      },
    ],
  },
  {
    id: 'pb-9',
    title: 'MiFID II commodity derivative classification policy review',
    businessUnit: 'Legal / Compliance',
    date: '2023-02-28',
    outcome: 'Approved',
    regulatoryRefs: ['MiFID II Art. 2(1)(j)', 'EMIR Refit Art. 2(7)'],
    summary:
      'Board approval of PPC\'s updated MiFID II commodity derivative classification policy. Legal confirmed that physical power and gas forward contracts within PPC\'s trading book qualify for the Art. 2(1)(j) commercial exemption, provided they are settled by physical delivery and entered into for commercial hedging purposes. An annual exemption assessment and classification review was established as a standing governance requirement.',
    resolution:
      'The Board approved the updated MiFID II commodity derivative classification policy, confirming that physical power and gas forward contracts qualifying under Art. 2(1)(j) are exempt from MiFID II authorisation requirements, and authorising Legal to maintain the annual exemption assessment.',
    snippets: [
      {
        id: 'pb-9-s1',
        label: 'MiFID II Art. 2(1)(j) exemption confirmation',
        text: 'Legal has confirmed, following an assessment conducted in accordance with the ESMA Q&A on MiFID II commodity derivative issues, that the bilateral electricity forward contracts covered by this recommendation qualify for the Art. 2(1)(j) commercial exemption on the basis that: (i) they are settled by physical delivery; (ii) they are entered into for commercial hedging or funding purposes; and (iii) PPC does not apply for authorisation as an investment firm. This confirmation is subject to annual review.',
      },
      {
        id: 'pb-9-s2',
        label: 'Annual classification review commitment',
        text: 'Legal, with the assistance of Treasury, shall conduct an annual review of PPC\'s MiFID II commodity derivative classification no later than 30 September of each year, covering: changes in ESMA guidance, changes in PPC\'s trading activities, and any new instruments added to the trading book. The review report shall be presented to the Audit Committee.',
      },
    ],
  },
]

export const KB_PAST_RECS_BY_ID: Map<string, PastRecommendation> = new Map(
  PAST_RECOMMENDATIONS.map((r) => [r.id, r])
)
