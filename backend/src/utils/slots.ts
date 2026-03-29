interface SlotParams {
  startTime: string;
  endTime: string;
  duration: number;
  booked: Array<{ start: string; end: string }>;
}

const toMin = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toStr = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export function generateSlots({ startTime, endTime, duration, booked }: SlotParams): string[] {
  const start = toMin(startTime);
  const end = toMin(endTime);
  const bookedRanges = booked.map(b => ({ s: toMin(b.start), e: toMin(b.end) }));
  const slots: string[] = [];

  for (let cur = start; cur + duration <= end; cur += 30) {
    const slotEnd = cur + duration;
    const isBlocked = bookedRanges.some(b => cur < b.e && slotEnd > b.s);
    if (!isBlocked) slots.push(toStr(cur));
  }
  return slots;
}
