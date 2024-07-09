import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { details } from "../utils/classifiers";
import React, { useRef, useState } from "react";
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
import { MdClose } from "react-icons/md";

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
    // let content = ""

    let isResponse = data.content != null
    console.log(isResponse, "is response", data, data.postData)
    if (isResponse){
        /**
         * @type {HARContent}
         */
        let content = data.content
        
        console.log(content, "content")
        if (content.mimeType.startsWith("image/")){
            return <img 
                style={{width:"100%", borderRadius:"10px"}} 
                src={content.encoding != "base64" ? content.text : "data:"+content.mimeType+";base64,"+content.text} 
            />
        }
        else if (content.mimeType.includes("font")){
            return <>
            <style>
            {`@font-face {
                font-family: 'EmbeddedFont';
                src: url('data:${content.mimeType};charset=utf-8;base64,${content.text}');
            }`}
            </style>
            <span><b>Font Preview</b></span>
            <div className="font-preview">
                <span>The quick brown fox jumps over the lazy dog.</span>
                <span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                <span>abcdefghijklmnopqrstuvwxyz</span>
            </div>
            </>
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


function Switcher({setter, getter}){

    let opposite = getter == "body" ? "headers" : "body"

    const styleCreator = (type) => {return {
        width: getter == type ? "0px" : "revert-layer", 
        padding: getter == type ? "0px" : "revert-layer",
        border: getter == type ? "0px" : "revert-layer"
    }}

    let firstStretcher = styleCreator("headers")
    let secondStretcher = styleCreator("body")

    return <button className="slider" onClick={()=>setter(opposite)}>
        <div className="sliderBg">
            <button className="leftspace">body</button>
            <button className="rightspace">headers</button>
        </div>
        <div className="sliderButton">
            <button style={{visibility:"hidden", ...secondStretcher}} className={getter + " leftspace"}><b>{opposite}</b></button>
            <button className={getter+ " main"}><b>{getter}</b></button>
            <button style={{visibility:"hidden", ...firstStretcher}} className={getter + " rightspace"}><b>{opposite}</b></button>
        </div>
    </button>
}

/**
 * 
 * @param {object} param0 
 * @param {HAREntry} param0.data 
 * @returns 
 */
export default function DetailModal({data, hide}){
    let requestHasData = data.request?.postData != null || data.request.queryString.length > 0 
    
    //  TODO: Create switcher for body and headers
    // let responseContent = ""
    /**
     * @type {["body" | "headers", React.Dispatch<React.SetStateAction<"body" | "headers">>]}
     */
    let [responseType, setResponseType] = useState("body")

    /**
     * @type {["body" | "headers", React.Dispatch<React.SetStateAction<"body" | "headers">>]}
     */
    let [requestType, setRequestType] = useState(requestHasData ? "body" : "headers")

    let badgeData = data["_data"]

    // console.log(data.response.content.mimeType)
    return(
        <>
            <div className="header">
                <span></span>
                <span style={{display:"flex"}}>Inspecting: <b style={{textOverflow: "ellipsis", overflow: "hidden", width:"100%"}}>{data.request.url}</b></span>
                {/* <button onClick={hide}>Close</button> */}
                <MdClose style={{"cursor":"pointer"}} onClick={hide} size={20}></MdClose>
            </div>
            <BadgeGenerator data={badgeData}></BadgeGenerator>
            <PanelGroup direction="horizontal">
                <Panel style={{overflow:"scroll"}}>
                    <div>
                        <div>
                            <span><b>Request</b></span> <br></br>
                            <span>{data.request.method} {new URL(data.request.url).pathname}</span>
                        </div>
                        <Switcher setter={setRequestType} getter={requestType}></Switcher>
                    </div>
                    <SmartBodyPreview data={data.request}></SmartBodyPreview>
                    {/* <CodeGenBlock code={data.request?.postData?.text ?? ""}></CodeGenBlock> */}
                </Panel>
                <ResizeBar />
                <Panel style={{overflow:"scroll"}}>
                    <div>
                        <div>
                            <span><b>Response</b></span><br></br>
                            <span>{data.response.status} {data.response.statusText}</span>
                        </div>
                        <Switcher setter={setResponseType} getter={responseType}></Switcher>
                    </div>
                    <SmartBodyPreview data={data.response}></SmartBodyPreview>
                    {/* <CodeGenBlock code={data.response?.content?.text}></CodeGenBlock> */}
                </Panel>
            </PanelGroup>
        </>
    )
}