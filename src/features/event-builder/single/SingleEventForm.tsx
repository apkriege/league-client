import { Controller, useFormContext } from "react-hook-form";
import { Input, Select } from "@/components/form";
import { useCoursesWithTees } from "@api/courses";
import dayjs from "dayjs";

export default function SingleEventForm() {
  const { data: courses, isLoading } = useCoursesWithTees();
  const { control, watch } = useFormContext();
  const selectedCourseId = watch("courseId");

  if (!courses || isLoading) {
    return <div>Loading courses...</div>;
  }

  const teeOptions = () => {
    if (!selectedCourseId) return [];

    const course = courses.find((c: any) => String(c.id) === String(selectedCourseId));
    if (!course || !course.tees) return [];

    return course.tees.map((tee: any) => ({
      value: String(tee.id),
      label: `${tee.name} (${tee.distance} yds)`,
    }));
  };

  return (
    <div className="">
      {/* <h3>Event Information</h3> */}
      <div className="event-info grid grid-cols-3 gap-x-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => {
            return (
              <Input
                label="Event Name"
                placeholder="Enter Event Name"
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            );
          }}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => {
            return (
              <Select
                label="Event Type"
                placeholder="Select Event Type"
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                options={[
                  { value: "individual", label: "Individual" },
                  { value: "team", label: "Team" },
                ]}
              />
            );
          }}
        />
        <Controller
          name="date"
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
      </div>
      <div className="course-and-scoring">
        {/* <h3>Course And Scoring</h3> */}
        <div className="grid grid-cols-3 gap-x-4">
          <Controller
            name="courseId"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  label="Course"
                  placeholder="Select Course"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  options={courses.map((course: any) => ({
                    value: String(course.id),
                    label: course.name,
                  }))}
                />
              );
            }}
          />
          <Controller
            name="teeId"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  label="Tee"
                  placeholder="Select Tee"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  options={teeOptions()}
                />
              );
            }}
          />
          <Controller
            name="startSide"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  label="Start Side"
                  placeholder="Select Start Side"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  options={[
                    { value: "front", label: "Front" },
                    { value: "back", label: "Back" },
                  ]}
                />
              );
            }}
          />
          <Controller
            name="holes"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  label="Holes"
                  placeholder="Select Number of Holes"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  options={[
                    { value: "9", label: "9" },
                    { value: "18", label: "18" },
                  ]}
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
                  placeholder="Enter Start Time"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              );
            }}
          />
          <Controller
            name="interval"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  type="number"
                  label="Interval (minutes)"
                  placeholder="Enter Interval in Minutes"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              );
            }}
          />
        </div>
        <div className="grid grid-cols-5 gap-4">
          <Controller
            name="scoringFormat"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  label="Scoring Type"
                  placeholder="Select Scoring Type"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  options={[
                    { value: "stroke", label: "Stroke Play" },
                    { value: "match", label: "Match Play" },
                  ]}
                />
              );
            }}
          />
          {watch("scoringFormat") === "match" ? (
            <div className="col-span-4 grid grid-cols-3 gap-4">
              <Controller
                name="ptsPerHole"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      label="Points Per Hole"
                      placeholder="Enter points per hole"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  );
                }}
              />
              <Controller
                name="ptsPerMatch"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      label="Points Per Match"
                      placeholder="Enter points per match"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  );
                }}
              />
              <Controller
                name="ptsPerTeamWin"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      label="Points Per Team Win"
                      placeholder="Enter points per team win"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  );
                }}
              />
            </div>
          ) : (
            <div className="col-span-4">
              <Controller
                name="strokePoints"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      label="Stroke Points"
                      placeholder="Enter stroke points"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
