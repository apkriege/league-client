import { describe, expect, it } from "vitest";
import { resolveSeoMetadata } from "./seo";
import marketingPages from "@/pages/marketing/marketing-pages.json";

describe("resolveSeoMetadata", () => {
  it("makes the public marketing page indexable and canonical", () => {
    expect(resolveSeoMetadata("/")).toMatchObject({
      indexable: true,
      canonicalUrl: "https://leaguenightpro.com/",
    });
  });

  it("assigns canonical metadata to public legal pages", () => {
    expect(resolveSeoMetadata("/privacy/")).toMatchObject({
      title: "Privacy Policy | League Night Pro",
      canonicalUrl: "https://leaguenightpro.com/privacy",
      indexable: true,
    });
  });

  it("prevents account and application routes from being indexed", () => {
    expect(resolveSeoMetadata("/league/42")).toMatchObject({
      title: "League Overview | League Night Pro",
      canonicalUrl: null,
      indexable: false,
    });
  });

  it.each([
    ["/login", "Sign In"],
    ["/invite/token-123", "Accept Invitation"],
    ["/forgot-password", "Forgot Password"],
    ["/reset-password", "Reset Password"],
    ["/verify-email", "Verify Email"],
    ["/leagues", "Leagues"],
    ["/leagues/create", "Create League"],
    ["/courses", "Courses"],
    ["/courses/12", "Course Details"],
    ["/support", "Contact Support"],
    ["/league/4", "League Overview"],
    ["/league/4/players", "Players"],
    ["/league/4/player/9", "Player Details"],
    ["/league/4/teams", "Teams"],
    ["/league/4/team/8", "Team Details"],
    ["/league/4/schedule", "Schedule"],
    ["/league/4/edit", "Edit League"],
    ["/league/4/admin", "League Administration"],
    ["/league/4/events/create", "Create Event"],
    ["/league/4/events/7", "Event Details"],
    ["/league/4/events/7/edit", "Edit Event"],
    ["/league/4/events/7/scores", "Event Scoring"],
    ["/league/4/events/7/print-scorecards", "Print Scorecards"],
    ["/superadmin/courses", "Course Administration"],
    ["/superadmin/leagues", "League Administration"],
    ["/superadmin/billing", "Billing Administration"],
    ["/superadmin/users", "User Administration"],
  ])("assigns %s a distinct analytics title", (path, title) => {
    expect(resolveSeoMetadata(path).title).toBe(`${title} | League Night Pro`);
  });

  it("uses a clear title for unknown routes", () => {
    expect(resolveSeoMetadata("/missing").title).toBe("Page Not Found | League Night Pro");
  });

  it.each(marketingPages)("makes /$slug indexable with unique metadata", (page) => {
    expect(resolveSeoMetadata(`/${page.slug}`)).toMatchObject({
      title: page.title,
      description: page.description,
      canonicalUrl: `https://leaguenightpro.com/${page.slug}`,
      indexable: true,
    });
  });
});
