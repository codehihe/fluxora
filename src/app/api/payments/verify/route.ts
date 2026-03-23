import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPurchaseEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      workflowId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !workflowId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Save purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        workflowId: workflow.id,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: workflow.price,
        status: 'COMPLETED',
      },
      include: {
        workflow: true,
      }
    });

    // Attempt to send email but don't fail the request if it fails
    try {
      await sendPurchaseEmail(session.user.email, session.user.name || 'User', workflow);
    } catch (emailError) {
      console.error('Failed to send purchase confirmation email:', emailError);
    }

    return NextResponse.json({ success: true, purchase });

  } catch (error) {
    console.error('[VERIFY_PAYMENT]', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
