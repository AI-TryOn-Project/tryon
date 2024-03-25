import { useAppDispatch, useAppSelector } from "~src/store/store";
import "./index.less";
import { CUR_TAB } from "~src/config";
import UploadText from '../../resources/upload_text.png';
import BodyText from '../../resources/body_text.png';
const Title = () => {
  const dispatch = useAppDispatch();

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types
  const curTab = useAppSelector((state) => state.curTab.curTab);

  return (
    <div className="title-container">
      <img
        src={curTab === CUR_TAB.BODY ? BodyText : UploadText}
      />
    </div>
  );
};
export default Title;
