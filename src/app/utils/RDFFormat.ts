export class RDFFormat {

    public static formatMap = [
        {format: "JSON-LD", extension: "json", mime: "application/json"},
        {format: "N3", extension: "n3", mime: "text/n3"},
        {format: "NQUADS", extension: "nq", mime: "text/x-nquads"},
        {format: "N-TRIPLES", extension: "nt", mime: "text/plain"},
        {format: "RDF/XML", extension: "rdf", mime: "application/rdf+xml"},
        {format: "RDF/XML-ABBREV", extension: "rdf", mime: "application/rdf+xml"},
        {format: "TRIG", extension: "trig", mime: "application/x-trig"},
        {format: "TRIX", extension: "trix", mime: "application/trix"},
        {format: "TRIX-EXT", extension: "trix-ext", mime: "application/trix"},
        {format: "TURTLE", extension: "ttl", mime: "text/turtle"},
    ]

    static getMIMETypeFromFormat(format: string): string {
        var mime: string; 
        for (var i = 0; i < this.formatMap.length; i++) {
            if (this.formatMap[i].format == format) {
                mime = this.formatMap[i].mime;
            }
        }
        return mime;
    }

    static getFormatExtensions(format: string): string {
        var ext: string;
        for (var i = 0; i < this.formatMap.length; i++) {
            if (this.formatMap[i].format == format) {
                ext = this.formatMap[i].extension;
            }
        }
        return ext;
    }

}