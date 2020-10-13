const _ = require('lodash');

function parseLayerMeta(mapInfo) {
    const tileset = _.sortBy(_.get(mapInfo, 'map.tileset'), tile => parseInt(_.get(tile, '_attributes.firstgid'), 10))
    const gids = _.map(tileset, tile => parseInt(_.get(tile, '_attributes.firstgid'), 10));
    const layerMeta = _.map(tileset, ({ _attributes }, index) => {
        const { firstgid, source } = _attributes;
        const max = index === gids.length - 1 ? 999999 : gids[index + 1]
        const newSource = source.replace('.tsx', '').toLowerCase();
        return { min: parseInt(firstgid, 10), max: max, source: newSource, from: source }
    })
    console.log(layerMeta)
    return layerMeta;
}

function parseLayer(mapInfo) {
    const map = _.get(mapInfo, 'map');
    const layers = _.map(map.layer, item => {
        const matrix = _.get(item, 'data._text').trim().replace(/\n/g, '')
        return {
            name: _.get(item, '_attributes.name'),
            matrix: matrix.split(',').map(item => parseInt(item, 10)),
        }
    })
    return layers;
}

module.exports = {
    parseLayerMeta: parseLayerMeta,
    parseLayer: parseLayer
}