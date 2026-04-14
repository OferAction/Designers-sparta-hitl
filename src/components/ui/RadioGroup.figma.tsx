import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"
import figma from "@figma/code-connect"

figma.connect(
  RadioGroup,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2780%3A51105",
  {
    props: {},
    example: () => (
      <RadioGroup defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    ),
  },
)
