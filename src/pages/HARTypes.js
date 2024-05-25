// AI Generated Typedefs extracted from http://www.softwareishard.com/blog/har-12-spec/
// Props to odvarko@gmail.com / @janodvarko

/**
 * @typedef {string} HARVersion
 * @description Version number of the format
 * @example "1.2"
 */

/**
 * @typedef {string} HARDateTimeISO8601
 * @description Date and time stamp for the beginning of the page load ([`ISO 8601`][iso-8601])
 * @example "2009-04-16T12:07:25.123+01:00"
 */

/**
 * @typedef {string} HARPageId
 * @description Unique identifier of a page within the [`log`](#log). [`Entries`](#entries) use it to refer the parent page
 * @example "page_0"
 */

/**
 * @typedef {string} HARRequestMethod
 * @description Request method
 * @example "GET"
 */

/**
 * @typedef {string} HARRequestUrl
 * @description Absolute URL of the request (fragments are not included)
 * @example "http://www.example.com/path/?param=value"
 */

/**
 * @typedef {string} HARHTTPVersion
 * @description [Request HTTP Version][rfc7230-version]
 * @example "HTTP/1.1"
 */

/**
 * @typedef {string} HARPostDataMimeType
 * @description [Mime type][mime-type] of posted data
 * @example "multipart/form-data"
 */

/**
 * @typedef {number} HARResponseStatus
 * @description [Response status][rfc7231-status]
 * @example 200
 */

/**
 * @typedef {string} HARResponseStatusText
 * @description [Response status description][rfc7231-status]
 * @example "OK"
 */

/**
 * @typedef {string} HARRedirectUrl
 * @description Redirection target URL from the Location response header
 * @example ""
 */

/**
 * @typedef {string} HARContentMimeType
 * @description MIME type of the response `text` *(value of the `Content-Type` response header)*. The charset attribute of the MIME type is included *(if available)*
 * @example "text/html; charset=utf-8"
 */

/**
 * @typedef {string} HARContentEncoding
 * @description *(new in 1.2)* - Encoding used for response `text` field e.g "base64"
 * @example "base64"
 */

/**
 * @typedef {string} HARCacheExpires
 * @description Expiration time of the cache entry
 * @example "2009-04-16T15:50:36"
 */

/**
 * @typedef {string} HARCacheEtag
 * @description [Etag][rfc7232-etag]
 * @example ""
 */

/**
 * @typedef {string} HARServerIpAddress
 * @description *(new in 1.2)* - IP address of the server that was connected (result of DNS resolution)
 * @example "10.0.0.1"
 */

/**
 * @typedef {string} HARConnectionId
 * @description *(new in 1.2)* - Unique ID of the parent TCP/IP connection, can be the client or server port number.
 * @example "52492"
 */

/**
 * @typedef {string} HARComment
 * @description  A comment provided by the user or the application
 * @example ""
 */

/**
 * This object represents the root of exported data.
 * @typedef {object} HARLog
 * @property {HARVersion} version - Version number of the format
 * @property {HARCreator} creator - Name and version info of the log [creator](#creator) application
 * @property {HARBrowser} [browser] - Name and version info of used [browser](#browser)
 * @property {HARPage[]} [pages] - List of all exported (tracked) [pages](#pages)
 * @property {HAREntry[]} entries - List of all exported (tracked) [requests](#entries)
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "version": "1.2",
  "creator": {
    "name": "Firebug",
    "version": "1.6"
  },
  "browser": {
    "name": "Firefox",
    "version": "3.6"
  },
  "pages": [],
  "entries": [],
  "comment": ""
}
 */

/**
 * @typedef {object} HARCreator
 * @property {string} name - Name of the application used to export the log
 * @property {string} version - Version of the application used to export the log
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "name": "Firebug",
  "version": "1.6",
  "comment": ""
}
 */

/**
 * @typedef {object} HARBrowser
 * @property {string} name - Name of the browser used to export the log
 * @property {string} version - Version of the browser used to export the log
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "name": "Firefox",
  "version": "3.6",
  "comment": ""
}
 */

/**
 * This object represents list of exported pages.
 * @typedef {object} HARPage
 * @property {HARDateTimeISO8601} startedDateTime - Date and time stamp for the beginning of the page load ([`ISO 8601`][iso-8601])
 * @property {HARPageId} id - Unique identifier of a page within the [`log`](#log). [`Entries`](#entries) use it to refer the parent page
 * @property {string} title - Page title
 * @property {HARPageTimings} pageTimings - Detailed timing info about page load
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "startedDateTime": "2009-04-16T12:07:25.123+01:00",
  "id": "page_0",
  "title": "Test Page",
  "pageTimings": {
    "onContentLoad": 1720,
    "onLoad": 2500
  },
  "comment": ""
}
 */

/**
 * This object describes timings for various events (states) fired during the page load. All times are specified in milliseconds. If a time info is not available appropriate field is set to `-1`
 * @typedef {object} HARPageTimings
 * @property {number} [onContentLoad] - Content of the page loaded. Number of milliseconds since page load started ([`page.startedDateTime`](#pages))
 * @property {number} [onLoad] - Page is loaded (`onLoad` event fired). Number of milliseconds since page load started ([`page.startedDateTime`](#pages))
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "onContentLoad": 1720,
  "onLoad": 2500,
  "comment": ""
}
 */

/**
 * This object represents an array with all exported HTTP requests. Sorting entries by `startedDateTime` (starting from the oldest) is preferred way how to export data since it can make importing faster. However the reader application should always make sure the array is sorted (if required for the import).
 * @typedef {object} HAREntry
 * @property {HARPageId} [pageref] - Unique Reference to the parent page
 * @property {HARDateTimeISO8601} startedDateTime - Date and time stamp of the request start ([`ISO 8601`][iso-8601])
 * @property {number} time - Total elapsed time of the request in milliseconds. This is the sum of all timings available in the timings object (i.e. not including `-1` values)
 * @property {HARRequest} request - Detailed info about the request
 * @property {HARResponse} response - Detailed info about the response
 * @property {HARCache} cache - Info about cache usage
 * @property {HARTimings} timings - Detailed timing info about request/response round trip
 * @property {HARServerIpAddress} [serverIPAddress] - *(new in 1.2)* - IP address of the server that was connected (result of DNS resolution)
 * @property {HARConnectionId} [connection] - *(new in 1.2)* - Unique ID of the parent TCP/IP connection, can be the client or server port number.
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "pageref": "page_0",
  "startedDateTime": "2009-04-16T12:07:23.596Z",
  "time": 50,
  "request": {
    "method": "GET",
    "url": "http://www.example.com/path/?param=value",
    "httpVersion": "HTTP/1.1",
    "cookies": [],
    "headers": [],
    "queryString": [],
    "postData": {},
    "headersSize": 150,
    "bodySize": 0
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "httpVersion": "HTTP/1.1",
    "cookies": [],
    "headers": [],
    "content": {
      "size": 33,
      "compression": 0,
      "mimeType": "text/html; charset=utf-8",
      "text": "\n"
    },
    "redirectURL": "",
    "headersSize": 160,
    "bodySize": 850
  },
  "cache": {},
  "timings": {
    "blocked": 0,
    "dns": -1,
    "connect": 15,
    "send": 20,
    "wait": 38,
    "receive": 12,
    "ssl": -1
  },
  "serverIPAddress": "10.0.0.1",
  "connection": "52492",
  "comment": ""
}
 */

/**
 * This object contains detailed info about performed request.
 * @typedef {object} HARRequest
 * @property {HARRequestMethod} method - [Request method][rfc7231-methods]
 * @property {HARRequestUrl} url - Absolute URL of the request (fragments are not included)
 * @property {HARHTTPVersion} httpVersion - [Request HTTP Version][rfc7230-version]
 * @property {HARCookie[]} cookies - List of [`cookie`](#cookies) objects
 * @property {HARHeader[]} headers - List of [`header`](#headers) objects
 * @property {HARQueryString[]} queryString - List of query parameter objects
 * @property {HARPostData} [postData] - Posted data info
 * @property {number} headersSize - Total number of bytes from the start of the HTTP request message until (and including) the double `CRLF` before the body
 * @property {number} bodySize - Size of the request body in bytes (e.g. `POST` data payload)
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "method": "GET",
  "url": "http://www.example.com/path/?param=value",
  "httpVersion": "HTTP/1.1",
  "cookies": [],
  "headers": [],
  "queryString": [],
  "postData": {},
  "headersSize": 150,
  "bodySize": 0,
  "comment": ""
}
 */

/**
 * This object contains detailed info about the response.
 * @typedef {object} HARResponse
 * @property {HARResponseStatus} status - [Response status][rfc7231-status]
 * @property {HARResponseStatusText} statusText - [Response status description][rfc7231-status]
 * @property {HARHTTPVersion} httpVersion - [Response HTTP Version][rfc7230-version]
 * @property {HARCookie[]} cookies - List of [`cookie`](#cookies) objects
 * @property {HARHeader[]} headers - List of [`header`](#headers) objects
 * @property {HARContent} content - Details about the response body
 * @property {HARRedirectUrl} redirectURL - Redirection target URL from the Location response header
 * @property {number} headersSize - Total number of bytes from the start of the HTTP response message until (and including) the double `CRLF` before the body
 * @property {number} bodySize - Size of the received response body in bytes. Set to `0` in case of responses coming from the cache (`304`)
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "status": 200,
  "statusText": "OK",
  "httpVersion": "HTTP/1.1",
  "cookies": [],
  "headers": [],
  "content": {
    "size": 33,
    "compression": 0,
    "mimeType": "text/html; charset=utf-8",
    "text": "\n"
  },
  "redirectURL": "",
  "headersSize": 160,
  "bodySize": 850,
  "comment": ""
}
 */

/**
 * This object contains list of all cookies (used in [`request`](#request) and [`response`](#response) objects).
 * @typedef {object} HARCookie
 * @property {string} name - The name of the cookie
 * @property {string} value - The cookie value
 * @property {string} [path] - The path pertaining to the cookie
 * @property {string} [domain] - The host of the cookie
 * @property {HARDateTimeISO8601} [expires] - Cookie expiration time. ([`ISO 8601`][iso-8601])
 * @property {boolean} [httpOnly] - Set to true if the cookie is HTTP only, false otherwise
 * @property {boolean} [secure] - *(new in 1.2)* - `true` if the cookie was transmitted over ssl, `false` otherwise
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "name": "TestCookie",
  "value": "Cookie Value",
  "path": "/",
  "domain": "www.janodvarko.cz",
  "expires": "2009-07-24T19:20:30.123+02:00",
  "httpOnly": false,
  "secure": false,
  "comment": ""
}
 */

/**
 * This object contains list of all headers (used in [`request`](#request) and [`response`](#response) objects).
 * @typedef {object} HARHeader
 * @property {string} name - The name of the header
 * @property {string} value - The header value
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "name": "Accept-Encoding",
  "value": "gzip,deflate",
  "comment": ""
}
 */

/**
 * This object contains list of all parameters & values parsed from a query string, if any (embedded in [`request`](#request) object).
 * @typedef {object} HARQueryString
 * @property {string} name - The name of the query
 * @property {string} value - The query value
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "name": "param1",
  "value": "value1",
  "comment": ""
}
 */

/**
 * This object describes posted data, if any (embedded in [`request`](#request) object).
 * @typedef {object} HARPostData
 * @property {HARPostDataMimeType} mimeType - [Mime type][mime-type] of posted data
 * @property {HARParam[]} [params] - List of posted parameters (in case of URL encoded parameters)
 * @property {string} [text] - Plain text posted data
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "mimeType": "multipart/form-data",
  "params": [],
  "text": "plain posted data",
  "comment": ""
}
 */

/**
 * List of posted parameters, if any (embedded in [`postData`](#postData) object).
 * @typedef {object} HARParam
 * @property {string} name - name of a posted parameter
 * @property {string} [value] - value of a posted parameter or content of a posted file
 * @property {string} [fileName] - name of a posted file
 * @property {string} [contentType] - content type of a posted file
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "name": "paramName",
  "value": "paramValue",
  "fileName": "example.pdf",
  "contentType": "application/pdf",
  "comment": ""
}
 */

/**
 * This object describes details about response content (embedded in [`response`](#response) object).
 * @typedef {object} HARContent
 * @property {number} size - Length of the returned content in bytes. Should be equal to `response.bodySize` if there is no compression and bigger when the content has been compressed
 * @property {number} [compression] - Number of bytes saved
 * @property {HARContentMimeType} mimeType - MIME type of the response `text` *(value of the `Content-Type` response header)*. The charset attribute of the MIME type is included *(if available)*
 * @property {string} [text] - Response body sent from the server or loaded from the browser cache.
 * @property {HARContentEncoding} [encoding] - *(new in 1.2)* - Encoding used for response `text` field e.g "base64"
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "size": 33,
  "compression": 0,
  "mimeType": "text/html; charset=utf-8",
  "text": "\n",
  "comment": ""
}
 */

/**
 * This objects contains info about a request coming from browser cache.
 * @typedef {object} HARCache
 * @property {HARCacheObject|null} [beforeRequest] - State of a cache entry before the request
 * @property {HARCacheObject|null} [afterRequest] - State of a cache entry after the request
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "beforeRequest": null,
  "afterRequest": null,
  "comment": ""
}
 */

/**
 * @typedef {object} HARCacheObject
 * @property {HARCacheExpires} [expires] - Expiration time of the cache entry
 * @property {string} lastAccess - The last time the cache entry was opened
 * @property {HARCacheEtag} eTag - [Etag][rfc7232-etag]
 * @property {number} hitCount - The number of times the cache entry has been opened
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "expires": "2009-04-16T15:50:36",
  "lastAccess": "2009-16-02T15:50:34",
  "eTag": "",
  "hitCount": 0,
  "comment": ""
}
 */

/**
 * This object describes various phases within request-response round trip. All times are specified in milliseconds.
 * @typedef {object} HARTimings
 * @property {number} [blocked] - Time spent in a queue waiting for a network connection
 * @property {number} [dns] - DNS resolution time. The time required to resolve a host name
 * @property {number} [connect] - Time required to create TCP connection
 * @property {number} send - Time required to send HTTP request to the server
 * @property {number} wait - Waiting for a response from the server
 * @property {number} receive - Time required to read entire response from the server (or cache)
 * @property {number} [ssl] - *(new in 1.2)* - Time required for SSL/TLS negotiation.
 * @property {HARComment} [comment] - *(new in 1.2)* - A comment provided by the user or the application
 * @example {
  "blocked": 0,
  "dns": -1,
  "connect": 15,
  "send": 20,
  "wait": 38,
  "receive": 12,
  "ssl": -1,
  "comment": ""
}
 */