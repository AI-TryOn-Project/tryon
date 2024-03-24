import { useAppDispatch, useAppSelector } from "~src/store/store"

import "./index.less"

import { CUR_TAB } from "~src/config"
import { changeTab } from "~src/store/tab-slice"

const Footer = () => {
  const dispatch = useAppDispatch()

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types
  const curTab = useAppSelector((state) => state.curTab.curTab)

  return (
    <div className="footer-container">
      <div
        className={`tab-bar-tab ${curTab === CUR_TAB.UPLOAD ? 'active' : ''}`}
        onClick={() => dispatch(changeTab(CUR_TAB.UPLOAD))}>
        <img
          src="resources/tab-bar-tab-icon0.svg"
          alt="Icon 0"
          className="tab-bar-icon-0"
        />
      </div>
      <div 
        className={`tab-bar-tab ${curTab === CUR_TAB.BODY ? 'active' : ''}`}
        onClick={() => dispatch(changeTab(CUR_TAB.BODY))}>
        <img
          src="resources/tab-bar-tab-icon1.svg"
          alt="Icon 1"
          className="tab-bar-icon-1"
        />
      </div>
    </div>
  )
}
export default Footer
