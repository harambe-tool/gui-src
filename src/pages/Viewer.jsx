import ReactFlow, { Background, Controls } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext } from 'react';

// function component




export default function Viewer(){
    let { harContent } = useContext(AppStateContext)
    /**
     * @type {HARLog}
     */
    let log = harContent["log"];
    return <>
        <div>
            <p>First Page Loaded: {log["pages"][0]["title"]}</p>
            <ReactFlow>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    </>
}