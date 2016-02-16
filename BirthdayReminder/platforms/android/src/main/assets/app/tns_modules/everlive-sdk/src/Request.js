var utils = require('./utils');
var rsvp = require('./common').rsvp;
var buildAuthHeader = utils.buildAuthHeader;
var parseUtilities = utils.parseUtilities;
var guardUnset = utils.guardUnset;
var common = require('./common');
var reqwest = common.reqwest;
var _ = common._;
var Headers = require('./constants').Headers;
var isNodejs = require('./everlive.platform').isNodejs;
var Query = require('./query/Query');
var AggregateQuery = require('./query/AggregateQuery');

module.exports = (function () {
    var _self;

    // The Request type is an abstraction over Ajax libraries
    // A Request object needs information about the Everlive connection and initialization options

    function Request(setup, options) {
        guardUnset(setup, 'setup');
        guardUnset(options, 'options');
        this.setup = setup;
        this.method = null;
        this.endpoint = null;
        this.data = null;
        // TODO success and error callbacks should be uniformed for all ajax libs
        this.success = null;
        this.error = null;
        this.parse = Request.parsers.simple;

        var _headers = {};
        //make sure that the headers are always normalized
        Object.defineProperty(this, 'headers', {
            get: function () {
                return _headers;
            },
            set: function (val) {
                // If we let two identical headers with different casing slip into a request
                // the browser concatenates them which brings chaos to earth
                _headers = utils.normalizeKeys(val);
            }
        });

        _.extend(this, options);
        delete this.headers[Headers.filter];
        _self = this;
        this._init(options);
    }

    Request.prototype = {
        // Calls the underlying Ajax library
        send: function () {
            Request.sendRequest(this);
        },
        // Returns an authorization header used by the request.
        // If there is a logged in user for the Everlive instance then her/his authentication will be used.
        buildAuthHeader: buildAuthHeader,
        // Builds the URL of the target Everlive service
        buildUrl: function buildUrl() {
            var queryString = '';

            if (this.query && this.query.filter) {
                queryString = '?filter=' + JSON.stringify(this.query.filter);
            }

            return utils.buildUrl(this.setup) + this.endpoint + queryString;
        },
        // Processes the given query to return appropriate headers to be used by the request
        buildQueryHeaders: function buildQueryHeaders(query) {
            if (query && query instanceof Query) {
                return Request.prototype._buildQueryHeaders(query);
            } else {
                return {};
            }
        },
        // Initialize the Request object by using the passed options
        _init: function (options) {
            _.extend(this.headers, this.buildAuthHeader(this.setup, options), this.buildQueryHeaders(options.query));
        },
        // Translates an Everlive.Query to request headers
        _buildQueryHeaders: function (query) {
            query = query.build();
            var headers = {};

            // query filter has been moved to the URL of the request
            // in order to avoid character encoding difficulties

            if (query.$select !== null) {
                headers[Headers.select] = JSON.stringify(query.$select);
            }
            if (query.$sort !== null) {
                headers[Headers.sort] = JSON.stringify(query.$sort);
            }
            if (query.$skip !== null) {
                headers[Headers.skip] = query.$skip;
            }
            if (query.$take !== null) {
                headers[Headers.take] = query.$take;
            }
            if (query.$expand !== null) {
                headers[Headers.expand] = JSON.stringify(query.$expand);
            }
            if (query.$aggregate !== null) {
                headers[Headers.aggregate] = JSON.stringify(query.$aggregate);
            }
            return headers;
        }
    };

    var parseOnlyCompleteDateTimeString = _self && _self.setup && _self.setup.parseOnlyCompleteDateTimeObjects;

    var reviver = parseUtilities.getReviver(parseOnlyCompleteDateTimeString);

    Request.parsers = {
        simple: {
            result: parseUtilities.parseResult.bind(null, reviver),
            error: parseUtilities.parseError.bind(null, reviver)
        },
        single: {
            result: parseUtilities.parseSingleResult.bind(null, reviver),
            error: parseUtilities.parseError.bind(null, reviver)
        },
        update: {
            result: parseUtilities.parseUpdateResult.bind(null, reviver),
            error: parseUtilities.parseError.bind(null, reviver)
        }
    };

    if (typeof Request.sendRequest === 'undefined') {
        Request.sendRequest = function (request) {
            var url = request.buildUrl();
            url = utils.disableRequestCache(url, request.method);
            request.method = request.method || 'GET';
            var data = request.method === 'GET' ? request.data : JSON.stringify(request.data);

            var requestParams = {
                url: url,
                method: request.method,
                data: data,
                headers: request.headers,
                contentType: 'application/json'
            };

            if (isNodejs) {
                requestParams.success = function (data, response) {
                    request.success.call(request, request.parse.result(data), response);
                };

                requestParams.error = function (jqXHR) {
                    request.error.call(request, request.parse.error(jqXHR.responseText || jqXHR.statusText));
                };
            } else {
                requestParams.type = 'json';
                requestParams.crossOrigin = true;
                requestParams.success = function (data, textStatus, jqXHR) {
                    var result = request.parse.result(data);
                    request.success.call(request, result);
                };

                requestParams.error = function (jqXHR, textStatus, errorThrown) {
                    var error = request.parse.error(jqXHR.responseText || jqXHR.statusText);
                    request.error.call(request, error);
                };
            }

            reqwest(requestParams);
        };
    }

    return Request;
}());