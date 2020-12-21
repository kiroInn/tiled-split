const _ = require('lodash');
const mapInfo = require('./map/index');
const splitMapJS = require('./index-js');
const splitMapTMX = require('./index-tmx');

_.forEach(mapInfo, info => {
    splitMapTMX(info)
    // splitMapJS(info)
});