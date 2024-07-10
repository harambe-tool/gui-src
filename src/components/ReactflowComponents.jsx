import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
const handleStyle = { left: 10 };
import "./Components.css"

import { MdDataObject } from "react-icons/md";
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import "highlight.js/styles/github.css";

hljs.registerLanguage('json', json);

let customWidthMappings = { 
  // harBase: HARBase, 
  // media: HARImage, 
  analytics_endpoint: {
    width:200,
    height:175
  },
  "apiRequest_external": {
      width:700
  },
  "apiRequest_core": {
      width:700,
  },
  "api_path":{
    height:175
  },
  "default": {
    width:250,
    height:300
  }
  // "cdnAsset": HARBase,
  // "hostedAsset": HARBase
};

function mapToDimension(type){
  let width = customWidthMappings[type]?.width 
  let height = customWidthMappings[type]?.height

  return {
    width: customWidthMappings[type]?.width ??  customWidthMappings["default"]["width"],
    height: customWidthMappings[type]?.height ??  customWidthMappings["default"]["height"]
  }
}

function CardCore(props){
  // console.log(props)
  let dimensions = mapToDimension(props.type)

  return (
    <>
      <div className={`card ${props.className} ${props.selected ? "selected" : ""}`} style={{width:dimensions.width, height:dimensions.height}}>
        {props.children}
      </div>
      <Handle type="source" position={Position.Bottom} id={props.id+"-source"}/>
      <Handle type="target" position={Position.Top} id={props.id+"-target"} />
    </>
  )
}

/**
 * Use for requests of initiator type 'other'
 * @param {import('reactflow').NodeProps<HAREntry>} props 
 */
function HARCard(props) {
  return (
    <>
    <CardCore type={props.type} selected={props.selected}>
      <span>{props.data.request.url}<br />{props.data.request.method}</span>
    </CardCore>
    </>
  );
}

/**
 * Use for requests of initiator type 'other'
 * @param {import('reactflow').NodeProps<import('../pages/Viewer').decomposedPath_t>} props 
 */
function ApiPath(props){
  return <>
    <CardCore type={props.type} selected={props.selected} className="api_path">
        <b>{props.data.isID ? "Path Component (ID)" : "Path Component"}</b>
        <span>{props.data.label}</span>
        <br></br>
        <b>Full Path</b>
        <span>{props.data.path}</span>
    </CardCore>
  </>
}

// function baseCardStyle(props){
//   return {
//     boxSizing:"border-box", 
//     overflowY:"overlay", 
//     overflowWrap:"break-word", 
//     width:"250px", 
//     height:"300px", 
//     borderRadius:"12px", 
//     background:`rgba(255,255,255,${props.selected ? 0.2 : 0.1})`, 
//     padding:"10px", 
//     border:`2px solid rgba(134, 124, 255, ${props.selected ? 1 : 0} )` 
//   }
// }

/**
 * Use for requests of initiator type 'other'
 * @param {import('reactflow').NodeProps<HAREntry>} props 
 */
function HARImage(props) {
  let {hostname, pathname} = new URL(props.data.request.url)
  let content = props.data.response.content
  return (
    <>
      <CardCore type={props.type} selected={props.selected} className="image">
        <span><b>{hostname}</b><br />{pathname}</span>
        <div className='object-contain'>
          <img style={{borderRadius:"10px"}} src={content.encoding != "base64" ? content.text : "data:"+content.mimeType+";base64,"+content.text} />
        </div>
      </CardCore>
      {/* <div className={`card image ${props.selected ? "selected" : ""}`}>
        <span><b>{hostname}</b><br />{pathname}</span><br></br>
        <img style={{width:"100%", borderRadius:"10px"}} src={content.encoding != "base64" ? content.text : "data:"+content.mimeType+";base64,"+content.text} />
      </div>
      <Handle type="source" position={Position.Bottom} id={props.id+"-source"}/>
      <Handle type="target" position={Position.Top} id={props.id+"-target"} /> */}
    </>
  );
}

function JSONBlock(props){
  //HLJS
  // Stub
  // determine whether or not to use jsonblock through response content type
}


function CodeGenBlock({code}){

  let prettifiedJSON = code

  try {
    prettifiedJSON = JSON.stringify(JSON.parse(code), null, 2)
  } catch (error) {
    console.log(error)
  }
  // prettifiedJSON = JSON.stringify(JSON.parse(code), null, 2)
  let code_formatted = hljs.highlight(prettifiedJSON, {language: "json"}).value
  return <pre>
    <code>
      <div dangerouslySetInnerHTML = {{__html:code_formatted}}></div>
    </code>
  </pre>
}

/**
 * For API requests
 * @param {import('reactflow').NodeProps<HAREntry>} props 
 */
function APIBlock(props){
  //HLJS
  // Stub
  // determine whether or not to use apiblock through:
  //   Response body type is application/json
  //   Request body type is application/json
  // then we are using a REST API.

  
  return <CardCore type={props.type} selected={props.selected} className="api">
    <MdDataObject />  <span>{props.data.request.method}</span>
    <br />
    <span> {props.data.request.url}</span>
    { (props.data.request.method == "POST" && props.data.request.postData != undefined && props.data.request.postData.text != undefined && props.data.request.postData.text.length > 0 && props.data.request.postData.mimeType == "application/json") && <>
        <br></br>
        <span>Request</span>
        <CodeGenBlock code={props.data.request.postData.text} />
    </> }
    { (props.data.response != undefined && props.data.response.content != undefined && props.data.response.content.text != undefined && props.data.response.content.size > 0 && props.data.response.content.mimeType == "application/json") && <>
        <br></br>
        <span>Response</span>
        <CodeGenBlock code={props.data.response.content.text} />
    </> }
    <br></br>
    <br></br>
  </CardCore>
}


function WebsocketBlock(props){
  return props.data._webSocketMessages.map((message, index) => {
    return (
      <div key={index}>
        <span>{message}</span>
      </div>
    )
  })
}

/**
 * For Analytics like Google Analytics, posthog, etc
 * @param {import('reactflow').NodeProps<HAREntry>} props 
 */
function AnalyticsBlock(props){
  let {hostname, pathname} = new URL(props.data.request.url)
  return <CardCore type={props.type} selected={props.selected} className="analytics">
    <span><b>{hostname}</b><br />{pathname}</span>

    {/* <img style={{width:"100%", borderRadius:"10px"}} src={content.encoding != "base64" ? content.text : "data:"+content.mimeType+";base64,"+content.text} /> */}
  </CardCore>
}

export {HARCard as HARBase, HARImage, WebsocketBlock, AnalyticsBlock, APIBlock, customWidthMappings, mapToDimension, ApiPath}