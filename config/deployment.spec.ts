import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const clientRoot = process.cwd();
const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(clientRoot, relativePath), "utf8"));

describe("client deployment configuration", () => {
  it("builds and serves the SPA through Railway", () => {
    const railway = readJson("railway.json");
    const packageJson = readJson("package.json");

    expect(railway.build.buildCommand).toBe("npm run build");
    expect(railway.deploy.startCommand).toBe("npm run start");
    expect(railway.deploy.healthcheckPath).toBe("/");
    expect(packageJson.scripts.start).toContain("-c serve.json");
  });

  it("keeps SPA fallback, security headers, and immutable asset caching enabled", () => {
    const serveConfig = readJson("public/serve.json");
    const allResponseHeaders = serveConfig.headers.find(
      (entry: { source: string }) => entry.source === "**/*",
    );
    const assetHeaders = serveConfig.headers.find(
      (entry: { source: string }) => entry.source === "assets/**",
    );

    expect(serveConfig.rewrites).toContainEqual({ source: "**", destination: "/index.html" });
    expect(allResponseHeaders.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "Content-Security-Policy" }),
        expect.objectContaining({ key: "Strict-Transport-Security" }),
        expect.objectContaining({ key: "X-Content-Type-Options", value: "nosniff" }),
      ]),
    );
    expect(assetHeaders.headers).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    });
  });

  it("pins Node 24 and runs repository-owned CI verification", () => {
    const nodeVersion = fs.readFileSync(path.join(clientRoot, ".nvmrc"), "utf8").trim();
    const workflow = fs.readFileSync(
      path.join(clientRoot, ".github/workflows/verify.yml"),
      "utf8",
    );

    expect(nodeVersion).toMatch(/^24\./);
    expect(workflow).toContain("node-version-file: .nvmrc");
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain("npm run audit:prod");
  });
});
