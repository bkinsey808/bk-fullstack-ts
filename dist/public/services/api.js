var API = (function () {
    function API() {
    }
    API.prototype.getBooks = function () {
        return fetch('http://localhost:3000/api/books');
    };
    return API;
})();
exports.API = API;
