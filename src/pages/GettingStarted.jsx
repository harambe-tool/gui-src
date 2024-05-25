import React, { useState, useContext } from "react";
import {AppStateContext} from "./../appStateBackend";

export default function Importer() {
  const ctx = useContext(AppStateContext);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  /**
   * @type {{current: HTMLInputElement}}
   */
  let inputRef = React.createRef();
  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const harContent = JSON.parse(event.target.result);
        ctx.setHarContent(harContent);
        console.log(ctx.harContent);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div id="banner" style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "2em" }}>WhoDunnit</span>
          <span>Find links between requests and fuzz with AI.</span>
        </div>
        <div className="sep"></div>
        <div>
          <p>Insert your HAR file here</p>
          <label htmlFor="file-upload" style={{ display: "flex", flexDirection:"column", cursor: "pointer" }}>
            <input ref={inputRef} accept=".har" multiple={false} type="file" id="file-upload" onChange={handleFileChange} style={{ display: "none" }} />
            <button onClick={()=>{inputRef.current.click()}} style={{ borderRadius: "5px", padding: "10px", border: "1px solid #ccc", background:"rgba(255, 255, 255, 0.05)", cursor: "pointer" }}>
              Choose File
            </button>
            <span style={{ display:"block" }}>{file?.name ?? "No file selected"}</span>
          </label>
        </div>
          { file && <button onClick={()=>handleUpload} style={{ borderRadius: "5px", padding: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", margin:"50px", background:"rgba(255, 255, 255, 0.05)", cursor: "pointer"}}>
            Get Started
          </button>}
      </div>
    </>
  );
}
