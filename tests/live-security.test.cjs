const {test}=require('node:test');const assert=require('node:assert/strict');
const {validateDestination,publicIPv4}=require(process.env.NBO_LIVE_BUILD+'/live-check.js');
test('health checks reject local, credentialed, literal and unsafe scheme URLs',()=>{
for(const u of ['http://example.com','https://localhost','https://127.0.0.1','https://[::1]','https://name.internal','https://user:secret@example.com','https://example.com:444'])assert.throws(()=>validateDestination(u));
assert.equal(validateDestination('https://example.com/path').hostname,'example.com');
});
test('health socket pinning rejects nonpublic IPv4 ranges',()=>{for(const ip of ['0.0.0.0','10.0.0.1','100.64.0.1','127.0.0.1','169.254.169.254','172.16.0.1','192.168.0.1','192.0.2.1','198.18.0.1','224.0.0.1','255.255.255.255'])assert.equal(publicIPv4(ip),false,ip);assert.equal(publicIPv4('8.8.8.8'),true)});
