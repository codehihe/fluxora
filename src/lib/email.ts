import { prisma } from "@/lib/prisma";
import { sendAccessCodeEmail as sendResend } from "./resend";
import { sendAccessCodeEmail as sendNodemailer, sendEmail as sendNodemailerGeneric } from "./nodemailer";

export type EmailProvider = "resend" | "nodemailer";

export async function getEmailProvider(): Promise<EmailProvider> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "email_provider" },
        });
        return (setting?.value as EmailProvider) || "resend";
    } catch (error) {
        console.error("Failed to fetch email provider setting:", error);
        return "resend"; // Default fallback
    }
}

export async function setEmailProvider(provider: EmailProvider) {
    await prisma.systemSetting.upsert({
        where: { key: "email_provider" },
        update: { value: provider },
        create: {
            key: "email_provider",
            value: provider,
            description: "Active email service provider (resend or nodemailer)"
        },
    });
}

export async function sendAccessCodeEmail(to: string, accessCode: string) {
    const provider = await getEmailProvider();

    console.log(`📧 Sending email using provider: ${provider}`);

    if (provider === "nodemailer") {
        return sendNodemailer(to, accessCode);
    } else {
        return sendResend(to, accessCode);
    }
}

export async function sendEmail(params: {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
}) {
    const provider = await getEmailProvider();

    console.log(`📧 Sending generic email using provider: ${provider}`);

    if (provider === "nodemailer") {
        return sendNodemailerGeneric(params);
    } else {
        // Resend implementation using the raw client
        const { resend } = await import("./resend");
        return resend.emails.send({
            from: 'FlowKit <noreply@flowkit.in>',
            to: params.to,
            subject: params.subject,
            text: params.text,
            html: params.html,
        });
    }
}

export async function sendPurchaseEmail(to: string, userName: string, workflow: any) {
    const amountStr = (workflow.price).toLocaleString('en-IN', { style: 'currency', currency: workflow.currency || 'INR' });
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #FF6B35;">Thanks for your purchase, ${userName}! 🎉</h2>
        <p>Your payment of <strong>${amountStr}</strong> for <strong>${workflow.name}</strong> was successful.</p>
        
        <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #111;">Order Details</h3>
          <ul style="list-style: none; padding: 0; color: #4b5563;">
            <li style="margin-bottom: 10px;">📦 <strong>Workflow:</strong> ${workflow.name}</li>
            <li style="margin-bottom: 10px;">💳 <strong>Amount Paid:</strong> ${amountStr}</li>
          </ul>
        </div>
        
        <p>You can now access your workflow (view, download, import) directly from your dashboard.</p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="${appUrl}/dashboard/purchases" style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View My Purchases
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;" />
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          Need help? Reply to this email.<br>
          <strong>- The Fluxora Team</strong>
        </p>
      </div>
    `;
  
    await sendEmail({
      to,
      subject: 'Thanks for your purchase 🎉 - Fluxora',
      text: `Thanks for your purchase, ${userName}! Your payment of ${amountStr} for ${workflow.name} was successful.`,
      html,
    });
}
