interface DayConfig {
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

interface BookedMeeting {
  startTime: string;
  endTime: string;
  status: string;
}

const toMin = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toStr = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function generateTimeSlots(
  date: string,
  duration: number,
  dayConfig: DayConfig | null | undefined,
  bookedMeetings: BookedMeeting[] = []
): string[] {
  if (!dayConfig?.isEnabled) return [];

  const winStart = toMin(dayConfig.startTime);
  const winEnd = toMin(dayConfig.endTime);

  const booked = bookedMeetings
    .filter((m) => m.status === 'CONFIRMED')
    .map((m) => ({ start: toMin(m.startTime), end: toMin(m.endTime) }));

  const slots: string[] = [];
  let cur = winStart;

  while (cur + duration <= winEnd) {
    const slotEnd = cur + duration;

    const conflict = booked.some((b) => cur < b.end && slotEnd > b.start);

    const slotDateTime = new Date(`${date}T${toStr(cur)}:00`);
    const isPast = slotDateTime <= new Date();

    if (!conflict && !isPast) {
      slots.push(toStr(cur));
    }

    cur += 30;
  }

  return slots;
}
