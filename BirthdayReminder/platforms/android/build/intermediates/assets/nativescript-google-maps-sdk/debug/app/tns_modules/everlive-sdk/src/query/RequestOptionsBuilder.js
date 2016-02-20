var DataQuery = require('./DataQuery');
var Request = require('../Request');
var _ = require('../common')._;
var constants = require('../constants');

module.exports = (function () {
    var RequestOptionsBuilder = {};

    RequestOptionsBuilder._buildEndpointUrl = function (dataQuery) {
        var endpoint = dataQuery.collectionName;
        if (dataQuery.additionalOptions && dataQuery.additionalOptions.id !== undefined) {
            endpoint += '/' + dataQuery.additionalOptions.id;
        }

        return endpoint;
    };

    RequestOptionsBuilder._buildBaseObject = function (dataQuery) {
        var defaultObject = {
            endpoint: RequestOptionsBuilder._buildEndpointUrl(dataQuery),
            query: dataQuery.query,
            success: dataQuery.onSuccess,
            error: dataQuery.onError,
            data: dataQuery.data,
            headers: dataQuery.headers
        };

        if (dataQuery.parse) {
            defaultObject.parse = dataQuery.parse;
        }

        return defaultObject;
    };

    RequestOptionsBuilder._build = function (dataQuery, additionalOptions) {
        return _.extend(RequestOptionsBuilder._buildBaseObject(dataQuery), additionalOptions);
    };

    RequestOptionsBuilder[DataQuery.operations.Read] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'GET'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.ReadById] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'GET'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.Count] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'GET',
            endpoint: dataQuery.collectionName + '/_count'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.Create] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.RawUpdate] = function (dataQuery) {
        var endpoint = dataQuery.collectionName;
        var query = dataQuery.query;
        var ofilter = null; // request options filter

        if (typeof query === 'string') {
            endpoint += '/' + query; // send the filter as string
        } else if (typeof query === 'object') {
            ofilter = query; // send the filter as filter headers
        }

        return RequestOptionsBuilder._build(dataQuery, {
            method: 'PUT',
            endpoint: endpoint,
            query: ofilter
        });
    };

    RequestOptionsBuilder[DataQuery.operations.Update] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'PUT'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.Delete] = function (dataQuery) {
        return _.extend(RequestOptionsBuilder._buildBaseObject(dataQuery), {
            method: 'DELETE'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.DeleteById] = RequestOptionsBuilder[DataQuery.operations.Delete];

    RequestOptionsBuilder[DataQuery.operations.SetAcl] = function (dataQuery) {
        var endpoint = dataQuery.collectionName;
        var query = dataQuery.query;

        if (typeof query === 'string') { // if query is string than will update a single item using the query as an identifier
            endpoint += '/' + query;
        } else if (typeof query === 'object') { // else if it is an object than we will use it's id property
            endpoint += '/' + query[constants.idField];
        }
        endpoint += '/_acl';
        var method, data;
        if (dataQuery.additionalOptions.acl === null) {
            method = 'DELETE';
        } else {
            method = 'PUT';
            data = dataQuery.additionalOptions.acl;
        }

        return RequestOptionsBuilder._build(dataQuery, {
            method: method,
            endpoint: endpoint,
            data: data
        });
    };

    RequestOptionsBuilder[DataQuery.operations.SetOwner] = function (dataQuery) {
        var endpoint = dataQuery.collectionName;
        var query = dataQuery.query;
        if (typeof query === 'string') { // if query is string than will update a single item using the query as an identifier
            endpoint += '/' + query;
        } else if (typeof query === 'object') { // else if it is an object than we will use it's id property
            endpoint += '/' + query[constants.idField];
        }
        endpoint += '/_owner';

        return RequestOptionsBuilder._build(dataQuery, {
            method: 'PUT',
            endpoint: endpoint
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserLogin] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            endpoint: 'oauth/token',
            authHeaders: false,
            parse: Request.parsers.single
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserLogout] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'GET',
            endpoint: 'oauth/logout'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserChangePassword] = function (dataQuery) {
        var keepTokens = dataQuery.additionalOptions.keepTokens;
        var endpoint = 'Users/changepassword';
        if (keepTokens) {
            endpoint += '?keepTokens=true';
        }

        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            endpoint: endpoint,
            parse: Request.parsers.single
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserLoginWithProvider] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            authHeaders: false
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserLinkWithProvider] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            endpoint: RequestOptionsBuilder._buildEndpointUrl(dataQuery) + '/link'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserUnlinkFromProvider] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            endpoint: RequestOptionsBuilder._buildEndpointUrl(dataQuery) + '/unlink'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserResetPassword] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            endpoint: RequestOptionsBuilder._buildEndpointUrl(dataQuery) + '/resetpassword'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.UserSetPassword] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'POST',
            endpoint: RequestOptionsBuilder._buildEndpointUrl(dataQuery) + '/setpassword'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.FilesUpdateContent] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'PUT',
            endpoint: RequestOptionsBuilder._buildEndpointUrl(dataQuery) + '/Content'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.FilesGetDownloadUrlById] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'GET'
        });
    };

    RequestOptionsBuilder[DataQuery.operations.Aggregate] = function (dataQuery) {
        return RequestOptionsBuilder._build(dataQuery, {
            method: 'GET',
            endpoint: dataQuery.collectionName + '/_aggregate'
        });
    };

    return RequestOptionsBuilder;
}());