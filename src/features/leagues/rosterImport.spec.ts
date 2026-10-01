import { describe, expect, it } from "vitest";
import { previewRosterImport } from "./rosterImport";

const headers = 'First Name,Last Name,Gender,Handicap,Email,Type';
describe('roster import', () => {
  it('reads CSV, escaped quotes and stored handicaps without course conversion', () => {
    const result = previewRosterImport('\uFEFF' + headers + '\r\n"Jo ""J""",Golfer,F,-1.4,JO@test.com,substitute\r\nSam,Other,M,0,,');
    expect(result.errors).toEqual([]);
    expect(result.players[0]).toMatchObject({ firstName: 'Jo "J"', gender: 'female', handicap: -1.4, email: 'jo@test.com', type: 'sub' });
    expect(result.players[1].handicap).toBe(0);
  });
  it('accepts pasted tab-separated cells and quoted commas', () => {
    expect(previewRosterImport('firstName\tlastName\tgender\thandicap\nPat\tGolfer\tmale\t12.3').players[0].handicap).toBe(12.3);
    expect(previewRosterImport(headers + '\n"Pat, Jr",Golfer,male,10,,player').errors).toEqual([]);
  });
  it.each(['', '0x10', 'NaN', 'Infinity', '12,5', '-10.1', '54.1'])('rejects invalid or missing handicap %s', handicap => {
    expect(previewRosterImport(headers + `\nPat,Golfer,male,"${handicap}",,player`).errors.length).toBeGreaterThan(0);
  });
  it('detects duplicates within the import and against the existing roster', () => {
    const source = headers + '\nPat,Golfer,male,10,pat@test.com,player\nPAT,GOLFER,male,12,,player';
    expect(previewRosterImport(source).errors[0]).toContain('duplicate');
    expect(previewRosterImport(source, [{ firstName: 'Other', lastName: 'Name', email: 'pat@test.com' }]).errors[0]).toContain('duplicate');
  });
  it.each(['First Name,Last Name\nPat,Golfer', headers + '\n"Pat,Golfer,male,10,,player', headers + '\nPat,Golfer,male,10', headers + '\nPat,Golfer,unknown,10,,other'])('reports incomplete or malformed rows', source => {
    expect(previewRosterImport(source).errors.length).toBeGreaterThan(0);
  });
  it('limits file size and row count', () => {
    expect(previewRosterImport('x'.repeat(1_000_001)).errors[0]).toContain('1 MB');
    expect(previewRosterImport(headers + '\n' + 'Pat,Golfer,male,10,,player\n'.repeat(501)).errors[0]).toContain('500');
  });
});
