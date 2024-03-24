import { useAppDispatch, useAppSelector } from "~src/store/store"
import "./index.less"
import { CUR_TAB } from "~src/config"

const Title = () => {
  const dispatch = useAppDispatch()

  // Make sure to use "useAppSelector" instead of "useSelector" to automatically get the correct types
  const curTab = useAppSelector((state) => state.curTab.curTab)

  return (
    <div className="title-container">
        <h1>{curTab === CUR_TAB.BODY?'Enter Body Dimensions':'Upload Profile Photo'}</h1>
    </div>
  )
}
export default Title
