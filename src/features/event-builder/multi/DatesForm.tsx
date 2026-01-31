import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import dayjs from "dayjs";
import { Checkbox, Input, MultiSelect, Select } from "@/components/form";

export default function DatesForm() {
  const { control, watch, setValue } = useFormContext();

  const [isEditDayOff, setIsEditDayOff] = useState(false);
  const [dayOff, setDayOff] = useState<any>({
    name: "",
    date: new Date(),
  });

  const daysOff =
    watch("daysOff")
      .map((o: any) => ({
        ...o,
        date: new Date(o.date),
      }))
      .sort((a: any, b: any) => a.date - b.date) || [];

  const editDayOff = (day: any) => {
    setDayOff({ ...day, date: new Date(day.date) });
    setIsEditDayOff(true);
  };

  const saveDayOff = () => {
    if (isEditDayOff) {
      const updatedDaysOff = daysOff.map((d: any) => (d.id === dayOff.id ? dayOff : d));
      setValue("daysOff", updatedDaysOff);
      setIsEditDayOff(false);
      setDayOff({ name: "", date: new Date() });
    } else {
      const newDayOff = { ...dayOff, id: Date.now() };
      const updatedDaysOff = [...daysOff, newDayOff];
      setValue("daysOff", updatedDaysOff);
      setDayOff({ name: "", date: new Date() });
    }
  };

  const removeDayOff = (id: number) => {
    const updatedDaysOff = daysOff.filter((d: any) => d.id !== id);
    setValue("daysOff", updatedDaysOff);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-x-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => {
            return (
              <Input
                type="date"
                label="Event Date"
                placeholder="Select Event Date"
                value={dayjs(field.value).format("YYYY-MM-DD") || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            );
          }}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => {
            return (
              <Input
                type="date"
                label="End Date"
                placeholder="Select End Date"
                value={dayjs(field.value).format("YYYY-MM-DD") || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            );
          }}
        />
        <Controller
          name="startTime"
          control={control}
          render={({ field }) => {
            return (
              <Input
                type="time"
                label="Start Time"
                placeholder="Select Start Time"
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            );
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <Controller
          name="interval"
          control={control}
          render={({ field }) => {
            return (
              <Input
                type="number"
                label="Interval (mins)"
                placeholder="Enter Interval"
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            );
          }}
        />
        <Controller
          name="frequency"
          control={control}
          render={({ field }) => {
            return (
              <Select
                label="Frequency"
                placeholder="Select Frequency"
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "biweekly", label: "Bi-Weekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            );
          }}
        />
        <Controller
          name="alternate"
          control={control}
          render={({ field }) => {
            return (
              <Checkbox
                label="Alternate Weeks"
                checked={field.value || false}
                onChange={(checked) => {
                  field.onChange(checked);
                }}
              />
            );
          }}
        />
        <div className="col-span-3">
          <Controller
            name="daysOfWeek"
            control={control}
            render={({ field }) => {
              return (
                <MultiSelect
                  label="Days of the Week"
                  placeholder="Select Days"
                  value={field.value || []}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  options={[
                    { value: "sunday", label: "Sunday" },
                    { value: "monday", label: "Monday" },
                    { value: "tuesday", label: "Tuesday" },
                    { value: "wednesday", label: "Wednesday" },
                    { value: "thursday", label: "Thursday" },
                    { value: "friday", label: "Friday" },
                    { value: "saturday", label: "Saturday" },
                  ]}
                />
              );
            }}
          />
        </div>
      </div>

      <div className="mt-5">
        <h4 className="mb-1 font-semibold">Special Days</h4>
        <p className="w-2/3 text-sm italic text-gray-400">
          These are special days that are not part of the regular schedule. You can add days off or
          championship days. You can also add special events or tournaments.
        </p>
        <div className="grid grid-cols-3 gap-4 items-end">
          <Input
            label="Name"
            value={dayOff.name}
            placeholder="Enter Name"
            onChange={(e) => setDayOff((prev: any) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            type="date"
            label="Date"
            value={dayjs(dayOff.date).format("YYYY-MM-DD")}
            placeholder="Select Date"
            onChange={(e) =>
              setDayOff((prev: any) => ({ ...prev, date: new Date(e.target.value) }))
            }
          />
          <button className="btn btn-primary btn-md mb-1" onClick={saveDayOff}>
            {isEditDayOff ? "Save" : "Add"} Day
          </button>
        </div>
        <div className="mt-3">
          <table className="w-full">
            <thead>
              <tr>
                <th className="border-b pb-2 text-left text-xs">Date</th>
                <th className="border-b pb-2 text-left text-xs">Text</th>
                <th className="border-b pb-2 text-left text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {daysOff.map((day: any) => (
                <tr key={`${day.date}-${day.id}`} className="border-b border-white/10">
                  <td className="py-2 text-xs">{dayjs(day.date).format("MM-DD-YYYY")}</td>
                  <td className="py-2 text-xs">{day.name}</td>
                  <td className="py-3 flex gap-2 w-[100px]">
                    <button className="btn btn-xs btn-secondary" onClick={() => editDayOff(day)}>
                      Edit
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => removeDayOff(day.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
