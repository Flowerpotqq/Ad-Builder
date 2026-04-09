import { Resend } from "resend";

let resendInstance: Resend | null = null;

/** Get or create the Resend client singleton */
export function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/** Inject tracking pixel and click-wrap links into HTML */
export function injectTracking(
  html: string,
  campaignId: string,
  contactId: string,
  appUrl: string
): string {
  // Inject tracking pixel before closing </body>
  const trackingPixel = `<img src="${appUrl}/api/track/open?cid=${campaignId}&uid=${contactId}" width="1" height="1" style="display:none;" alt="" />`;
  let trackedHtml = html.replace("</body>", `${trackingPixel}</body>`);

  // Wrap all links for click tracking (except unsubscribe and tracking pixel)
  trackedHtml = trackedHtml.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      // Skip tracking pixel and unsubscribe URLs
      if (url.includes("/api/track/") || url.includes("unsubscribe")) {
        return match;
      }
      const trackedUrl = `${appUrl}/api/track/click?cid=${campaignId}&uid=${contactId}&url=${encodeURIComponent(url)}`;
      return `href="${trackedUrl}"`;
    }
  );

  return trackedHtml;
}
