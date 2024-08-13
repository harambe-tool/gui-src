import ReactFlow, { Background, Controls, ReactFlowProvider, useOnSelectionChange, useReactFlow, useStoreApi } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext, useEffect, useMemo, useState } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component
import { APIBlock, AnalyticsBlock, ApiPath, HARBase, HARImage, customWidthMappings, mapToDimension } from "./../components/ReactflowComponents"
import DetailBar from '../components/DetailBar';
import Dagre from '@dagrejs/dagre';
import TopBar from '../components/TopBar';
import fingerprintClassifier from '../utils/classifiers';

import uuidvalidator from "uuid-validate"
import { isNumeric } from '../utils/validators';
import { loggers } from '../utils/loggers';
import Search from '../components/Search';

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
const isAnalytics = (url) => trackers.some(tracker => url.includes(tracker))
/**
 * Classifier - currently only classifies and groups initiators
 * @param {HAREntry} entry 
 * @param {number} index_any 
 * @param {string} pageref 
 */
function classifier(entry, internalPredicate) {

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
    }
    if (initiator?.stack?.callFrames == []) {
        initiatorURL = initiator?.stack?.parent?.callFrames?.at(0)?.url // Just nab the first initiator
    }
    initiatorURL ??= "orphan"

    let coreURL = new URL(entry.request.url).hostname.split(".");
    let isInternal = internalPredicate(coreURL)

    let dataToBeProcessed = fingerprintClassifier(entry.request.headers, entry.response.headers)

    type = "harBase"
    switch (entry["_resourceType"]) {
        case "image":
            type = "media"
            break;
        case "script":
            type = isInternal ? "hostedAsset" : "cdnAsset"
    }

    if (entry.response.content.mimeType.startsWith("image/") ||
      entry.response.content.mimeType.startsWith("svg+xml")) type = "media";

    if (isAnalytics(entry.request.url)) type = "analytics_endpoint"

    if (isInternal && 
        (entry.response.content.mimeType.startsWith("application/json") || entry?.request?.method == "POST")
    ) type = "apiRequest_core"

    return {
        type,
        initiator: initiatorURL,
        data:dataToBeProcessed
    };
}

/** @typedef {{id: number, path: string, label: string}} decomposedPath_t */

/** @type {decomposedPath_t[]} */
export let decomposedPaths = []

function buildDescendingPath(entry) {
    let url = new URL(entry.request.url)
    let decomposedPath = (url.hostname + url.pathname).split("/")
    decomposedPath.pop()

    decomposedPath.map((slug, index, full) => {
        let fullPath = full.slice(0, index + 1).join("/")

        let isID = uuidvalidator(slug) || isNumeric(slug)
        // Prevent duplicate slug creations
        let searchResults = decomposedPaths.findIndex((decomposed) => decomposed.path == fullPath)
        if (searchResults == -1) decomposedPaths.push({
            id: decomposedPaths.length,
            path: fullPath,
            label: slug,
            isID: isID
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


// TODO: This has many loops... 
// TODO: I should have one big reducer loop at the start that preprocesses this data THEN I deal with the logic.
function Viewer_providerless() {
    let { harContent, filter, setFilter } = useContext(AppStateContext)
    // Maybe use useNavigate?
    if (harContent == null) return location.replace("/")
    
    let instance = useReactFlow()
    /**
     * @type {ReturnType<typeof useState<import('reactflow').Node>>}
     */
    let [selectedNode, setSelectedNode] = useState(null);
    // let [filter, setFilter] = useState("all");
    
    window["filter"] = filter // Make it globally available... Yikes. In the future, provide a Filter context.

    /** @type {HARLog_Harambe} */
    let log = harContent["log"];

    let keywords = log.pages.flatMap((page) => 
        new URL(page.title).hostname.split(".").slice(0, -1))

    const isInternal = (comparisonList) => 
        keywords.some(keyword => comparisonList.includes(keyword))

    let processedEntries = useMemo(() => log.entries.map(EntryToNode(isInternal)),[])

    // TODO: create a lookup feature
    const findInitiator = (initiator) =>
        log.entries.find(entry => entry?.request?.url == initiator)?.id ?? "orphan"

    /**
     * @type {{nodes:import('reactflow').Node<HAREntry_Harambe>[], edges:{v:Number,w:Number}[]}}
     */
    let { nodes, edges } = useMemo(() => {
        // TODO: See if this whole memoized function can be optimized
        let toplevel_parentID = "";
        layout = new Dagre.graphlib.Graph()
        layout.setGraph({ rankdir: "TB" });
        layout.setDefaultEdgeLabel(() => ({}));

        /**
         * @type {HAREntry_Harambe[]}
         */
        let values = processedEntries;
        values = filter == "all" ? values : values.filter((entry) => entry["_type"] == filter)

        values = values.map((entry) => {
            // Using index is bad, as it'll change when the filter changes
            let ID = entry.id
            /** @type {import('reactflow').Node} */
            let data = {
                id: ID,
                type: entry["_type"],
                data: entry,
                focusable: true,
                ...mapToDimension(entry["_type"]),
            }
            // TODO: Have special handling for the API Tree nodes OR implement them inside the nodes
            layout.setNode(ID, data)

            if (filter == "apiRequest_core") {
                let url = new URL(entry.request.url)
                let simplePath = (url.hostname + url.pathname) // No query params and protocol

                const poppedPath = simplePath.split("/").slice(0, -1).join("/")
                const searchResult = decomposedPaths.find((value) => poppedPath == value.path)
                const parent = searchResult?.id ?? "orphan"

                layout.setEdge(`${parent}-slug`, ID)
            }
            else {
                let initiatorID = findInitiator(entry["_initiator_harambe"])
                layout.setEdge(initiatorID, ID)
            }
            return data
        })
        
        let extraNodes = []
        if (filter == "apiRequest_core") {
            loggers.viewer_algos(filter, "Filtering by API request (internal)")

            extraNodes = decomposedPaths.map((pathObject) => {
                let currentID = `${pathObject.id}-slug`
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
                    const parent = decomposedPaths.find((value) => poppedPath == value.path)?.id
                    layout.setEdge(`${parent ?? "orphan"}-slug`, currentID)
                } else toplevel_parentID = currentID; 

                return data;
            })
            loggers.viewer_algos("Extra Nodes:", extraNodes)
        }

        values = [...values, ...extraNodes]

        Dagre.layout(layout);
        
        let nodes = []
        let edges = []

        values.map((entry) => {
            // TODO: Fix all  types
            // I think I assigned an incorrect type to this...
            const { x, y, width, height } = layout.node(entry.id); 
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
                let { x, y } = layout.node(toplevel_parentID)
                instance.setCenter(x, y, { zoom: 1, duration: 200 })
            }
            else instance.fitView({ duration: 200, padding: .5 })
        }, 100)
        return { nodes, edges };
    }, [filter])

    let selected_instance = nodes.find((e)=>e.id == selectedNode?.id)
    if (selectedNode?.id && selected_instance !== undefined) 
        selected_instance.selected = true;

    /** @type {import('reactflow').Edge[]} */
    let customEdges = edges.map((edge) => { return { id: `${edge.v}-${edge.w}`, source: edge.v, target: edge.w } });

    let store = useStoreApi()
    const { addSelectedNodes } = store.getState()

    // edges.
    return <>
        <div className='viewer' style={{ "width": "100vw", "height": "100vh" }}>
            <div className='barHolder'>
                <TopBar filterSetter={setFilter} selectedNode={selectedNode}></TopBar>
                <DetailBar log={selectedNode?.data}></DetailBar>
                <div style={{position:"absolute", zIndex:9999, top:"6em", right:"2em"}}>
                    <Search nodes={nodes} setSelectedNode={setSelectedNode}></Search>
                </div>
            </div>
            <ReactFlow
                onPaneClick={e=>{setSelectedNode(null); addSelectedNodes([]) }}
                edgesFocusable={false} edgesUpdatable={false} nodesDraggable={false}
                minZoom={0} maxZoom={1000000} pannable={true}
                fitViewOptions={{ maxZoom: 1000000, minZoom: 0 }}
                onNodeClick={(_, node) => setSelectedNode(node)}
                nodesFocusable={true} nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                edges={customEdges}
                nodes={nodes}
                // onlyRenderVisibleElements={true}
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

function EntryToNode(isInternal) {
    return (entry) => {
        let entryClone = { ...entry };
        let classified = classifier(entry, isInternal);
        // TODO: Document the _ properties
        entryClone["_type"] = classified.type;
        entryClone["_data"] = classified.data;
        entryClone["_initiator_harambe"] = classified.initiator;
        if (entryClone["_type"] == "apiRequest_core") {
            loggers.viewer_algos("Building path from", entry.request.url);
            buildDescendingPath(entry);
        }
        return entryClone;
    };
}

export default function Viewer() {
    // This way, even the topbars have Reactflow hooks.  
    return <ReactFlowProvider>
        <Viewer_providerless></Viewer_providerless>
    </ReactFlowProvider>
}