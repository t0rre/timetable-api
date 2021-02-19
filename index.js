const https = require('https');
const express = require('express');
const app = express();
const port = 8080;
const corsAllow = '*';

app.use(express.json())

app.all('/api/signature', function (req, res) {
    res.append('Access-Control-Allow-Origin', corsAllow);
    console.log('Got request for signature!');
    let data= JSON.stringify({"signature":req.body.signature});
    let options = {
        hostname: 'web.skola24.se',
        port: 443,
        path: '/api/encrypt/signature',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'X-Scope': '8a22163c-8662-4535-9050-bc5e1923df48'
        }
      }
    let resBody = '';
    let proxyReq = https.request(options, function(proxyRes) {
        proxyRes.on('data', function (d) {
            resBody += d;
        })
        proxyRes.on('end', function(){
            res.status(200);
            res.hea
            res.json({'output':JSON.parse(resBody)})
        })
    })
    proxyReq.write(data);
    proxyReq.end();
});


app.all('/api/timetable', function(req,res){
    res.append('Access-Control-Allow-Origin', corsAllow);
    console.log('Got request for timetable!');
    let data = "null";
    let options = {
        hostname: 'web.skola24.se',
        port: 443,
        path: '/api/get/timetable/render/key',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Content-Length': data.length,
          'X-Scope': '8a22163c-8662-4535-9050-bc5e1923df48'
        }
      }
    let resBody = '';
    let proxyReq = https.request(options, function(proxyRes) {
        proxyRes.on('data', function (d) {
            resBody += d;
        })
        proxyRes.on('end', function(){
            let renderKey = JSON.parse(resBody).data.key;
            resBody = ''
            data= JSON.stringify({
                "renderKey":renderKey,
                "host":req.body.domain,
                "unitGuid":req.body.unitGuid,
                "startDate":"null",
                "endDate":"null",
                "scheduleDay":0,
                "blackAndWhite":"false",
                "width":1223,
                "height":550,
                "selectionType":4,
                "selection":req.body.signature,
                "showHeader":"false",
                "periodText":"",
                "week":req.body.week,
                "year":req.body.year,
                "privateFreeTextMode":"false",
                "privateSelectionMode":"null",
                "customerKey":""
             });
            options.path = '/api/render/timetable'
            let proxyReqTable = https.request(options, function(proxyResTable) {
                proxyResTable.on('data', function (d) {
                    resBody += d;
                })
                proxyResTable.on('end', function(){
                    res.status(200);
                    res.json({'output':JSON.parse(resBody)})
                })
            })
            proxyReqTable.write(data);
            proxyReqTable.end();
        })
    })
    proxyReq.write(data);
    proxyReq.end();
});
app.listen(port);