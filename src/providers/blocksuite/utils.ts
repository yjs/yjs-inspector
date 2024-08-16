// Ported from blocksuite
//
// https://github.com/toeverything/blocksuite/blob/2d5a5f4b2b397af0a8cd96451fd3054d86da66a0/packages/framework/global/src/utils/assert.ts#L17
// https://github.com/toeverything/blocksuite/blob/226e9f4efab9f5243d4dbab9b7d6fa896bd39f1e/packages/framework/global/src/utils/logger.ts#L8
//
// Licensed under the MPL 2.0

export function assertExists<T>(
  val: T | null | undefined,
  message: string | Error = "val does not exist",
): asserts val is T {
  if (val === null || val === undefined) {
    if (message instanceof Error) {
      throw message;
    }
    throw new Error(message);
  }
}

export class NoopLogger {
  debug() {}

  error() {}

  info() {}

  warn() {}
}

export class ConsoleLogger {
  debug(message: string, ...args: unknown[]) {
    console.debug(message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    console.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(message, ...args);
  }
}
