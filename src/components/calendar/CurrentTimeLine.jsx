import React from "react";
import { differenceInMinutes, startOfDay } from "date-fns";

// Red "now" indicator line for the time grid. Updates every minute.
export default function CurrentTimeLine({ hourHeight }) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const top = (differenceInMinutes(now, startOfDay(now)) / 60) * hourHeight;

  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="relative">
        <div className="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="h-[2px] bg-red-500" />
      </div>
    </div>
  );
}