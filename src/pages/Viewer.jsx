import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import {HARBase} from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';
import Dagre from '@dagrejs/dagre';

let initiators = []

/**
 * Classifier - currently only classifies and groups initiators
 * @param {HAREntry} entry 
 */
function classifier(entry, index_any){
    // Store the initiator. This isn't in spec, but it's gonna be in the HAR file. Only tested for Chrome devtool HARs.
    const initiator = entry["_initiator"]
    let initiatorType = initiator.type
    let initiatorURL = ""
    switch (initiatorType) {
        case "script":
            initiatorURL = initiator?.stack?.callFrames[0]?.url
            break;
    }

    let index = Number(index_any)
    initiators[index] = initiatorURL
    console.log(initiators)

    //todo: create `type` for reactflow
    //  analytics_endpoint (posthog, google ads, etc)
    //  apiRequest_external (identify endpoints through CLD similarity. with an option to change to internal API)
    //  apiRequest_core (what the site identifies as the main API - identify endpoints through CLD similarity with an option to change to external API)
    //  harBase (initiator : other)
    //  hostedAsset (static hosted scripts - all scripts under same CLD or not recognized from a global provider. Can get from long cache times or file extension)
    //  cdnAsset (3rd party scripts)

    return "harBase"
}

const layout = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

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
    // can use entry index as ID for nodes

    /**
     * 
     * @param {HAREntry} entry 
     * @param {Number} index 
     * @returns 
     */
    function computePosition(entry, index){
        entry["initiator"]
        return { x: 0, y: index * 100 }
    }

    log.entries.map((entry, index) => {classifier(entry, index)})
    /**
    * @type {import('reactflow').Node[]}
    */
    let nodes = log.entries.map((entry, index) => {

        let nodeData = {
            position: computePosition(entry, index),//{ x: 0, y: index * 100 },
            id: index.toString(),
            type: classifier(entry, index),
            data: entry,
            focusable: true,
        }
        return nodeData
    })

    log.entries.map((entry, index) => {
        layout.setNode(entry.request.url, {label: entry.request.url+"\n"+entry.request.method, width: 100, height: 100})
        layout.setEdge(entry.request.url, initiators[index])
    })

    console.log(layout)

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