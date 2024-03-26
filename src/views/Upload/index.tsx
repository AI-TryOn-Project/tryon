import { useAppDispatch, useAppSelector } from "~src/store/store";

import "./index.less";

import Uploader from "~src/components/Uploader";

const Upload = () => {
  const dispatch = useAppDispatch();
  const base64_image = useAppSelector((state) => state.data.base64_image);
  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types

  return (<div className="tab-content-inner-bg tab-content-inner-bg-profile">
    <Uploader />
    <div className="explain">{base64_image ? 'Image saved successfully! Right-click on any model picture for instant face swap.' : 'Capture your clear, well-lit, frontal facial image for optimal results.'}</div>
  </div>);
};
export default Upload;
