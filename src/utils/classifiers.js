let headermapper = (await import("./headermap.json"))
// WARNING : These checks are AI Generated.
// TODO: Implement https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html (and credit it)
// TODO: Get less AI Generated header checks by surveying bug hunters on common "ooh la la" headers

// "Why wasn't this already the case?" -> as I mainly do bug bounties on big tech companies, I mostly deal with vendor-specific headers.
// more:  well, x-goog-api-key, ezpz, no big deal - x-trace-something-for-obscure-server, i hardly know 'er


const includeChecks_resp = Object.assign({}, headermapper.mapper.response._include)
const includeChecks_req = Object.assign({},headermapper.mapper.request._include)

let reqMappings = headermapper.mapper.request
let respMappings = headermapper.mapper.response
delete reqMappings["_include"]
delete respMappings["_include"]

export default function fingerprintClassifier(requestHeaders, responseHeaders){
    // let reqIncludes = Object.keys(includeChecks_resp)
    
    function includeChecker(headers, includeMap){
        let keysOfInclude = Object.keys(includeMap)
        let filtered = headers.filter((header)=>keysOfInclude.includes(header.name.toLowerCase()))
        return filtered.map((header)=>includeMap[header.name])
    }
    function valuechecker(headers, comparisonMap){
        let keysOfInclude = Object.keys(comparisonMap)
        // let foundHeader = headers.find((header)=>keysOfInclude.includes(header.name.toLowerCase()))
        // foundHeader.value
        let filtered = headers.filter((header)=>keysOfInclude.includes(header.name.toLowerCase()))
        let mapped = filtered.map((header)=>comparisonMap[header.name.toLowerCase()][header.value.toLowerCase()]) 
        
        return mapped
        // return filtered.map((header)=>comparisonMap[header.name])
    }
    // const comparisonMapper = (headers, mappings)=>Object.keys(headers).reduce((accumulated, headername, index, array)=>{
    //     let extractedDetailKey = mappings[headername]
        
    //     if(headers.includes(headername)){
    //         return [...accumulated, extractedDetailKey]
    //     }
    // }, [])


    let nodeInfo  = [
        ...includeChecker(requestHeaders, includeChecks_req),
        ...includeChecker(responseHeaders, includeChecks_resp),
        ...valuechecker(requestHeaders, reqMappings),
        ...valuechecker(responseHeaders, respMappings)
    ]
    // nodeInfo = [...nodeInfo, ...includeChecker(responseHeaders, includeChecks_resp), ...]

    // Deduplicating...
    nodeInfo = [...new Set(nodeInfo)].filter((val) => val !== undefined)
    // console.log(nodeInfo)
    return nodeInfo
    // const data = {
    //     // "amz": responseHeaders.includes("x-amz-request-id"),
    //     // "cloudflare": responseHeaders.includes("cf-ray"),
    //     "fastly": responseHeaders.includes("x-served-by") && responseHeaders.includes("x-cache"),
    //     // "google": responseHeaders.includes("x-cloud-trace-context"),
    //     // "heroku": responseHeaders.includes("x-heroku-queue-wait-time"),
    //     "rackspace": responseHeaders.includes("x-rackspace-request-id"),
    //     "azure": responseHeaders.includes("x-ms-request-id"),
    //     "nginx": responseHeaders.includes("x-powered-by") && responseHeaders["x-powered-by"].toLowerCase().includes("nginx"),
    //     "apache": responseHeaders.includes("server") && responseHeaders["server"].toLowerCase().includes("apache"),
    //     "iis": responseHeaders.includes("server") && responseHeaders["server"].toLowerCase().includes("iis"),
    //     "openresty": responseHeaders.includes("server") && responseHeaders["server"].toLowerCase().includes("openresty"),
    //     "traefik": responseHeaders.includes("x-traefik-version"),
    //     "caddy": responseHeaders.includes("server") && responseHeaders["server"].toLowerCase().includes("caddy"),
    //     "envoy": responseHeaders.includes("x-envoy-upstream-service-time"),
    //     "haproxy": responseHeaders.includes("x-haproxy-backend"),
    //     "aws-elb": responseHeaders.includes("x-amzn-trace-id"),
    //     "google-lb": responseHeaders.includes("x-google-backends"),
    //     "ratelimit": responseHeaders.includes("x-ratelimit-limit"),
    //     "set-cookie": responseHeaders.includes("set-cookie"),
    //     "server-timing": responseHeaders.includes("server-timing"),
    //     "strict-transport-security": responseHeaders.includes("strict-transport-security"),
    //     "x-xss-protection": responseHeaders.includes("x-xss-protection"),
    //     "x-frame-options": responseHeaders.includes("x-frame-options"),
    //     "content-security-policy": responseHeaders.includes("content-security-policy"),
    //     "x-content-type-options": responseHeaders.includes("x-content-type-options"),
    //     "referrer-policy": responseHeaders.includes("referrer-policy"),
    //     "access-control-allow-origin": responseHeaders.includes("access-control-allow-origin"),
    //     "access-control-allow-methods": responseHeaders.includes("access-control-allow-methods"),
    //     "access-control-allow-headers": responseHeaders.includes("access-control-allow-headers"),
    //     "x-powered-by": responseHeaders.includes("x-powered-by"),
    //     "user-agent": requestHeaders.includes("user-agent"),
    //     "accept": requestHeaders.includes("accept"),
    //     "accept-encoding": requestHeaders.includes("accept-encoding"),
    //     "accept-language": requestHeaders.includes("accept-language"),
    //     "authorization": requestHeaders.includes("authorization"),
    //     "cookie": requestHeaders.includes("cookie"),
    //     "x-api-key": requestHeaders.includes("x-api-key"),
    //     "x-client-id": requestHeaders.includes("x-client-id"),
    //     "x-user-id": requestHeaders.includes("x-user-id"),
    //     "api-key": requestHeaders.includes("api-key"),
    //     "client-id": requestHeaders.includes("client-id"),
    //     "user-id": requestHeaders.includes("user-id"),
    //     "apikey": requestHeaders.includes("apikey"),
    //     "clientid": requestHeaders.includes("clientid"),
    //     "userid": requestHeaders.includes("userid")
    // };

}
  
export const details = headermapper.descriptions