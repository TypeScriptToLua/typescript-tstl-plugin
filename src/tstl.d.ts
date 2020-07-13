/* eslint-disable @typescript-eslint/no-unnecessary-qualifier */
import * as tstl from 'typescript-to-lua';

declare module 'typescript-to-lua' {
  export const transpile: ((options: tstl.TranspileOptions) => tstl.TranspileResult) | undefined;
}
