System.register([], function(exports_1) {
    var ARTURIResource, ARTLiteral, ARTBNode;
    return {
        setters:[],
        execute: function() {
            ARTURIResource = (function () {
                function ARTURIResource(uri, show, rule) {
                    this.isResource = function () {
                        return true;
                    };
                    this.isURIResource = function () {
                        return true;
                    };
                    this.isLiteral = function () {
                        return false;
                    };
                    this.uri = uri;
                    this.show = show;
                    this.rule = rule;
                }
                ARTURIResource.prototype.isBNode = function () {
                    return false;
                };
                ARTURIResource.prototype.getShow = function () {
                    return this.show;
                };
                ARTURIResource.prototype.getNominalValue = function () {
                    return this.uri;
                };
                ;
                ARTURIResource.prototype.toNT = function () {
                    return "<" + this.uri + ">";
                };
                ;
                return ARTURIResource;
            })();
            exports_1("ARTURIResource", ARTURIResource);
            ARTLiteral = (function () {
                function ARTLiteral(label, datatype, lang, isTypedLiteral) {
                    this.label = label;
                    this.datatype = datatype;
                    this.lang = lang;
                    this.isTypedLiteral = isTypedLiteral;
                }
                ARTLiteral.prototype.isResource = function () {
                    return false;
                };
                ;
                ARTLiteral.prototype.isURIResource = function () {
                    return false;
                };
                ;
                ARTLiteral.prototype.isLiteral = function () {
                    return true;
                };
                ;
                ARTLiteral.prototype.isBNode = function () {
                    return false;
                };
                ARTLiteral.prototype.getShow = function () {
                    return this.toNT();
                };
                ARTLiteral.prototype.getNominalValue = function () {
                    return this.label;
                };
                ;
                ARTLiteral.prototype.toNT = function () {
                    var nt = JSON.stringify(this.label);
                    if (this.lang != null && this.lang.length > 0) {
                        nt += "@" + this.lang;
                    }
                    else if (this.datatype != null) {
                        nt += "^^" + this.datatype;
                    }
                    return nt;
                };
                ;
                return ARTLiteral;
            })();
            exports_1("ARTLiteral", ARTLiteral);
            ARTBNode = (function () {
                function ARTBNode(id, show, role) {
                    this.id = id;
                    this.show = show;
                    this.role = role;
                }
                ARTBNode.prototype.isResource = function () {
                    return false;
                };
                ;
                ARTBNode.prototype.isURIResource = function () {
                    return false;
                };
                ;
                ARTBNode.prototype.isLiteral = function () {
                    return false;
                };
                ;
                ARTBNode.prototype.isBNode = function () {
                    return true;
                };
                ;
                ARTBNode.prototype.getShow = function () {
                    return this.getNominalValue();
                };
                ARTBNode.prototype.getNominalValue = function () {
                    return "_:" + this.id;
                };
                ;
                ARTBNode.prototype.toNT = function () {
                    return this.getNominalValue();
                };
                ;
                return ARTBNode;
            })();
            exports_1("ARTBNode", ARTBNode);
        }
    }
});
//# sourceMappingURL=ARTResources.js.map