export async function getCsrfToken() {
    await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
    });
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
