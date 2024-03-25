import { useAppDispatch, useAppSelector } from "~src/store/store"
import "./index.less"
import closeIcon from '../../resources/icon-close.svg'; 
import iconMin from '../../resources/icon-min.svg'; 

const Header = () => {
  const dispatch = useAppDispatch()
  return (
    <div className="header-container">
      <div id="minBtn" className="icon-btn icon-btn-min" >
        <img src={iconMin} alt="Close" />
      </div> 
      <div id="closeBtn" className="icon-btn icon-btn-close" onClick={()=>{window.close()}}>
        <img src={closeIcon} alt="Min" />
      </div>
    </div>
  )
}
export default Header
