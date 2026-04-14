import { useEffect, useState } from "react";

export const useLeftPanelWidth = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(0);


  useEffect(() => {
    const leftPanel = document.getElementById("left-panel-provider");
    if (!leftPanel) {
      setLeftPanelWidth(0);

      return;
    }

    const updateWidth = () => {
      setLeftPanelWidth(leftPanel.offsetWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(leftPanel);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return leftPanelWidth;
};
