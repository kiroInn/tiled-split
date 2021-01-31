const convert = require('xml-js');
const fs = require('fs');
const _ = require('lodash');
const { parseLayerMeta, parseLayer } = require('./parser');
const { cpSource, mapAg, split, transform } = require('./util');
const { extract } = require('./extract');
function splitMap(SPLIT) {
    const namePrefix = SPLIT.name.toLowerCase()
    fs.mkdirSync(`../dist/${namePrefix}`, { recursive: true })
    fs.readFile(`map/${namePrefix}.tmx`, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        let mapInfo = JSON.parse(convert.xml2json(data, { compact: true, spaces: 2 }));
        if (SPLIT.isExtract) {
            mapInfo = extract(mapInfo, SPLIT);
            // console.log(mapInfo)
        }
        let layer = parseLayer(mapInfo);
        const layerMeta = parseLayerMeta(mapInfo);
        const mapMeta = {
            width: parseInt(_.get(mapInfo, 'map._attributes.width'), 10),
            height: parseInt(_.get(mapInfo, 'map._attributes.height'), 10),
            chunkCol: SPLIT.chunkCol, chunkRow: SPLIT.chunkRow
        }
        fs.writeFile(`../dist/${namePrefix}/${namePrefix}-cp.sh`, cpSource(layer, layerMeta), function (err) {
            if (err) return console.log(err);
        })
        fs.writeFile(`../dist/${namePrefix}/${namePrefix}.mapag`, mapAg(layer, mapMeta), function (err) {
            if (err) return console.log(err);
        })
        const splitLayers = split(layer, mapMeta);
        _.forEach(_.flatten(_.chunk(splitLayers, SPLIT.chunkCol).reverse()), (item, index) => {
            const fileName = `${namePrefix}/${namePrefix}` + `${index}`.padStart(6, '0')
            fs.writeFile(`../dist/${fileName.toLowerCase()}.tmx`, transform(item, layerMeta, mapMeta), function (err) {
                if (err) return console.log(err);
                console.log('done', fileName.toLowerCase())
            })
        })
    });
}
module.exports = splitMap;