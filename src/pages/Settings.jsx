import { useContext, createRef, useState } from "react";
import { AppStateContext } from "../appStateBackend";
import { BlockPicker, ChromePicker, SliderPicker } from "react-color";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { DynamicScheme, hexFromArgb } from "@material/material-color-utilities";

function Colorpicker() {
    let inputRef = createRef();
    let [color, setColor] = useState("#867cff");
    let [pickerShowing, setPickerShowing] = useState(false);
    const appState = useContext(AppStateContext);

    let middleware = (color)=>{
        appState.setTheme(color);
        setColor(color);
    }

    return <>
        <button onClick={()=>{setPickerShowing(!pickerShowing)}}>
            <div style={{background:color}} className="colorDisplay"></div>
        </button>
        <div style={{display: pickerShowing ? "block" : "none"}}>
            <ChromePicker  color={color} onChange={(color) => middleware(color.hex)} />
        </div>
        {/* <input ref={inputRef} type="color" style={{position:"relative", display:"none", top:"10em"}} value={color} onChange={(e) => setColor(e.target.value)} /> */}
    </>

}


export default function Settings() {
    const appState = useContext(AppStateContext);
    let navigate = useNavigate();
    let invertedPreference = appState.preference == "dark" ? "light" : "dark";
    return <div style={{ padding:"2em", marginInline:"2em"}}>
        <span><b>Configure Harambe</b></span>
        <div className="sep"></div>
        <p>Pick a theme</p>
        <Colorpicker></Colorpicker>
        <br></br>
        <br></br>
        <span>Theme Preference</span>
        <br></br>
        <button onClick={()=>appState.setPreference(invertedPreference)} style={{marginRight:"1em", backgroundColor: hexFromArgb(appState.theme.onBackground), color:hexFromArgb(appState.theme.background)}}>Switch to {invertedPreference} mode</button>

        <button onClick={()=>navigate('/')} className="settings-button"><MdArrowBack /> <span>Back</span></button>
        
    </div>

}