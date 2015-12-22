System.register(["angular2/core", "../widget/rdfResource/rdfResourceComponent", 'angular2/http', "./projectServices", 'rxjs/add/operator/map'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, rdfResourceComponent_1, http_1, projectServices_1;
    var ProjectComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (rdfResourceComponent_1_1) {
                rdfResourceComponent_1 = rdfResourceComponent_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (projectServices_1_1) {
                projectServices_1 = projectServices_1_1;
            },
            function (_1) {}],
        execute: function() {
            ProjectComponent = (function () {
                function ProjectComponent(projectService) {
                    this.projectService = projectService;
                    this.currentProject = "progetto attuale";
                    this.projectList = [];
                }
                ProjectComponent.prototype.onClick = function () {
                    this.projectService.listProjects()
                        .subscribe(function (data) {
                        var parser = new DOMParser();
                        var stResp = parser.parseFromString(data, "application/xml");
                        var projColl = stResp.getElementsByTagName("project");
                        for (var i = 0; i < projColl.length; i++) {
                            this.projectList.push({
                                accessible: projColl[i].getAttribute("accessible"),
                                modelConfigType: projColl[i].getAttribute("modelConfigType"),
                                ontmgr: projColl[i].getAttribute("ontmgr"),
                                ontoType: projColl[i].getAttribute("ontoType"),
                                open: projColl[i].getAttribute("open"),
                                status: projColl[i].getAttribute("status"),
                                type: projColl[i].getAttribute("type"),
                                name: projColl[i].textContent,
                            });
                        }
                        console.log("projs: " + JSON.stringify(this.projectList));
                    }, function (err) { console.log("in error callback"); this.logError(err); }, function () { console.log('Call Complete'); });
                };
                ProjectComponent = __decorate([
                    //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION
                    core_1.Component({
                        selector: "project-component",
                        templateUrl: "app/src/project/projectComponent.html",
                        viewProviders: [http_1.HTTP_PROVIDERS],
                        providers: [projectServices_1.ProjectServices],
                        directives: [rdfResourceComponent_1.RdfResourceComponent]
                    }), 
                    __metadata('design:paramtypes', [projectServices_1.ProjectServices])
                ], ProjectComponent);
                return ProjectComponent;
            })();
            exports_1("ProjectComponent", ProjectComponent);
        }
    }
});
//# sourceMappingURL=projectComponent.js.map