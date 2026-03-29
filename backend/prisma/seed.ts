import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@schedulr.app' },
    update: {},
    create: {
      name: 'Tina Khatri',
      email: 'admin@schedulr.app',
      username: 'tina',
      passwordHash: hash,
      timezone: 'Asia/Kolkata',
      welcomeMessage: 'Welcome! Book a time that works for you.',
    },
  });
  console.log('User created:', user.name);

  const eventTypesData = [
    { name: '15 Minute Meeting', slug: '15min', duration: 15, color: '#006BFF', description: 'Quick sync, intro call, or rapid Q&A', location: 'Google Meet' },
    { name: '30 Minute Meeting', slug: '30min', duration: 30, color: '#00C48C', description: 'Standard meeting for most topics', location: 'Zoom' },
    { name: '60 Minute Meeting', slug: '60min', duration: 60, color: '#8B5CF6', description: 'Deep dive, planning session, or onboarding', location: 'Google Meet' },
  ];

  let et1: any, et2: any, et3: any;
  [et1, et2, et3] = await Promise.all(
    eventTypesData.map(et =>
      prisma.eventType.upsert({
        where: { userId_slug: { userId: user.id, slug: et.slug } },
        update: {},
        create: { userId: user.id, ...et },
      })
    )
  );
  console.log('Event types seeded');

  for (let day = 0; day <= 6; day++) {
    await prisma.availability.upsert({
      where: { userId_dayOfWeek: { userId: user.id, dayOfWeek: day } },
      update: {},
      create: {
        userId: user.id,
        dayOfWeek: day,
        isEnabled: day >= 1 && day <= 5,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Asia/Kolkata',
      },
    });
  }
  console.log('Availability seeded (Mon-Fri 9AM-5PM)');

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const add = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

  await prisma.meeting.createMany({
    data: [
      { hostId: user.id, eventTypeId: et2.id, inviteeName: 'Priya Sharma', inviteeEmail: 'priya@example.com', date: fmt(add(2)), startTime: '10:00', endTime: '10:30', duration: 30, timezone: 'Asia/Kolkata', status: 'CONFIRMED' },
      { hostId: user.id, eventTypeId: et1.id, inviteeName: 'Rahul Verma', inviteeEmail: 'rahul@example.com', date: fmt(add(4)), startTime: '14:00', endTime: '14:15', duration: 15, timezone: 'Asia/Kolkata', status: 'CONFIRMED' },
      { hostId: user.id, eventTypeId: et3.id, inviteeName: 'Ananya Singh', inviteeEmail: 'ananya@example.com', date: fmt(add(-3)), startTime: '11:00', endTime: '12:00', duration: 60, timezone: 'Asia/Kolkata', status: 'CONFIRMED' },
      { hostId: user.id, eventTypeId: et2.id, inviteeName: 'Vikram Nair', inviteeEmail: 'vikram@example.com', date: fmt(add(-7)), startTime: '15:00', endTime: '15:30', duration: 30, timezone: 'Asia/Kolkata', status: 'CANCELLED' },
    ],
  });
  console.log('Sample meetings seeded');
  console.log('\nDatabase seeded!');
  console.log('Login: admin@schedulr.app / password123');
  console.log('Public booking: http://localhost:3000/tina');
}

main().catch(console.error).finally(() => prisma.$disconnect());
