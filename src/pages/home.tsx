import { Outlet } from "react-router-dom";

import { HomeLayout } from "@/layouts";

const Home = ({ isTemplateList }: { isTemplateList?: boolean }) => {
  return (
    <HomeLayout isTemplateList={isTemplateList}>
      <Outlet />
    </HomeLayout>
  );
};

export default Home;
