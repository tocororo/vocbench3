export class RDFFormat {

    public name: string;
    public charset: string;
    public fileExtensions: string[];
    public standardURI: {namespace: string, localName: string};
    public mimetypes: string[];
    public defaultMIMEType: string;
    public defaultFileExtension: string;

    constructor(name: string, charset: string, fileExt: string[], standardURI: {namespace: string, localName: string},
        mimetypes: string[], defaultMIMEType: string, defaultFileExt: string) {
        this.name = name;
        this.charset = charset;
        this.fileExtensions = fileExt;
        this.standardURI = standardURI;
        this.mimetypes = mimetypes;
        this.defaultMIMEType = defaultMIMEType;
        this.defaultFileExtension = defaultFileExt;
    }

}

export class DataFormat {
    public name: string;
    public defaultMimeType: string;
    public defaultFileExtension: string;

    constructor(name: string, defaultMimeType: string, defaultFileExtension: string) {
        this.name = name;
        this.defaultMimeType = defaultMimeType;
        this.defaultFileExtension = defaultFileExtension;
    }
}