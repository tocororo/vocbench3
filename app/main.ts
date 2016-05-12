import { bootstrap } from "@angular/platform-browser-dynamic";
import { enableProdMode, Renderer } from "@angular/core";
import { ROUTER_PROVIDERS } from "@angular/router-deprecated";
import { HTTP_PROVIDERS } from "@angular/http";

import { MODAL_BROWSER_PROVIDERS } from 'angular2-modal/platform-browser';
import { BS_MODAL_PROVIDERS } from 'angular2-modal/plugins/bootstrap';

import { HttpManager } from "./src/utils/HttpManager";
import { VocbenchCtx } from "./src/utils/VocbenchCtx";
import { VBEventHandler } from "./src/utils/VBEventHandler";
import { ModalServices } from "./src/widget/modal/modalServices";

import {App} from "./src/app";

// enableProdMode();
/**
 * 2nd argument is an array of providers injectable 
 * Providers can be injected punctually in a Component if needed (using the proviers: [] array), or
 * in the bootstrap function so that they can be widely used in the application, without specifying them in providers
 */
bootstrap(App, [
    ROUTER_PROVIDERS, HTTP_PROVIDERS,
    HttpManager, VocbenchCtx, VBEventHandler,
    BS_MODAL_PROVIDERS, Renderer, MODAL_BROWSER_PROVIDERS, //required in order to add ModalServices as provider
    ModalServices
]);