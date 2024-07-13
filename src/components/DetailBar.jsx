
import "./DetailBar.css"
import "./../pages/HARTypes"
import { decomposedPaths } from "../pages/Viewer"
import { details } from "../utils/classifiers"
import { loggers } from "../utils/loggers"

function subBuilder(index,subheader,content){
    return <>
        <span key={index} className="subheader">{subheader}</span>
        <span>{content}</span>
    </>
}

//  analytics_endpoint (posthog, google ads, etc)
//  apiRequest_external (identify endpoints through CLD similarity. with an option to change to internal API)
//  apiRequest_core (what the site identifies as the main API - identify endpoints through CLD similarity with an option to change to external API)
//  harBase (initiator : other)
//  hostedAsset (static hosted scripts - all scripts under same CLD or not recognized from a global provider. Can get from long cache times or file extension)
//  cdnAsset (3rd party scripts)
//  media (images, svg, icons, fonts, etc)

const typeDetails = {
    "analytics_endpoint": {
        "description":"This is a node containing analytics. Can be flagged due to Posthog, Google Ads, etc.",
        "pretty_label": "Analytics"
    },
    "apiRequest_external": {
        "description":"This is an API request made to a third-party, non analytics  service. May or may not contain core details, and could be incorrectly classified as external.",
        "pretty_label": "External API"
    },
    "apiRequest_core":{
        "description":"This is an API request made to the site's own API. May or may not contain core details, and could be incorrectly classified as external.",
        "pretty_label": "Internal API"
    },
    "harBase": {
        "description":"This is a node that has not been classified. It may be an API request, a static asset, or an analytics endpoint. It may also be an orphan node, meaning it was not initiated by a script or other resource.",
        "pretty_label": "Unknown"
    },
    "hostedAsset": {
        "description":"This is a static asset hosted on the site's own server. It may be a script, a stylesheet, or a font.",
        "pretty_label": "Hosted Asset"
    },
    "cdnAsset": {
        "description":"This is a static asset hosted on a CDN. It may be a script, a stylesheet, or a font.",
        "pretty_label": "CDN Asset"
    },
    "media": {
        "description":"This is a media asset, such as an image, a video, or an audio file.",
        "pretty_label": "Media"
    },
    "api_path": {
        "description":"This is a slug representing a path in the site's API. It is not a request, but rather a representation of a possible path that could be requested. In the future, intelligent fuzzing operations will be done on this node.",
        "pretty_label": "API Path"
    }
}


// if (entry.response.headers.includes("x-amz-request-id")){
//     data["amz"] = true // Uses AWS
// }
// if (entry.request.method == "POST" && entry.request.postData.mimeType == "application/x-www-form-urlencoded") {
//     data["form"] = true // Uses forms
// }
// if (entry.response.headers.includes("x-csrf-token")) {
//     data["csrf"] = true // Uses CSRF
// }
// if (entry.response.headers.includes("x-ratelimit-limit")) {
//     data["ratelimit"] = true // Uses rate limiting
// }
// if (entry.response.headers.includes("x-request-id")) {
//     data["requestid"] = true // Uses request IDs
// }
// if (entry.response.headers.includes("x-correlation-id")) {
//     data["correlationid"] = true // Uses correlation IDs
// }
// if (entry.response.headers.includes("x-api-key")) {
//     data["apikey"] = true // Uses API keys
// }
// if (entry.response.headers.includes("x-access-token")) {
//     data["accesstoken"] = true // Uses access tokens
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

// * @typedef {{
//     *     amz: boolean,
//     *     form: boolean,
//     *     csrf: boolean,
//     *     ratelimit: boolean,
//     *     requestid: boolean,
//     *     correlationid: boolean,
//     *     apikey: boolean,
//     *     accesstoken: boolean,
//     *     authtoken: boolean,
//     *     authorization: boolean,
//     *     clientid: boolean,
//     *     userid: boolean,
//     * }} Data

let datadescs = {
    "amz": "This node uses Amazon Web Services.",
    "form": "This node is a form submission / uses the form mime type.",
    "csrf": "This node uses CSRF tokens.",
    "ratelimit": "This endpoint uses rate limiting.",
    "requestid": "This node has a request ID",
} 

/**
 * 
 * @param {{log: HAREntry}} logParam 
 * @returns 
 */
function DetailBar_core({log}){
    
    loggers.detail_bar(log)
    const type = log["_type"]
    /**
     * @type {import("../pages/Viewer").Data}
     */
    const data = log["_data"]

    loggers.detail_bar(data)

    return <div className="detail-bar-container">
        <div className="detail-bar">
            <span className="subheader">Inspecting the following node</span>
            <span>{log.request.url}</span>

            <span className="subheader">Quick node info</span>
            <span>Identified as <b>{typeDetails[type].pretty_label}</b></span>
            <span>Description: {typeDetails[type].description}</span>

            <div className="sep small"></div>
            <span className="header">Extracted data</span>
            {
                data.map((technology_name, index)=><span>{details[technology_name]}</span>)
            }
            {/* <div className="headers">
                <div className="req section">
                    <span className="header">Request Headers</span>
                    {log.request.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
                <div className="res section">
                    <span className="header">Response Headers</span>
                    {log.response.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
            </div>
            <div className="sep small"></div>
            <div className="data">
                <span className="header">Request Data</span>
                <div className="req section">
                    
                </div>
                <span className="header">Response Data</span>
                <div className="res section">
                    <span className="subheader">Status</span>
                    <span>{log.response.status}</span>
                </div>
            </div> */}
        </div>
    </div>
}

/**
 * @typedef {{id : number,label:string,path:string}} data 
 */

/**
 * 
 * @param {{data:data}} param0 
 * @returns 
 */
function DetailBar_core_slug({data}){
    loggers.detail_bar(decomposedPaths);
    // FOr viewing Slug entries
    return <div className="detail-bar-container">
        <div className="detail-bar">
            <span className="subheader">Inspecting the following slug</span>
            <span>{data.path}</span>
            <div className="sep small"></div>
            <span>Children (flattened)</span>

            {decomposedPaths.filter((path)=>path.path.startsWith(data.path)).map((path)=>{
                let snippedPath = path.path.replace(data.path,"");
                return <span key={path.id}>{snippedPath}</span>
            })}
            
        {/*
            <div className="headers">
                <div className="req section">
                    <span className="header">Request Headers</span>
                    {log.request.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
                <div className="res section">
                    <span className="header">Response Headers</span>
                    {log.response.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
            </div>
            <div className="sep small"></div>
            <div className="data">
                <span className="header">Request Data</span>
                <div className="req section">
                    
                </div>
                <span className="header">Response Data</span>
                <div className="res section">
                    <span className="subheader">Status</span>
                    <span>{log.response.status}</span>
                </div>
            </div> */}
        </div>
    </div>

}

// function DetailBar_core_slug({data}){
//     loggers.detail_bar(decomposedPaths);
//     // FOr viewing Slug entries
//     let children = decomposedPaths.filter((path)=>path.path.startsWith(data.path))

//     let textualChild = (child)=>{
//         const parts = child.split("/")
//         const last = parts.pop()
    
//         const folderNames = parts.map((part) => part.replace(/./g, "-"));
//         const folderStructure = folderNames.join("-");
//         return folderStructure+last 
//     }
//     return <div className="detail-bar-container">
//         <div className="detail-bar">
//             <span className="subheader">Inspecting the following slug</span>
//             <span>{data.path}</span>
//             <div className="sep small"></div>
//             <span>Children (flattened)</span>
//             <div>
//                 {children.map((path, index, arr)=>{
//                     let snippedPath = path.path.replace(data.path,"");
//                     // loggers.detail_bar(arr)
//                     let text = snippedPath.startsWith(arr[index-1]?.path) ? snippedPath.replace(arr[index-1]?.path,"-".repeat(arr[index-1].path.length)) : snippedPath
//                     loggers.detail_bar(text)
//                     let textualized = textualChild(text)
//                     return <span style={{fontSize:".6em"}} key={path.id}>
//                         {path.isID ? <b>{textualized}</b> : textualized}
//                         </span>
//                 })}
//             </div>
//         </div>
//     </div>
// }

export default function DetailBar({log}){
    if (!log) return <div></div>
    let isSlug = Object.keys(log).every((val)=>["id","label","path", "isID"].includes(val))
    loggers.detail_bar(isSlug,  Object.keys(log));
    return <div className="contain-bar">{isSlug ?  <DetailBar_core_slug data={log}> </DetailBar_core_slug> : <DetailBar_core log={log}/>}</div>
}