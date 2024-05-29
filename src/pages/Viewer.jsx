import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useEffect, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import {HARBase} from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';
import Dagre from '@dagrejs/dagre';

let initiators = []
let initiatorIndexes =[];
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
        case "other":
            initiatorURL = "orphan"
            break;
    }

    let index = Number(index_any)
    initiatorURL ??= "orphan"
    initiators[index] = initiatorURL
    // console.log(initiators)

    //todo: create `type` for reactflow
    //  analytics_endpoint (posthog, google ads, etc)
    //  apiRequest_external (identify endpoints through CLD similarity. with an option to change to internal API)
    //  apiRequest_core (what the site identifies as the main API - identify endpoints through CLD similarity with an option to change to external API)
    //  harBase (initiator : other)
    //  hostedAsset (static hosted scripts - all scripts under same CLD or not recognized from a global provider. Can get from long cache times or file extension)
    //  cdnAsset (3rd party scripts)
    entry["_type"] = "harBase"
    return "harBase"
}

const layout = new Dagre.graphlib.Graph()
layout.setGraph({});
layout.setDefaultEdgeLabel(() => ({}));
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
    // console.log(selectedNode)
    // can use entry index as ID for nodes
    log.entries.map((entry, index)=>{classifier(entry,index)})

    /**
     * @type {import('reactflow').Node[]}
     */
    let nodes = useMemo(()=> {
        let values = log.entries.map((entry, index) => {
            /**
             * @type {import('reactflow').Node}
             */
            let data = {
                id: index.toString(),
                type: entry["_type"],
                data: entry,
                focusable: true,
                width:400,
                height:100
            }
            layout.setNode(entry.request.url, data)
            layout.setEdge(entry.request.url, log.entries.find(entry => entry["request"]?.url === initiators[index])??"orphan")
            const { x, y } = layout.node(entry.request.url);
            return {
                position: { x, y },
                id: index.toString(),
                type: entry["_type"],
                data: entry,
                focusable: true,
                width:400,
                height:100
            }
        });
        Dagre.layout(layout);
        console.log("layout", layout);
        console.log(initiators)
        return values;
    }, [])
    // return { ...node, position: { x, y } };

    console.log(nodes)

    if(selectedNode?.id) nodes[Number(selectedNode.id)].selected = true;

    return <>
        <div className='viewer' style={{"width": "100vw", "height": "100vh"}}>
            <ReactFlow onNodeClick={(event,node)=>{setSelectedNode(node)}} nodesFocusable={true} nodeTypes={nodeTypes} proOptions={{ hideAttribution: true }} nodes={nodes} fitView>
                {/* <Background variant='cross' /> */}
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