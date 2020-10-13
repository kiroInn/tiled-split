const convert = require('xml-js');
const fs = require('fs');
const _ = require('lodash');
const { parseLayerMeta, parseLayer } = require('./parser');
const { cpSource, mapAg, split, transform } = require('./util');

const SPLIT = { chunkCol: 1, chunkRow: 1 };
const INPUT = { name: 'D717' }
fs.mkdir(`../dist/${INPUT.name}`, { recursive: true }, err => { console.log(err) })
fs.readFile(`${INPUT.name}.tmx`, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var mapInfo = JSON.parse(convert.xml2json(data, { compact: true, spaces: 2 }));
    const layer = parseLayer(mapInfo);
    const layerMeta = parseLayerMeta(mapInfo);
    const mapMeta = {
        width: parseInt(_.get(mapInfo, 'map._attributes.width'), 10),
        height: parseInt(_.get(mapInfo, 'map._attributes.height'), 10),
        chunkCol: SPLIT.chunkCol, chunkRow: SPLIT.chunkRow
    }

    fs.writeFile(`../dist/${INPUT.name}/${INPUT.name}-cp.sh`, cpSource(layer, layerMeta), function (err) {
        if (err) return console.log(err);
        console.log('cpSource complete');
    })
    fs.writeFile(`../dist/${INPUT.name}/${INPUT.name}.mapag`, mapAg(layer, layerMeta), function (err) {
        if (err) return console.log(err);
        console.log('mapAg complete');
    })
    _.forEach(split(layer, mapMeta), (item, index) => {
        const fileName = `${INPUT.name}/${INPUT.name}` + `${index}`.padStart(3, '0')
        fs.writeFile(`../dist/${fileName}.tmx`, transform(item, layerMeta, mapMeta), function (err) {
            if (err) return console.log(err);
            console.log(`${fileName}  complete`);
        })
    })
});
