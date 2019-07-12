#!/usr/bin/env node
const fs = require('fs');
const ghpages = require('gh-pages');

var args = process.argv.slice(2);

let name;
let space;
let token;
if (args.length === 3) {
   name = args[0];
   space = args[1];
   token = args[2];
} else {
   name = 'tangram-skeleton';
   space = 'INSERT-XYZ-SPACE-ID';
   token = 'INSERT-XYZ-TOKEN';
}


const exec = require('child_process').exec;

function execute(command, callback) {
   
   exec(command, function(error, stdout, stderr){ callback(stdout); });
};




const html =
`<html lang="en-us">

<head>
   <meta charset="utf-8">
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   <title>Tangram Skeleton</title>
   <script src="https://unpkg.com/leaflet@1.0.1/dist/leaflet.js"></script>
   <script src="https://unpkg.com/tangram/dist/tangram.min.js"></script>
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.1/dist/leaflet.css" />
   <link rel="stylesheet" href="index.css">
</head>
<body>
   <div id="map"></div>
   <script src="index.js"></script>
</body>
</html>
`;

const css =
`body {
   margin: 0px;
   border: 0px;
   padding: 0px;
   font-family: sans-serif;
   color: #333;
}

#map {
   height: 100%;
   width: 100%;
   position: absolute;
}

`;

const js =
`const tangram = Tangram.leafletLayer({
   scene: 'scene.yaml',
   events: {
      click: onMapClick
   }
})
const map = L.map('map', {
   center: [47.608013, -122.335167],
   zoom: 7.5,
   layers: [tangram],
   zoomControl: false
});
map.attributionControl.addAttribution('<a href="https://here.xyz">HERE XYZ</a> | <a href="https://github.com/tangrams/tangram">Tangram</a>| <a href="https://www.openstreetmap.org/">OSM</a>');


function onMapClick () {}

`;

const yaml =
`cameras:
    camera1:
        type: perspective
global:
    token: ${token}
    language: en
    language_text_source: |
        function() {
            return (global.language && feature['name:'+global.language]) || feature.name;
        }
sources:
    xyz_osm:
        type: MVT
        url: https://xyz.api.here.com/tiles/osmbase/256/all/{z}/{x}/{y}.mvt
        max_zoom: 16
        url_params:
            access_token: global.token
    _xyz_space:
        type: GeoJSON
        url: https://xyz.api.here.com/hub/spaces/${space}/tile/web/{z}_{x}_{y}
        url_params:
            access_token: global.token
layers:
    xyz_space_lines:
        data: { source: _xyz_space}
        draw:
            lines:
                order: 10000000
                color: '#8B9ED4'
                width: 2px
                interactive: true
                collide: false
    xyz_space_points:
        data: { source: _xyz_space}
        draw:
            points:
                order: 10000000
                color: '#8B9ED4'
                size: 2px
                interactive: true
                collide: false
    places:
        data: { source: xyz_osm }
        city-points:
            filter:
                kind: locality
                kind_detail: city
                $zoom: { max: 18 }
            draw:
                 text:
                     text_source: global.language_text_source
                     priority: 10
                     order: 999
                     font:
                         family: Roboto Mono
                         fill: '#C3CDD4'
                         stroke: { color: white, width: 4 }
                         size: [[4, 15px], [8, 18px], [12, 26px]]
                         buffer: 2px
    earth:
        data: { source: xyz_osm }
        draw:
            polygons:
                order: function() { return feature.sort_rank; }
                color: 'white'

    landuse:
        data: { source: xyz_osm }
        draw:
            polygons:
                order: function() { return feature.sort_rank; }
                color: '#E9EEF1'

    water:
        data: { source: xyz_osm }
        draw:
            polygons:
                order: function() { return feature.sort_rank; }
                color: '#DEE1E3'

    roads:
        data: { source: xyz_osm }
        filter:
            not: { kind: [path, rail, ferry] }
        draw:
            lines:
                order: function() { return feature.sort_rank; }
                color: '#C3CDD4'
                width: 8
                cap: round
        highway:
            filter:
                kind: highway
            draw:
                lines:
                    order: function() { return feature.sort_rank; }
                    color: '#D3DCE1'
                    width: [[5, 5000], [8, 800], [10, 200], [12, 100],[14,40], [18, 20]]
                    outline:
                        color: '#EEEEEE'
                        width: [[16, 0], [18, 1.5]]
        minor_road:
            filter:
                kind: minor_road
            draw:
                lines:
                    order: function() { return feature.sort_rank; }
                    color: '#F8FAFB'
                    width: 5

    buildings:
        data: { source: xyz_osm }
        draw:
            polygons:
                order: function() { return feature.sort_rank; }
                color: '#E9EBEB'
        3d-buildings:
            filter: { $zoom: { min: 15 } }
            draw:
                polygons:
                    extrude: function () { return feature.height > 20 || $zoom >= 16; }

`



let command = `cd ${name}`
if (!fs.existsSync(`./xyz-maps/dist/${name}`)){
   fs.mkdirSync(`./xyz-maps/dist/${name}`, { recursive: true });
} else {
   command += ` && git init && git remote add origin https://github.com/dbabbs/xyz-maps.git`;
}

execute(command, () => {
   console.log('created git repo and added origin')
   // callback(val);

   fs.writeFile(`./xyz-maps/dist/${name}/index.html`, html, function (err) {
      if (err) throw err;
      console.log('html created');
   });
    
    fs.writeFile(`./xyz-maps/dist/${name}/index.js`, js, function (err) {
      if (err) throw err;
      console.log('javascript created');
   });
    
    fs.writeFile(`./xyz-maps/dist/${name}/index.css`, css, function (err) {
      if (err) throw err;
      console.log('css created');
   });
    
    fs.writeFile(`./xyz-maps/dist/${name}/scene.yaml`, yaml, function (err) {
      if (err) throw err;
      console.log('yaml created');
   });


   const directory = `./xyz-maps/dist`;
   const repo = `https://github.com/dbabbs/xyz-maps.git`;

   //Publish Gh pages
   ghpages.publish(directory, { repo: repo, add: true }, err => {
      if (err) {
         console.log(err);
      }
      console.log('published to gh-pages')

      execute('git add . && git commit -m "auto commit by bot" && git push origin master', () => {
         console.log('published to master')
      })
   });

   //Publish master
   // ghpages.publish(directory, { repo: repo, branch: 'master' }, err => {
   //    if (err) {
   //       console.log(err);
   //    }
   //    console.log('published')
   // });
    
});



