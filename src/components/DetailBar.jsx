
import "./DetailBar.css"
import "./../pages/HARTypes"

function subBuilder(index,subheader,content){
    return <>
        <span key={index} className="subheader">{subheader}</span>
        <span>{content}</span>
    </>
}

/**
 * 
 * @param {{log: HAREntry}} logParam 
 * @returns 
 */
function DetailBar_core({log}){
    
    return <div className="detail-bar-container">
        <div className="detail-bar">
            <span className="subheader">Inspecting the following URL</span>
            <span>{log.request.url}</span>

            <div className="sep small"></div>
            <div className="headers">
                <div className="req section">
                    <span className="header">Request Headers</span>
                    {log.request.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
                <div className="res section">
                    <span className="header">Response Headers</span>
                    {log.response.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
            </div>
            {/* <div className="sep small"></div>
            <div className="data">
                <span className="header">Request Data</span>
                <div className="req section">
                    
                </div>
                <span className="header">Response Data</span>
                <div className="res section">
                    <span className="subheader">Status</span>
                    <span>{log.response.status}</span>
                </div>
            </div> */}
        </div>
    </div>
}

/**
 * @typedef {{id : number,label:string,path:string}} data 
 */

/**
 * 
 * @param {{data:data}} param0 
 * @returns 
 */
function DetailBar_core_slug({data}){
    console.log(data);
    // FOr viewing Slug entries
    return <div className="detail-bar-container">
        <div className="detail-bar">
            <span className="subheader">Inspecting the following slug</span>
            <span>{data.path}</span>
            <div className="sep small"></div>
            
        {/*
            <div className="headers">
                <div className="req section">
                    <span className="header">Request Headers</span>
                    {log.request.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
                <div className="res section">
                    <span className="header">Response Headers</span>
                    {log.response.headers.map((header, index) => subBuilder(index, header.name, header.value))}
                </div>
            </div>
            <div className="sep small"></div>
            <div className="data">
                <span className="header">Request Data</span>
                <div className="req section">
                    
                </div>
                <span className="header">Response Data</span>
                <div className="res section">
                    <span className="subheader">Status</span>
                    <span>{log.response.status}</span>
                </div>
            </div> */}
        </div>
    </div>

}

export default function DetailBar({log}){
    if (!log) return <div></div>
    let keys = log;
    let isSlug = Object.keys(log).every((val)=>["id","label","path"].includes(val))
    console.log(isSlug,  Object.keys(log));
    return <div className="contain-bar">{isSlug ?  <DetailBar_core_slug data={log}> </DetailBar_core_slug> : <DetailBar_core log={log}/>}</div>
}