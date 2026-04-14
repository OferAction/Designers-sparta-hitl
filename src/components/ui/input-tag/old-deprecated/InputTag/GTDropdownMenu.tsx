import { GT_MENU_ITEMS } from "./constants";
import { InputTagGTMenu } from "./InputTagGTMenu";

export const GTDropdownMenu = () => {
  return (
    <div className="absolute -left-1">
      <InputTagGTMenu items={GT_MENU_ITEMS} connectedTo="gt_toystory_eval" showDetach={true} />
    </div>
  );
};
