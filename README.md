# Harambe

Harambe, at its core, is a HAR file viewer.

But what do you want from viewers alone?
What if, when viewing the structure of a site, it could display insightful snippets of feedback? 
What if, instead of having to switch from app to command line to website, you can directly do what you want to do from the website itself?

## Default View

Logically, an HTML page lists resources - CSS, JS and media. The JS files may make web requests. The CSS files may fetch more media. 

Harambe builds a graph view that represents this relationship between resources. The document is the root, and it links each request to its parent (also called the initiator). 



## API View

Each endpoint in a server has scaffolding. 
When you read a resource, sure, you get what's in there.
But it has been designed in a specific manner for a specific reason. Maybe the backend devs didn't put much thought towards it, or maybe the backend devs put so much care into it that the codebase can be legally considered art.

But in either case, there is a structure that creates predictability.

## Context Based Fuzzing

Why would a banking service using NextJS have a `wp-admin` page? You're sending a whole 3 thousand line wordlist to get more analytics when the analysis is in the context.

Every page has subtle clues to the technology using it. Why are you using a static wordlist? Your fuzzer can adapt based on the responses. You can mask up headers, but your Java stack trace as an error message from a server is not hiding much.

If we have intelligent fuzzers that operate on tech stack clues and application context, you could knock an IDOR bug out the park in seconds.
