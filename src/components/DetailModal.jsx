import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { details } from "../utils/classifiers";
import { useRef, useState } from "react";
import "./Modal.css"
import prettydiff from "prettydiff";
import "./../pages/HARTypes"
// let prettydiff = require("prettydiff");
// import hljs from 'highlight.js/lib/core';
// import json from 'highlight.js/lib/languages/json';
// import html from 'highlight.js/lib/languages/html'; //chance of something going wrong: 99%
// import javascript from 'highlight.js/lib/languages/javascript';
// import css from 'highlight.js/lib/languages/css';


import hljs from 'highlight.js';
import "highlight.js/styles/github.css";

// hljs.registerLanguage('json', json);
// hljs.registerLanguage('html', html);
// hljs.registerLanguage('js', javascript);
// hljs.registerLanguage('css', css);


function ResizeBar({}){
    let [grabbing, setGrabbing] = useState(false);
    // let [dragging, setDragging] = useState(false);
    return <PanelResizeHandle hitAreaMargins={{coarse:10}} onDragging={setGrabbing} className="resize-bar">
        <div
            className={`resize-handle ${grabbing ? "grabbing" : ""}`}
        ></div>
    </PanelResizeHandle>
}



function CodeGenBlock({code}){
    let code_modified = code ?? "<empty>"
    let isHTML = code_modified.startsWith("<!")
    // let output = "",
    let options = prettydiff.options;
    options.lexer = "auto"
    if (isHTML)options.lexer = "markup"
    options.source = code_modified;
    options.mode = "beautify"
    options.language = isHTML ? "html" : "auto"
    code_modified = prettydiff();
    console.log( code, options)
    // Smart Prettify
    // ...
    // code_modified = esthetic.format(code_modified)

    // try {
    //   prettifiedJSON = JSON.stringify(JSON.parse(code), null, 2)
    // } catch (error) {
    //   console.log(error)
    // }
    // prettifiedJSON = JSON.stringify(JSON.parse(code), null, 2)
    let code_formatted = hljs.highlightAuto(code_modified, ["json", "html", "js", "css", "xml", "text"]).value
    return <pre>
        <code>
        <div dangerouslySetInnerHTML = {{__html:code_formatted}}></div>
        </code>
    </pre>
}

/**
 * 
 * @param {{data:HARResponse | HARRequest}} props 
 */
function SmartBodyPreview({data}){
    let content = ""

    let isResponse = data.content != null
    console.log(isResponse, "is response", data, data.postData)
    if (isResponse){
        /**
         * @type {HARContent}
         */
        content = data.content
        
        console.log(content, "content")
        if (content.mimeType.startsWith("image/")){
            return <img 
                style={{width:"100%", borderRadius:"10px"}} 
                src={content.encoding != "base64" ? content.text : "data:"+content.mimeType+";base64,"+content.text} 
            />
        }
        return <CodeGenBlock code={content?.text}></CodeGenBlock>
    }
    else{

        return <CodeGenBlock code={data.postData}></CodeGenBlock>
    }
    // else {

    //     let pData = data?.postData

    // }




}

function TechnologyDescriptorBadge({tech_name}){
    const info = details[tech_name]
    let [showTooltip, setTooltip] = useState(false)
    
    return <span onMouseOver={()=>setTooltip(true)} onMouseOut={()=>setTooltip(false)}>
        {showTooltip && <span className="tooltip">
            <div className="text">
                {info}
            </div>
        </span>}
        <span className="badge">{tech_name}</span>
    </span>
}
function BadgeGenerator({data}){
    return <div className="badges">
        <span style={{marginRight:"1em"}}>Technologies used</span>
        {data.map((technology_name, index)=><TechnologyDescriptorBadge tech_name={technology_name} key={index}></TechnologyDescriptorBadge>)}
    </div>
}

/**
 * 
 * @param {object} param0 
 * @param {HAREntry} param0.data 
 * @returns 
 */
export default function DetailModal({data}){
    let requestHasData = data.request?.postData != null || data.request.queryString.length > 0 

    let responseContent = ""
    let [responseType, setResponseType] = useState("body")

    let requestContent = ""
    let [requestType, setRequestType] = useState(requestHasData ? "body" : "headers")

    let badgeData = data["_data"]

    console.log(data.response.content.mimeType)
    return(
        <>
            <span style={{display:"flex"}}>Inspecting: <b style={{textOverflow: "ellipsis", overflow: "hidden"}}>{data.request.url}</b></span>
            <BadgeGenerator data={badgeData}></BadgeGenerator>
            <PanelGroup direction="horizontal">
                <Panel style={{overflow:"scroll"}}>
                    <span><b>Request</b></span> <br></br>
                    <span>{data.request.method} {new URL(data.request.url).pathname}</span>
                    <SmartBodyPreview data={data.request}></SmartBodyPreview>
                    {/* <CodeGenBlock code={data.request?.postData?.text ?? ""}></CodeGenBlock> */}
                </Panel>
                <ResizeBar />
                <Panel style={{overflow:"scroll"}}>
                    <span><b>Response</b></span><br></br>
                    <span>{data.response.status} {data.response.statusText}</span>
                    <SmartBodyPreview data={data.response}></SmartBodyPreview>
                    {/* <CodeGenBlock code={data.response?.content?.text}></CodeGenBlock> */}
                </Panel>
            </PanelGroup>
        </>
    )
}