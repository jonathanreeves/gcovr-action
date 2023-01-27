import * as core from "@actions/core";
import * as action from "./action";
import * as deps from "./deps";
import * as gcovr from "./gcovr";

async function run(): Promise<void> {
  try {
    const inputs = action.parseInputs();
    await deps.check(inputs);
    await gcovr.run(inputs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
