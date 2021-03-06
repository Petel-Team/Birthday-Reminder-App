var buildPromise = require('../utils').buildPromise;
var constants = require('../constants');
var idField = constants.idField;
var DataQuery = require('../query/DataQuery');
var RequestOptionsBuilder = require('../query/RequestOptionsBuilder');
var rsvp = require('../common').rsvp;
var Request = require('../Request');
var Everlive = require('../Everlive');
var EverliveError = require('../EverliveError').EverliveError;
var EverliveErrors = require('../EverliveError').EverliveErrors;
var EventQuery = require('../query/EventQuery');
var platform = require('../everlive.platform');
var everlivePlatform = platform.platform;
var _ = require('../common')._;
var utils = require('../utils');
var Query = require('../query/Query');

var beforeExecuteAllowedOperations = [
    constants.DataQueryOperations.Count,
    constants.DataQueryOperations.Read,
    constants.DataQueryOperations.Create,
    constants.DataQueryOperations.Update,
    constants.DataQueryOperations.UpdateById,
    constants.DataQueryOperations.Delete,
    constants.DataQueryOperations.DeleteById,
    constants.DataQueryOperations.ReadById,
    constants.DataQueryOperations.Aggregate,
    constants.DataQueryOperations.RawUpdate
];

module.exports = (function () {
    function mergeResultData(data, success) {
        return function (res, response) {
            var attrs = res.result;
            // support for kendo observable array
            if (_.isArray(data) || typeof data.length === 'number') {
                _.each(data, function (item, index) {
                    _.extend(item, attrs[index]);
                });
            } else {
                _.extend(data, attrs);
            }

            success(res, response);
        };
    }

    function mergeUpdateResultData(data, success) {
        return function (res) {
            var modifiedAt = res.ModifiedAt;
            data.ModifiedAt = modifiedAt;
            success(res);
        };
    }

    /**
     * @class Data
     * @classdesc A class that provides methods for all CRUD operations to a given {{site.bs}} data type. Covers advanced scenarios with custom headers and special server-side functionality.
     * @param {object} setup
     * @param {string} collectionName
     * @protected
     */
    function Data(setup, collectionName, offlineStorage, everlive) {
        this.setup = setup;
        this.collectionName = collectionName;
        this.options = null;
        this.offlineStorage = offlineStorage;
        this.everlive = everlive;
    }

    Data.prototype = {
        _isOnline: function () {
            return this.offlineStorage ? this.offlineStorage.isOnline() : true;
        },

        _getOfflineCreateData: function (query, requestResponse) {
            var createData;
            if (_.isArray(query.data)) {
                createData = [];
                for (var i = 0; i < query.data.length; i++) {
                    var objectToCreate = _.extend(query.data[i], requestResponse.result[i]);
                    createData.push(objectToCreate)
                }
            } else {
                createData = _.extend(query.data, requestResponse.result);
            }

            return createData;
        },
        _applyOffline: function (query, requestResponse) {
            var autoSyncEnabled = this.offlineStorage && this.offlineStorage.setup.autoSync;
            if (autoSyncEnabled) {
                switch (query.operation) {
                    case DataQuery.operations.Read:
                    case DataQuery.operations.ReadById:
                    case DataQuery.operations.FilesGetDownloadUrlById:
                        var syncReadQuery = new DataQuery(_.defaults({
                            data: requestResponse.result,
                            isSync: true,
                            operation: DataQuery.operations.Create
                        }, query));
                        return this.offlineStorage.processQuery(syncReadQuery);
                    case DataQuery.operations.Create:
                        var createData = this._getOfflineCreateData(query, requestResponse);
                        var createQuery = new DataQuery(_.defaults({
                            data: createData,
                            isSync: true
                        }, query));
                        return this.offlineStorage.processQuery(createQuery);
                    case DataQuery.operations.Update:
                    case DataQuery.operations.RawUpdate:
                        query.isSync = true;
                        query.ModifiedAt = requestResponse.ModifiedAt;
                        return this.offlineStorage.processQuery(query);
                    default:
                        query.isSync = true;
                        return this.offlineStorage.processQuery(query);
                }
            }

            return new rsvp.Promise(function (resolve) {
                resolve();
            });
        },

        _setOption: function (key, value) {
            this.options = this.options || {};
            if (_.isObject(value)) {
                this.options[key] = _.extend({}, this.options[key], value);
            } else {
                this.options[key] = value;
            }
            return this;
        },
        _generateQueryFromFilter: function (filterOrQuery) {
            if (filterOrQuery instanceof Query) {
                return filterOrQuery;
            } else {
                return new Query(filterOrQuery);
            }
        },

    /**
         * Modifies whether the query should be invoked on the offline storage.
         * @memberOf Data.prototype
         * @method useOffline
         * @name useOffline
         * @param {boolean} [useOffline]
         * @returns {Data} Returns the same instance of the Data object.
         */
        useOffline: function (useOffline) {
            if (arguments.length !== 1) {
                throw new Error('A single value is expected in useOffline() query modifier');
            }
            return this._setOption('useOffline', useOffline);
        },

        /**
         * Does not use the cache when retrieving the data.
         * Only valid when caching is enabled.
         * @memberOf Data.prototype
         * @method ignoreCache
         * @name ignoreCache
         * @returns {Data}
         * */
        ignoreCache: function () {
            return this._setOption('ignoreCache', true);
        },

        /**
         * Forces the request to get the data from the cache even if the data is already expired.
         * Only valid when caching is enabled.
         * @memberOf Data.prototype
         * @method forceCache
         * @name forceCache
         * @returns {Data}
         * */
        forceCache: function () {
            return this._setOption('forceCache', true);
        },

        /**
         * Sets cache expiration specifically for the current query.
         * Only valid when caching is enabled.
         * @memberOf Data.prototype
         * @method maxAge
         * @name maxAge
         * @param maxAgeInMinutes
         * @returns {Data}
         * */
        maxAge: function (maxAgeInMinutes) {
            var maxAge = maxAgeInMinutes * 1000 * 60;
            return this._setOption('maxAge', maxAge);
        },

        isSync: function (isSync) {
            if (arguments.length !== 1) {
                throw new Error('A single value is expected in isSync() query modifier');
            }
            return this._setOption('isSync', isSync);
        },

        /**
         * Modifies whether the query should try to authenticate if the security token has expired.
         * Default is false.
         * Only valid when the authentication module has an onAuthenticationRequired function.
         * @memberOf Data.prototype
         * @method skipAuth
         * @param skipAuth
         * @returns {Data}
         * */
        skipAuth: function (skipAuth) {
            if (arguments.length !== 1) {
                throw new Error('A single value is expected in skipAuth() query modifier');
            }
            return this._setOption('skipAuth', skipAuth);
        },

        /**
         * Modifies whether the query should be applied offline, if the sdk is currenty working online.
         * Default is true.
         * Only valid when offlineStorage is enabled.
         * @memberOf Data.prototype
         * @method applyOffline
         * @param applyOffline
         * @returns {Data}
         * */
        applyOffline: function (applyOffline) {
            if (arguments.length !== 1) {
                throw new Error('A single value is expected in applyOffline() query modifier');
            }
            return this._setOption('applyOffline', applyOffline);
        },

        /**
         * Sets additional non-standard HTTP headers in the current data request. See [List of Request Parameters](http://docs.telerik.com/platform/backend-services/rest/apireference/RESTfulAPI/custom_headers) for more information.
         * @memberOf Data.prototype
         * @method withHeaders
         * @param {object} headers Additional headers to be sent with the data request.
         * @returns {Data}
         */
        withHeaders: function (headers) {
            return this._setOption('headers', headers);
        },
        /**
         * Sets an expand expression to be used in the data request. This allows you to retrieve complex data sets using a single query based on relations between data types.
         * @memberOf Data.prototype
         * @method expand
         * @param {object} expandExpression An [expand expression](http://docs.telerik.com/platform/backend-services/rest/data/relations/relations-defining) definition.
         * @returns {Data}
         */
        expand: function (expandExpression) {
            var expandHeader = {
                'X-Everlive-Expand': JSON.stringify(expandExpression)
            };
            return this.withHeaders(expandHeader);
        },

        _applyQueryOffline: function (query) {
            var self = this;

            if (!query.applyOffline) {
                query.onError.call(this, new EverliveError('The applyOffline must be true when working offline.'));
            } else {
                self.offlineStorage.processQuery(query)
                    .then(function () {
                        query.onSuccess.apply(this, arguments);
                    }, function (err) {
                        if (!err.code) {
                            err = new EverliveError(err.message, EverliveErrors.generalDatabaseError.code);
                        }
                        query.onError.call(this, err);
                    });
            }
        },

        _sendRequest: function (query, online) {
            var self = this;

            var originalSuccess = query.onSuccess;
            query.onSuccess = function () {
                var args = arguments;
                var data = args[0];

                if (query.applyOffline) {
                    return self._applyOffline(query, data)
                        .then(function () {
                            originalSuccess.apply(this, args);
                        }, function (err) {
                            var notSupported = EverliveErrors.operationNotSupportedOffline.code;
                            var notFound = EverliveErrors.itemNotFound.code;

                            if (online && (err.code === notSupported || err.code === notFound)) {
                                originalSuccess.apply(this, args);
                            } else {
                                query.onError.apply(this, arguments);
                            }
                        });
                } else {
                    return originalSuccess.apply(this, args);
                }
            };

            var getRequestOptionsFromQuery = RequestOptionsBuilder[query.operation];
            var requestOptions = getRequestOptionsFromQuery(query);
            this._setAdditionalHeaders(query, requestOptions);
            var request = new Request(this.setup, requestOptions);
            request.send();
        },

        _applyQueryOnline: function (query) {
            if (query.useCache) {
                this.everlive.cache._cacheDataQuery(query);
            } else {
                this._sendRequest(query, true);
            }
        },

        _setAdditionalHeaders: function (query, requestOptions) {
            if (query.isSync) {
                requestOptions.headers[constants.Headers.sync] = true;
            }

            var sdkHeaderValue = {
                sdk: 'js',
                platform: everlivePlatform
            };

            requestOptions.headers[constants.Headers.sdk] = JSON.stringify(sdkHeaderValue);
        },

        processDataQuery: function (query) {            
            var self = this;

            var offlineStorageEnabled = this.everlive._isOfflineStorageEnabled();
            query.useOffline = offlineStorageEnabled ? !this.everlive.isOnline() : false;

            if (this.options) {
                query = _.defaults(this.options, query);
            }
            
            var isCachingEnabled = (this.everlive.setup.caching === true || (this.everlive.setup.caching && this.everlive.setup.caching.enabled));
            var isSupportedInOffline = utils.isQuerySupportedOffline(query);

            query.useCache = isCachingEnabled && !query.isSync && isSupportedInOffline;
            query.applyOffline = query.applyOffline !== undefined ? query.applyOffline : offlineStorageEnabled || query.useCache;

            if (!query.useCache && query.forceCache) {
                return query.onError.call(this, new EverliveError(EverliveErrors.cannotForceCacheWhenDisabled));
            }

            this.options = null;
            if (!query.skipAuth && this.everlive.authentication && this.everlive.authentication.isAuthenticationInProgress()) {
                query.onError = _.wrap(query.onError, function (errorFunc, err) {
                    if (err.code === EverliveErrors.invalidToken.code || err.code === EverliveErrors.expiredToken.code) {
                        var whenAuthenticatedPromise = self.everlive.authentication._ensureAuthentication();
                        if (!query.noRetry) {
                            whenAuthenticatedPromise.then(function () {
                                if (query.headers && query.headers.authorization) {
                                    //at this stage if a token is used for authentication it is already invalidated
                                    //we need to set the new one to the query
                                    var authHeader = utils.buildAuthHeader(self.everlive.setup);
                                    _.extend(query.headers, authHeader);
                                }

                                return self.processDataQuery(query);
                            });
                        }
                    } else {
                        errorFunc.call(self, err);
                    }
                });

                //if we are currently authenticating, queue the data query after we have logged in
                if (self.everlive.authentication.isAuthenticating()) {
                    var whenAuthenticatedPromise = self.everlive.authentication._ensureAuthentication();
                    if (!query.noRetry) {
                        whenAuthenticatedPromise.then(function () {
                            return self.processDataQuery(query);
                        });
                    }

                    return whenAuthenticatedPromise;
                }
            }

            if (_.contains(beforeExecuteAllowedOperations, query.operation)) {
                var eventQuery = EventQuery.fromDataQuery(query);
                this.everlive._emitter.emit(constants.Events.BeforeExecute, eventQuery);
                if (eventQuery.isCancelled()) {
                    return;
                }

                query.applyEventQuery(eventQuery);
            }
            
            var canUseOffline = undefined;
            if (utils.isContentType.files(query.collectionName) && platform.isDesktop) {
                var op = query.operation;
                
                if (query.useOffline && query.applyOffline && (op === DataQuery.operations.Create || op === DataQuery.operations.Update)) {
                    return query.onError.call(this, new EverliveError(EverliveErrors.filesNotSupportedInBrowser));
                }
                
                var isDesktopFilesOpSupported = op === DataQuery.operations.Read ||
                    op === DataQuery.operations.ReadById ||
                    op === DataQuery.operations.FilesGetDownloadUrlById ||
                    op === DataQuery.operations.Delete ||
                    op === DataQuery.operations.DeleteById;
                
                canUseOffline = query.useOffline && isDesktopFilesOpSupported;
            } else {
                canUseOffline = query.useOffline;
            }
                  
            if ((!query.isSync && this.offlineStorage && this.offlineStorage.isSynchronizing())) {
                query.onError.call(this, new EverliveError(EverliveErrors.syncInProgress));
            } else if (canUseOffline) {
                this._applyQueryOffline(query);
            } else {
                this._applyQueryOnline(query);
            }
        },
        // TODO implement options: { requestSettings: { executeServerCode: false } }. power fields queries could be added to that options argument
        /**
         * Gets all data items that match the filter. This allows you to retrieve a subset of the items based on various filtering criteria.
         * @memberOf Data.prototype
         * @method get
         * @name get
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Gets all data items that match the filter. This allows you to retrieve a subset of the items based on various filtering criteria.
         * @memberOf Data.prototype
         * @method get
         * @name get
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        get: function (filterOrQuery, success, error) {
            var self = this;

            return buildPromise(function (successCb, errorCb) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.Read,
                    collectionName: self.collectionName,
                    query: self._generateQueryFromFilter(filterOrQuery),
                    onSuccess: successCb,
                    onError: errorCb
                });

                return self.processDataQuery(dataQuery);
            }, success, error);
        },
        // TODO handle options
        // TODO think to pass the id as a filter

        /**
         * Gets a data item by ID.
         * @memberOf Data.prototype
         * @method getById
         * @name getById
         * @param {string} id ID of the item.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Gets an item by ID.
         * @memberOf Data.prototype
         * @method getById
         * @name getById
         * @param {string} id ID of the item.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         * */
        getById: function (id, success, error) {
            var self = this;

            return buildPromise(function (successCb, errorCb) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.ReadById,
                    collectionName: self.collectionName,
                    parse: Request.parsers.single,
                    additionalOptions: {
                        id: id
                    },
                    onSuccess: successCb,
                    onError: errorCb
                });


                return self.processDataQuery(dataQuery);
            }, success, error);
        },
        /**
         *  A fluent API aggregation / grouping data from server. Can accept aggregationExpression or fluent chaining rules.
         * @memberOf Data.prototype
         * @method aggregate
         * @name aggregate
         * @param {object} GroupBy fields / Aggregation functions [aggregationExpression].
         * @returns {Promise} The promise for the request.
         */
        /**
         *  A fluent API aggregation / grouping data from server. Can accept aggregationExpression or fluent chaining rules.
         * @memberOf Data.prototype
         * @method aggregate
         * @name aggregate
         * @param {object} GroupBy fields / Aggregation functions [aggregationExpression].
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         * */

        aggregate: function (aggregateQuery, success, error) {
            var self = this;

            return buildPromise(function (successCb, errorCb) {
                var aggrDataQuery = new DataQuery({
                    operation: constants.DataQueryOperations.Aggregate,
                    query: aggregateQuery,
                    collectionName: self.collectionName,
                    parse: Request.parsers.single,
                    onSuccess: successCb,
                    onError: errorCb
                });
                return self.processDataQuery(aggrDataQuery);
            }, success, error);
        },

        /**
         * Gets the count of the data items that match the filter.
         * @memberOf Data.prototype
         * @method count
         * @name count
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Gets the count of the items that match the filter.
         * @memberOf Data.prototype
         * @method count
         * @name count
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        count: function (filterOrQuery, success, error) {
            var self = this;

            return buildPromise(function (sucessCb, errorCb) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.Count,
                    collectionName: self.collectionName,
                    query: self._generateQueryFromFilter(filterOrQuery),
                    parse: Request.parsers.single,
                    onSuccess: sucessCb,
                    onError: errorCb
                });
                return self.processDataQuery(dataQuery);
            }, success, error);
        },

        /**
         * Creates a data item.
         * @memberOf Data.prototype
         * @method create
         * @name create
         * @param {object|object[]} data Item or items that will be created.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Creates an item.
         * @memberOf Data.prototype
         * @method create
         * @name create
         * @param {object|object[]} data The item or items that will be created.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        create: function (data, success, error) {
            var self = this;

            return buildPromise(function (success, error) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.Create,
                    collectionName: self.collectionName,
                    data: data,
                    parse: Request.parsers.single,
                    onSuccess: mergeResultData(data, success),
                    onError: error
                });

                return self.processDataQuery(dataQuery);
            }, success, error);
        },
        /**
         * Updates all objects that match a filter with the specified update expression.
         * @memberOf Data.prototype
         * @method rawUpdate
         * @name rawUpdate
         * @param {object} updateObject Update object that contains the new values.
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Updates all objects that match a filter with the specified update expression.
         * @memberOf Data.prototype
         * @method rawUpdate
         * @name rawUpdate
         * @param {object} updateObject Update object that contains the new values.
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        /**
         * Updates an object by ID with the specified update expression.
         * @memberOf Data.prototype
         * @method rawUpdate
         * @name rawUpdate
         * @param {object} updatedObject Updated object that contains the new values.
         * @param {string} id The ID of the item.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Updates an object by ID with the specified update expression.
         * @memberOf Data.prototype
         * @method rawUpdate
         * @name rawUpdate
         * @param {object} updateObject Updated object that contains the new values.
         * @param {string} id The ID of the item.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        rawUpdate: function (attrs, filter, success, error) {
            var self = this;

            return buildPromise(function (success, error) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.RawUpdate,
                    collectionName: self.collectionName,
                    parse: Request.parsers.update,
                    query: filter,
                    data: attrs,
                    onSuccess: success,
                    onError: error
                });
                return self.processDataQuery(dataQuery);
            }, success, error);
        },
        // TODO: Check if there is a case in which replace = true is passed to this function
        _update: function (attrs, filterOrQuery, single, replace, success, error) {
            var self = this;

            return buildPromise(function (success, error) {
                var data = {};
                data[replace ? '$replace' : '$set'] = attrs;

                // if the update is for a single item - merge the update result and add the ModifiedAt field to the result
                var onSuccess = single ? mergeUpdateResultData(attrs, success) : success;

                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.Update,
                    collectionName: self.collectionName,
                    parse: Request.parsers.update,
                    query: self._generateQueryFromFilter(filterOrQuery),
                    data: data,
                    additionalOptions: {
                        id: single ? attrs[idField] : undefined
                    },
                    onSuccess: onSuccess,
                    onError: error
                });
                return self.processDataQuery(dataQuery);
            }, success, error);
        },

        /**
         * Updates a single data item. This operation takes an object that specifies both the data item to be updated and the updated values.
         * @memberOf Data.prototype
         * @method updateSingle
         * @name updateSingle
         * @param {object} item The item that will be updated. Note: the ID property of the item will be used to determine which item will be updated.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Updates the provided item.
         * @memberOf Data.prototype
         * @method updateSingle
         * @name updateSingle
         * @param {object} model The item that will be updated. Note: the ID property of the item will be used to determine which item will be updated.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        updateSingle: function (model, success, error) {
            var err = this._validateIdForModel(model);
            if (err) {
                return buildPromise(function (success, error) {
                    return error(err);
                }, success, error);
            }
            return this._update(model, null, true, false, success, error);
        },

        _validateIdForModel: function (model, isDestroy) {
            // validation for destroySingle('id-as-string') scenario
            if (((typeof model === 'string' && model !== '') || typeof model === 'number') && isDestroy) {
                return;
            }

            if (!model || model.Id === undefined || model.Id === null || model.Id === '') {
                return new EverliveError(EverliveErrors.invalidId)
            }
        },

        /**
         * Updates all items that match a filter with the specified update object.
         * @memberOf Data.prototype
         * @method update
         * @name update
         * @param {object} updateObject The update object.
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Updates all items that match the filter with the specified update object.
         * @memberOf Data.prototype
         * @method update
         * @name update
         * @param {object} model The update object.
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        update: function (model, filter, success, error) {
            return this._update(model, filter, false, false, success, error);
        },
        _destroy: function (attrs, filterOrQuery, single, success, error) {
            var self = this;

            return buildPromise(function (success, error) {
                // for support of destroySingle using string id
                var idField = (attrs && typeof attrs === 'object') ? attrs[constants.idField] : attrs;

                var dataQuery = new DataQuery({
                    operation: single ? DataQuery.operations.DeleteById : DataQuery.operations.Delete,
                    collectionName: self.collectionName,
                    query: self._generateQueryFromFilter(filterOrQuery),
                    onSuccess: success,
                    onError: error,
                    additionalOptions: {
                        id: single ? idField : undefined
                    }
                });
                return self.processDataQuery(dataQuery);
            }, success, error);
        },

        /**
         * Deletes a single data item by ID.
         * @memberOf Data.prototype
         * @method destroySingle
         * @name destroySingle
         * @param {string} itemId The ID of the item to delete.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Deletes a single data item by ID.
         * @memberOf Data.prototype
         * @method destroySingle
         * @name destroySingle
         * @param {string} itemId The ID of the item to delete.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        /**
         * Deletes a single data item by ID.
         * @memberOf Data.prototype
         * @method destroySingle
         * @name destroySingle
         * @param {object} item Object containing the item ID to be deleted.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Deletes a single data item by ID.
         * @memberOf Data.prototype
         * @method destroySingle
         * @name destroySingle
         * @param {object} model Object containing the item ID to be deleted.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        destroySingle: function (model, success, error) {
            var err = this._validateIdForModel(model, true);
            if (err) {
                return buildPromise(function (success, error) {
                    return error(err);
                }, success, error);
            }

            return this._destroy(model, null, true, success, error);
        },

        /**
         * Deletes all data items that match a filter.
         * @memberOf Data.prototype
         * @method destroy
         * @name destroy
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Deletes all items that match the filter.
         * @memberOf Data.prototype
         * @method destroy
         * @name destroy
         * @param {object|null} filter A [filter expression](http://docs.telerik.com/platform/backend-services/rest/queries/queries-filtering) definition.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        destroy: function (filter, success, error) {
            return this._destroy(null, filter, false, success, error);
        },

        /**
         * Sets the Access Control List (ACL) of a specified data item.
         * @memberOf Data.prototype
         * @method setAcl
         * @name setAcl
         * @param {object} acl The acl object.
         * @param {object} item The item whose ACL will be updated. Note: the ID property of the item will be used to determine which item will be updated.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Sets the Access Control List (ACL) of a specified data item.
         * @memberOf Data.prototype
         * @method setAcl
         * @name setAcl
         * @param {object} acl The acl object.
         * @param {object} item The item whose ACL will be updated. Note: the ID property of the item will be used to determine which item will be updated.
         * @param {object} operationParameters An object that accepts operation parameters.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        /**
         * Sets the Access Control List (ACL) of a specified data item.
         * @memberOf Data.prototype
         * @method setAcl
         * @name setAcl
         * @param {object} acl The acl object.
         * @param {string} id The ID of the item.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Sets the Access Control List (ACL) of an item with a specified ID.
         * @memberOf Data.prototype
         * @method setAcl
         * @name setAcl
         * @param {object} acl The acl object.
         * @param {string} id The ID of the item.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        setAcl: function (acl, filter, success, error) {
            var self = this;

            return buildPromise(function (success, error) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.SetAcl,
                    collectionName: self.collectionName,
                    parse: Request.parsers.single,
                    query: filter,
                    additionalOptions: {
                        acl: acl
                    },
                    onSuccess: success,
                    onError: error
                });

                return self.processDataQuery(dataQuery);
            }, success, error);
        },

        /**
         * Sets the owner of the specified data item.
         * @memberOf Data.prototype
         * @method setOwner
         * @name setOwner
         * @param {string} acl The new owner ID.
         * @param {object} item The item whose owner will be updated. Note: the ID property of the item will be used to determine which item will be updated.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Sets the owner of the specified data item.
         * @memberOf Data.prototype
         * @method setOwner
         * @name setOwner
         * @param {string} acl The new owner ID.
         * @param {object} item The item whose owner will be updated. Note: the ID property of the item will be used to determine which item will be updated.
         * @param {object} operationParameters An object that accepts operation parameters.
         * @param {Function} [operationParameters.success] A success callback.
         * @param {Function} [operationParameters.error] An error callback.
         * @param {Boolean} [operationParameters.useOffline] Whether to invoke the operation on the offline storage. Default is based on the current mode of the Everlive instance.
         * @param {Boolean} [operationParameters.applyOffline=true] If working online, whether to also apply the operation on the local storage.
         */
        /**
         * Sets the owner of the specified data item.
         * @memberOf Data.prototype
         * @method setOwner
         * @name setOwner
         * @param {string} ownerId The new owner ID.
         * @param {string} id The ID of the item.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Sets the owner of the specified data item.
         * @memberOf Data.prototype
         * @method setOwner
         * @name setOwner
         * @param {string} ownerId The new owner ID.
         * @param {string} id The ID of the item.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        setOwner: function (ownerId, filter, success, error) {
            var self = this;

            return buildPromise(function (success, error) {
                var dataQuery = new DataQuery({
                    operation: DataQuery.operations.SetOwner,
                    collectionName: self.collectionName,
                    query: filter,
                    data: {
                        Owner: ownerId
                    },
                    onSuccess: success,
                    onError: error
                });
                return self.processDataQuery(dataQuery);
            }, success, error);
        },
        /**
         * Saves the provided data item. This operation will create or update the item depending on whether it is new or existing.
         * @memberOf Data.prototype
         * @method save
         * @name save
         * @param {object} item An object containing the item that is being saved.
         * @returns {Promise} The promise for the request.
         */
        /**
         * Saves the provided data item. This operation will create or update the item depending on whether it is new or existing.
         * @memberOf Data.prototype
         * @method save
         * @name save
         * @param {object} model An object containing the item that is being saved.
         * @param {Function} [success] A success callback.
         * @param {Function} [error] An error callback.
         */
        save: function (model, success, error) {
            var self = this;
            var isNew = this.isNew(model);

            return buildPromise(function (success, error) {
                function saveSuccess(res) {
                    res.type = isNew ? 'create' : 'update';
                    success(res);
                }

                function saveError(err) {
                    err.type = isNew ? 'create' : 'update';
                    error(err);
                }

                if (isNew) {
                    return self.create(model, saveSuccess, saveError);
                } else {
                    return self.updateSingle(model, saveSuccess, saveError);
                }
            }, success, error);
        },
        /**
         * Checks if the specified data item is new or not.
         * @memberOf Data.prototype
         * @method isNew
         * @param model Item to check.
         * @returns {boolean}
         */
        isNew: function (model) {
            return typeof model[idField] === 'undefined';
        }
    };

    return Data;
}());
