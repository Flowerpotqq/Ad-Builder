import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getResendClient, injectTracking } from "@/lib/email/resend-client";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** POST /api/campaigns/[id]/send — Send a campaign to its contact list */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const fromName = process.env.RESEND_FROM_NAME || "NAP Solutions";

    // Load campaign with contact list
    const campaign = await prisma.campaign.findFirst({
      where: { id: params.id, userId },
      include: {
        contactList: {
          include: { contacts: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Validation
    if (!campaign.htmlContent) {
      return badRequestResponse("Campaign has no email content");
    }
    if (!campaign.subject) {
      return badRequestResponse("Campaign has no subject line");
    }
    if (!campaign.contactList || campaign.contactList.contacts.length === 0) {
      return badRequestResponse("No contacts in the selected list");
    }

    // Update status to sending
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: "SENDING" },
    });

    const resend = getResendClient();
    let successCount = 0;
    let failCount = 0;

    // Send to each contact
    for (const contact of campaign.contactList.contacts) {
      try {
        // Personalize HTML
        let personalizedHtml = campaign.htmlContent;
        personalizedHtml = personalizedHtml.replace(
          /\{\{firstName\}\}/g,
          contact.firstName || "there"
        );
        personalizedHtml = personalizedHtml.replace(
          /\{\{lastName\}\}/g,
          contact.lastName || ""
        );
        personalizedHtml = personalizedHtml.replace(
          /\{\{email\}\}/g,
          contact.email
        );

        // Inject tracking
        const trackedHtml = injectTracking(
          personalizedHtml,
          campaign.id,
          contact.id,
          appUrl
        );

        // Send via Resend
        await resend.emails.send({
          from: `${campaign.fromName || fromName} <${campaign.fromEmail || fromEmail}>`,
          to: [contact.email],
          subject: campaign.subject,
          html: trackedHtml,
          text: campaign.previewText || undefined,
        });

        // Record send event
        await prisma.emailEvent.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            type: "SENT",
          },
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error);
        failCount++;

        await prisma.emailEvent.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            type: "FAILED",
            metadata: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: failCount === campaign.contactList.contacts.length ? "FAILED" : "SENT",
        sentAt: new Date(),
        totalSent: successCount,
      },
    });

    return NextResponse.json({
      success: true,
      data: { sent: successCount, failed: failCount },
    });
  } catch (error) {
    console.error("Send campaign error:", error);

    // Revert status on error
    try {
      await prisma.campaign.update({
        where: { id: params.id },
        data: { status: "FAILED" },
      });
    } catch {
      // Ignore revert errors
    }

    return serverErrorResponse("Failed to send campaign");
  }
}
