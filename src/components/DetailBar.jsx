
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
            </div>
        </div>
    </div>
}

export default function DetailBar({log}){
    return log ? <DetailBar_core log={log}/> : <div></div>
}