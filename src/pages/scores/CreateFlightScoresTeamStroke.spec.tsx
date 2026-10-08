import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/context/ToastContext";
import { CreateFlightScoresTeamStroke } from "./CreateFlightScoresTeamStroke";

const render = (handicap: number | null) => {
  const holes = Array.from({length:9}, (_,index) => ({num:index+1,par:4,hcp:index+1}));
  const flight = {id:1,players:[{playerId:1,teamId:1,handicapIndex:handicap,player:{id:1,firstName:"Pending",lastName:"Golfer",gender:"male",handicap}}],teams:[{teamId:1,team:{name:"A"}},{teamId:2,team:{name:"B"}}]};
  flight.players.push(...[2,3,4].map(id => ({playerId:id,teamId:id === 2 ? 1 : 2,handicapIndex:0,player:{id,firstName:"Known",lastName:String(id),gender:"male",handicap:0}})));
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={new QueryClient()}><ToastProvider>
    <CreateFlightScoresTeamStroke flight={flight} event={{scoringMode:"best-ball",format:"team",scoringHoles:holes,scoringConfig:{handicapAllowance:1}}} isEditMode={false} />
  </ToastProvider></QueryClientProvider></MemoryRouter>).replace(/<!--.*?-->/g, "");
  const start = html.indexOf("Pending Golfer");
  return {html,row:html.slice(start,html.indexOf("</tr>",start))};
};
describe("team net previews", () => {
  it("shows a pending net rather than scratch scoring for an unknown player", () => {
    const {html,row} = render(null);
    expect(html).toContain("Handicap calculated when all holes are entered");
    expect(row).toMatch(/>0<\/td><td[^>]*>—<\/td>/);
    const teamRow = html.match(/A Best Net<\/td>(.*?)<\/tr>/)?.[1];
    expect(teamRow).toContain("—");
    expect(teamRow).not.toMatch(/>0<\/td>/);
  });
  it("keeps a supplied zero handicap available for scoring", () => {
    const {html,row} = render(0);
    expect(html).toContain("Handicap 0.00");
    expect(row).toMatch(/>0<\/td><td[^>]*>0<\/td>/);
  });
});
