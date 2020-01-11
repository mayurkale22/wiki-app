'use strict';

const { NodeTracer } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const tracer = new NodeTracer();
const exporter = new JaegerExporter({serviceName: 'my-service'});
tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

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

app.listen(3000, function () {
  console.log('App running on http://localhost:3000/wiki')
})
