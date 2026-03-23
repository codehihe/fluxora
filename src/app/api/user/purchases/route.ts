import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workflow: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, purchases });

  } catch (error) {
    console.error('[GET_PURCHASES]', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}
