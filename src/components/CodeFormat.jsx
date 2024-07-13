import { Suspense, useState, useMemo, useReducer, useEffect } from "react"
import esthetic from "esthetic";
import hljs from 'highlight.js';
import { loggers } from "../utils/loggers";

esthetic.settings({logLevel:1})

function HighlightBlock({data}){
    loggers.formatter("Highlight block")
    let start = Date.now()
    let code_formatted = hljs.highlightAuto(data).value
    let timings = Date.now() - start
    loggers.formatter("Highlighting complete\n\n seconds:", timings/1000, "\n\n MS:", timings)
    return <pre>
        <code>
        <div dangerouslySetInnerHTML = {{__html:code_formatted}}></div>
        </code>
    </pre>
}

async function CodeGenBlock_async({code}){
    // Formatters take a lot of time!
    loggers.formatter("Code Gen Block running")

    let code_modified = code ?? "<empty>"
    code_modified = code_modified.length == 0 ? "<no content>" : code_modified

    try {
        loggers.formatter("Code Gen Block formatting code")
        let start = Date.now()
        code_modified = esthetic.format(code_modified)
        let timings = Date.now() - start
        
        loggers.formatter("Code Gen Block formatting complete\n\n seconds:", timings/1000, "\n\n MS:", timings)
    }
    catch (e){
        // Formatter may throw an error... Can't trust formatters with incomplete docs!
        loggers.formatter("[HARAMBE_SAY] Harambe think something wrong...", code_modified, e)
    }
    let start = Date.now()
    let code_formatted = hljs.highlightAuto(code).value
    let timings = Date.now() - start
    loggers.formatter("Highlighting complete\n\n seconds:", timings/1000, "\n\n MS:", timings)
    return <pre>
        <code>
        <div dangerouslySetInnerHTML = {{__html:code_formatted}}></div>
        </code>
    </pre>
    // return <HighlightBlock data={code_modified}></HighlightBlock>
}


function Fallback({code}){
    loggers.formatter("Rendering fallback:")
    // return <div className="fallback-code">...</div>;
    return <div className="fallback-code">{code}</div>;
}


function highlightReducer(state, action){
    if (action.type == "highlight_complete"){
        return {highlighted:true, code:action.code}
    }
    return state
} 
// TODO: get the damn thing to render TWICE - once WITHOUT HLJS and once WITH
export default function CodeGenBlock({code}){

    // let [loaded, setLoaded] = useState(false);
    // let [code, setCode] = useState(code)
    let [highlightTask, setHighlightTask] = useReducer(highlightReducer, {highlighted:false, code:code})
    

    loggers.formatter("Code Gen Block running on", code, highlightTask.highlighted)

    let code_modified = code ?? "<empty>"
    code_modified = code_modified.length == 0 ? "<no content>" : code_modified


    try {
        code_modified = useMemo(()=>esthetic.format(code_modified), [code_modified])
        // setHighlightTask)
    }
    catch (e){
        loggers.error(loggers.formatter, "[HARAMBE_SAY] Harambe think something wrong...", code_modified, e)
    }

    // let code_formatted;
    
    useEffect(()=>{
        if (!highlightTask.highlighted){
            let highlighted = hljs.highlightAuto(code_modified, ["html", "css", "json", "js", "xml", "md", "text"]).value;
            setHighlightTask({type:"highlight_complete", code:highlighted})
        }
    }, [code])

    return <pre>
        <code>
            {
                highlightTask.highlighted && <div dangerouslySetInnerHTML = {{__html:highlightTask.code}}></div>
            }
            {
                !(highlightTask.highlighted) && <div>
                    <Fallback code={code_modified} />
                </div>
            }
        
        </code>
    </pre>

    // return <Suspense fallback={<Fallback code={code} />}>
    //     <CodeGenBlock_async code={code}></CodeGenBlock_async>
    // </Suspense>
}