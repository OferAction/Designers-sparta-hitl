import { useCallback, useEffect, useMemo } from "react";

import moment from "moment";
import { DateRange } from "react-day-picker";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { TriggerType, TriggerTypeValues } from "../services/types";
import { Option } from "@/components/ui/input-tag";

const allTriggers: Option[] = [
  { id: "Azure", label: "Azure", value: TriggerType.AzureTrigger },
  { id: "Outlook", label: "Outlook", value: TriggerType.EmailTrigger },
  { id: "notSpecified", label: "notSpecified", value: TriggerType.NotSpecified },
];

/**
 * Zod schema for validating and parsing URL search params with defaults
 * Handles cross-field validation for date ranges using native Zod date methods
 */
const searchParamsSchema = z
  .object({
    from: z.coerce.date().nullable().catch(null),
    to: z.coerce.date().nullable().catch(null),
    triggers: z
      .union([z.array(z.nativeEnum(TriggerType)), z.tuple([z.literal("null")])])
      .nullable()
      .catch(null)
      .transform((val) => {
        if (!val || val.length === 0) return Object.values(TriggerType);
        if (val.length === 1 && val[0] === "null") return [];
        return val as TriggerTypeValues[];
      }),
  })
  .transform((val) => {
    let fromDate = moment(val.from);
    let toDate = moment(val.to);

    const fromValid = fromDate.isValid();
    const toValid = toDate.isValid();

    if (!fromValid && !toValid) {
      fromDate = moment().subtract(30, "days");
      toDate = moment();
    } else if (fromValid && !toValid) {
      toDate = fromDate.clone().add(30, "days");
    } else if (!fromValid && toValid) {
      fromDate = toDate.clone().subtract(30, "days");
    }

    if (toDate.isBefore(fromDate)) {
      toDate = fromDate.clone().add(30, "days");
    }

    return {
      ...val,
      from: fromDate.toDate(),
      to: toDate.toDate(),
    };
  });

/**
 * Manages monitoring filters state synchronized with URL search params
 * Handles date range and trigger type filters with automatic default initialization using Zod validation
 */
export function useMonitoringFiltersURLParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse and validate search params using Zod
  const parsedParams = useMemo(() => {
    const rawParams = {
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      triggers: searchParams.getAll("triggers"),
    };

    return searchParamsSchema.parse(rawParams);
  }, [searchParams]);

  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const triggersParam = searchParams.has("triggers") ? searchParams.getAll("triggers") : null;
    const newParams = new URLSearchParams(searchParams);

    if (!fromParam) {
      newParams.set("from", parsedParams.from.toISOString());
    }

    if (!toParam) {
      newParams.set("to", parsedParams.to.toISOString());
    }

    if (!triggersParam) {
      (parsedParams.triggers ?? Object.values(TriggerType)).forEach((trigger) => {
        newParams.append("triggers", String(trigger));
      });
    }

    setSearchParams(newParams, { replace: true });
  }, [parsedParams, searchParams, setSearchParams]);

  const date = useMemo(
    () => ({
      from: parsedParams.from,
      to: parsedParams.to,
    }),
    [parsedParams.from, parsedParams.to]
  );

  const setDate = useCallback(
    (value: DateRange | undefined) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (!value?.from || !value?.to) {
            newParams.delete("from");
            newParams.delete("to");
          } else {
            newParams.set("from", value.from.toISOString());
            newParams.set("to", value.to.toISOString());
          }
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const selectedTriggers = useMemo<Option[] | null>(() => {
    const triggers = parsedParams.triggers;
    if (triggers.length === 0) return [];

    const filtered = allTriggers.filter((trigger) => triggers.includes(trigger?.value as TriggerTypeValues));
    return filtered;
  }, [parsedParams]);

  const setSelectedTriggers = useCallback(
    (value: Option[] | null) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("triggers");

          if (value === null) {
            // null means all triggers selected
            allTriggers.forEach((trigger) => {
              if (trigger?.value) {
                newParams.append("triggers", String(trigger.value));
              }
            });
          } else if (value.length === 0) {
            // Empty array means no triggers selected - use "null" string
            newParams.set("triggers", "null");
          } else {
            // Array with specific values
            value.forEach((trigger) => {
              if (trigger?.value) {
                newParams.append("triggers", String(trigger.value));
              }
            });
          }

          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return {
    date,
    setDate,
    selectedTriggers,
    setSelectedTriggers,
    allTriggers,
  };
}
