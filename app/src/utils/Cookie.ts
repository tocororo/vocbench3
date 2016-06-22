//https://github.com/BCJTI/ng2-cookies
export class Cookie {
	
	public static VB_ACTIVE_SKOS_SCHEME = "active_skos_scheme";
	public static VB_CONTENT_LANG = "content_language";
	public static VB_HUMAN_READABLE = "human_readable";
	public static VB_INFERENCE_IN_RES_VIEW = "inference_in_resource_view";
	public static VB_RESOURCE_VIEW_MODE = "resource_view_mode";

	public static ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE = "alignment_per_page";
	public static ALIGNMENT_VALIDATION_RELATION_SHOW = "relation_show";
	public static ALIGNMENT_VALIDATION_SHOW_CONFIDENCE = "show_confidence";
	public static ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION = "rejected_alignment_action";

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