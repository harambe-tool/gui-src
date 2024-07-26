import React, { useMemo, useState } from "react"
import { useReactFlow } from "reactflow"

/**
 * @typedef          {(
 * "request_url"      |
 * "response_content" |
 * "response_headers" |
 * "request_headers"  |
 * "request_content"  )} filters
 */

export default function Search(){
    const flowInstance = useReactFlow()
    const [text, setText] = useState("")
    const [isCaseSensitive, setCaseSensitivity] = useState(false);
    const [regexMode, setRegexMode] = useState(false);

    /** @type {[filters, React.Dispatch<React.SetStateAction<filters>>]} */
    const [filter, setFilter] = useState("response_content")

    const [resultIndex, setIndex] = useState(0)
    
    /** @type {import("reactflow").Node<HAREntry_Harambe>[]} */
    const nodes = useMemo(()=>flowInstance.getNodes(),[flowInstance])

    const insensitive_regex = new RegExp(text, "i");
    const sensitive_regex = new RegExp(text);


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
    let result_ids = nodes.filter((node)=>{
        // Filter by selection
        // Filter by text
        switch (filter) {
            case "response_content":
                return matcher(node.data.response.content.text ?? "")
            case "response_headers":
                let resp_headers = node.data.response.headers
                let responseHeader_flat = resp_headers.reduce(headerReducer, "")
                return matcher(responseHeader_flat)
            case "request_headers":
                let req_headers = node.data.request.headers;
                let requestHeader_flat = req_headers.reduce(headerReducer, "")
                return matcher(requestHeader_flat)
            case "request_content":
                return matcher(node.data.request.postData.text ?? "")
            case "request_url":
                return matcher(node.data.request.url)
            default:
                return ""
        };
    }).map(node=>node.id)

    // Keep a list and have the up and down arrows control the index

    // useReactflow hook to go to the node that fits that criteria

    // CONCEPT : replicate the VSCode search

    // Controlled Input
    return <div className="search">
        <input type="text" value={text} onChange={(e)=>setText(e.target.value)}></input>
        
        <span>Search by: {filter}</span>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
            <option value="response_content">Response Content</option>
            <option value="response_headers">Response Headers</option>
            <option value="request_headers">Request Headers</option>
            <option value="request_content">Request Content</option>
            <option value="request_url">Request URL</option>
        </select>
        <div>
            <button data-enabled={isCaseSensitive} onClick={e=>setCaseSensitivity(!isCaseSensitive)} title="Case Sensitive">Aa</button>
            <button data-enabled={regexMode} onClick={e=>setRegexMode(!regexMode)} title="Regex Mode">.*</button>
        </div>
    </div>
}