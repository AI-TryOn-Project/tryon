import { useAppDispatch, useAppSelector } from "~src/store/store"

import "./index.less"

import Uploader from "~src/components/Uploader"

const Upload = () => {
  const dispatch = useAppDispatch()

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types

  return <div className="tab-content-inner-bg tab-content-inner-bg-profile">
<Uploader />
  </div>
}
export default Upload
