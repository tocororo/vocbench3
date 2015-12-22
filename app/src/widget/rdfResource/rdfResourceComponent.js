System.register(["angular2/core", "../../utils/ARTResources"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, ARTResources_1;
    var RdfResourceComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (ARTResources_1_1) {
                ARTResources_1 = ARTResources_1_1;
            }],
        execute: function() {
            RdfResourceComponent = (function () {
                function RdfResourceComponent() {
                    this.res = new ARTResources_1.ARTURIResource("http://demo.it#concept", "concept", "concept");
                    this.imageSrc = "app/assets/images/concept.png";
                    this.resourceShow = this.res.getShow(); //find a way to cast ARTNode to ARTURIResource
                }
                __decorate([
                    core_1.Input('resource'), 
                    __metadata('design:type', Object)
                ], RdfResourceComponent.prototype, "res", void 0);
                RdfResourceComponent = __decorate([
                    core_1.Component({
                        selector: "rdf-resource",
                        templateUrl: "app/src/widget/rdfResource/rdfResource.html",
                    }), 
                    __metadata('design:paramtypes', [])
                ], RdfResourceComponent);
                return RdfResourceComponent;
            })();
            exports_1("RdfResourceComponent", RdfResourceComponent);
        }
    }
});
//# sourceMappingURL=rdfResourceComponent.js.map