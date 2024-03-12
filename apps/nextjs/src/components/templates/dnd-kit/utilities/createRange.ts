/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const defaultInitializer = (index: number) => index;

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer,
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index));
}
