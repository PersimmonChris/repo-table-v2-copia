"use client";

import type { Table } from "@tanstack/react-table";
import type { DataTableFilterField } from "./types";
import { InputWithAddons } from "@/components/custom/input-with-addons";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/custom/slider";
import { isArrayOfNumbers } from "@/lib/is-array";
import { formatCompactNumber } from "@/lib/format";

type DataTableFilterSliderProps<TData> = Extract<
  DataTableFilterField<TData>,
  { type: "slider" }
> & {
  table: Table<TData>;
};

export function DataTableFilterSlider<TData>({
  table,
  value: _value,
  min,
  max,
  trailing,
}: DataTableFilterSliderProps<TData>) {
  const value = _value as string;
  const column = table.getColumn(value);
  const filterValue = column?.getFilterValue();

  const filters =
    typeof filterValue === "number"
      ? [filterValue, filterValue]
      : Array.isArray(filterValue) && isArrayOfNumbers(filterValue)
        ? filterValue.length === 1
          ? [filterValue[0], filterValue[0]]
          : filterValue
        : undefined;

  const formatValue = (val: number) => {
    if (trailing === "k€") {
      return formatCompactNumber(val) + trailing;
    }
    return `${val}${trailing ? ` ${trailing}` : ''}`;
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-4">
        <div className="grid w-full gap-1.5">
          <Label
            htmlFor={`min-${value}`}
            className="px-2 text-muted-foreground"
          >
            Min.
          </Label>
          <InputWithAddons
            placeholder="from"
            trailing={trailing}
            containerClassName="mb-2 h-9 rounded-lg w-full"
            type="number"
            name={`min-${value}`}
            id={`min-${value}`}
            value={`${filters?.[0] ?? min}`}
            min={min}
            max={max}
            className="w-full"
            onChange={(e) => {
              const val = Number.parseInt(e.target.value) || 0;
              const newValue =
                Array.isArray(filters) && val < filters[1]
                  ? [val, filters[1]]
                  : [val, max];
              column?.setFilterValue(newValue);
            }}
          />
        </div>
        <div className="grid w-full gap-1.5">
          <Label
            htmlFor={`max-${value}`}
            className="px-2 text-muted-foreground"
          >
            Max.
          </Label>
          <InputWithAddons
            placeholder="to"
            trailing={trailing}
            containerClassName="mb-2 h-9 rounded-lg"
            type="number"
            name={`max-${value}`}
            id={`max-${value}`}
            value={`${filters?.[1] ?? max}`}
            min={min}
            max={max}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value) || 0;
              const newValue =
                Array.isArray(filters) && val > filters[0]
                  ? [filters[0], val]
                  : [min, val];
              column?.setFilterValue(newValue);
            }}
          />
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        value={filters || [min, max]}
        onValueChange={(values) => column?.setFilterValue(values)}
        formatValue={formatValue}
      />
    </div>
  );
}
