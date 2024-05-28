import ReactFlow, { Background, Controls } from 'reactflow';
import { AppStateContext } from '../appStateBackend';
import { useContext } from 'react';
import './Viewer.css'
import 'reactflow/dist/style.css';
// function component

/**
 * @type {import('reactflow').Node[]}
 */
const nodes = [
    {
      id: '1',
      position: { x: 0, y: 0 },
    },
  ];


export default function Viewer(){
    let { harContent } = useContext(AppStateContext)
    /**
     * @type {HARLog}
     */
    let log = harContent["log"];
    
    return <>
        <div className='viewer' style={{"width": "100vw", "height": "100vh"}}>
            <ReactFlow proOptions={{ hideAttribution: true }} nodes={nodes} fitView>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    </>
}