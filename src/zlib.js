const zlib = require('zlib');


var base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split("");
var base64inv = {}; 
for (var i = 0; i < base64chars.length; i++) { 
  base64inv[base64chars[i]] = i; 
}
function decodeNumeric(s) {
  s = s.replace(new RegExp('[^'+base64chars.join("")+'=]', 'g'), "");

  var p = (s.charAt(s.length-1) == '=' ? 
          (s.charAt(s.length-2) == '=' ? 'AA' : 'A') : ""); 
  var r = []; 
  s = s.substr(0, s.length - p.length) + p;

  for (var c = 0; c < s.length; c += 4) {
    var n = (base64inv[s.charAt(c)] << 18) + (base64inv[s.charAt(c+1)] << 12) +
            (base64inv[s.charAt(c+2)] << 6) + base64inv[s.charAt(c+3)];

    r.push((n >>> 16) & 255);
    r.push((n >>> 8) & 255);
    r.push(n & 255);
  }
  return r;
}
console.log(Buffer.from(`0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,
0,0,0,1,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,
0,0,1,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,
1,0,0,0,0,0,0,0,0,0`).toString('base64'))