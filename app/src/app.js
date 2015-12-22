System.register(["angular2/core", "angular2/platform/browser", "angular2/router", 'angular2/http', "./project/projectComponent", "./utils/HttpManager", "./utils/VocbenchCtx"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, router_1, http_1, projectComponent_1, HttpManager_1, VocbenchCtx_1;
    var App;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (projectComponent_1_1) {
                projectComponent_1 = projectComponent_1_1;
            },
            function (HttpManager_1_1) {
                HttpManager_1 = HttpManager_1_1;
            },
            function (VocbenchCtx_1_1) {
                VocbenchCtx_1 = VocbenchCtx_1_1;
            }],
        execute: function() {
            App = (function () {
                function App() {
                }
                App = __decorate([
                    core_1.Component({
                        selector: "app",
                        templateUrl: "app/src/app.html",
                        directives: [router_1.ROUTER_DIRECTIVES],
                    }),
                    router_1.RouteConfig([
                        { path: "/Home", name: "Home", component: projectComponent_1.ProjectComponent },
                        { path: "/Concepts", name: "Concepts", component: projectComponent_1.ProjectComponent },
                        { path: "/Class", name: "Class", component: projectComponent_1.ProjectComponent },
                        { path: "/Schemes", name: "Schemes", component: projectComponent_1.ProjectComponent },
                        { path: "/Sparql", name: "Sparql", component: projectComponent_1.ProjectComponent },
                        { path: "/Test", name: "Test", component: projectComponent_1.ProjectComponent },
                    ]), 
                    __metadata('design:paramtypes', [])
                ], App);
                return App;
            })();
            exports_1("App", App);
            browser_1.bootstrap(App, [
                router_1.ROUTER_PROVIDERS, http_1.HTTP_PROVIDERS,
                HttpManager_1.HttpManager, VocbenchCtx_1.VocbenchCtx
            ]);
        }
    }
});
//# sourceMappingURL=app.js.map