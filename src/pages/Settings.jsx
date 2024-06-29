import { useContext, createRef, useState } from "react";
import { AppStateContext } from "../appStateBackend";

function Colorpicker() {
    let inputRef = createRef();
    let [color, setColor] = useState("#867cff");

    const appState = useContext(AppStateContext);
    return <>
        <button onClick={()=>{inputRef.current.click()}}><div className="colorDisplay"></div></button>
        <input ref={inputRef} type="color" style={{position:"relative", display:"none", top:"10em"}} value={color} onChange={(e) => setColor(e.target.value)} />
    </>

}


export default function Settings() {
    const appState = useContext(AppStateContext);
    
    return <div style={{ padding:"10px" }}>
        <span>Configure Harambe</span>
        <div className="sep"></div>
        <p>Pick a theme</p>
        <Colorpicker></Colorpicker>
        
    </div>

}