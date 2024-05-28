import ReactFlow, { Background, Controls } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component




export default function Viewer(){
    let { harContent } = useContext(AppStateContext)
    /**
     * @type {HARLog}
     */
    let log = harContent["log"];
    
    return <>
        <div className='viewer' style={{"width": "100%", "height": "100%"}}>
            <ReactFlow>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    </>
}