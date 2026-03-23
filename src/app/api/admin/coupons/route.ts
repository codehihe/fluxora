import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("[COUPON_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { code, discountPercentage, isActive, maxUses, validUntil } = body;

    if (!code || !discountPercentage) {
      return new NextResponse("Code and discount are required", { status: 400 });
    }

    // Check if exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return new NextResponse("Coupon format code already exists", { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercentage: parseInt(discountPercentage),
        isActive: isActive !== undefined ? isActive : true,
        maxUses: maxUses ? parseInt(maxUses) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[COUPON_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
