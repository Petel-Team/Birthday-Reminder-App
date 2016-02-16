/**
 * @class Files
 * @protected
 * @extends Data
 */

var buildPromise = require('../utils').buildPromise;
var DataQuery = require('../query/DataQuery');
var Request = require('../Request');
var utils = require('../utils');
var platform = require('../everlive.platform');

module.exports.addFilesFunctions = function addFilesFunctions(ns) {
    /**
     * Get a URL that can be used as an endpoint for uploading a file. It is specific to each {{site.TelerikBackendServices}} app.
     * @memberof Files.prototype
     * @method getUploadUrl
     * @returns {string}
     */
    ns.getUploadUrl = function () {
        return utils.buildUrl(this.setup) + this.collectionName;
    };

    /**
     * Get the download URL for a file.
     * @memberof Files.prototype
     * @method getDownloadUrl
     * @deprecated
     * @see {@link Files.getDownloadUrlById}
     * @param {string} fileId The ID of the file.
     * @returns {string} url The download URL.
     */
    ns.getDownloadUrl = function (fileId) {
        return utils.buildUrl(this.setup) + this.collectionName + '/' + fileId + '/Download';
    };

    ns._getUpdateUrl = function (fileId) {
        return this.collectionName + '/' + fileId + '/Content';
    };

    /**
     * Get a URL that can be used as an endpoint for updating a file. It is specific to each {{site.TelerikBackendServices}} app.
     * @memberof Files.prototype
     * @method getUpdateUrl
     * @param {string} fileId The ID of the file.
     * @returns {string} url The update URL.
     */
    ns.getUpdateUrl = function (fileId) {
        return utils.buildUrl(this.setup) + this._getUpdateUrl(fileId);
    };

    /**
     * Updates a file's content
     * @memberof Files.prototype
     * @method updateContent
     * @param {string} fileId File ID.
     * @param {Object} file The file metadata and the base64 encoded file content.
     * @param {Function} [success] A success callback.
     * @param {Function} [error] An error callback.
     * @returns {Promise} The promise for the request
     */
    ns.updateContent = function (fileId, file, success, error) {
        var self = this;

        return buildPromise(function (success, error) {
            var dataQuery = new DataQuery({
                operation: DataQuery.operations.FilesUpdateContent,
                // the passed file content is base64 encoded
                data: file,
                collectionName: self.collectionName,
                additionalOptions: {
                    id: fileId
                },
                onSuccess: success,
                onError: error
            });


            return self.processDataQuery(dataQuery);
        }, success, error);
    };

    /**
     * Gets the download URL for a file by ID.
     * @memberof Files.prototype
     * @method getDownloadUrlById
     * @param {string} fileId File ID.
     * @returns {Promise} The promise for the request
     */
    /**
     * Gets the download URL for a file by ID.
     * @memberof Files.prototype
     * @method getDownloadUrlById
     * @param {string} fileId File ID.
     * @param {Function} [success] A success callback.
     * @param {Function} [error] An error callback.
     */
    ns.getDownloadUrlById = function (fileId, success, error) {
        var self = this;

        return buildPromise(function (success, error) {
            if (platform.isDesktop && !self.everlive.isOnline()) {
                //while in offline we cannot get the url of the file, but we can generate one
                var url = self.getDownloadUrl(fileId);
                return success(url);
            }

            var dataQuery = new DataQuery({
                operation: DataQuery.operations.FilesGetDownloadUrlById,
                collectionName: self.collectionName,
                additionalOptions: {
                    id: fileId
                },
                parse: Request.parsers.single,
                onSuccess: function (data) {
                    success(data.result.Uri);
                },
                onError: error
            });


            return self.processDataQuery(dataQuery);
        }, success, error);
    };

    /**
     * Downloads a file to the device's file system. Wraps the Apache Cordova "download()" [FileTransfer](http://cordova.apache.org/docs/en/2.7.0/cordova_file_file.md.html#FileTransfer) method. Note that the signatures of these methods differ.
     * @memberof Files.prototype
     * @method download
     * @param {string} fileToDownload A Backend Services File ID.
     * @param {string} pathOnDevice An Apache Cordova FileSystem URL representing the local path on the device where the downloaded file will be saved. Maps to the "target" FileTransfer plugin parameter.
     * @param {object} [options] Additional request options. Maps to the "options" FileTransfer plugin parameter.
     * @param {object} [options.headers] A JSON object containing headers to send along with the request.
     * @param {boolean} [trustAllHosts=false] Whether to accept all security certificates including self-signed certificates. Maps to the "trustAllHosts" FileTransfer plugin parameter.
     * @returns {Promise} The promise for the request.
     */
    /**
     * Downloads a file to the device's file system. Wraps the Apache Cordova "download()" [FileTransfer](http://cordova.apache.org/docs/en/2.7.0/cordova_file_file.md.html#FileTransfer) method. Note that the signatures of these methods differ.
     * @memberof Files.prototype
     * @method download
     * @param {string} fileToDownload A Backend Services File ID.
     * @param {string} pathOnDevice An Apache Cordova FileSystem URL representing the local path on the device where the downloaded file will be saved. Maps to the "target" FileTransfer plugin parameter.
     * @param {object} [options] Additional request options. Maps to the "options" FileTransfer plugin parameter.
     * @param {object} [options.headers] A JSON object containing headers to send along with the request.
     * @param {boolean} [trustAllHosts=false] Whether to accept all security certificates including self-signed certificates. Maps to the "trustAllHosts" FileTransfer plugin parameter.
     * @param {Function} [success] A success callback that is passed an Apache Cordova [FileEntry](https://cordova.apache.org/docs/en/3.3.0/cordova_file_file.md.html#FileEntry) object. Maps to the "successCallback" FileTransfer plugin parameter.
     * @param {Function} [error] An error callback that is passed an Apache Cordova [FileTransferError](https://github.com/apache/cordova-plugin-file-transfer#filetransfererror) object. Maps to the "errorCallback" FileTransfer plugin parameter.
     */
    ns.download = function (url, localPath, options, trustAllHosts, success, error) {
        var self = this;

        return buildPromise(function (success, error) {
            if (!trustAllHosts) {
                trustAllHosts = false;
            }

            var headers = options && options.headers ? options.headers : {};

            var fileTransfer = new FileTransfer();
            self.withHeaders(headers)
                .getById(url)
                .then(function (res) {
                    var file = res.result;
                    url = file.Uri;
                    fileTransfer.download(url, localPath, success, error, trustAllHosts, options);
                }, error);
        }, success, error);
    };

    /**
     * Uploads a file from the device's file system to Backend Services. Wraps the Apache Cordova "upload()" [FileTransfer](http://cordova.apache.org/docs/en/2.7.0/cordova_file_file.md.html#FileTransfer) method. Note that the signatures of these methods differ.
     * @memberof Files.prototype
     * @method upload
     * @param {string} fileToUpload An Apache Cordova FileSystem URL representing the full path to the file on the device.
     * @param {object} [options] Additional request options. Maps to the "options" FileTransfer plugin parameter.
     * @param {string} [options.fileKey] The name of the form element. Defaults to 'file' in the FileTransfer plugin parameter.
     * @param {string} [options.fileName] The file name to use when uploading the file. Defaults to 'image.jpg' in the FileTransfer plugin.
     * @param {string} [options.httpMethod] The HTTP method to use, either POST or PUT. Defaults to 'POST' in the FileTransfer plugin parameter.
     * @param {string} [options.mimeType] The mime type of the uploaded data. Defaults to 'image/jpeg' in the FileTransfer plugin parameter.
     * @param {object} [options.params] A set of optional key/value pairs to pass in the HTTP request.
     * @param {boolean} [options.chunkedMode] Whether to upload the data in chunked streaming mode. Defaults to 'true' in the FileTransfer plugin parameter.
     * @param {object} [options.headers] A JSON object for the headers to send along with the request.
     * @param {boolean} [trustAllHosts=false] Whether to accept all security certificates including self-signed certificates. Maps to the "trustAllHosts" FileTransfer plugin parameter.
     * @returns {Promise} The promise for the request.
     */
    /**
     * Uploads a file from the device's file system to Backend Services. Wraps the Apache Cordova "upload()" [FileTransfer](http://cordova.apache.org/docs/en/2.7.0/cordova_file_file.md.html#FileTransfer) method. Note that the signatures of these methods differ.
     * @memberof Files.prototype
     * @method upload
     * @param {string} fileToUpload An Apache Cordova FileSystem URL representing the full path to the file on the device.
     * @param {object} [options] Additional request options. Maps to the "options" FileTransfer plugin parameter.
     * @param {string} [options.fileKey] The name of the form element. Defaults to 'file' in the FileTransfer plugin parameter.
     * @param {string} [options.fileName] The file name to use when uploading the file. Defaults to 'image.jpg' in the FileTransfer plugin parameter.
     * @param {string} [options.httpMethod] The HTTP method to use, either POST or PUT. Defaults to 'POST' in the FileTransfer plugin parameter.
     * @param {string} [options.mimeType] The mime type of the uploaded data. Defaults to 'image/jpeg' in the FileTransfer plugin parameter.
     * @param {object} [options.params] A set of optional key/value pairs to pass in the HTTP request.
     * @param {boolean} [options.chunkedMode] Whether to upload the data in chunked streaming mode. Defaults to 'true' in the FileTransfer plugin parameter.
     * @param {object} [options.headers] A JSON object for the headers to send along with the request.
     * @param {boolean} [trustAllHosts=false] Whether to accept all security certificates including self-signed certificates. Maps to the "trustAllHosts" FileTransfer plugin parameter.
     * @param {Function} [success] A success callback that is passed an Apache Cordova [FileUploadResult](https://github.com/apache/cordova-plugin-file-transfer#fileuploadresult) object. Maps to the "successCallback" FileTransfer plugin parameter.
     * @param {Function} [error] An error callback that is passed an Apache Cordova [FileTransferError](https://github.com/apache/cordova-plugin-file-transfer#filetransfererror) object. Maps to the "errorCallback" FileTransfer plugin parameter.
     */
    ns.upload = function (localPath, options, trustAllHosts, success, error) {
        var url = this.getUploadUrl();
        return buildPromise(function (success, error) {
            if (!trustAllHosts) {
                trustAllHosts = false;
            }
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(url);
            fileTransfer.upload(localPath, uri, success, error, options, trustAllHosts);
        }, success, error);
    }
};