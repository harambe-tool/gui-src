
import "./DetailBar.css"
import "./../pages/HARTypes"
/**
 * 
 * @param {{log: HAREntry}} logParam 
 * @returns 
 */
function DetailBar_core({log}){
    return <div className="detail-bar-container">
        <div className="detail-bar">
            <div className="headers">
                <div className="req section">
                    <span className="header">Request Headers</span>
                </div>
                <div className="res section">
                    <span className="header">Response Headers</span>
                </div>
            </div>

            <div className="data">
                <span className="header">Request Data</span>
                <div className="req section">
                    <span className="subheader">URL</span>
                    <span>{log.request.url}</span>
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