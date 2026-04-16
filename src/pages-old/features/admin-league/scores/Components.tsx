export const FirstTD = ({ children }: any) => (
  <td className="sticky left-0 z-10 pr-4 text-left text-xs font-bold backdrop-blur-xl py-0">
    {children}
  </td>
);

export const HoleInput = ({ id, value, pops, onChange }: any) => (
  <div className="relative">
    <input
      id={id}
      type="text"
      className={`text-xs input font-bold focus:outline-none focus:ring-0 h-8 w-full min-w-14 rounded-md border py-0 text-center`}
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        onChange({ ...e, target: { ...e.target, value: val === "" ? 0 : parseInt(val) || 0 } });
      }}
    />
    {pops > 0 && (
      <div className="absolute bottom-2 right-2 flex gap-0.5">
        {Array.from({ length: pops }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-base-content rounded-full" />
        ))}
      </div>
    )}
  </div>
);

// Sticky last column
// const LastTD = ({ children }: any) => (
//   <td className="sticky right-0 z-10 pl-4 text-left text-sm font-bold backdrop-blur-xl py-0">
//     {children}
//   </td>
// );

export const LastTD = ({ children }: any) => (
  <td className="pl-4 text-left text-xs font-bold py-0">{children}</td>
);
