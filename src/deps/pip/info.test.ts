import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as os from "os";
import { PackageInfo, showPackageInfo } from "./info";

function expectPathExist(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error(`Expect ${path} to be exist`);
  }
}

function appendInfo(err: unknown, info: { [key: string]: any }): unknown {
  if (err instanceof Error) {
    for (const [key, value] of Object.entries(info)) {
      const str = JSON.stringify(value, null, 2);
      err.message = `${err.message}\n${key}: ${str}`;
    }
  }
  return err;
}

describe("test show info of a pip package", () => {
  describe("show info of a valid package (pip)", () => {
    let pkgInfo: PackageInfo;
    test("should be valid", async () => {
      const res = showPackageInfo("pip");
      await expect(res).resolves.toBeInstanceOf(PackageInfo);
      pkgInfo = (await res) as PackageInfo;
    });

    describe("check contents of the package info", () => {
      test("name should be valid", () => {
        expect(pkgInfo.name).toBe("pip");
      });
      test("version should be valid", () => {
        expect(pkgInfo.version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
      });
      test("location should be exist", () => {
        expectPathExist(pkgInfo.location);
      });

      test("dependencies should be valid", () => {
        const deps = pkgInfo.dependencies;
        try {
          expect(deps.length).toBe(0);
        } catch (err) {
          throw appendInfo(err, { deps: deps });
        }
      });

      test("files should be valid", () => {
        const files = pkgInfo.files;
        try {
          expect(files.length).toBeGreaterThan(0);
        } catch (err) {
          throw appendInfo(err, { files: files });
        }
      });

      test("directories should be exist", () => {
        const dirs = pkgInfo.directories();
        try {
          expect(dirs.length).toBe(2);
          for (const dir of dirs) {
            expectPathExist(dir);
          }
        } catch (err) {
          throw appendInfo(err, { dirs: dirs });
        }
      });

      test("executables should be exist", async () => {
        const execs = await pkgInfo.executables();
        try {
          expect(execs.length).toBe(os.type() === "Windows_NT" ? 4 : 3);
          for (const exec of execs) {
            expectPathExist(exec);
          }
        } catch (err) {
          throw appendInfo(err, { execs: execs });
        }
      });
    });
  });

  describe("show info of an invalid package", () => {
    test("should be null", async () => {
      const pkgInfo = showPackageInfo("an-invalid-package");
      await expect(pkgInfo).resolves.toBeNull();
    });
  });
});
