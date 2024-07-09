import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange, useReactFlow } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useEffect, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import { APIBlock, AnalyticsBlock, ApiPath, HARBase, HARImage, customWidthMappings, mapToDimension } from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';
import Dagre from '@dagrejs/dagre';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';
import fingerprintClassifier from '../utils/classifiers';

let initiators = {}
let initiatorIndexes = [];

const trackers = [
    "https://www.google-analytics.com/g/collect",
    "https://www.google-analytics.com/j/collect",
    "https://stats.g.doubleclick.net",
    "https://analytics.google.com/g/collect",
    "https://www.google-analytics.com/collect",
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
    "https://play.google.com/log",
    "https://tr.snapchat.com/p",
    "https://api.realytics.io/event/track?cb="
]
function isAnalytics(url) {
    return trackers.some(tracker => url.includes(tracker))
}
/**
 * Classifier - currently only classifies and groups initiators
 * @param {HAREntry} entry 
 * @param {number} index_any 
 * @param {string} pageref 
 */
function classifier(entry, index_any, internalPredicate) {

    let data = [];
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
    if (initiator?.stack?.callFrames == []) {
        initiatorURL = initiator?.stack?.parent?.callFrames?.at(0)?.url
    }
    // let index = Number(index_any)
    initiatorURL ??= "orphan"
    // initiators[index] = initiatorURL
    // console.log(initiators)
    let coreURL = new URL(entry.request.url).hostname.split(".");
    let isInternal = internalPredicate(coreURL)

    //TODO: Implement https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html (and credit it)
    const classificationMap = {
        "amz": entry.response?.headers?.includes("x-amz-request-id"),
        "form": entry.request?.postData?.mimeType?.startsWith("application/x-www-form-urlencoded"),
        "csrf": entry.response?.headers?.includes("x-csrf-token"),
        "ratelimit": entry.response?.headers?.includes("x-ratelimit-limit"),
        "requestid": entry.request?.headers?.includes("x-request-id"),
        "correlationid": entry.request?.headers?.includes("x-correlation-id"),
        "apikey": entry.request?.headers?.includes("x-api-key"),

    }

    let dataToBeProcessed = fingerprintClassifier(entry.request.headers, entry.response.headers)
    // console.log(dataToBeProcessed)
    // Object.entries
    // }
    // if (entry.response.headers.includes("x-amz-request-id")){
    //     data["amz"] = true // Uses AWS
    // }
    // if (entry.request.method == "POST" && entry.request.postData.mimeType == "application/x-www-form-urlencoded") {
    //     data["form"] = true // Uses forms
    // }
    // if (entry.request.headers.includes("x-csrf-token")) {
    //     data["csrf"] = true // Uses CSRF
    // }
    // if (entry.response.headers.includes("x-ratelimit-limit")) {
    //     data["ratelimit"] = true // Uses rate limiting
    // }
    // if (entry.response.headers.includes("x-request-id")) {
    //     data["requestid"] = true // Uses request IDs
    // }
    // if (entry.response.headers.includes("x-correlation-id")) {
    //     data["correlationid"] = true // Will be useful ofr tracking requests in Harambe - TODO!
    // }
    // if (entry.response.headers.includes("x-api-key")) {
    //     data["apikey"] = true // Might be useful
    // }
    // if (entry.response.headers.includes("x-access-token")) {
    //     data["accesstoken"] = true // Could contain useful JWTs?
    // }
    // if (entry.response.headers.includes("x-auth-token")) {
    //     data["authtoken"] = true // Uses auth tokens
    // }
    // if (entry.response.headers.includes("authorization")) {
    //     data["authorization"] = true // Uses authorization headers
    // }
    // if (entry.response.headers.includes("x-client-id")) {
    //     data["clientid"] = true // Uses client IDs
    // }
    // if (entry.response.headers.includes("x-user-id")) {
    //     data["userid"] = true // Uses user IDs
    // }


    type = "harBase"
    switch (entry["_resourceType"]) {
        case "image":
            type = "media"
            break;
        case "script":
            type = isInternal ? "hostedAsset" : "cdnAsset"
    }
    if (entry.response.content.mimeType.startsWith("image/") || entry.response.content.mimeType.startsWith("svg+xml")) {
        type = "media"
    }
    // console.log(entry.request.url)
    if (isAnalytics(entry.request.url)) {
        type = "analytics_endpoint"
    }

    // console.log(entry.response.content.mimeType.startsWith("application/json"), internalPredicate(coreURL))
    if (isInternal && entry.response.content.mimeType.startsWith("application/json")) {
        type = "apiRequest_core"
    }

    // if (entry.response.content.mimeType.startsWith("text/javascript")){
    //     entry["_type"] = isInternal ? "hostedAsset" : "cdnAsset" 
    // }
    // console.log(entry)
    // return "harBase"
    return {
        type,
        initiator: initiatorURL,
        data:dataToBeProcessed
    };
}

/**
 * @typedef {{id: number, path: string, label: string}} decomposedPath_t
 */

/**
 * @type {decomposedPath_t[]}
 */
export let decomposedPaths = []
function buildDescendingPath(entry, index) {
    let url = new URL(entry.request.url)
    let decomposedPath = (url.hostname + url.pathname).split("/")
    decomposedPath.pop()
    // console.log(decomposedPath)

    decomposedPath.map((slug, index, full) => {
        let fullPath = full.slice(0, index + 1).join("/") //this is fine

        // Prevent duplicate slug creations
        let searchResults = decomposedPaths.findIndex((decomposed) => decomposed.path == fullPath)
        if (searchResults == -1) decomposedPaths.push({
            id: decomposedPaths.length,
            path: fullPath,
            label: slug
        })
    })
}

let layout = new Dagre.graphlib.Graph()
layout.setGraph({ rankdir: "TB" });
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

function Viewer_providerless() {
    let { harContent } = useContext(AppStateContext)

    if (harContent == null) return location.replace("/")
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

    let keywords = log.pages.flatMap((page) => new URL(page.title).hostname.split(".").slice(0, -1))
    // console.log(keywords)
    const isInternal = (comparisonList) => keywords.some(keyword => comparisonList.includes(keyword))


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

    let classifiedEntries = useMemo(() => {
        // REFACTOR IN PROGRESS
        return log.entries.map((entry, index) => {
            let entryClone = { ...entry }
            let classified = classifier(entry, index, isInternal)
            entryClone["_type"] = classified.type
            entryClone["_data"] = classified.data
            entryClone["_initiator_harambe"] = classified.initiator
            if (entryClone["_type"] == "apiRequest_core") {
                console.log("Building path from", entry.request.url)
                buildDescendingPath(entry, index)
                // decomposedPaths[fullPath][ending] = true
            }
            return entryClone
            // console.log(entry)
        })
    },[])
    // console.log(decomposedPaths)


    const findInitiator = (initiator) => {
        let initiatorIndex = log.entries.findIndex(entry => entry?.request?.url == initiator)
        return initiatorIndex == -1 ? "orphan" : initiatorIndex.toString()
    }
    /**
     * @type {{values:import('reactflow').Node[], edges:{v:Number,w:Number}[]}}
     */
    let { nodes, edges } = useMemo(() => {

        let toplevel_parentID = "";
        layout = new Dagre.graphlib.Graph()
        layout.setGraph({ rankdir: "TB" });
        layout.setDefaultEdgeLabel(() => ({}));

        let values = classifiedEntries;
        values = filter == "all" ? values : values.filter((entry) => entry["_type"] == filter)
        let extraNodes = []

        if (filter == "apiRequest_core") {
            console.log(filter, "Filtering by API request")

            extraNodes = decomposedPaths.map((pathObject) => {
                let currentID = `${pathObject.id}-slug`
                console.log(pathObject)
                let data = {
                    id: currentID,
                    type: "api_path",
                    data: pathObject,
                    focusable: false,
                    ...mapToDimension("api_path")
                }
                layout.setNode(currentID, data)
                const isRoot = pathObject.label == pathObject.path
                if (!isRoot) {
                    const poppedPath = pathObject.path.split("/").slice(0, -1).join("/")
                    // If its a child, it cant be an orphan - but best to avoid a crash due to not thinking it out fully.
                    const parent = decomposedPaths.find((value) => poppedPath == value.path)?.id ?? "orphan"
                    layout.setEdge(`${parent}-slug`, currentID)
                }
                else {
                    toplevel_parentID = currentID; //doesnt matter which top level node, so we're fine with the last one.
                }

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
            if (filter == "apiRequest_core") {
                let url = new URL(entry.request.url)
                let simplePath = (url.hostname + url.pathname)

                const poppedPath = simplePath.split("/").slice(0, -1).join("/")
                console.log(poppedPath)
                const searchResult = decomposedPaths.find((value) => poppedPath == value.path)
                console.log(poppedPath, "has a ", searchResult)
                const parent = searchResult?.id ?? "orphan"
                const edgeId = `${parent}-slug`
                if (parent != "orphan")
                    console.log(`${poppedPath} has a parent slug! `, edgeId, searchResult.path)
                layout.setEdge(`${parent}-slug`, index_str)
            }
            else {
                let initiatorID = findInitiator(entry["_initiator_harambe"])
                layout.setEdge(initiatorID, index_str)
            }
            return data
        })
        values = [...values, ...extraNodes]

        Dagre.layout(layout);
        let nodes = []
        let edges = []

        // TODO: See if this whole memoized function can be optimized
        values.map((entry, index) => {
            const { x, y, width, height } = layout.node(entry.id); //i think i assigned an incorrect type to Values...
            nodes.push({
                position: {
                    x: x - width / 2,
                    y: y - height / 2,
                },
                ...entry,
            })
        });
        edges = layout.edges()

        setTimeout(() => {
            if (filter == "apiRequest_core") {
                // let projectedCoords = instance.project({x,y})
                // after logging i realize i have been using -slug-slug and toplevel_parentID is of the wrong type
                let { x, y } = layout.node(toplevel_parentID)

                instance.setCenter(x, y, { zoom: 1, duration: 200 })
                // instance.setViewport({x, y, zoom:2})
            }
            else {
                instance.fitView({ duration: 200, padding: .5 })
            }
        }, 100)
        return { nodes, edges };

    }, [filter])
    // return { ...node, position: { x, y } };

    console.log(edges)

    if (selectedNode?.id && nodes[Number(selectedNode.id)] !== undefined) nodes[Number(selectedNode.id)].selected = true;

    /**
     * @type {import('reactflow').Edge[]}
     */
    let customEdges = edges.map((edge) => { return { id: `${edge.v}-${edge.w}`, source: edge.v, target: edge.w } });

    // edges.
    return <>
        <div className='viewer' style={{ "width": "100vw", "height": "100vh" }}>

            <div className='barHolder'>
                <TopBar filterSetter={setFilter} selectedNode={selectedNode}></TopBar>
                <DetailBar log={selectedNode?.data}></DetailBar>
            </div>
            <ReactFlow
                edgesFocusable={false} edgesUpdatable={false} nodesDraggable={false}
                minZoom={0} maxZoom={1000000} pannable={true}
                fitViewOptions={{ maxZoom: 1000000, minZoom: 0 }}
                onNodeClick={(event, node) => { setSelectedNode(node) }}
                nodesFocusable={true} nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                edges={customEdges}
                nodes={nodes}
                onlyRenderVisibleElements={true}
                connectOnClick={false}
                defaultEdgeOptions={{ focusable: false, deletable: false, updatable: false }}
                nodesConnectable={false}
                fitView>
                <Background />
                <Controls />
            </ReactFlow>
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




export default function Viewer() {

    return <ReactFlowProvider>
        <Viewer_providerless></Viewer_providerless>
    </ReactFlowProvider>
}