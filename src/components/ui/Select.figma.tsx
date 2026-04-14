import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select"
import figma from "@figma/code-connect"

figma.connect(
  Select,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2738%3A3406",
  {
    props: {
      placeholder: figma.string("Content"),
    },
    example: ({ placeholder }) => (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
)
