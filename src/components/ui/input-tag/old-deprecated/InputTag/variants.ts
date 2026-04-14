import { cva } from "class-variance-authority";

export const mainVariant = cva("group/tag relative h-6 flex items-stretch rounded-md text-sm cursor-pointer", {
  variants: {
    // Main variants - fundamental differences in appearance
    appearance: {
      emphasized: "", // border-muted
      flat: "group-hover/row:border-border",
    },
    status: {
      default: "",
      error: "outline outline-2 outline-destructive outline-offset-2",
    },
    state: {
      idle: "",
      disabled: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    appearance: "flat",
    status: "default",
    state: "idle",
  },
});

export const typeVariant = cva(
  "peer group/type shrink-0 flex items-center justify-center hidden rounded-l-[5px] w-6 h-full group-data-[has-type-trigger=true]/tag:inline-flex",
  {
    variants: {
      // Main variants - fundamental differences in appearance
      type: {
        input: "has-[.focus]/input:outline-2 has-[.focus]/input:outline-primary has-[.focus]/input:outline-offset-2",
        select:
          "data-[state=open]:outline data-[state=open]:outline-2 data-[state=open]:outline-primary data-[state=open]:outline-offset-2 data-[state=open]:z-10 focus:outline focus:z-10 focus:outline-2  focus:outline-offset-2 focus:outline-primary ",
      },
      appearance: {
        emphasized:
          "hover:bg-accent data-[state=open]:bg-accent border-y border-l group-data-[has-input-trigger=false]/tag:border-r border-muted focus:!border-transparent focus:bg-accent group-hover/tag:border-border", // border-muted
        flat: "border-transparent hover:bg-accent group-hover/row:border group-hover/row:border-border",
      },
      status: {
        default: "group-data-[has-input-trigger=false]/tag:rounded-r-[5px] data-[state=open]:rounded-r-[5px] focus:rounded-r-[5px] ",
        error:
          "data-[state=open]:!outline-none focus:!outline-none group-hover/tag:border-input hover:bg-transparent !border-input data-[state=open]:border-input data-[state=open]:rounded-r-[0px] group-data-[has-input-trigger=false]/tag:rounded-r-[5px]",
      },
      state: {
        idle: "",
        disabled: "cursor-not-allowed opacity-50",
      },
    },
    defaultVariants: {
      type: "select",
      appearance: "flat",
      status: "default",
      state: "idle",
    },
  }
);

export const inputVariant = cva(
  "group/input truncate flex items-center h-full rounded-r-[5px] rounded-l-[0px] outline-none group-data-[has-type-trigger=false]/tag:rounded-l-[5px] group-data-[has-input-trigger=false]/tag:hidden min-h-6",
  {
    variants: {
      // Main variants - fundamental differences in appearance
      type: {
        default: "focus:outline-2 focus:outline-primary focus:outline-offset-2 focus:outline-2 focus:outline-primary focus:outline-offset-2",
        input: "has-[.focus]/input:outline-2 has-[.focus]/input:outline-primary has-[.focus]/input:outline-offset-2",
        select:
          "data-[state=open]:outline-2 data-[state=open]:outline-primary data-[state=open]:outline-offset-2 focus:outline-2 focus:outline-primary focus:outline-offset-2",
      },
      appearance: {
        emphasized:
          "data-[state=open]:bg-accent focus:bg-accent has-[.focus]/input:bg-accent hover:bg-accent border-y border-r border-muted focus:group-hover/tag:border-transparent group-hover/tag:border-border group-data-[has-type-trigger=false]/tag:border has-[.focus]/input:group-hover/tag:border-transparent", // border-muted
        flat: "border-transparent group-hover/row:bg-accent group-hover/row:border-y group-hover/row:border-r group-hover/row:border-muted",
      },
      status: {
        default:
          "has-[.focus]/input:border-transparent has-[.focus]/input:hover:border-transparent has-[.focus]/input:z-10 has-[.focus]/input:rounded-l-[5px] data-[state=open]:border-transparent data-[state=open]:hover:border-transparent data-[state=open]:z-10 data-[state=open]:rounded-l-[5px] focus:border-transparent focus:hover:border-transparent focus:z-10 focus:rounded-l-[5px] group-data-[is-operand-tag=true]/tag:text-purple-accent",
        error:
          "text-destructive placeholder:text-destructive has-[.focus]/input:outline-transparent  hover:bg-transparent group-hover/tag:border-input !border-input has-[.focus]/input:border-input has-[.focus]/input:rounded-r-[5px] data-[state=open]:outline-transparent data-[state=open]/input:outline-transparentdata-[state=open]:border-input data-[state=open]:rounded-r-[5px] focus:outline-transparent focus:border-input focus:rounded-r-[5px] group-data-[is-operand-tag=true]/tag:text-destructive",
      },
      state: {
        idle: "",
        disabled: "cursor-not-allowed text-muted-foreground placeholder:text-destructive",
      },
    },
    defaultVariants: {
      type: "select",
      appearance: "flat",
      status: "default",
      state: "idle",
    },
  }
);

export const buttonIdle = "bg-blue-accent bg-opacity-20 text-muted-foreground transition-colors duration-200";
export const buttonHover = "hover:bg-border-blue hover:text-foreground";
export const numberIdle = "bg-muted-foreground text-background transition-colors duration-200";
export const numberHovered = "group-hover:bg-foreground group-hover:text-background";
export const buttonFocus = "bg-border-blue text-foreground ring-2 z-20 ring-blue-accent rounded-md ring-offset-2 ring-offset-background";
export const buttonError = "bg-destructive/10 text-destructive ring-2 z-20 ring-destructive rounded-md ring-offset-2 ring-offset-background";
