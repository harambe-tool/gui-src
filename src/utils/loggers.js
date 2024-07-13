const loggers_internal = {
    appstate : (data)=>["[App State Log]", data],
    formatter : (data)=>["[Code Formatter trace]", data],
    components : (data)=>["[Components]", data],
    detail_modal : (data)=>["[Components][Detail Modal]", data],
    detail_bar : (data)=>["[Components][Detail Bar]", data],
    topbar : (data)=>["[Components][Topbar]", data],
    viewer : (data)=>["[Components][Viewer]", data],
    viewer_algos : (data)=>["[Components][Viewer Algos]", data],
    classifier : (data)=>["[Classifier]", data],
    error : (data)=>["[ERROR]--\n\n",data,"\n\n--[END ERROR]--"],
    // formatter : (data)=>console.trace("[Code Formatter trace]", data),
}

/**
 * @type {ProxyHandler}
 */
const logger_implementation = {
    get : (target, props, proxy)=>{
        return (data)=>console.log("[HARAMBE]", ...target[props](data))
        
    }
}
const loggers = new Proxy(loggers_internal, logger_implementation)


export {loggers};