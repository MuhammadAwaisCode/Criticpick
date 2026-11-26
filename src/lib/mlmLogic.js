/**
 * ============================================================================
 * CRITICPICK MLM / AFFILIATE COMMISSION LOGIC
 * Extracted from 4 source documents. NO UI CODE — pure data + calculation logic.
 * ============================================================================
 *
 * SOURCE CONFLICT NOTICE (read before using):
 * The 4 documents do NOT agree with each other on two important points.
 * This file uses the LATEST/most-refined version as the default (Doc D below,
 * which explicitly says it preserves the original % and rank logic from Doc A
 * but tightens definitions/guardrails). Both variants are kept in the config
 * so you can switch with one flag.
 *
 * Doc A = CRITICPICK_MLM_Affiliate_Program_Specification.pdf   (v1.0 original)
 * Doc B = Untitled_document.docx                                (Roman Urdu planning note — no new formulas, just scope/volumes list)
 * Doc C = Untitled_document_1_.docx  ("Comprehensive System Architecture...")
 * Doc D = Untitled_document_2_.docx  ("Affiliate & Partner Growth Program v1.0" — risk-reviewed rewrite)
 *
 * CONFLICT 1 — Commission base:
 *   Doc A & Doc C: commission = % of order_amount / "net commissionable volume" (i.e. gross-ish order value)
 *   Doc D:         commission MUST be % of Criticpick's marketplace SERVICE FEE (platform's cut from vendor),
 *                  NOT gross sale value — explicitly flagged as a legal/margin risk otherwise.
 *   -> This file defaults to Doc D's basis (serviceFee). Set COMMISSION_BASE_MODE = 'GROSS_ORDER'
 *      to reproduce Doc A/C's original (unrefined) behavior instead.
 *
 * CONFLICT 2 — Rank qualification metric:
 *   Doc A & Doc D: qualification is headcount-based (e.g. Silver = 100 directly-registered team members;
 *                  Gold = 5 directly-sponsored affiliates who each independently reach Silver;
 *                  Diamond = 10 directly-sponsored affiliates who each independently reach Gold).
 *   Doc C:         adds a DIFFERENT/parallel PV (Personal Volume) + GV (Group Volume) currency-based
 *                  qualification model (e.g. Silver = PKR 5,000 PV + PKR 20,000 GV + 3 Active Directs),
 *                  which does not match Doc A/D's "100 team members" figure for Silver.
 *   -> Both are included below as separate config blocks (QUALIFICATION_HEADCOUNT, QUALIFICATION_PV_GV).
 *      Doc D never mentions PV/GV, so headcount is treated as the primary/default model here.
 *      You (or the business owner) need to pick ONE qualification model before this goes to production —
 *      Doc D itself flags several numbers as open placeholders (see OPEN_DECISIONS at the bottom).
 *
 * Everything else below (4-rank structure, breakaway logic, override %s, 365-day attribution,
 * refund/pending handling, payout cap) is consistent across the documents that mention it.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. TIERS & LEVELS BREAKDOWN
// ----------------------------------------------------------------------------
// 4 ranks. Commission has up to 3 "levels" per order:
//   Level 1 (Personal)      — commission the referring affiliate earns on their own direct sale
//   Level 2 (Direct/Team)   — override an upline earns on sales made by their direct/personal team
//   Level 3 (Second-degree) — Diamond-only: override on their Gold/Silver sub-teams' team sales
// Diamond also triggers "breakaway" (see BREAKAWAY_CONFIG) rather than continuing indefinitely upward.

const RANK_TIERS = {
  BASIC: {
    level: 1,
    personalCommissionRate: 0.06,      // 6.00% on own direct sales (Doc A, C, D all agree)
    tier2OverrideRate: 0.0,
    tier3OverrideRate: 0.0,
  },
  SILVER: {
    level: 2,
    personalCommissionRate: 0.06,      // 6.00% on own direct sales
    tier2OverrideRate: 0.01,           // 1.00% on total group sales
    tier2OverrideAppliesToGroupSizeRange: [100, 500], // override only active while group is 100–500 members (Doc A)
    tier3OverrideRate: 0.0,
  },
  GOLD: {
    level: 3,
    personalCommissionRate: 0.10,      // 10.00% on own direct sales
    tier2OverrideRate: 0.01,           // 1.00% override on direct personal team's sales volume
    tier3OverrideRate: 0.0,
  },
  DIAMOND: {
    level: 4,
    personalCommissionRate: 0.15,      // 15.00% on own direct sales
    tier2OverrideRate: 0.01,           // 1.00% override on personal GOLD team's sales volume
    tier3OverrideRate: 0.005,          // 0.50% override on personal SILVER team's sales volume
    triggersBreakaway: true,
  },
};

// ----------------------------------------------------------------------------
// 2. CALCULATION BASE
// ----------------------------------------------------------------------------
const COMMISSION_BASE_MODE = 'SERVICE_FEE'; // 'SERVICE_FEE' (Doc D, recommended) | 'GROSS_ORDER' (Doc A/C, original)

/**
 * Doc D explicitly requires: commissionable value = vendor sale price × platform's own commission/service-fee rate.
 * Doc A/C never define a service fee at all — they compute commission directly off order_amount, which
 * Doc D flags as a payout-exceeding-revenue risk on a multi-vendor marketplace.
 *
 * @param {number} orderAmount       Gross order/sale value (what the customer paid)
 * @param {number} platformFeeRate   Criticpick's cut of the vendor sale (only used in SERVICE_FEE mode), e.g. 0.20 for 20%
 * @returns {number} the commissionable base value affiliate % rates are applied to
 */
function getCommissionableBase(orderAmount, platformFeeRate = null) {
  if (COMMISSION_BASE_MODE === 'SERVICE_FEE') {
    if (platformFeeRate == null) {
      throw new Error('platformFeeRate is required in SERVICE_FEE mode (Doc D). This value is an open decision — see OPEN_DECISIONS.');
    }
    return orderAmount * platformFeeRate; // marketplace_service_fee, per Doc D Section 5
  }
  // GROSS_ORDER mode — Doc A / Doc C original (pre-risk-review) behavior
  return orderAmount;
}

// ----------------------------------------------------------------------------
// 3. ELIGIBILITY & QUALIFICATION RULES
// ----------------------------------------------------------------------------

// --- Model 1: Headcount-based qualification (Doc A + Doc D — treated as primary/default) ---
const QUALIFICATION_HEADCOUNT = {
  BASIC:   { requirement: 'Default rank upon registration + KYC completion', directsRequired: 0 },
  SILVER:  { requirement: 'Personal downline network reaches 100 directly-registered affiliates', directsRequired: 100 },
  GOLD:    { requirement: '5 directly-sponsored affiliates who EACH independently qualify Silver', directsAtRequiredRank: { rank: 'SILVER', count: 5 } },
  DIAMOND: { requirement: '10 directly-sponsored affiliates who EACH independently qualify Gold', directsAtRequiredRank: { rank: 'GOLD', count: 10 } },
};

// --- Model 2: PV/GV currency-based qualification (Doc C only — conflicts with Model 1's Silver figure) ---
const QUALIFICATION_PV_GV = {
  BASIC:   { pv: 3000,  gv: 0,       activeDirects: 0 },  // PKR
  SILVER:  { pv: 5000,  gv: 20000,   activeDirects: 3 },
  GOLD:    { pv: 15000, gv: 150000,  activeDirects: 5 },
  DIAMOND: { pv: 50000, gv: 500000,  activeDirects: 10 },
};
// PV = Personal Volume: net commissionable value from affiliate's own direct sales in a calendar month.
// GV = Group Volume: cumulative net commissionable value of entire downline network in a calendar month (incl. own PV).
// "Active" direct = a Tier-2 affiliate who generates >= PKR 500 PV in the evaluation month.

// --- Other rules present across the documents ---
const OTHER_RULES = {
  minimumPersonalSalesPerRankPerMonth: 15000, // PKR, Doc D — placeholder, needs sign-off (see OPEN_DECISIONS)
  linkAttributionDays: 365,                   // Doc A, C, D all agree — resets on every new click (Doc D)
  rankMaintenance: 'Re-evaluated monthly. 2 consecutive months below qualifying threshold => soft-demote one rank (rates change, tree/relationships unaffected).', // Doc D
  activeDirectMinimumPV: 500, // PKR/month, Doc C
  uplineBinding: 'Permanent and non-transferable once set at registration; changeable only via Diamond breakaway.', // Doc A, D
  selfDealingRules: 'Self-referral, fake accounts, and refunded/cancelled orders must NOT generate commission.', // Doc D
};

// ----------------------------------------------------------------------------
// BREAKAWAY LOGIC (Diamond rank)
// ----------------------------------------------------------------------------
const BREAKAWAY_CONFIG = {
  enabled: true,
  onQualify: 'DIAMOND',
  effect: 'Affiliate + their entire downline detach from original sponsor tree and become a new independent root tree.',
  parentLosesOverrideOnDetachedTree: true, // going forward only — past-earned commission untouched (Doc D)
  // Doc D's addition on top of Doc A's "hard cutoff": a small lifetime override survives the breakaway
  // to preserve the original sponsor's incentive to keep mentoring toward Diamond.
  leadershipOverrideForFormerSponsor: {
    enabledInDocD: true,
    enabledInDocA: false, // Doc A/pdf has a hard, total cutoff — no residual override
    rateRange: [0.0025, 0.005], // 0.25%–0.5%, exact figure is an open decision
  },
};

// ----------------------------------------------------------------------------
// PAYOUT CAP & PENDING/REFUND HANDLING (Doc D only — not present in Doc A/C)
// ----------------------------------------------------------------------------
const PAYOUT_CONTROL_CONFIG = {
  maxPayoutCapPercentOfMonthlyServiceFee: [0.35, 0.45], // range given, exact value open decision
  returnWindowDays: null, // open decision — commission held "pending" until this many days pass with no refund
  onCapExceeded: 'Prorate all pending commissions down proportionally for that period; log for admin review.',
};

// ============================================================================
// 4. JAVASCRIPT HELPER FUNCTIONS
// ============================================================================

/**
 * Determines whether a given affiliate falls within an upline's override-eligible group,
 * per the per-rank rules in RANK_TIERS.
 *
 * @param {Object} upline    { rank, groupSize } — groupSize only relevant for SILVER
 * @param {Object} referred  { rank }             — the affiliate whose sale is being evaluated
 * @returns {{ rate: number, label: string }|null}
 */
function getOverrideRuleForUpline(upline, referred) {
  switch (upline.rank) {
    case 'SILVER': {
      const [min, max] = RANK_TIERS.SILVER.tier2OverrideAppliesToGroupSizeRange;
      if (upline.groupSize >= min && upline.groupSize <= max) {
        return { rate: RANK_TIERS.SILVER.tier2OverrideRate, label: 'Silver group override' };
      }
      return null;
    }
    case 'GOLD':
      // override on GOLD's own direct/personal team sales (any rank within their direct team)
      return { rate: RANK_TIERS.GOLD.tier2OverrideRate, label: 'Gold personal-team override' };
    case 'DIAMOND':
      if (referred.rank === 'GOLD') {
        return { rate: RANK_TIERS.DIAMOND.tier2OverrideRate, label: 'Diamond override on Gold team' };
      }
      if (referred.rank === 'SILVER') {
        return { rate: RANK_TIERS.DIAMOND.tier3OverrideRate, label: 'Diamond override on Silver team' };
      }
      return null;
    case 'FORMER_SPONSOR_POST_BREAKAWAY':
      if (BREAKAWAY_CONFIG.leadershipOverrideForFormerSponsor.enabledInDocD) {
        // exact rate must be chosen from rateRange — using midpoint as an example default
        const [lo, hi] = BREAKAWAY_CONFIG.leadershipOverrideForFormerSponsor.rateRange;
        return { rate: (lo + hi) / 2, label: 'Former-sponsor lifetime leadership override' };
      }
      return null;
    default:
      return null; // BASIC has no override rights
  }
}

/**
 * Core calculator — computes personal commission + every upline override for a single completed order.
 *
 * @param {number} orderAmount         Gross value of the order
 * @param {Object[]} referralTree      Ordered upline chain for the affiliate who made the sale, root-last-or-first
 *                                      doesn't matter — each entry: { affiliateId, rank, groupSize?, isFormerSponsor? }
 *                                      referralTree[0] is the affiliate who actually made the direct sale.
 * @param {string} userRank            Rank of the affiliate who made the direct sale (referralTree[0].rank)
 * @param {Object} [options]
 * @param {number} [options.platformFeeRate]  Required if COMMISSION_BASE_MODE === 'SERVICE_FEE'
 * @param {Object} [options.orderMeta]        { orderId, completedAt, isRefunded }
 * @returns {{ totalEarnings: number, breakdown: Object[], base: number }}
 */
function calculateAffiliateEarnings(orderAmount, referralTree, userRank, options = {}) {
  if (options.orderMeta?.isRefunded) {
    // Doc D: refunded/cancelled orders must not generate commission at all.
    return { totalEarnings: 0, breakdown: [], base: 0 };
  }

  const base = getCommissionableBase(orderAmount, options.platformFeeRate);
  const breakdown = [];

  // --- Level 1: personal commission for the affiliate who made the direct sale ---
  const rankConfig = RANK_TIERS[userRank];
  if (!rankConfig) throw new Error(`Unknown rank: ${userRank}`);

  const personalAmount = base * rankConfig.personalCommissionRate;
  breakdown.push({
    affiliateId: referralTree[0]?.affiliateId ?? null,
    level: 1,
    type: 'personal',
    rank: userRank,
    rate: rankConfig.personalCommissionRate,
    amount: personalAmount,
  });

  // --- Level 2 / 3: walk the rest of the upline chain and apply override rules ---
  const referred = { rank: userRank };
  for (let i = 1; i < referralTree.length; i++) {
    const upline = referralTree[i];
    const effectiveUpline = upline.isFormerSponsor
      ? { ...upline, rank: 'FORMER_SPONSOR_POST_BREAKAWAY' }
      : upline;

    const rule = getOverrideRuleForUpline(effectiveUpline, referred);
    if (rule) {
      const overrideAmount = base * rule.rate;
      breakdown.push({
        affiliateId: upline.affiliateId,
        level: upline.rank === 'DIAMOND' && referred.rank === 'SILVER' ? 3 : 2,
        type: 'override',
        rank: upline.rank,
        rule: rule.label,
        rate: rule.rate,
        amount: overrideAmount,
      });
    }
  }

  const totalEarnings = breakdown.reduce((sum, entry) => sum + entry.amount, 0);
  return { totalEarnings, breakdown, base };
}

/**
 * Splits a set of already-calculated commission entries into pending vs approved,
 * based on Doc D's rule: commission is held "pending" until the order's return/refund
 * window closes, then becomes "approved" (payable).
 *
 * @param {Object[]} commissionEntries  Each: { amount, orderCompletedAt (Date), isRefunded }
 * @param {number} returnWindowDays
 * @param {Date} [now]
 * @returns {{ pending: Object[], approved: Object[], pendingTotal: number, approvedTotal: number }}
 */
function splitPendingVsApproved(commissionEntries, returnWindowDays, now = new Date()) {
  const pending = [];
  const approved = [];

  for (const entry of commissionEntries) {
    if (entry.isRefunded) continue; // excluded entirely, not even pending

    const msSinceCompletion = now - new Date(entry.orderCompletedAt);
    const windowMs = returnWindowDays * 24 * 60 * 60 * 1000;

    if (msSinceCompletion >= windowMs) {
      approved.push(entry);
    } else {
      pending.push(entry);
    }
  }

  const sum = (arr) => arr.reduce((total, e) => total + e.amount, 0);
  return {
    pending,
    approved,
    pendingTotal: sum(pending),
    approvedTotal: sum(approved),
  };
}

/**
 * Applies the monthly payout cap (Doc D): if total approved payouts for the month exceed
 * maxPayoutCapPercent of that month's total marketplace service fee revenue, prorate down.
 *
 * @param {Object[]} approvedEntries          Each: { amount, ... }
 * @param {number} totalServiceFeeThisMonth
 * @param {number} maxPayoutCapPercent        e.g. 0.40 for 40%
 * @returns {{ entries: Object[], wasCapped: boolean, capAmount: number }}
 */
function applyMonthlyPayoutCap(approvedEntries, totalServiceFeeThisMonth, maxPayoutCapPercent) {
  const capAmount = totalServiceFeeThisMonth * maxPayoutCapPercent;
  const rawTotal = approvedEntries.reduce((sum, e) => sum + e.amount, 0);

  if (rawTotal <= capAmount || rawTotal === 0) {
    return { entries: approvedEntries, wasCapped: false, capAmount };
  }

  const scaleFactor = capAmount / rawTotal;
  const proratedEntries = approvedEntries.map((e) => ({ ...e, amount: e.amount * scaleFactor, prorated: true }));
  return { entries: proratedEntries, wasCapped: true, capAmount };
}

// ----------------------------------------------------------------------------
// OPEN DECISIONS (explicitly unresolved in the source documents — Doc D Section 8)
// ----------------------------------------------------------------------------
const OPEN_DECISIONS = [
  'Exact minimum personal sales value required per rank per month (placeholder: PKR 15,000)',
  'Exact marketplace service fee % Criticpick takes from vendors (this is the base the whole calculator runs on)',
  'Leadership override % for broken-away trees (recommended range: 0.25%–0.5%)',
  'Max total monthly payout cap % of service fee revenue (recommended range: 35%–45%)',
  'Whether China-market affiliates use single-tier-only compensation until a direct-selling license is secured',
  'Which qualification model is authoritative: headcount-based (Doc A/D) vs PV/GV currency-based (Doc C) — they conflict on Silver\'s requirement',
];

module.exports = {
  RANK_TIERS,
  COMMISSION_BASE_MODE,
  getCommissionableBase,
  QUALIFICATION_HEADCOUNT,
  QUALIFICATION_PV_GV,
  OTHER_RULES,
  BREAKAWAY_CONFIG,
  PAYOUT_CONTROL_CONFIG,
  getOverrideRuleForUpline,
  calculateAffiliateEarnings,
  splitPendingVsApproved,
  applyMonthlyPayoutCap,
  OPEN_DECISIONS,
};