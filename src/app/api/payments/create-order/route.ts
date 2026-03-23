import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflowId, couponCode } = await req.json();

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (!workflow.isPaid) {
      return NextResponse.json({ error: 'Workflow is free' }, { status: 400 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        workflowId: workflow.id,
        status: 'COMPLETED',
      },
    });

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    let finalPrice = workflow.price;
    let originalPrice = workflow.price;
    let discountAmount = 0;
    let appliedDiscountPercentage = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });
      if (coupon && coupon.isActive) {
        if (!coupon.validUntil || new Date() <= coupon.validUntil) {
           if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
             discountAmount = Math.floor((finalPrice * coupon.discountPercentage) / 100);
             finalPrice = Math.max(0, finalPrice - discountAmount);
             appliedDiscountPercentage = coupon.discountPercentage;
             
             // Increment used count
             await prisma.coupon.update({
               where: { id: coupon.id },
               data: { usedCount: { increment: 1 } }
             });
           }
        }
      }
    }

    // Amount in paise (multiply by 100)
    const amount = finalPrice * 100;
    const currency = workflow.currency || 'INR';

    // Fix receipt length error (must be <= 40). e.g., rcpt_a1b2c3d4_12345678 (max 40)
    const shortWorkflowId = workflowId.length > 10 ? workflowId.substring(workflowId.length - 10) : workflowId;
    const shortDate = Date.now().toString().substring(5); // Last 8 digits
    const receiptId = `rcpt_${shortWorkflowId}_${shortDate}`;

    const orderOptions = {
      amount,
      currency,
      receipt: receiptId.substring(0, 40),
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Frontend needs this to initialize SDK
      originalPrice,
      discountAmount,
      appliedDiscountPercentage,
    });

  } catch (error) {
    console.error('[CREATE_ORDER]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
