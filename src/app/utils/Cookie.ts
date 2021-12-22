// this class is partially re-using code from the project:
// https://github.com/BCJTI/ng2-cookies

import { ARTURIResource } from "../models/ARTResources";
import { Project } from "../models/Project";
import { User } from "../models/User";

export class Cookie {

    public static TRANSLATE_LANG = "translate.lang";

    public static RES_VIEW_INCLUDE_INFERENCE = "resource_view.include_inference";
    public static RES_VIEW_RENDERING = "resource_view.rendering";
    public static RES_VIEW_MODE = "resource_view.mode";
    public static RES_VIEW_TAB_SYNCED = "resource_view.tab_synced";
    public static RES_VIEW_DISPLAY_IMG = "resource_view.display_img";
    public static RES_VIEW_SORT_BY_RENDERING = "resource_view.sort_by_rendering";
    public static RES_VIEW_SHOW_DEPRECATED = "resource_view.show_deprecated";
    public static RES_VIEW_SHOW_DATATYPE_BADGE = "resource_view.show_datatype_badge";
    public static RES_VIEW_CODE_FORMAT = "resource_view.code_format";

    public static SHOW_DEPRECATED = "tree_list.show_deprecated";

    public static ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE = "alignment_validation.alignment_per_page";
    public static ALIGNMENT_VALIDATION_RELATION_SHOW = "alignment_validation.relation_show";
    public static ALIGNMENT_VALIDATION_SHOW_CONFIDENCE = "alignment_validation.show_confidence";
    public static ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION = "alignment_validation.rejected_alignment_action";
    public static ALIGNMENT_VALIDATION_RENDERING = "alignment_validation.rendering";

    public static ALIGNMENT_LAST_EXPLORED_PROJECT = "alignment.last_project";
    public static ALIGNMENT_LAST_CHOSEN_TYPE = "alignment.last_type";

    public static LEX_ENTRY_LAST_INDEX = "structures.lex_entry.last_index";

    public static SEARCH_STRING_MATCH_MODE = "search.string_match_mode";
    public static SEARCH_USE_URI = "search.use_uri";
    public static SEARCH_USE_LOCAL_NAME = "search.use_local_name";
    public static SEARCH_USE_NOTES = "search.use_notes";
    public static SEARCH_CONCEPT_SCHEME_RESTRICTION = "search.restrict_active_schemes";
    public static SEARCH_EXTEND_ALL_INDIVIDUALS = "search.extends_all_inividuals";

    public static PROJECT_TABLE_ORDER = "project.table_col_order";
    public static PROJECT_COLLAPSED_DIRS = "project.collapsed_dirs"; //comma separated names of collapsed directories
    public static PROJECT_VIEW_MODE = "project.view_mode";
    public static PROJECT_FACET_BAG_OF = "project.facet_bag_of";
    public static PROJECT_RENDERING = "project.rendering";

    public static WARNING_CUSTOM_ROOT = "ui.tree.cls.warnings.customroot";
    public static WARNING_CODE_CHANGE_VALIDATION = "resource_view.warnings.code_change_validation";

    /**
     * Retrieves a single cookie by it's name
     * @param  {string} name Identification of the Cookie
     * @returns The Cookie's value 
     */
    public static getCookie(name: string, project?: Project, user?: User): string {
        if (project) {
            name += ".P." + project.getName();
        }
        if (user) {
            name += ".U." + user.getIri().getURI();
        }

        let myWindow: any = window;
        name = myWindow.escape(name);
        let regexp = new RegExp('(?:^' + name + '|;\\s*' + name + ')=(.*?)(?:;|$)', 'g');
        let result = regexp.exec(document.cookie);
        return (result === null) ? null : myWindow.unescape(result[1]);
    }

     /**
      * Save the Cookie
      * @param name 
      * @param value 
      * @param attrs 
      */
      public static setCookie(name: string, value: string, project?: Project, user?: User, attrs?: CookieAttr) {
        if (value == null) {
            this.deleteCookie(name, project, user);
            return;
        }

        if (project) {
            name += ".P." + project.getName();
        }
        if (user) {
            name += ".U." + user.getIri().getURI();
        }

        let myWindow: any = window;
        let cookieStr = myWindow.escape(name) + '=' + myWindow.escape(value) + ';';

        let expires = (attrs && attrs.expires) ? attrs.expires : 365 * 10; //default 10 years
        let dtExpires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24);
        cookieStr += 'expires=' + dtExpires.toUTCString() + ';';
        
        let path: string = (attrs && attrs.path) ? attrs.path : null;
        if (path) {
            cookieStr += "path=" + path + ";";
        }

        document.cookie = cookieStr;
    }

    /**
     * Removes specified Cookie
     */
    public static deleteCookie(name: string, project?: Project, user?: User) {
        // If the cookie exists
        if (Cookie.getCookie(name, project, user)) {
            Cookie.setCookie(name, '', project, user, { expires: -1 });
        }
    }


}

/**
 * Note: path is useful for the translate.lang cookie which if it is set for http://<hostname>/vocbench3 
 * is blocked by the browser for requests toward http://<hostname>/semanticturkey since they have different path
 */
export interface CookieAttr {
    expires?: number;
    path?: string; 
}