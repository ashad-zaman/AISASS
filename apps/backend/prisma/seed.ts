import { PrismaClient, PlanType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      plan: 'FREE',
      settings: {},
    },
  });

  console.log('Created tenant:', tenant.name);

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@aisass.com' },
    update: {},
    create: {
      email: 'demo@aisass.com',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      tenantId: tenant.id,
    },
  });

  console.log('Created user:', user.email);

  // Create membership
  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'OWNER',
    },
  });

  console.log('Created membership');

  // Create plans with proper typing
  const plans: Array<{
    name: string;
    type: PlanType;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyRequests: number;
    monthlyTokens: number;
    maxDocuments: number;
    maxFileSize: number;
    maxMembers: number;
    features: string;
  }> = [
    {
      name: 'Free',
      type: 'FREE',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyRequests: 100,
      monthlyTokens: 10000,
      maxDocuments: 5,
      maxFileSize: 5242880, // 5MB
      maxMembers: 1,
      features: JSON.stringify(['Basic chat', '5 documents', '10k tokens/month']),
    },
    {
      name: 'Pro',
      type: 'PRO',
      monthlyPrice: 2900,
      yearlyPrice: 29000,
      monthlyRequests: 5000,
      monthlyTokens: 500000,
      maxDocuments: 100,
      maxFileSize: 26214400, // 25MB
      maxMembers: 5,
      features: JSON.stringify(['Priority support', '100 documents', '500k tokens/month', 'Larger files']),
    },
    {
      name: 'Team',
      type: 'TEAM',
      monthlyPrice: 9900,
      yearlyPrice: 99000,
      monthlyRequests: -1, // unlimited
      monthlyTokens: -1, // unlimited
      maxDocuments: -1, // unlimited
      maxFileSize: 104857600, // 100MB
      maxMembers: 20,
      features: JSON.stringify(['Unlimited everything', 'Priority support', 'Team collaboration']),
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { type: plan.type },
      update: plan,
      create: plan,
    });
  }

  console.log('Created plans');

  console.log('\n✅ Seeding completed!');
  console.log('\nDemo Credentials:');
  console.log('  Email: demo@aisass.com');
  console.log('  Password: demo123456');
  console.log('  Tenant: Demo Workspace');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });