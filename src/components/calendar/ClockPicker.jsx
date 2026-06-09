import React from "react";

// Analog clock time picker. Two stages: pick hour, then pick minute.
export default function ClockPicker({ hour, minute, onChange, onDone }) {
  const [mode, setMode] = React.useState(minute !== 0 ? "minute" : "hour"); // "hour" | "minute"
  const clockRef = React.useRef(null);
  const minuteRef = React.useRef(null);

  const isHour = mode === "hour";
  const count = isHour ? 12 : 60;
  const step = isHour ? 1 : 5; // minute labels every 5
  const current = isHour ? hour % 12 : minute;

  // angle for the hand (12 at top)
  const valueForAngle = isHour ? hour % 12 : minute;
  const anglePer = isHour ? 30 : 6;
  const handAngle = valueForAngle * anglePer;

  const selectFromPosition = (clientX, clientY) => {
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    if (isHour) {
      let h = Math.round(deg / 30) % 12;
      // keep am/pm range of current hour
      const pm = hour >= 12;
      onChange(pm ? (h === 0 ? 12 : h + 12) : h, minute);
    } else {
      let m = Math.round(deg / 6) % 60;
      onChange(hour, m);
    }
  };

  const handlePointer = (e) => {
    e.preventDefault();
    selectFromPosition(e.clientX, e.clientY);
  };

  const radius = 88;
  const center = 110;

  const ticks = [];
  for (let i = 0; i < count; i += step) {
    const label = isHour ? (i === 0 ? 12 : i) : i;
    const angle = (i * anglePer - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const selected = isHour ? (hour % 12) === i : minute === i;
    ticks.push(
      <button
        key={i}
        type="button"
        onClick={() => {
          if (isHour) {
            const pm = hour >= 12;
            onChange(pm ? (i === 0 ? 12 : i + 12) : i, minute);
          } else {
            onChange(hour, i);
          }
        }}
        className={`absolute w-9 h-9 -ml-[18px] -mt-[18px] rounded-full flex items-center justify-center text-sm font-medium transition-colors
          ${selected ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
        style={{ left: x, top: y }}
      >
        {String(label).padStart(2, "0")}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Digital display — editable inputs */}
      <div className="flex items-center gap-1 text-3xl font-semibold tabular-nums">
        <input
          type="text"
          inputMode="numeric"
          value={String(hour).padStart(2, "0")}
          onFocus={(e) => { setMode("hour"); e.target.select(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onDone?.(); } }}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(-2);
            let h = parseInt(raw, 10);
            if (isNaN(h)) h = 0;
            if (h > 23) h = 23;
            onChange(h, minute);
            // Auto-jump to minutes once the hour is unambiguous (2 digits or > 2)
            if (raw.length >= 2 || parseInt(raw, 10) > 2) {
              setMode("minute");
              setTimeout(() => { minuteRef.current?.focus(); minuteRef.current?.select(); }, 0);
            }
          }}
          className={`w-14 text-center px-2 py-0.5 rounded-md outline-none focus:ring-2 focus:ring-primary/40
            ${isHour ? "bg-primary/10 text-primary" : "text-foreground"}`}
        />
        <span>:</span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          value={String(minute).padStart(2, "0")}
          onFocus={(e) => { setMode("minute"); e.target.select(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onDone?.(); } }}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(-2);
            let m = parseInt(raw, 10);
            if (isNaN(m)) m = 0;
            if (m > 59) m = 59;
            onChange(hour, m);
          }}
          className={`w-14 text-center px-2 py-0.5 rounded-md outline-none focus:ring-2 focus:ring-primary/40
            ${!isHour ? "bg-primary/10 text-primary" : "text-foreground"}`}
        />
      </div>

      {/* Clock face */}
      <div
        ref={clockRef}
        onPointerDown={handlePointer}
        onPointerMove={(e) => { if (e.buttons === 1) handlePointer(e); }}
        className="relative rounded-full bg-secondary touch-none cursor-pointer"
        style={{ width: 220, height: 220 }}
      >
        {/* hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom bg-primary rounded-full"
          style={{
            width: 2,
            height: radius,
            transform: `translate(-50%, -100%) rotate(${handAngle}deg)`,
          }}
        />
        {/* center dot */}
        <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-primary" />
        {ticks}
      </div>

      <div className="flex w-full gap-2">
        {isHour ? (
          <button
            type="button"
            onClick={() => setMode("minute")}
            className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Weiter zu Minuten
          </button>
        ) : (
          <button
            type="button"
            onClick={onDone}
            className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Fertig
          </button>
        )}
      </div>
    </div>
  );
}