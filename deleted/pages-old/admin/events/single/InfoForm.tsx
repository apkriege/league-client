import {
  AutocompleteSelect,
  DateInput,
  Input,
  SelectableInfoCard,
  ToggleCards,
} from "@/components/form";
import { Label } from "@/components/form/Label";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { useCoursesWithTees } from "@api/courses";
import { CircleCheck, Tally5, Trophy, User, Users, Zap } from "lucide-react";
import { useFormContext } from "react-hook-form";

export default function InfoForm() {
  const { data: courses } = useCoursesWithTees();
  const methods = useFormContext();

  if (!courses) return null;

  console.log(courses[0]);

  const courseOptions = courses.map((course: any) => ({
    value: course.id,
    label: course.name,
    content: (
      <div className="flex flex-col">
        <span>
          {course.name}, {course.location}
        </span>
        <span className="text-[10px] text-gray-500">
          {course.par} &bull; {course.numHoles} HOLES
        </span>
      </div>
    ),
  }));

  const getTeeOptions = () => {
    const selectedCourse = courses.find((course: any) => course.id === methods.watch("courseId"));
    if (!selectedCourse) return [];

    return selectedCourse.tees.map((tee: any) => ({
      value: tee.id,
      body: (
        <div className="flex flex-col">
          <span>{tee.name}</span>
          <span className="text-[10px] text-gray-500">
            {tee.par} &bull; {tee.distance} yards
          </span>
        </div>
      ),
    }));
  };

  return (
    <div>
      <PageHeader
        title="Single Event"
        subTitle="Select the type of event you want to create. This will determine the setup process and available features."
        icon={<Trophy size={14} />}
        iconText="CREATE EVENT"
      />
      <div className="flex gap-4">
        <div className="w-2/3 flex flex-col gap-5">
          <Card>
            <h3 className="text-lg font-bold">Event Details</h3>
            <p className="text-sm text-gray-500">
              Set up the details for your event, including date, time, and format.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Event Name"
                  placeholder="e.g. January Open"
                  {...methods.register("name", { required: "Event name is required" })}
                />
                <DateInput
                  label="Event Date"
                  {...methods.register("date", { required: "Event date is required" })}
                />
              </div>
              <ToggleCards
                value={methods.watch("format")}
                onChange={(value) => methods.setValue("format", value)}
                options={[
                  { value: "individual", label: "INDIVIDUAL", icon: <User /> },
                  { value: "team", label: "TEAM PLAY", icon: <Users /> },
                ]}
              />
            </div>
          </Card>
          <Card>
            <div>
              <h3 className="text-lg font-bold">Course Selection</h3>
              <p className="text-sm text-gray-500">
                Set up the details for your event, including date, time, and format.
              </p>
              <AutocompleteSelect
                label="Course"
                placeholder="Select a course"
                options={courseOptions}
                onChange={(value) => methods.setValue("courseId", value)}
                value={methods.watch("courseId")}
              />
            </div>
            {methods.watch("courseId") && (
              <div className="w-full">
                <div>
                  <Label text="Tee" />
                  <ToggleCards
                    value={methods.watch("teeId")}
                    onChange={(value) => methods.setValue("teeId", value)}
                    options={getTeeOptions()}
                    className="max-grid-cols-2!"
                  />
                </div>
              </div>
            )}
            <div className="w-full">
              <Label text="Starting Side" />
              <ToggleCards
                value={methods.watch("startSide")}
                onChange={(value) => methods.setValue("startSide", value)}
                options={[
                  { value: "front", label: "FRONT 9" },
                  { value: "back", label: "BACK 9" },
                  { value: "full", label: "FULL 18" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input
                label="Interval (minutes)"
                type="number"
                {...methods.register("interval", {
                  required: "Interval is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Interval must be at least 1 minute" },
                })}
              />
              <Input
                label="Start Time"
                type="time"
                {...methods.register("startTime", { required: "Start time is required" })}
              />
              <Input
                label="Holes"
                type="number"
                {...methods.register("holes", {
                  required: "Number of holes is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1 hole" },
                  max: { value: 18, message: "Cannot exceed 18 holes" },
                })}
              />
            </div>
          </Card>
        </div>
        <div className="w-1/3 flex flex-col gap-5">
          <Card className="">
            <h3 className="text-lg font-bold">Scoring</h3>
            <p className="text-sm text-gray-500">Choose how you want to score your event.</p>

            <div className="mt-4">
              <div>
                <Label text="Scoring Format" />
                <div className="flex flex-col gap-2">
                  <SelectableInfoCard
                    active={methods.watch("scoringFormat") === "stroke"}
                    onClick={() => methods.setValue("scoringFormat", "stroke")}
                    icon={<Tally5 size={26} />}
                    title="Stroke Play"
                    description="Each player/team records their total strokes for each hole. Lowest total wins."
                    activeIndicator={<CircleCheck size={26} />}
                  />
                  <SelectableInfoCard
                    active={methods.watch("scoringFormat") === "match"}
                    onClick={() => methods.setValue("scoringFormat", "match")}
                    icon={<Zap size={26} />}
                    title="Match Play"
                    description="Players/teams compete hole-by-hole. Each hole is worth a point, and the player/team with the most points wins."
                    activeIndicator={<CircleCheck size={26} />}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              {methods.watch("scoringFormat") === "stroke" && (
                <Input
                  label="Points Per Stroke"
                  type="number"
                  {...methods.register("ptsPerHole", {
                    required: "Points per stroke is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be at least 0 points" },
                  })}
                />
              )}
              {methods.watch("scoringFormat") === "match" && (
                <>
                  <Input
                    label="Points Per Hole"
                    type="number"
                    {...methods.register("ptsPerHole", {
                      required: "Points per hole win is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be at least 0 points" },
                    })}
                  />
                  <Input
                    label="Points Per Match"
                    type="number"
                    {...methods.register("ptsPerMatch", {
                      required: "Points per player win is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be at least 0 points" },
                    })}
                  />
                  <Input
                    label="Points Per Team Win"
                    type="number"
                    {...methods.register("ptsPerTeamWin", {
                      required: "Points per team win is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be at least 0 points" },
                    })}
                  />
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
