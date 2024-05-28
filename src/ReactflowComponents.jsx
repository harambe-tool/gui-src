import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
const handleStyle = { left: 10 };

/**
 * Use for requests of initiator type 'other'
 * @param {import('reactflow').NodeProps<HAREntry>} props 
 */
function HARBase(props) {
  return (
    <>
      <div style={{borderRadius:"12px", background:`rgba(255,255,255,${props.selected ? 0.2 : 0.1})`, padding:"10px", border:`2px solid rgba(134, 124, 255, ${props.selected ? 1 : 0} )` }}>
        <span>{props.data.request.url}</span><br></br>
        <span>{props.data.request.method}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      /> */}
    </>
  );
}

export {HARBase}