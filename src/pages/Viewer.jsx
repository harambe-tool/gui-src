import ReactFlow, { Background, Controls } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useMemo } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import {HARBase} from "./../ReactflowComponents"

let initiators = {

}

/**
 * 
 * @param {HAREntry} entry 
 */
function classifier(entry, index){
    // Store the initiator
    let initiator = entry["_initiator"]
    if (!initiators[initiator])
        initiators[initiator] = []

    initiators[initiator].append(index)
}

export default function Viewer(){
    const nodeTypes = useMemo(() => ({ harBase: HARBase }), []);
    let { harContent } = useContext(AppStateContext)
    /**
     * @type {HARLog}
    */
   let log = harContent["log"];
   console.log(log.entries)
   /**
    * @type {import('reactflow').Node[]}
    */
   const nodes = [
       {
         id: 'node-1',
         type: 'harBase',
         position: { x: 0, y: 0 },
         data: log.entries[0],
         focusable: true
       },
     ];
    return <>
        <div className='viewer' style={{"width": "100vw", "height": "100vh"}}>
            <ReactFlow nodeTypes={nodeTypes} proOptions={{ hideAttribution: true }} nodes={nodes} fitView>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    </>
}