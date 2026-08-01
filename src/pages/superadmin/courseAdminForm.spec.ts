import { describe, expect, it } from "vitest";
import {
  buildEmptyTee,
  emptyCourseForm,
  getCourseValidationError,
  toCoursePayload,
} from "./courseAdminForm";

const validForm = {
  ...emptyCourseForm,
  clubId: "12",
  name: "North Course",
};

describe("course admin form utilities", () => {
  it("reports the first actionable validation error", () => {
    expect(getCourseValidationError(emptyCourseForm, [])).toBe("Please select a club.");
    expect(getCourseValidationError({ ...validForm, name: " " }, [])).toBe(
      "Course name is required."
    );
    expect(getCourseValidationError({ ...validForm, timeZone: "EST" }, [])).toBe(
      "Enter a valid IANA timezone, such as America/Detroit."
    );

    const unnamedTee = buildEmptyTee(18);
    expect(getCourseValidationError(validForm, [unnamedTee])).toBe("Tee 1 needs a name.");
  });

  it("maps valid form values to the API payload", () => {
    const tee = {
      ...buildEmptyTee(9),
      name: "Blue",
      color: "blue",
      distance: "3200",
      ratingMen: "35.4",
      slopeMen: "118",
    };
    const form = { ...validForm, numHoles: "9", par: "36", description: "  Front nine  " };

    expect(getCourseValidationError(form, [tee])).toBeNull();
    expect(toCoursePayload(form, [tee])).toMatchObject({
      clubId: 12,
      name: "North Course",
      description: "Front nine",
      timeZone: validForm.timeZone,
      numHoles: 9,
      par: 36,
      tees: [
        {
          name: "Blue",
          color: "blue",
          distance: 3200,
          ratingMen: 35.4,
          slopeMen: 118,
        },
      ],
    });
  });
});
