import Header from "~src/components/Header";
import Title from "~src/components/Title";
import { useAppDispatch, useAppSelector } from "~src/store/store";

import "./index.less";

import Footer from "~src/components/Footer";
import Upload from "~src/views/Upload";
import Body from "~src/views/Body";
import { CUR_TAB } from "~src/config";

const MainView = () => {
  const dispatch = useAppDispatch();
  const curTab = useAppSelector((state) => state.curTab.curTab);
  const showMin = useAppSelector((state) => state.mode.showMin);

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types

  return (
    <div className="main-container">
      {showMin ?
        (
          <>
            <Header />
          </>
        ) :
        (
          <>
            <Header />
            <Title />
            {
              curTab === CUR_TAB.UPLOAD ? <Upload /> : <Body />
            }
            <Footer />
          </>
        )}

    </div>
  );
};
export default MainView;