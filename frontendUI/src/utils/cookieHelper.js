/* 
 * COOKIE UTILITY HELPER
 * Quản lý lưu trữ phiên làm việc của khách hàng
 */

export const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // Stringify value if it's an object/array, otherwise write directly
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    document.cookie = name + "=" + encodeURIComponent(stringValue) + expires + "; path=/; SameSite=Lax; Secure";
};

export const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            const val = decodeURIComponent(c.substring(nameEQ.length));
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        }
    }
    return null;
};

export const eraseCookie = (name) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
};
