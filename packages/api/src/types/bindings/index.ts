export type Bindings = {
  ORIGIN_URL: string;
  DATABASE_URL: string;
  ENVIRONMENT: "prod" | "test" | "staging" | "dev";
  PACHI: KVNamespace;
  PACHI_PROD: KVNamespace;
  HANKO_URL: string;
  PACHI_BUCKET: R2Bucket;
};
