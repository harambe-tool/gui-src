// WARNING : These checks are AI Generated.
// TODO: Implement https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html (and credit it)
// TODO: Get less AI Generated header checks by surveying bug hunters on common "ooh la la" headers

// "Why wasn't this already the case?" -> as I mainly do bug bounties on big tech companies, I mostly deal with vendor-specific headers.
// more:  well, x-goog-api-key, ezpz, no big deal - x-trace-something-for-obscure-server, i hardly know 'er

let headermapper = (await import("./headermap.json"))


export default function fingerprintClassifier(requestHeaders, responseHeaders){
    const includeChecks_resp = headermapper.response._include
    const includeChecks_req = headermapper.request._include


    reqIncludes = Object.keys(includeChecks_resp)
    
    const includeLambda = (headers, includeCheck)=>Object.keys(headers).reduce((accumulated, headername, index, array)=>{
        let extractedDetailKey = includeCheck[headername]
        if(headers.includes(headername)){
            return [...accumulated, extractedDetailKey]
        }
    }, [])

    let nodeInfo  = includeLambda(requestHeaders, includeChecks_req)
    nodeInfo = [...nodeInfo, ...includeLambda(responseHeaders, includeChecks_resp)]
    
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
  
export const details = {
    "amz": "This node uses Amazon Web Services.",
    "cloudflare": "This node is behind Cloudflare.",
    "fastly": "This node is behind Fastly.",
    "google": "This node likely uses Google Cloud Platform.",
    "heroku": "This node is hosted on Heroku.",
    "rackspace": "This node likely uses Rackspace services.",
    "azure": "This node is hosted on Microsoft Azure.",
    "nginx": "This node uses Nginx.",
    "apache": "This node uses Apache.",
    "iis": "This node uses Internet Information Services.",
    "openresty": "This node uses OpenResty.",
    "traefik": "This node uses Traefik as a reverse proxy/load balancer.",
    "caddy": "This node uses Caddy as a web server.",
    "envoy": "This node uses Envoy as a proxy.",
    "haproxy": "This node uses HAProxy as a load balancer.",
    "aws-elb": "This node uses Amazon Web Services Elastic Load Balancer.",
    "google-lb": "This node uses Google Cloud Load Balancing.",
    "ratelimit": "This node implements rate limiting.",
    "set-cookie": "The response sets a cookie.",
    "server-timing": "The response includes server timing information.",
    "strict-transport-security": "This node enforces HTTPS connections.",
    "x-xss-protection": "This node enables cross-site scripting (XSS) protection.",
    "x-frame-options": "This node controls if it can be embedded in frames.",
    "content-security-policy": "This node defines content security policies.",
    "x-content-type-options": "This node prevents MIME sniffing vulnerabilities.",
    "referrer-policy": "This node defines how referrers are sent.",
    "access-control-allow-origin": "This node defines which origins are allowed to access resources.",
    "access-control-allow-methods": "This node defines which HTTP methods are allowed.",
    "access-control-allow-headers": "This node defines which custom headers are allowed.",
    "x-powered-by": "The response discloses the underlying technology used.",
    "user-agent": "The request includes the user agent string.",
    "accept": "The request specifies acceptable media types.",
    "accept-encoding": "The request specifies acceptable content encodings.",
    "accept-language": "The request specifies preferred languages.",
    "authorization": "The request includes authorization information.",
    "cookie": "The request includes cookies.",
    "x-api-key": "The request includes an API key.",
    "x-client-id": "The request includes a client ID.",
    "x-user-id": "The request includes a user ID.",
    "api-key": "The request includes an API key.",
    "client-id": "The request includes a client ID.",
    "user-id": "The request includes a user ID.",
    "apikey": "The request includes an API key.",
    "clientid": "The request includes a client ID.",
    "userid": "The request includes a user ID."
  };