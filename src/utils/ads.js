/**
 * Google H5 Games Ad Placement API — rewarded ad wrapper.
 *
 * Callbacks (exactly one of the first three always fires, then onDone):
 *   onGranted   — user watched the full ad → grant the reward
 *   onDismissed — user actively closed the ad early → no reward
 *   onNoAd      — no ad was available, or SDK not ready → caller can fall back
 *   onDone      — always called last
 *
 * A 3-second timeout guarantees onNoAd fires even if adBreakDone never arrives
 * (e.g. SDK not yet initialised, network error, localhost restrictions).
 */
export function showRewardedAd({ name = 'hint', onGranted, onDismissed, onNoAd, onDone } = {}) {
  if (typeof window.adBreak !== 'function') {
    console.log('[Ads] adBreak not available — SDK not loaded');
    onNoAd?.();
    onDone?.();
    return;
  }

  let resolved = false;
  let adShown  = false;

  function finish(cb) {
    if (resolved) return;
    resolved = true;
    clearTimeout(fallbackTimer);
    cb?.();
    onDone?.();
  }

  // Safety net: if adBreakDone never arrives, fall back after 3 seconds.
  const fallbackTimer = setTimeout(() => {
    console.log('[Ads] timeout — SDK did not respond, falling back');
    finish(onNoAd);
  }, 3000);

  window.adBreak({
    type: 'reward',
    name,
    beforeReward: (showAd) => { adShown = true; showAd(); },
    adViewed:    () => finish(onGranted),
    adDismissed: () => finish(onDismissed),
    adBreakDone: (info) => {
      console.log(`[Ads] adBreakDone — breakStatus: ${info.breakStatus}`);
      if (!adShown) finish(onNoAd); // no ad was shown → fall back
      // if adShown, adViewed/adDismissed already called finish()
    },
  });
}
