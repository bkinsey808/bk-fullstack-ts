var API = (function () {
    function API() {
    }
    API.prototype.getNavItems = function () {
        return fetch('http://localhost:3000/api/nav_items');
    };
    return API;
})();
exports.API = API;
