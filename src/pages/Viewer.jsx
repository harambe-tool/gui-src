import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange, useReactFlow } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useEffect, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import {APIBlock, AnalyticsBlock, ApiPath, HARBase, HARImage, customWidthMappings, mapToDimension} from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';
import Dagre from '@dagrejs/dagre';
import TopBar from '../components/TopBar';

let initiators = {}
let initiatorIndexes =[];


const trackers = [
    "https://www.google-analytics.com/g/collect", 
    "ads/ga-audiences", 
    "googleads", 
    "adservice", 
    "ad.doubleclick", 
    "pagead/landing", 
    "fullstory.com", 
    "loglady.", 
    "ingest.sentry.io", 
    "bat.bing.com/p/insights", 
    "fbevents",
    "https://play.google.com/log"
]
function isAnalytics(url){
    return trackers.some(tracker => url.includes(tracker))
}
/**
 * Classifier - currently only classifies and groups initiators
 * @param {HAREntry} entry 
 * @param {number} index_any 
 * @param {string} pageref 
 */
function classifier(entry, index_any, internalPredicate){
    let type = "harBase"
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
    // let index = Number(index_any)
    initiatorURL ??= "orphan"
    // initiators[index] = initiatorURL
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
    type = "harBase"
    switch (entry["_resourceType"]){
        case "image":
            type = "media"
            break;
        case "script":
            type = isInternal ? "hostedAsset" : "cdnAsset" 
    }
    if (entry.response.content.mimeType.startsWith("image/") || entry.response.content.mimeType.startsWith("svg+xml")){
        type = "media"
    }
    // console.log(entry.request.url)
    if (isAnalytics(entry.request.url)){
        type = "analytics_endpoint"
    }

    // console.log(entry.response.content.mimeType.startsWith("application/json"), internalPredicate(coreURL))
    if (isInternal && entry.response.content.mimeType.startsWith("application/json")){
        type = "apiRequest_core"
    }

    // if (entry.response.content.mimeType.startsWith("text/javascript")){
    //     entry["_type"] = isInternal ? "hostedAsset" : "cdnAsset" 
    // }
    // console.log(entry)
    // return "harBase"
    return {
        type,
        initiator: initiatorURL
    };
}

/**
 * @typedef {{id: number, path: string, label: string}} decomposedPath_t
 */

/**
 * @type {decomposedPath_t[]}
 */
let decomposedPaths = []
function buildDescendingPath(entry,index){
    let url = new URL(entry.request.url)
    let decomposedPath = (url.hostname+url.pathname).split("/")
    // console.log(decomposedPath)
    
    decomposedPath.map((slug,index,full)=>{
        let fullPath = full.slice(0,index+1).join("/") //this is fine

        // Prevent duplicate slug creations
        let searchResults = decomposedPaths.findIndex((decomposed)=>decomposed.path == fullPath)
        if (searchResults == -1)decomposedPaths.push({
            id: decomposedPaths.length,
            path: fullPath,
            label: slug
        })
    })
}

let layout = new Dagre.graphlib.Graph()
layout.setGraph({rankdir:"TB"});
layout.setDefaultEdgeLabel(() => ({}));

const nodeTypes = { 
    "harBase": HARBase, 
    "media": HARImage, 
    "analytics_endpoint": AnalyticsBlock,
    "apiRequest_external": HARBase,
    "apiRequest_core": APIBlock,
    "cdnAsset": HARBase,
    "hostedAsset": HARBase,
    "api_path": ApiPath
};

function Viewer_providerless(){
    let { harContent } = useContext(AppStateContext)
    /**
     * @type {ReturnType<typeof useState<import('reactflow').Node>>}
    */
    let [selectedNode, setSelectedNode] = useState(null);
    let [filter, setFilter] = useState("all");
    let instance = useReactFlow()
    /**
     * @type {HARLog}
    */
    let log = harContent["log"];
    
    let keywords = log.pages.flatMap((page)=>new URL(page.title).hostname.split(".").slice(0,-1))
    // console.log(keywords)
    const isInternal = (comparisonList)=>keywords.some(keyword => comparisonList.includes(keyword))

    
    // console.log(selectedNode)
    // can use entry index as ID for nodes
        // go through all API reqs?
        // split by `/` and get each slug
        // build a "tree"
        // ```json
        // {
        // "services.balling.com" : {
        //     "api":{
        //          "users":[
        //              "128303443",
        //              "120385945"
        //          ],
        //          "posts":[
        //              "edit",
        //              "view"
        //          ]
        //     }
        // }
        // }```

        //  decomposedPaths = {}
        //  id : /api/users/128303443 
        //  label : 128303443
        // id : /api/users/ 
        //  label : users
        // id: /api/ 
        //  label : api

        // decompostedPaths = [ {"id":"/api/users/128303443","label":"128303443"}, {"id":"/api/users/","label":"users"}, {"id":"/api/","label":"api"} ]

    let classifiedEntries = useMemo(()=>{
        // REFACTOR IN PROGRESS
        return log.entries.map((entry, index)=>{
            let entryClone = {...entry}
            let classified = classifier(entry,index, isInternal)
            entryClone["_type"] = classified.type
            entryClone["_initiator_harambe"] = classified.initiator
            if (entryClone["_type"] == "apiRequest_core"){
                console.log("Building path from", entry.request.url)
                buildDescendingPath(entry, index)
                // decomposedPaths[fullPath][ending] = true
            }
            return entryClone
            // console.log(entry)
        })
    }) 
    // console.log(decomposedPaths)


    const findInitiator = (initiator)=>{
        let initiatorIndex = log.entries.findIndex(entry => entry?.request?.url == initiator)
        return initiatorIndex == -1 ? "orphan" : initiatorIndex.toString()
    }
    /**
     * @type {{values:import('reactflow').Node[], edges:{v:Number,w:Number}[]}}
     */
    let {nodes, edges} = useMemo(()=> {

        layout = new Dagre.graphlib.Graph()
        layout.setGraph({rankdir:"TB"});
        layout.setDefaultEdgeLabel(() => ({}));

        let values = classifiedEntries;
        values = filter == "all" ? values : values.filter((entry)=>entry["_type"] == filter)
        let extraNodes = []
        
        if (filter == "apiRequest_core"){
            console.log(filter, "Filtering by API request")
            
            extraNodes = decomposedPaths.map((pathObject)=>{
                console.log(pathObject)
                let data = {
                    id:`${pathObject.id}-slug`,
                    type:"api_path",
                    data: pathObject,
                    focusable: false,
                    ...mapToDimension("api_path")
                }
                layout.setNode(`${pathObject.id}-slug`, data)
                return data;
            })
            console.log("Extra Nodes:", extraNodes)
        }

        values = values.map((entry, index) => {
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
                // rank: entry["_type"] == "media" ? 3 : 2 
            }
            let index_str = index.toString()
            layout.setNode(index_str, data)


            // Find initiator in list with .filter()
            // let initiator = entry["_initiator_harambe"]
            let initiatorID = findInitiator(entry["_initiator_harambe"])
            layout.setEdge(initiatorID, index_str)
            return data
        })
        values = [...values, ...extraNodes]

        Dagre.layout(layout);
        let nodes = []
        let edges = []

        // TODO: See if this whole memoized function can be optimized
        values.map((entry, index) => {
            try {

            const { x, y, width, height } = layout.node(entry.id); //i think i assigned an incorrect type to entry...
            nodes.push({
                position: {
                    x: x - width / 2,
                    y: y - height / 2,
                },
                ...entry,
            })
            } catch (e){
                debugger;
                throw e
            }


        });
        edges = layout.edges()
        setTimeout(()=>{
            instance.fitView({duration:200,padding:.5})
        },100)
        return {nodes,edges};

    }, [filter])
    // return { ...node, position: { x, y } };

    console.log(nodes)

    if(selectedNode?.id && nodes[Number(selectedNode.id)] !== undefined ) nodes[Number(selectedNode.id)].selected = true;

    /**
     * @type {import('reactflow').Edge[]}
     */
    let customEdges = edges.map((edge)=>{return {id:`${edge.v}-${edge.w}`, source:edge.v, target:edge.w}});

    // edges.
    return <>
        <div className='viewer' style={{"width": "100vw", "height": "100vh"}}>
            <TopBar filterSetter={setFilter} selectedNode={selectedNode}></TopBar>
            <ReactFlow  selectNodesOnDrag={true} minZoom={0} maxZoom={1000000} pannable={true} fitViewOptions={{maxZoom: 1000000, minZoom:0}} onNodeClick={(event,node)=>{setSelectedNode(node)}} nodesFocusable={true} nodeTypes={nodeTypes} proOptions={{ hideAttribution: true }} edges={customEdges} nodes={nodes} fitView>
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