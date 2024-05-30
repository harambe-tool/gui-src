import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
const handleStyle = { left: 10 };
import "./Components.css"

function CardCore(props){
  return (
    <>
      <div className={`card ${props.className} ${props.selected ? "selected" : ""}`}>
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
      <div className={`card ${props.selected ? "selected" : ""}`}>
        <span>{props.data.request.url}</span><br></br>
        <span>{props.data.request.method}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id={props.id+"-source"}/>
      <Handle type="target" position={Position.Top} id={props.id+"-target"} />
    </>
  );
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
      <div className={`card image ${props.selected ? "selected" : ""}`}>
        <span><b>{hostname}</b><br />{pathname}</span><br></br>
        <img style={{width:"100%", borderRadius:"10px"}} src={content.encoding != "base64" ? content.text : "data:"+content.mimeType+";base64,"+content.text} />
      </div>
      <Handle type="source" position={Position.Bottom} id={props.id+"-source"}/>
      <Handle type="target" position={Position.Top} id={props.id+"-target"} />
    </>
  );
}

function JSONBlock(props){
  //HLJS
  // Stub
  // determine whether or not to use jsonblock through response content type
}

function APIBlock(props){
  //HLJS
  // Stub
  // determine whether or not to use apiblock through:
  //   Response body type is application/json
  //   Request body type is application/json
  // then we are using a REST API.
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

function AnalyticsBlock(props){
  return <>
  </>
}

export {HARCard as HARBase, HARImage, WebsocketBlock}