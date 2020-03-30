// Angular 2
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/http';
import '@angular/router';
// RxJS
import 'rxjs';
// Other vendors for example jQuery, Lodash or Bootstrap
// You can import js, ts, css, sass, ...

import 'jquery';
import 'bootstrap/dist/js/bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css'; //overriden by assets/styles/custom_bootstrap/css/bootstrap.min.css

import 'ngx-modialog';
import 'ngx-modialog/plugins/bootstrap';

//import 'yasgui-yasqe/dist/yasqe.bundled.js'; //already imported in yasguiComponent
import 'yasgui-yasqe/dist/yasqe.min.css';

import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/mode/simple.js'; //for defineSimpleMode() in the definition of the manchester mode
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/ntriples/ntriples.js';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';



//import 'codemirror/lib/codemirror.js'; //already imported in the components that needs CodeMirror

import 'jsprolog/dist/jsprolog';

import 'ng2-completer';