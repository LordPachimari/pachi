import type{ Server } from "@pachi/validators";

type ResultType<With, Entity> = With extends { [P in keyof Entities]?: true }
  ? Entity & Pick<Entities, Extract<keyof With, keyof Entities>>
  : Entity;

type Entities = {
  products?: Server.Product[];
  values?: Server.ProductOptionValue[];
  product?: Server.Product;
};

type isWithEntity = {
  [P in keyof Entities]?: true;
};

type withEntity = {
  [P in keyof isWithEntity]: P extends keyof Entities ? Entities[P] : never;
};

export type { Entities, isWithEntity, withEntity, ResultType };
