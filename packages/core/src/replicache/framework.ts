import type { WriteTransaction } from "replicache";
import type { z, ZodSchema } from "zod";

interface Mutation<Name extends string = string, Input = any> {
  name: Name;
  input: Input;
}

export class ServerMutations<Mutations> {
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
  ): ServerMutations<Mutations & { [key in Name]: Mutation<Name, Input> }> {
    this.mutations.set(name as string, {
      fn,
      input: fn.schema,
    });
    return this;
  }

  public execute(name: string, args: unknown) {
    const mut = this.mutations.get(name);
    if (!mut) throw new Error(`Mutation "${name}" not found`);
    return mut.fn(args);
  }
}

type ExtractMutations<S extends ServerMutations<any>> =
  S extends ServerMutations<infer M> ? M : never;

export class ClientMutations<
  S extends ServerMutations<any>,
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
    return Object.fromEntries(this.mutations.entries()) as {
      [key in keyof Mutations]: (
        ctx: WriteTransaction,
        args: Mutations[key]["input"],
      ) => Promise<void>;
    };
  }
}
