'use client';

import { motion } from 'framer-motion';

interface CalendarEvent {
  date: Date;
  title: string;
  type: string;
}

interface CalendarEventsProps {
  events: CalendarEvent[];
}

export default function CalendarEvents({ events }: CalendarEventsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Kalendarz wydarzeń</h2>
      {events.length > 0 ? (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'bond' ? 'bg-yellow-400' : 'bg-pink-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white font-semibold">{event.title}</p>
                  <p className="text-purple-200/70 text-sm">
                    {event.date.toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-purple-200/70 text-center py-12">Brak zaplanowanych wydarzeń</p>
      )}
    </motion.div>
  );
}

