import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MdSearch } from "react-icons/md";
import { useReactFlow, useStoreApi } from "reactflow"

/**
 * @typedef          {(
 * "request_url"      |
 * "response_content" |
 * "response_headers" |
 * "request_headers"  |
 * "request_content"  )} filters
 */
/**
 * 
 * @param {{setSelectedNode: React.Dispatch<React.SetStateAction<import "reactflow".Node<HAREntry_Harambe>>>}}  
 * @returns 
 */
export default function Search({setSelectedNode, view_filtered}){

    let [visible, setVisible] = useState(false)
    let inputRef = React.createRef();

    useEffect(()=>{
        let findHandler = (e) => {
            if (e.ctrlKey && e.key === "f") { 
                e.preventDefault();
                setVisible(!visible)
                if (!visible)inputRef.current.focus()
            }
        }

        window.addEventListener("keydown", findHandler)
        return ()=>{window.removeEventListener("keydown", findHandler)}
    }, [visible]);

    const flowInstance = useReactFlow();
    const [text, setText] = useState("");
    const [searchQuery, setQuery] = useState(text)
    const [isCaseSensitive, setCaseSensitivity] = useState(false);
    const [regexMode, setRegexMode] = useState(false);

    /** @type {[filters, React.Dispatch<React.SetStateAction<filters>>]} */
    const [filter, setFilter] = useState("response_content")

    const [resultIndex, setIndex] = useState(0)
    
    /** @type {import("reactflow").Node<HAREntry_Harambe>[]} */
    const nodes = useMemo(()=>flowInstance.getNodes(),[flowInstance, view_filtered])

    
    let insensitive_regex;
    let sensitive_regex;

    if (regexMode){
        insensitive_regex = new RegExp(text, "i");
        sensitive_regex = new RegExp(text);
    }


    /** @param {string} input */
    const matcher = (input)=>{
        if (isCaseSensitive && regexMode)
            return sensitive_regex.test(input)
        else if (regexMode)
            return insensitive_regex.test(input)
        else if (isCaseSensitive)
            return input.includes(text)
        else
            return input.toLowerCase().includes(text.toLowerCase())
    }

    /** 
     * @param {string} prev
     * @param {HARHeader} curr
     */
    const headerReducer = (prev,curr)=>prev+(curr.name+":"+curr.value)

    // Go through the nodes
    let result_ids = useMemo(()=>nodes.filter((node)=>{
        // Filter by selection
        // Filter by text
        switch (filter) {
            case "response_content":
                return matcher(node.data.response?.content?.text ?? "")
            case "response_headers":
                let resp_headers = node.data.response.headers
                let responseHeader_flat = resp_headers.reduce(headerReducer, "")
                return matcher(responseHeader_flat)
            case "request_headers":
                let req_headers = node.data.request.headers;
                let requestHeader_flat = req_headers.reduce(headerReducer, "")
                return matcher(requestHeader_flat)
            case "request_content":
                // If query params are content, I think URL makes more sense.
                return matcher(node.data.request?.postData?.text ?? "")
            case "request_url":
                return matcher(node.data.request.url)
        };
    }), [searchQuery, nodes])

    let store = useStoreApi()
    const { addSelectedNodes } = store.getState()

    const zoomToResult = (resindex = null) => {

        const currentResult = result_ids[resindex ?? resultIndex]
        if (currentResult == undefined) return;
        let {x, y} = currentResult
        addSelectedNodes([currentResult.id])
        setSelectedNode(currentResult)
        flowInstance.setCenter(x,y, {zoom:1, duration:200})
    };

    if (result_ids.length == 0) addSelectedNodes([])
    useMemo(zoomToResult, [searchQuery, nodes, filter]);
    // console.log(result_ids)

    // Controlled Input
    return <div style={{display: visible ? "flex" : "none"}} className="search">
        <div style={{display:"flex", alignContent:"center", alignItems:"center"}}>
            <div className="inputcontainer">
                <input type="text"
                    onKeyDownCapture={e=>{
                        if (e.key != "Enter") return;
                        if (searchQuery == text){
                            let newIndex = resultIndex;
                            
                            // wrap around

                            if (e.shiftKey)newIndex = resultIndex-1 < 0 ? result_ids.length-1 : resultIndex-1
                            else newIndex = Math.abs(resultIndex+1) % result_ids.length
                            // this as a ternary would be messier
                            // Maybe use shiftKey to decrement THEN make the wraparound separate
                            zoomToResult(newIndex);
                            return setIndex(newIndex)
                        }
                        zoomToResult(0);
                        setQuery(text);
                        setIndex(0);
                    }}
                    value={text} 
                    onChange={(e)=>setText(e.target.value)} />
                
                <button data-enabled={isCaseSensitive} 
                    onClick={e=>setCaseSensitivity(!isCaseSensitive)} 
                    title="Case Sensitive">
                    Aa
                </button>
                <button data-enabled={regexMode} onClick={e=>setRegexMode(!regexMode)} title="Regex Mode">.*</button>
            </div>
            <button style={{height:"min-content",display:"flex"}} onClick={e=>{setQuery(text);zoomToResult()}}><MdSearch size={25}></MdSearch></button>
        </div>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
            <option value="response_content">Search for Response Content</option>
            <option value="response_headers">Search for Response Headers</option>
            <option value="request_headers">Search for Request Headers</option>
            <option value="request_content">Search for Request Content</option>
            <option value="request_url">Search for Request URL</option>
        </select>
        <span>{result_ids.length} result{result_ids.length != 1 && "s"}</span>
    </div>
}