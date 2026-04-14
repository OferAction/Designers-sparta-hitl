import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import figma from "@figma/code-connect"

figma.connect(
  Tabs,
  "https://www.figma.com/design/g5zl2u6IO13h5kcwBiQtOR?node-id=2764%3A25047",
  {
    props: {},
    example: () => (
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    ),
  },
)
