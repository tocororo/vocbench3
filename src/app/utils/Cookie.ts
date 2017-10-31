//https://github.com/BCJTI/ng2-cookies
export class Cookie {
	
	public static RES_VIEW_INCLUDE_INFERENCE = "resource_view.include_inference";
	public static RES_VIEW_RENDERING = "resource_view.rendering";
	public static RES_VIEW_MODE = "resource_view.mode";
	public static RES_VIEW_TAB_SYNCED = "resource_view.tab_synced";

	public static ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE = "alignment_validation.alignment_per_page";
	public static ALIGNMENT_VALIDATION_RELATION_SHOW = "alignment_validation.relation_show";
	public static ALIGNMENT_VALIDATION_SHOW_CONFIDENCE = "alignment_validation.show_confidence";
	public static ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION = "alignment_validation.rejected_alignment_action";

	public static SEARCH_STRING_MATCH_MODE = "search.string_match_mode";
	public static SEARCH_USE_URI = "search.use_uri";
	public static SEARCH_USE_LOCAL_NAME = "search.use_local_name";
	public static SEARCH_RESTRICT_LANG = "search.restrict_lang";
	public static SEARCH_LANGUAGES = "search.languages";
	public static SEARCH_CONCEPT_SCHEME_RESTRICTION = "search.restrict_active_schemes";
	public static SEARCH_CLS_IND_PANEL = "search.cls_ind_panel"; //tells if search classes, individuals or both

	public static PROJECT_TABLE_ORDER = "project.table_columns_order";

	/**
	 * Retrieves a single cookie by it's name
	 * @param  {string} name Identification of the Cookie
	 * @returns The Cookie's value 
	 */
	public static getCookie(name: string): string {
		let myWindow: any = window;
		name = myWindow.escape(name);
		let regexp = new RegExp('(?:^' + name + '|;\\s*' + name + ')=(.*?)(?:;|$)', 'g');
		let result = regexp.exec(document.cookie);
		return (result === null) ? null : myWindow.unescape(result[1]);
	}

	/**
	 * Save the Cookie
	 * @param  {string} name Cookie's identification
	 * @param  {string} value Cookie's value
	 * @param  {number} expires Cookie's expiration date in days from now. If it's undefined the cookie is a session Cookie
	 * @param  {string} path Path relative to the domain where the cookie should be avaiable. Default /
	 * @param  {string} domain Domain where the cookie should be avaiable. Default current domain
	 */
	public static setCookie(name: string, value: string, expires?: number, path?: string, domain?: string) {
		let myWindow: any = window;
		let cookieStr = myWindow.escape(name) + '=' + myWindow.escape(value) + ';';

		if (expires) {
			let dtExpires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24);
			cookieStr += 'expires=' + dtExpires.toUTCString() + ';';
		}
		if (path) {
			cookieStr += 'path=' + path + ';';
		}
		if (domain) {
			cookieStr += 'domain=' + domain + ';';
		}

		document.cookie = cookieStr;
	}

	/**
	 * Removes specified Cookie
	 * @param  {string} name Cookie's identification
	 * @param  {string} path Path relative to the domain where the cookie should be avaiable. Default /
	 * @param  {string} domain Domain where the cookie should be avaiable. Default current domain
	 */
	public static deleteCookie(name: string, path?: string, domain?: string) {
		// If the cookie exists
		if (Cookie.getCookie(name)) {
			Cookie.setCookie(name, '', -1, path, domain);
		}
	}

}