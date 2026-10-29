var V='soct-v1';
var SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V&&k!=='shared';}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function handleShare(e){return e.request.formData().then(function(fd){
  var f=fd.get('media'),t=((fd.get('text')||'')+'\n'+(fd.get('title')||'')).trim();
  return caches.open('shared').then(function(c){
    var ps=[];
    if(f&&f.size)ps.push(c.put('shared-image',new Response(f,{headers:{'Content-Type':f.type||'image/png'}})));
    if(t)ps.push(c.put('shared-text',new Response(t)));
    return Promise.all(ps);
  }).then(function(){return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303);});
}).catch(function(){return Response.redirect(new URL('./',self.registration.scope).href,303);});}
self.addEventListener('fetch',function(e){var r=e.request,u=new URL(r.url);
  if(r.method==='POST'&&u.pathname.slice(-14)==='/share-target/'){e.respondWith(handleShare(e));return;}
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp);});}return res;}).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('./index.html');});}));
});
