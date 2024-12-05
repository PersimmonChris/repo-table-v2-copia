export type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export type DatePreset = {
  label: string;
  from: Date;
  to: Date;
  shortcut: string;
};

export type Option = {
  label: string;
  value: string | boolean | number | undefined;
};

export type Input = {
  type: "input";
  options?: Option[];
};

export type Checkbox = {
  type: "checkbox";
  component?: (props: Option) => JSX.Element | null;
  options?: Option[];
  enableSearch?: boolean;
};

export type Slider = {
  type: "slider";
  min: number;
  max: number;
  trailing?: string;
  options?: Option[];
};

export type Timerange = {
  type: "timerange";
  options?: Option[]; // required for TS
  presets?: DatePreset[];
};

export type Base<TData> = {
  label: string;
  value: keyof TData;
  /**
   * Defines if the accordion in the filter bar is open by default
   */
  defaultOpen?: boolean;
  /**
   * Defines if the command input is disabled for this field
   */
  commandDisabled?: boolean;
};

export type DataTableFilterField<TData> = {
  label: string;
  value: keyof TData;
  defaultOpen?: boolean;
  commandDisabled?: boolean;
} & (
    | {
      type: "checkbox";
      component?: (props: Option) => JSX.Element | null;
      options?: Option[];
      enableSearch?: boolean;
    }
    | {
      type: "command";
      options: Option[];
    }
    | {
      type: "slider";
      min: number;
      max: number;
      trailing?: string;
    }
    | {
      type: "input";
    }
    | {
      type: "timerange";
      presets?: DatePreset[];
    }
  );
