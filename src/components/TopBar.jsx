import { useReactFlow } from "reactflow"
import "./TopBar.css"
import { useContext, useEffect, useState } from "react"
import DetailModal from "./DetailModal";
import "./Modal.css"
import { ModalContainer } from "./Modal";
import { loggers } from "../utils/loggers";
import { AppStateContext } from "../appStateBackend";

// TODO: LATER - One day, add an input for filtering. Until then, we'll have a mix and match approach to filtering
// TODO: Now - work on dropdown for resource types to show

function Filter({filterSetter}) {
  let instance = useReactFlow()

  let [filter, setFilter] = useState("all");
  let [isShowingMenu, setShowMenu] = useState(false);


  function setAsFilter(ev) {
    let newFilter = ev.target.className != "" ? ev.target.className : ev.target.parentElement.className
    setFilter(newFilter);
    filterSetter(newFilter);
  }

  useEffect(()=>{
    loggers.topbar("Filter changed")
  }, [filter])

  let dropdownMappings = {
    all: "No Filter",
    harBase: "Unknown",
    media: "Media",
    analytics_endpoint: "Analytics Endpoint",
    apiRequest_external: "External API",
    apiRequest_core: "Same-site API",
    cdnAsset: "CDN Scripts / Asset",
    hostedAsset: "Hosted Scripts / Script",
  };

  return (
    <div>
      <div onClick={() => setShowMenu(false)} onWheel={() => setShowMenu(false)} id="blurHandle" style={{position: "absolute", top:0,left:0,width:"100%",height:"100vh",zIndex:1000, display: isShowingMenu ? "block" : "none"}}></div>
      <button id="filterButton" onClick={() => setShowMenu(!isShowingMenu)}>{dropdownMappings[filter]}</button>
      {
        isShowingMenu && <fieldset id="filters" tabindex="0" style={{zIndex:1001}}>
        {Object.entries(dropdownMappings).map(([key, value], index) => (
          <button onClick={setAsFilter} key={key} className={key}>
  
              <span style={{userSelect:"none"}}>{value}</span>
              <input
              tabIndex={0}
              type="radio"
              onChange={setAsFilter}
              className={key}
              checked={key==filter}
              id={key}
              name="filters"
              ></input>
          </button>
        ))}
      </fieldset>
    }
      
    </div>
  );
}

export function GenericDropdown({mappings, state, callback}){
  let [isShowingMenu, setShowMenu] = useState(false);

  return <div>
      <div onClick={() => setShowMenu(false)} onWheel={() => setShowMenu(false)} id="blurHandle" style={{position: "absolute", top:0,left:0,width:"100%",height:"100vh",zIndex:1000, display: isShowingMenu ? "block" : "none"}}></div>
      <button id="filterButton" onClick={() => setShowMenu(!isShowingMenu)}>{mappings[state]}</button>
      {
        isShowingMenu && <fieldset id="filters" tabindex="0" style={{zIndex:1001}}>
        {Object.entries(mappings).map(([key, value], index) => (
          <button onClick={()=>callback(key)} key={key} className={key}>
              <span style={{userSelect:"none"}}>{value}</span>
              <input
              tabIndex={0}
              type="radio"
              onChange={()=>callback(key)}
              className={key}
              checked={key==state}
              id={key}
              name="filters"
              ></input>
          </button>
        ))}
      </fieldset>
    }
  </div>
}


// function Filter({viewNodeSetter}){
//     const supportedFilters = [
//         "method:",
//         "url:",
//         "status:",
//         "mime-type:",
//         "asset-type:"
//     ] 

//     return <input placeholder="Filter shown nodes"></input>
// }

/**
 * 
 * @param {{selectedNode :  import("reactflow").Node<any, string | undefined> | undefined}} param0 
 * @returns 
 */
export default function TopBar({selectedNode, filterSetter}){

    // let instance = useReactFlow()
    
    // get selected node
    // let nodes = instance.getNodes()
    // let selectedNode = nodes.filter(node => node.selected)[0]
    loggers.topbar(selectedNode)
    let {highlightedNodes, setHighlightedNodes} = useContext(AppStateContext)
    let isSlug = false
    if (selectedNode) isSlug = Object.keys(selectedNode.data).every((val)=>["id","label","path", "isID"].includes(val))
    let [activeModal, setActiveModal] = useState("") 
    /**
     * @type {HAREntry}
     */
    let data = selectedNode?.data
    let isActive = selectedNode !== null

    let hideAction = () => setActiveModal("")
    let modal = <></>

    function highlightHandler(){
      let new_state = Object.assign({}, highlightedNodes); //Avoid mutating the state (can also just destructure but this way is nicer, albeit lacking in performance)
      if (new_state[selectedNode.id] == undefined) new_state[selectedNode.id] = true
      else {new_state[selectedNode.id] = !new_state[selectedNode.id]}
      setHighlightedNodes(new_state)

    }
    switch (activeModal) {
      case "details":
        modal = <DetailModal hide={hideAction} data={data}></DetailModal>
        break;
      default:
        break;
    }

    return <div className='topbar '>
        <div className='left'>
            <button tabIndex={0} disabled={!isActive} onClick={() => setActiveModal("details")}>Details</button>
            <button tabIndex={1} disabled={!isActive} onClick={() => highlightHandler()}>Highlight</button>
            <button tabIndex={2} disabled={!isActive || true}>Show Similar</button>
            <button tabIndex={3} disabled={!isActive || true}>Initiators</button>
        </div>
        <div className='center'>
            {isActive && <span>{isSlug ? data.path : data.request.url}</span>}
            {!isActive && <span>Select a node to get started</span>}
        </div>
        <div className='right'>
            <Filter filterSetter={filterSetter}></Filter>
            <button disabled={true}>Core API Seeker</button>
        </div>
        { (activeModal != "") && <ModalContainer hideAction={hideAction} modal={modal}></ModalContainer> }
    </div>
}