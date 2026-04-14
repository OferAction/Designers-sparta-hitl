import { Skeleton } from "./skeleton"
import figma from "@figma/code-connect"

figma.connect(
  Skeleton,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=168%3A2123",
  {
    props: {},
    example: () => <Skeleton className="h-4 w-full" />,
  },
)
