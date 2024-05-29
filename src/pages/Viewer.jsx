import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import {HARBase} from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';

let initiators = {

}

/**
 * Classifier - currently only classifies and groups initiators
 * @param {HAREntry} entry 
 */
function classifier(entry, index){
    // Store the initiator
    let initiator = entry["_initiator"]
    // console.log()
    if (initiators[initiator] == undefined)
        initiators[initiator] = []

    initiators[initiator].push(index)

    //todo: create `type` for reactflow
    //  analytics_endpoint (posthog, google ads, etc)
    //  apiRequest_external (identify endpoints through CLD similarity. with an option to change to internal API)
    //  apiRequest_core (what the site identifies as the main API - identify endpoints through CLD similarity with an option to change to external API)
    //  harBase (initiator : other)
    //  hostedAsset (static hosted scripts - all scripts under same CLD or not recognized from a global provider. Can get from long cache times or file extension)
    //  cdnAsset (3rd party scripts)

    return "harBase"
}

function Viewer_providerless(){
    const nodeTypes = useMemo(() => ({ harBase: HARBase }), []);
    let { harContent } = useContext(AppStateContext)

    /**
     * @type {ReturnType<typeof useState<import('reactflow').Node>>}
     */
    let [selectedNode, setSelectedNode] = useState(null);

    /**
     * @type {HARLog}
    */
   let log = harContent["log"];
   console.log(selectedNode)
    * @type {import('reactflow').Node[]}
    */



    if(selectedNode?.id) nodes[Number(selectedNode.id)].selected = true;

    return <>
        <div className='viewer' style={{"width": "100vw", "height": "100vh"}}>
            <ReactFlow onNodeClick={(event,node)=>{setSelectedNode(node)}} nodesFocusable={true} nodeTypes={nodeTypes} proOptions={{ hideAttribution: true }} nodes={nodes} fitView>
                <Background />
                <Controls />
            </ReactFlow>
            <DetailBar log={selectedNode?.data}></DetailBar>
        </div>
    </>
}

export default function Viewer(){
    return <ReactFlowProvider>
        <Viewer_providerless></Viewer_providerless>
    </ReactFlowProvider>
}