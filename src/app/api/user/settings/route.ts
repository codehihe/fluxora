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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        username: true,
        location: true,
        websiteUrl: true,
        twitterHandle: true,
        githubUrl: true,
        linkedinUrl: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('[GET_SETTINGS]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, location, websiteUrl, twitterHandle, githubUrl, linkedinUrl, username } = body;

    // Check username uniqueness if changing
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id: session.user.id
          }
        }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        bio,
        location,
        websiteUrl,
        twitterHandle,
        githubUrl,
        linkedinUrl,
        username,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('[PATCH_SETTINGS]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
