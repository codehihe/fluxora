import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { code, discountPercentage, isActive, maxUses, validUntil } = body;

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: code?.toUpperCase(),
        discountPercentage: discountPercentage ? parseInt(discountPercentage) : undefined,
        isActive,
        maxUses: maxUses !== undefined ? (maxUses ? parseInt(maxUses) : null) : undefined,
        validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : undefined,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[COUPON_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coupon = await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[COUPON_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
