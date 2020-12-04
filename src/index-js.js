const convert = require('xml-js');
const fs = require('fs');
const _ = require('lodash');
const { parseLayerMeta, parseLayer } = require('./parser');
const { cpSource, mapAg, split, transformJS } = require('./util');



function splitMap(SPLIT) {
    fs.mkdirSync(`../dist/${SPLIT.name}`, { recursive: true })
    fs.readFile(`map/${SPLIT.name}.tmx`, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var mapInfo = JSON.parse(convert.xml2json(data, { compact: true, spaces: 2 }));
        let layer = parseLayer(mapInfo);
        const layerMeta = parseLayerMeta(mapInfo);
        const mapMeta = {
            width: parseInt(_.get(mapInfo, 'map._attributes.width'), 10),
            height: parseInt(_.get(mapInfo, 'map._attributes.height'), 10),
            chunkCol: SPLIT.chunkCol, chunkRow: SPLIT.chunkRow
        }
        fs.writeFile(`../dist/${SPLIT.name}/${SPLIT.name}-cp.sh`, cpSource(layer, layerMeta), function (err) {
            if (err) return console.log(err);
        })
        fs.writeFile(`../dist/${SPLIT.name}/${SPLIT.name}.mapag`, mapAg(layer, mapMeta), function (err) {
            if (err) return console.log(err);
        })
        layer = _.filter(layer, item => item.name !== 'obj');
        const splitLayers = split(layer, mapMeta);
        _.forEach(_.flatten(_.chunk(splitLayers, SPLIT.chunkCol).reverse()), (item, index) => {
            const fileName = `${SPLIT.name}/${SPLIT.name}` + `${index}`.padStart(6, '0')
            fs.writeFile(`../dist/${fileName.toLowerCase()}.json`, transformJS(item, layerMeta, mapMeta), function (err) {
                if (err) return console.log(err);
            })
        })
    });
}
module.exports = splitMap;

// const result = _.flatten(_.map(layers, layer => {
//     const newValues = _.flatten(_.chunk(layer.values, width).map((value, row) => {
//         return _.map(value, (item, column) => {
//             const { source, width, height } = item === 0 ? tilesets[0]: _.find(tilesets, tile => tile.id === item - 1);
//             return { id: item, src: source, x: column * 48, y: row * 32 + (32 - height) +  offsetHeight}
//         })
//     }));
//     return {
//         name: layer.name,
//         values: _.flatten(_.chunk(newValues, width).reverse()).filter(item => item.src)
//     }
// }).map(layer => layer.values))
