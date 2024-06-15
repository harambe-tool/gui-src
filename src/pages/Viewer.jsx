import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useEffect, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import {APIBlock, AnalyticsBlock, HARBase, HARImage, customWidthMappings, mapToDimension} from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';
import Dagre from '@dagrejs/dagre';
import TopBar from '../components/TopBar';

let initiators = []
let initiatorIndexes =[];


function isAnalytics(url){
    let trackers = ["https://www.google-analytics.com/g/collect", "ads/ga-audiences"]
    return trackers.some(tracker => url.includes(tracker))
}
/**
 * Classifier - currently only classifies and groups initiators
 * @param {HAREntry} entry 
 * @param {number} index_any 
 * @param {string} pageref 
 */
function classifier(entry, index_any, internalPredicate){
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
        case "parser":
        case "preflight":
            initiatorURL = initiator?.url
            break;
        // case "xhr":
            // initiatorURL = initiator?.url
            // break;
    }
    if (initiator?.stack?.callFrames == []){
        initiatorURL = initiator?.stack?.parent?.callFrames?.at(0)?.url
    }
    let index = Number(index_any)
    initiatorURL ??= "orphan"
    initiators[index] = initiatorURL
    // console.log(initiators)
    let coreURL = new URL(entry.request.url).hostname.split(".");
    let isInternal = internalPredicate(coreURL)

    //todo: create `type` for reactflow
    //  analytics_endpoint (posthog, google ads, etc)
    //  apiRequest_external (identify endpoints through CLD similarity. with an option to change to internal API)
    //  apiRequest_core (what the site identifies as the main API - identify endpoints through CLD similarity with an option to change to external API)
    //  harBase (initiator : other)
    //  hostedAsset (static hosted scripts - all scripts under same CLD or not recognized from a global provider. Can get from long cache times or file extension)
    //  cdnAsset (3rd party scripts)
    //  media (images, svg, icons, fonts, etc)
    entry["_type"] = "harBase"
    switch (entry["_resourceType"]){
        case "image":
            entry["_type"] = "media"
            break;
        case "script":
            entry["_type"] = isInternal ? "hostedAsset" : "cdnAsset" 
    }
    if (entry.response.content.mimeType.startsWith("image/") || entry.response.content.mimeType.startsWith("svg+xml")){
        entry["_type"] = "media"
    }
    // console.log(entry.request.url)
    if (isAnalytics(entry.request.url)){
        entry["_type"] = "analytics_endpoint"
    }

    // console.log(entry.response.content.mimeType.startsWith("application/json"), internalPredicate(coreURL))
    if (isInternal && entry.response.content.mimeType.startsWith("application/json")){
        entry["_type"] = "apiRequest_core"
    }

    // if (entry.response.content.mimeType.startsWith("text/javascript")){
    //     entry["_type"] = isInternal ? "hostedAsset" : "cdnAsset" 
    // }
    // console.log(entry)
    // return "harBase"
}



const layout = new Dagre.graphlib.Graph()
layout.setGraph({rankdir:"TB"});
layout.setDefaultEdgeLabel(() => ({}));

const nodeTypes = { 
    "harBase": HARBase, 
    "media": HARImage, 
    "analytics_endpoint": AnalyticsBlock,
    "apiRequest_external": HARBase,
    "apiRequest_core": APIBlock,
    "cdnAsset": HARBase,
    "hostedAsset": HARBase
};

function Viewer_providerless(){
    let { harContent } = useContext(AppStateContext)

    /**
     * @type {ReturnType<typeof useState<import('reactflow').Node>>}
     */
    let [selectedNode, setSelectedNode] = useState(null);

    /**
     * @type {HARLog}
    */
    let log = harContent["log"];
    
    let keywords = log.pages.flatMap((page)=>new URL(page.title).hostname.split(".").slice(0,-1))
    // console.log(keywords)
    const isInternal = (comparisonList)=>keywords.some(keyword => comparisonList.includes(keyword))

    
    // console.log(selectedNode)
    // can use entry index as ID for nodes
    log.entries.map((entry, index)=>{classifier(entry,index, isInternal)})
    
    /**
     * @type {{values:import('reactflow').Node[], edges:{v:Number,w:Number}[]}}
     */
    let {nodes, edges} = useMemo(()=> {
        let values = log.entries.map((entry, index) => {
            
            /**
             * @type {import('reactflow').Node}
             */
            let data = {
                id: index.toString(),
                type: entry["_type"],
                data: entry,
                focusable: true,
                ...mapToDimension(entry["_type"]),
                // width: customWidthMappings[entry["_type"]]?.width ??  customWidthMappings["default"]["width"],
                // height: customWidthMappings[entry["_type"]]?.height ??  customWidthMappings["default"]["height"]
                rank: entry["_type"] == "media" ? 3 : 2 
            }
            console.log(data)

            let initiatorIndex = log.entries.findIndex(entry => entry["request"]?.url === initiators[index])
            let initiatorID = initiatorIndex == -1 ? "orphan" : initiatorIndex.toString()
            layout.setNode(index.toString(), data)
            layout.setEdge(initiatorID, `${index}`)
            return data
        })
        Dagre.layout(layout);
        let nodes = []
        let edges = []

        values.map((entry, index) => {
            const { x, y, width, height } = layout.node(index.toString());
            nodes.push({
                position: {
                    x: x - width / 2,
                    y: y - height / 2,
                },
                ...entry,
            })

        });
        edges = layout.edges()
        return {nodes,edges};
    }, [])
    // return { ...node, position: { x, y } };

    console.log(nodes, edges)

    if(selectedNode?.id) nodes[Number(selectedNode.id)].selected = true;

    /**
     * @type {import('reactflow').Edge[]}
     */
    let customEdges = edges.map((edge)=>{return {id:`${edge.v}-${edge.w}`, source:edge.v, target:edge.w}});

    // edges.
    return <>
        <div className='viewer' style={{"width": "100vw", "height": "100vh"}}>
            <TopBar selectedNode={selectedNode}></TopBar>
            <ReactFlow minZoom={0} maxZoom={1000000} pannable={true} fitViewOptions={{maxZoom: 1000000, minZoom:0}} onNodeClick={(event,node)=>{setSelectedNode(node)}} nodesFocusable={true} nodeTypes={nodeTypes} proOptions={{ hideAttribution: true }} edges={customEdges} nodes={nodes} fitView>
                <Background />
                <Controls />
            </ReactFlow>
            <DetailBar log={selectedNode?.data}></DetailBar>
        </div>
    </>
}

// Adding a top bar allows for more clear cut action paths to take

// Inactive - no node selected
// either gray out the buttons or dont include them at all
// Left side: Active, but all disabled
// Center "Select a node to get started",
// Right side: Core API seeker [only shows REST API endpoints - hides CSS, Images, Analytics, etc]

// Active
// Left side:
// Details #4 [Button to view expanded details in a modal]
// Button to highlight / Add extra attention to this node
// [...more]
// Center
// Inspecting [type_icon] https://example.com/
// ||
// Inspecting [type_icon] https://example.com/long_url/no_fit_he...\
// Right Side
// Core API seeker [only shows REST API endpoints - hides CSS, Images, Analytics, etc]
// [...more]




export default function Viewer(){
    
    return <ReactFlowProvider>
        <Viewer_providerless></Viewer_providerless>
    </ReactFlowProvider>
}