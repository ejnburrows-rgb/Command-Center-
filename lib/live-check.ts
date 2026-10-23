import {lookup} from "node:dns/promises";
import https from "node:https";
import {isIP,BlockList} from "node:net";
const blocked=new BlockList();
for(const [address,prefix] of [["0.0.0.0",8],["10.0.0.0",8],["100.64.0.0",10],["127.0.0.0",8],["169.254.0.0",16],["172.16.0.0",12],["192.0.0.0",24],["192.0.2.0",24],["192.168.0.0",16],["198.18.0.0",15],["198.51.100.0",24],["203.0.113.0",24],["224.0.0.0",4],["240.0.0.0",4]] as [string,number][])blocked.addSubnet(address,prefix);
export function validateDestination(raw:string){const url=new URL(raw);if(url.protocol!=="https:"||url.username||url.password||(url.port&&url.port!=="443")||isIP(url.hostname)||url.hostname.includes(":")||!url.hostname.includes(".")||/\.(localhost|local|internal|test|invalid)$/i.test(url.hostname))throw Error("Use a public HTTPS hostname on port 443.");return url}
export function publicIPv4(address:string){return isIP(address)===4&&!blocked.check(address)}
async function head(url:URL,remaining:number){
 const addresses=await lookup(url.hostname,{all:true});
 // Pin the connection to a checked IPv4 address; DNS cannot redirect the socket afterward.
 const ipv4=addresses.filter(a=>a.family===4);
 if(!ipv4.length||ipv4.some(a=>!publicIPv4(a.address)))throw Error("Destination does not resolve to public IPv4 addresses.");
 return new Promise<{status:number;location?:string;lastModified?:string}>((resolve,reject)=>{
 const req=https.request(url,{method:"HEAD",lookup:(_host,_options,callback)=>callback(null,[{address:ipv4[0].address,family:4}]),headers:{"User-Agent":"NBO-Website-Health/1.0"}},res=>{res.resume();resolve({status:res.statusCode||0,location:res.headers.location,lastModified:res.headers["last-modified"]})});
 req.setTimeout(remaining,()=>req.destroy(Error("Website check timed out")));req.on("error",reject);req.end();
 });
}
export async function checkWebsite(raw:string){const started=Date.now();let url=validateDestination(raw);const redirects:string[]=[];
 for(let i=0;i<4;i++){const left=8000-(Date.now()-started);if(left<=0)throw Error("Website check timed out");const result=await Promise.race([head(url,left),new Promise<never>((_,reject)=>{const t=setTimeout(()=>reject(Error("Website check timed out")),left);t.unref()})]);
 if([301,302,303,307,308].includes(result.status)){if(!result.location||i===3)throw Error("Unsafe or excessive redirects");url=validateDestination(new URL(result.location,url).href);redirects.push(url.href);continue}
 return {url:url.href,checkedAt:new Date().toISOString(),status:result.status,success:result.status>=200&&result.status<300,lastModified:result.lastModified&&Number.isFinite(Date.parse(result.lastModified))?result.lastModified:null,redirects,deployment:null,buildAge:"BUILD AGE UNKNOWN",provenance:"HTTP HEAD response. Last-Modified describes the HTTP resource, not its deployment."};
 }throw Error("Too many redirects");
}
