import { useAppDispatch, useAppSelector } from "~src/store/store"
import "./index.less"
import closeIcon from '../../resources/icon-close.svg'; 
import iconMin from '../../resources/icon-min.svg'; 

const Header = () => {
  const dispatch = useAppDispatch()

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types

  return (
    <div className="">
      <button id="closeBtn" className="icon-btn icon-btn-close">
        <img src={iconMin} alt="Cross Icon" />
      </button> 
      <button id="minBtn" className="icon-btn icon-btn-min">
        <img src={closeIcon} alt="Min Icon" />
      </button>
    </div>
  )
}
export default Header
