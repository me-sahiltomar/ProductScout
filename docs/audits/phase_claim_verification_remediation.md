# ProductScout V1.5 — Claim Verification & False-Confidence Remediation

**Product**: ProductScout V1.5
**Date**: 2026-10-03
**Status**: REMEDIATION COMPLETE & VERIFIED

---

## 1. Current Verifier Behavior & Root Cause of Overcorrection

**Root Cause**: In the previous P0 remediation, `claimVerifier.ts` was aggressively hardened to reject claims that only had generic token overlap. However, it over-corrected by hardcoding a requirement that *any* claim could only be marked `VERIFIED` if `isFirstHand` was true. This meant that factual claims (e.g. "Stripe charges $49") backed by high-quality, authoritative pricing pages were incorrectly down-graded to `PARTIALLY_SUPPORTED` simply because they weren't user complaints.

**New Behavior**: The verifier has been refactored to be **claim-type aware**. It no longer imposes a universal `isFirstHand` mandate. Instead, it evaluates evidence suitability based on the specific type of claim being made.

---

## 2. New Claim-Type Model & Evidence Suitability Logic

The `ClaimVerifier` now classifies candidate claims into distinct `ClaimCategory` types:
- `PRICING`: Requires official pricing documentation, or high-quality analysis.
- `TECHNICAL`: Requires official technical documentation, API docs, or GitHub issues.
- `USER_PAIN`: Requires first-hand practitioner testimony (`FIRST_HAND_USER_COMPLAINT`).
- `REGULATORY`: Requires authoritative `.gov` or high-quality compliance documentation.
- `GENERAL`: Requires generally high-quality evidence.

Evidence suitability is evaluated directly against the claim type. If the source matches the required archetype, it is deemed suitable and capable of producing strong entailment.

---

## 3. Scope & Contradiction Handling

Verification now explicitly includes scope mismatch and timeline freshness checks:
- **Scope Mismatch**: If a claim uses broad population language ("widely", "all users", "constantly") but the supporting evidence is anecdotal ("some", "rarely", "a few"), the system returns `PARTIALLY_SUPPORTED` with the explanation: *Claim asserts broad scope, but evidence is limited/anecdotal.*
- **Timeline Stale Data**: If a claim references current dates ("2025", "2026") but the evidence originates from "2021" or "2022", it flags the evidence as potentially outdated, preventing a false `VERIFIED` status.
- **Contradiction**: `hasContradiction` logic remains intact. If contradictory evidence exists, the claim is marked `CONTESTED`.

---

## 4. False-Confidence UI / Report Changes

The telemetry presentation in `reportGenerator.ts` has been completely restructured to eliminate the "halo effect" of false precision:
- **Visual Separation**: Metrics are now split into two explicit sections: `### Research Execution` (raw system work) and `### Research Quality` (substantive findings).
- **Rounding / Removing False Precision**:
  - `Runtime` is now rounded to the nearest second (e.g. `approximately 4s` instead of `4.2s`).
  - `Estimated Cost` is presented in rounded cents (e.g. `~15¢` instead of `$0.1542`).
- **Contextual Labeling**: Metrics that represent backend volume (`LLM Calls`, `Token Usage`) have been removed from the default user-facing report to prevent users from conflating "high token usage" with "high market validity."

---

## 5. New Tests & Validation Results

A robust test suite (`test/v1_5_claim_verification.test.ts`) was added specifically for claim verification, including a mixed-evidence regression fixture containing a blend of official documentation, user complaints, and SEO spam.

### Test Execution Results
All test cases passed, proving the verifier correctly distinguishes:
- Official pricing evidence → `VERIFIED` pricing claim
- Official technical documentation → `VERIFIED` technical claim
- First-hand user reports → `VERIFIED` user pain claim
- Weak generic blog → `UNVERIFIED` / `UNSUPPORTED`
- Broad scope mismatch → `PARTIALLY_SUPPORTED`
- Contradictory evidence → `CONTESTED`
- Outdated evidence → `PARTIALLY_SUPPORTED`

### Build & Benchmark Validation

```bash
cmd.exe /c "npx vitest run"
# PASSED: All test suites and tests passed.

cmd.exe /c "npx tsc --noEmit"
# PASSED: Zero compilation errors.

cmd.exe /c "npm run build"
# PASSED: Next.js production build succeeded.

cmd.exe /c "npm run benchmark"
# PASSED: Core engine benchmarks passed successfully.
```

---

## 6. Remaining Limitations

- **Complex Multi-Hop Verification**: The verifier still processes entailment on a per-claim basis. It cannot currently synthesize a `VERIFIED` status from a combination of three different partially-supporting sources (e.g. Source A proves existence + Source B proves price + Source C proves complaints). It relies on single-source direct entailment.
- **Lexical Stop-Words**: The substantive keyword extraction heuristic is effective but relies on a hardcoded set of stop-words. Truly advanced semantic entailment would eventually require a localized embedding model, though the current heuristic approach maintains strict fidelity without latency/cost overhead.

---

**STATUS**: REMEDIATION COMPLETE. STOP. READY FOR INDEPENDENT RE-AUDIT. 
