import { useReactFlow } from "reactflow"
import "./TopBar.css"

/**
 * 
 * @param {{selectedNode :  import("reactflow").Node<any, string | undefined> | undefined}} param0 
 * @returns 
 */
export default function TopBar({selectedNode}){
    
    // let instance = useReactFlow()
    
    // get selected node
    // let nodes = instance.getNodes()
    // let selectedNode = nodes.filter(node => node.selected)[0]
    console.log(selectedNode)
    /**
     * @type {HAREntry}
     */
    let data = selectedNode?.data
    let isActive = selectedNode !== null
    return <div className='topbar '>
        <div className='left'>
            <button disabled={!isActive}>Details</button>
            <button disabled={!isActive}>Highlight</button>
            <button disabled={!isActive}>Show Similar</button>
            <button disabled={!isActive}>Initiators</button>
        </div>
        <div className='center'>
            {isActive && <span>{data.request.url}</span>}
            {!isActive && <span>Select a node to get started</span>}
        </div>
        <div className='right'>
            <button>Core API Seeker</button>
        </div>
    </div>
}