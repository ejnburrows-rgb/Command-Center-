import { createHmac } from "node:crypto";
const base = "https://api.zenzap.co";

export function zenzapConfigured() {
  return Boolean(
    (process.env.ZENZAP_API_KEY && process.env.ZENZAP_API_SECRET) ||
    (process.env.ZENZAP_CLIENT_ID && process.env.ZENZAP_CLIENT_SECRET)
  );
}
async function authHeaders(method: "GET" | "POST", uri: string, body: string) {
  const key = process.env.ZENZAP_API_KEY;
  const secret = process.env.ZENZAP_API_SECRET;
  if (key && secret) {
    const timestamp = String(Date.now());
    const payload = timestamp + "." + (method === "GET" ? uri : body);
    return {
      Authorization: "Bearer " + key,
      "X-Timestamp": timestamp,
      "X-Signature": createHmac("sha256",secret).update(payload).digest("hex")
    };
  }
  const id = process.env.ZENZAP_CLIENT_ID;
  const oauthSecret = process.env.ZENZAP_CLIENT_SECRET;
  if (!id || !oauthSecret) throw new Error("Zenzap is not configured.");
  const credentials = new URLSearchParams({
    grant_type:"client_credentials",client_id:id,client_secret:oauthSecret,
    scope:"channel:list message:read message:send"
  });
  const tokenRes = await fetch(base+"/oauth/token",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:credentials.toString(),signal:AbortSignal.timeout(12000),cache:"no-store"
  });
  if (!tokenRes.ok) throw new Error("Zenzap account authorization failed (HTTP "+tokenRes.status+").");
  const token = await tokenRes.json();
  if (typeof token.access_token !== "string") throw new Error("Zenzap returned no access token.");
  return {Authorization:"Bearer "+token.access_token};
}

export async function requestZenzap(method:"GET"|"POST",uri:string,data?:{topicId:string;text:string}) {
  if (!zenzapConfigured()) throw new Error("Zenzap is not connected.");
  if (!/^\/v2\/(topics|messages)(\/|\?|$)/.test(uri)) throw new Error("Invalid Zenzap resource.");
  const body = data?JSON.stringify(data):"";
  const headers = new Headers({"Content-Type":"application/json"});
  for(const [name,value] of Object.entries(await authHeaders(method,uri,body))) if(value) headers.set(name,value);
  const res=await fetch(base+uri,{
    method,headers,
    ...(method==="POST"?{body}:{}),signal:AbortSignal.timeout(15000),cache:"no-store"
  });
  if (!res.ok) throw new Error("Zenzap request failed (HTTP "+res.status+").");
  return res.json();
}
