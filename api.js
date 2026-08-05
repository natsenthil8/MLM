// Lightweight client API wrapper used by app.js
// Adds Authorization header automatically (adminToken or memberToken from sessionStorage)
(function () {
  function getToken() {
    return sessionStorage.getItem('adminToken') || sessionStorage.getItem('memberToken') || null;
  }

  function defaultHeaders(includeJson = true) {
    const h = {};
    if (includeJson) h['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }

  async function request(method, url, body) {
    const headers = defaultHeaders(!!body);
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }

    if (!res.ok) {
      const message = (json && (json.message || json.error)) || res.statusText || 'Request failed';
      const err = new Error(message);
      err.status = res.status;
      err.body = json;
      throw err;
    }

    return json;
  }

  window.api = {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    del: (url) => request('DELETE', url)
  };
})();
