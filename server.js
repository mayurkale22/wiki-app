'use strict';

const project = process.env.GOOGLE_CLOUD_PROJECT;
const tracing = require('@opencensus/nodejs');
const {StackdriverTraceExporter} = require('@opencensus/exporter-stackdriver');
const exporter = new StackdriverTraceExporter({projectId: project});

// [Enable next 2 lines to use OpenCensus Agent Exporter]
// const {OCAgentExporter} = require('@opencensus/exporter-ocagent');
// const exporter = new OCAgentExporter({serviceName: 'my-service'});

tracing.start({
  exporter: exporter,
  samplingRate: 1, // For demo purposes, always sample
  logLevel: 1 // show errors, if any
});


const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/wiki', function (req, res) {
  res.render('index', {pages: null, error: null});
})

app.post('/wiki', function (req, res) {
  let word = req.body.word;
  let url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch='${word}'`

  request(url, function (err, response, body) {
    if(err){
      res.render('index', {pages: null, error: 'Error, please try again'});
    } else {
      let data = JSON.parse(body)
      if(data == undefined){
        res.render('index', {pages: null, error: 'Error, please try again'});
      } else {
        const pages = [];
        for (var i in data.query.pages) {
          pages.push(data.query.pages[i].title);
        }
        res.render('index', {pages: pages, error: null});
      }
    }
  });
})

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`App running on http://localhost:${port}/wiki`)
})
