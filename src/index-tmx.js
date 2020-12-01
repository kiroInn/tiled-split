const convert = require('xml-js');
const fs = require('fs');
const _ = require('lodash');
const { parseLayerMeta, parseLayer } = require('./parser');
const { cpSource, mapAg, split, transform } = require('./util');
const SPLIT = { chunkCol: 2, chunkRow: 2 };
const INPUT = { name: 'd515' }

fs.rmdirSync(`../dist/${INPUT.name}`, { recursive: true })
fs.mkdirSync(`../dist/${INPUT.name}`, { recursive: true })
fs.readFile(`map/${INPUT.name}.tmx`, 'utf8', function (err, data) {
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
    fs.writeFile(`../dist/${INPUT.name}/${INPUT.name}.mapag`, mapAg(layer, mapMeta), function (err) {
        if (err) return console.log(err);
        console.log('mapAg complete');
    })
    const splitLayers = split(layer, mapMeta);
    _.forEach(_.flatten(_.chunk(splitLayers, SPLIT.chunkCol).reverse()), (item, index) => {
        const fileName = `${INPUT.name}/${INPUT.name}` + `${index}`.padStart(6, '0')
        fs.writeFile(`../dist/${fileName.toLowerCase()}.tmx`, transform(item, layerMeta, mapMeta), function (err) {
            if (err) return console.log(err);
            console.log(`${fileName}  complete`);
        })
    })
});
