const _ = require('lodash');

function parseLayerMeta(mapInfo) {
    const tileset = _.sortBy(_.get(mapInfo, 'map.tileset'), tile => parseInt(_.get(tile, '_attributes.firstgid'), 10))
    const gids = _.map(tileset, tile => parseInt(_.get(tile, '_attributes.firstgid'), 10));
    const layerMeta = _.map(_.isArray(tileset) ? tileset : [tileset], (tile, index) => {
        const { firstgid, source } = _.has(tile, '_attributes') ? tile._attributes : tile;
        const max = index === gids.length - 1 ? 999999 : gids[index + 1]
        const newSource = source.replace('.tsx', '').toLowerCase();
        return { min: parseInt(firstgid, 10), max: max, source: newSource, from: source }
    })
    return layerMeta;
}

function parseLayer(mapInfo) {
    const map = _.get(mapInfo, 'map');
    const layers = _.map(_.isArray(map.layer) ? map.layer : [map.layer], item => {
        const matrix = _.get(item, 'data._text').trim().replace(/\n/g, '')
        return {
            name: _.get(item, '_attributes.name'),
            matrix: matrix.split(',').map(item => parseInt(item, 10)),
        }
    })
    return layers.filter(layer => _.some(layer.matrix, item =>  item !== 0));
}

module.exports = {
    parseLayerMeta: parseLayerMeta,
    parseLayer: parseLayer
}