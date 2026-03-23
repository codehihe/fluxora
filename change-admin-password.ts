import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function changePassword() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx change-admin-password.ts <email> <new-password>');
    console.log('Example: npx tsx change-admin-password.ts admin@flowkit.in "MyNewPassword!"');
    process.exit(1);
  }

  const email = args[0];
  const newPassword = args[1];

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`✅ Password successfully updated for ${email}`);
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

changePassword();
