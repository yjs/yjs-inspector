import { isCI } from "~build/ci";
import { abbreviatedSha, github } from "~build/git";
import { name, version } from "~build/package";
import time from "~build/time";

const printBuildInfo = () => {
  if (process.env.NODE_ENV === "development") {
    return;
  }
  console.group("Build info");
  console.log("Project:", name);
  console.log("Build date:", time ? time.toLocaleString() : "Unknown");
  console.log("Environment:", `${process.env.NODE_ENV}${isCI ? "(ci)" : ""}`);
  console.log("Version:", `${version}-${abbreviatedSha}`);
  console.log(
    `This is an open source project, you can view its source code on Github!`,
  );
  console.log(`${github}/tree/${abbreviatedSha}`);
  console.groupEnd();
};

printBuildInfo();
