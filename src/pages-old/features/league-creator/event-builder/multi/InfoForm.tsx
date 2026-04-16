import { Controller, useFormContext } from "react-hook-form";
import { useCoursesWithTees } from "@api/courses";
import { Input, Select } from "@/components/form";

export default function InfoForm() {
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
          name="format"
          control={control}
          render={({ field }) => {
            return (
              <Select
                label="Format"
                placeholder="Select Format"
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
        </div>
      </div>
    </div>
  );
}
