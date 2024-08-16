let headermapper = (await import("./headermap.json"))
// WARNING : These checks are AI Generated.
// TODO: Implement https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html (and credit it)
// TODO: Get less AI Generated header checks by surveying bug hunters on common "ooh la la" headers

// "Why wasn't this already the case?" -> as I mainly do bug bounties on big tech companies, I mostly deal with vendor-specific headers.
// more:  well, x-goog-api-key, ezpz, no big deal - x-trace-something-for-obscure-server, i hardly know 'er


const includeChecks_resp = Object.assign(
    {}, headermapper.mapper.response._include
)
const includeChecks_req = Object.assign(
    {}, headermapper.mapper.request._include
)

let reqMappings = headermapper.mapper.request
let respMappings = headermapper.mapper.response
delete reqMappings["_include"]
delete respMappings["_include"]

function includeChecker(headers, includeMap){
    let keysOfInclude = Object.keys(includeMap)

    let filtered = headers.filter((header)=>
        keysOfInclude.includes(header.name.toLowerCase()))
    return filtered.map((header)=>
        includeMap[header.name])
}

function valuechecker(headers, comparisonMap){
    let keysOfInclude = Object.keys(comparisonMap)
    let filtered = headers.filter(
        (header)=> keysOfInclude.includes(header.name.toLowerCase())
    )

    return filtered.map((header)=>{

        comparisonMap[header.name.toLowerCase()][header.value.toLowerCase()]
    })
}
export default function fingerprintClassifier(requestHeaders, responseHeaders){

    let nodeInfo  = [
        ...includeChecker(requestHeaders, includeChecks_req),
        ...includeChecker(responseHeaders, includeChecks_resp),
        ...valuechecker(requestHeaders, reqMappings),
        ...valuechecker(responseHeaders, respMappings)
    ]

    // Deduplicating like this is slow but it's all good. 
    // I'd be more concerned about the .filter(.includes()).map() x4
    // It can be simplified a lot but... This is clean. Simple. Good.
    // A reducer is better for perf but makes it worse to maintain, it matters
    // 
    nodeInfo = [...new Set(nodeInfo)].filter((val) => val !== undefined)
    return nodeInfo
}

export const details = headermapper.descriptions
