import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, workflowId } = await req.json();

    if (!code || !workflowId) {
      return NextResponse.json({ error: 'Code and Workflow ID are required' }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || !workflow.isPaid) {
      return NextResponse.json({ error: 'Invalid workflow' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Coupon is inactive' }, { status: 400 });
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Calculate new price
    const originalPrice = workflow.price;
    const discountAmount = Math.floor((originalPrice * coupon.discountPercentage) / 100);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return NextResponse.json({
      valid: true,
      originalPrice,
      discountPercentage: coupon.discountPercentage,
      discountAmount,
      finalPrice
    });

  } catch (error) {
    console.error('[VALIDATE_COUPON]', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
