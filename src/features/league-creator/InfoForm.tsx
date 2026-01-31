import { Controller, useFormContext } from "react-hook-form";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import dayjs from "dayjs";
import Divider from "@/components/layout/Divider";

export default function InfoForm() {
  const leagueForm = useFormContext();

  return (
    <div className="info-form">
      <Controller
        name="name"
        control={leagueForm.control}
        render={({ field }) => (
          <Input label="League Name" placeholder="Enter league name" {...field} />
        )}
      />
      <Controller
        name="description"
        control={leagueForm.control}
        render={({ field }) => (
          <Input
            label="Description"
            placeholder="Enter league description"
            className="w-full"
            {...field}
          />
        )}
      />
      <Controller
        name="type"
        control={leagueForm.control}
        render={({ field }) => (
          <Select
            label="League Type"
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ]}
            {...field}
          />
        )}
      />
      <div className="grid grid-cols-2 gap-x-4">
        <Controller
          name="startDate"
          control={leagueForm.control}
          render={({ field }) => (
            <Input
              type="date"
              label="Start Date"
              placeholder="YYYY-MM-DD"
              value={dayjs(field.value).format("YYYY-MM-DD")}
              onChange={(e) => field.onChange(new Date(e.target.value))}
            />
          )}
        />
        <Controller
          name="endDate"
          control={leagueForm.control}
          render={({ field }) => (
            <Input
              type="date"
              label="End Date"
              placeholder="YYYY-MM-DD"
              value={dayjs(field.value).format("YYYY-MM-DD")}
              onChange={(e) => field.onChange(new Date(e.target.value))}
            />
          )}
        />
      </div>
      <Divider className="my-2!" />
      <div className="gap-x-4">
        <Controller
          name="contactFirstName"
          control={leagueForm.control}
          render={({ field }) => (
            <Input label="Contact First Name" placeholder="Enter contact first name" {...field} />
          )}
        />
        <Controller
          name="contactLastName"
          control={leagueForm.control}
          render={({ field }) => (
            <Input label="Contact Last Name" placeholder="Enter contact last name" {...field} />
          )}
        />
        <Controller
          name="contactEmail"
          control={leagueForm.control}
          render={({ field }) => (
            <Input label="Contact Email" placeholder="Enter contact email" {...field} />
          )}
        />
        <Controller
          name="contactPhone"
          control={leagueForm.control}
          render={({ field }) => (
            <Input label="Contact Phone" placeholder="Enter contact phone" {...field} />
          )}
        />
      </div>
    </div>
  );
}
