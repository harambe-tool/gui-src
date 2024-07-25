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
    // Go through the nodes
    nodes.filter((node)=>{
        // Filter by selection
        // Filter by text
        switch (filter) {
            case "response_content":
                return (node.data.response.content.text ?? "").includes(text)
            case "response_headers":
                return
            case "request_headers":
                return
            case "request_content":
                return
            case "request_url":
                return
            default:
                return ""
        };
        
    })
    // Keep a list and have the up and down arrows control the index

    // useReactflow hook to go to the node that fits that criteria

    // CONCEPT : replicate the VSCode search

    // Controlled Input
    return <div>
        <input type="text" value={text} onChange={(e)=>setText(e.target.value)}></input>
        
        <button></button>
    </div>
}