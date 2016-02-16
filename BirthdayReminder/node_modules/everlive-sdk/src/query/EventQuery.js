'use strict';

var constants = require('../constants');

var EventQuery = function () {
};

function applyDataQueryParameters(eventQuery, dataQuery) {
    var queryParameters = dataQuery.getQueryParameters();
    eventQuery.filter = queryParameters.filter;
    eventQuery.fields = queryParameters.select;
    eventQuery.sort = queryParameters.sort;
    eventQuery.skip = queryParameters.skip;
    eventQuery.take = queryParameters.limit || queryParameters.take;
    eventQuery.expand = queryParameters.expand;
    eventQuery.aggregate = queryParameters.aggregate;
    return queryParameters;
}

function applyDataQuerySettings(eventQuery, dataQuery) {
    eventQuery.settings = {
        useOffline: dataQuery.useOffline,
        applyOffline: dataQuery.applyOffline,
        ignoreCache: dataQuery.ignoreCache,
        forceCache: dataQuery.forceCache
    };
}

EventQuery.fromDataQuery = function (dataQuery) {
    var eventQuery = new EventQuery();
    eventQuery.contentTypeName = dataQuery.collectionName;
    if (dataQuery.additionalOptions && dataQuery.additionalOptions.id) {
        switch (dataQuery.operation) {
            case constants.DataQueryOperations.Update:
                eventQuery.operation = constants.DataQueryOperations.UpdateById;
                break;
            case constants.DataQueryOperations.Delete:
                eventQuery.operation = constants.DataQueryOperations.DeleteById;
                break;
            default:
                eventQuery.operation = dataQuery.operation;
        }
    } else {
        eventQuery.operation = dataQuery.operation;
    }

    eventQuery.itemId = dataQuery.additionalOptions ? dataQuery.additionalOptions.id : undefined;
    eventQuery.data = dataQuery.data;

    applyDataQuerySettings(eventQuery, dataQuery);
    applyDataQueryParameters(eventQuery, dataQuery);
    eventQuery.headers = dataQuery.getHeaders();
    var powerFieldsHeader = eventQuery.headers[constants.Headers.powerFields];
    if (typeof powerFieldsHeader === 'string') {
        eventQuery.powerfields = JSON.parse(powerFieldsHeader);
    }
    eventQuery.isSync = dataQuery.isSync; // readonly

    return eventQuery;
};

EventQuery.prototype = {
    cancel: function () {
        this._cancelled = true;
    },
    isCancelled: function () {
        return this._cancelled;
    }
};

module.exports = EventQuery;