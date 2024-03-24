import { useAppDispatch, useAppSelector } from "~src/store/store"
import "./index.less"

const Header = () => {
  const dispatch = useAppDispatch()

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types

  return (
    <div className="">
      <button id="closeBtn" className="icon-btn icon-btn-close">
        <img src="~src/resources/icon-close.svg" alt="Cross Icon" />
      </button>
      <button id="minBtn" className="icon-btn icon-btn-min">
        <img src="~src/resources/icon-min.svg" alt="Min Icon" />
      </button>
    </div>
  )
}
export default Header
