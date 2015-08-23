var API = (function () {
    function API() {
    }
    API.prototype.getBooks = function () {
        return Zone.bindPromiseFn(fetch)('http://localhost:3000/api/books');
    };
    return API;
})();
exports.API = API;
