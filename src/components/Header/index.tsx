import { useAppDispatch, useAppSelector } from "~src/store/store"
import "./index.less"
import closeIcon from '../../resources/icon-close.svg'; 
import iconMin from '../../resources/icon-min.svg'; 
import { changeMode } from "~src/store/mode-slice"

const Header = () => {
  const dispatch = useAppDispatch()
  const showMin = useAppSelector((state) => state.mode.showMin)
  
  const handleModeChange = () => {
    dispatch(changeMode(!showMin))
  }

  return (
    <div className="header-container">
      <div id="minBtn" className="icon-btn icon-btn-min" onClick={handleModeChange}>
        <img src={iconMin} alt="Close" />
      </div> 
      <div id="closeBtn" className="icon-btn icon-btn-close" onClick={()=>{window.close()}}>
        <img src={closeIcon} alt="Min" />
      </div>
    </div>
  )
}
export default Header
