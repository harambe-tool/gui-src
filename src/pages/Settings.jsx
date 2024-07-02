import { useContext, createRef, useState } from "react";
import { AppStateContext } from "../appStateBackend";
import { BlockPicker, ChromePicker, SketchPicker, SliderPicker } from "react-color";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { DynamicScheme, hexFromArgb } from "@material/material-color-utilities";

function Colorpicker() {
    let inputRef = createRef();
    let [color, setColor] = useState(localStorage.getItem('color') ?? "#867cff");
    let [pickerShowing, setPickerShowing] = useState(false);
    const appState = useContext(AppStateContext);

    let middleware = (color)=>{
        appState.setTheme(color);
        setColor(color);
    }

    return <div>
        <button onClick={()=>{setPickerShowing(!pickerShowing)}}>
            <div style={{background:color}} className="colorDisplay"></div>
        </button>
        <div style={{display: pickerShowing ? "block" : "none", position:"absolute"}}>
            <SketchPicker disableAlpha={true} presetColors={["#867cff", "#ff0000"]} color={color} onChange={(color) => middleware(color.hex)} />
        </div>
        {/* <input ref={inputRef} type="color" style={{position:"relative", display:"none", top:"10em"}} value={color} onChange={(e) => setColor(e.target.value)} /> */}
    </div>

}


export default function Settings({boxShadowOpts}) {
    const appState = useContext(AppStateContext);
    let navigate = useNavigate();
    let invertedPreference = appState.preference == "dark" ? "light" : "dark";
    return <div style={{ padding:"2em", marginInline:"2em"}}>
        <span><b>Configure Harambe</b></span>
        <div className="sep"></div>
        <span><b>Visuals</b></span>
        <p>Pick a theme</p>
        <Colorpicker></Colorpicker>
        <br></br>
        <br></br>
        <span>Theme Preference</span>
        <br></br>
        <button onClick={()=>appState.setPreference(invertedPreference)} style={{marginRight:"1em", backgroundColor: hexFromArgb(appState.theme.onBackground), color:hexFromArgb(appState.theme.background)}}>Switch to {invertedPreference} mode</button>
        <br></br>
        <br></br>
        <span>App glow</span>
        <input type="checkbox" checked={boxShadowOpts.boxShadow} onChange={(e)=>boxShadowOpts.setBoxShadow(e.target.checked)}></input>
        <br></br>
        <div className="sep"></div>
        <br></br>
        <span><b>Functionality</b></span>
        <span>... (WIP)</span>
        <button style={{bottom: "2em", top:"unset"}} onClick={()=>navigate('/')} className="settings-button"><MdArrowBack /> <span>Back</span></button>
        
    </div>

}