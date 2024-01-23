import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { forEachObj } from "remeda";

import { QUERY_OPTION_NAMES } from "./constants";

export type UseBuildQueryOptionParams = Partial<
  Record<(typeof QUERY_OPTION_NAMES)[number], string[]>
>;

/**
 * Create an url with query options.
 *
 * If the provided value is already exists in provided query option, it will be removed.
 *
 * @example
 * const buildQueryOption = useBuildExistingQueryOption()
 * buildQueryOption({"foo":["bar"]})
 * // Result: example.com -> example.com?foo=bar
 */
function useBuildExistingQueryOption() {
  const params = useSearchParams();
  const pathname = usePathname();
  const queryOptions = useQueryOptions(params);
  const searchParams = new URLSearchParams(params);

  return (queryOption: UseBuildQueryOptionParams) => {
    forEachObj.indexed(queryOption, (values, name) => {
      const currentValues = queryOptions[name];
      const newValue = values?.length
        ? Array.from(new Set([...currentValues, ...values])).filter(Boolean)
        : [];

      if (newValue.length) {
        searchParams.set(name, newValue.join(","));
      } else {
        searchParams.delete(name);
      }
    });

    return `${pathname}?${searchParams.toString()}`;
  };
}
function useBuildNewQueryOptions(queryOptionParams: UseBuildQueryOptionParams) {
  const pathname = usePathname();
  const queryOptions = Object.entries(queryOptionParams)
    .reduce((acc, [name, values = []]) => {
      if (values.length) {
        acc.set(name, values.join(","));
      } else {
        acc.delete(name);
      }

      return acc;
    }, new URLSearchParams())
    .toString();

  return `${pathname}?${queryOptions}`;
}
function useQueryOptions(searchParams: ReadonlyURLSearchParams) {
  return QUERY_OPTION_NAMES.reduce<
    Record<(typeof QUERY_OPTION_NAMES)[number], string[]>
  >(
    (acc, name) => {
      acc[name] = searchParams
        .getAll(name)
        .flatMap((values) =>
          values.replace(/\s/g, "").split(",").filter(Boolean),
        );

      return acc;
    },
    {
      page: [],
      pageSize: [],
      title: [],
      status: [],
    },
  );
}

export {
  useBuildExistingQueryOption,
  useBuildNewQueryOptions,
  useQueryOptions,
};
