import type { WriteTransaction } from "replicache";
import type { z, ZodSchema } from "zod";

import type { Transaction } from "@pachi/db";
import type { RequestHeaders } from "@pachi/types";

import type { ReplicacheTransaction, server } from "..";

interface Mutation<Name extends string = string, Input = any> {
  name: Name;
  input: Input;
}


export class Server<Mutations> {

  private mutations = new Map<
    string,
    {
      input: ZodSchema;
      fn: (input: any) => Promise<void>;
    }
  >();

  public expose<
    Name extends string,
    Shape extends ZodSchema,
    Input = z.infer<Shape>,
  >(
    name: Name,
    fn: ((input: z.infer<ZodSchema>) => Promise<any>) & {
      schema: Shape;
    },
  ): Server<Mutations & { [key in Name]: Mutation<Name, Input> }> {
    this.mutations.set(name as string, {
      fn,
      input: fn.schema,
    });
    return this;
  }

  public execute(name: string, args: unknown) {
    const mut = this.mutations.get(name as string);
    if (!mut) throw new Error(`Mutation "${name}" not found`);
    return mut.fn(args);
  }
}

type ExtractMutations<S extends Server<any>> = S extends Server<infer M>
  ? M
  : never;

export class Client<
  S extends Server<any>,
  Mutations extends Record<string, Mutation> = ExtractMutations<S>,
> {
  private mutations = new Map<string, (...input: any) => Promise<void>>();

  public expose<Name extends keyof Mutations>(
    name: Name,
    fn: (
      tx: WriteTransaction,
      input: Mutations[Name]["input"],
    ) => Promise<void>,
  ) {
    this.mutations.set(name as string, fn);
    return this;
  }

  public build(): {
    [key in keyof Mutations]: (
      ctx: WriteTransaction,
      args: Mutations[key]["input"],
    ) => Promise<void>;
  } {
    return Object.fromEntries(this.mutations) as {
      [key in keyof Mutations]: (
        ctx: WriteTransaction,
        args: Mutations[key]["input"],
      ) => Promise<void>;
    };
  }
}
