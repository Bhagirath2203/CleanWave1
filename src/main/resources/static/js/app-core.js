// Core CleanWave frontend utilities:
// - Centralized API client (cwApi)
// - Centralized auth helpers (cwAuth)
// - Global 401/403 handling and basic token expiry checks

(function (window) {
  const API_BASE = `${window.location.origin.replace(/\/+$/, '')}/api`;

  function parseJwt(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch (e) {
      return null;
    }
  }

  function getAuth() {
    const token = window.localStorage.getItem('token');
    const email = window.localStorage.getItem('email');
    const role = window.localStorage.getItem('role');
    return { token, email, role };
  }

  function isTokenExpired(token) {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return false; // backend will still enforce expiry
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  function clearAuthAndRedirect() {
    try {
      window.localStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = '/login.html';
  }

  function requireRole(requiredRole) {
    const { token, role } = getAuth();
    if (!token || isTokenExpired(token)) {
      clearAuthAndRedirect();
      return;
    }
    if (requiredRole && role !== requiredRole) {
      clearAuthAndRedirect();
    }
  }

  async function request(path, options) {
    const opts = options || {};
    const method = opts.method || 'GET';
    const auth = opts.auth !== false;
    const headers = opts.headers ? { ...opts.headers } : {};
    let body = opts.body;

    if (auth) {
      const { token } = getAuth();
      if (!token || isTokenExpired(token)) {
        clearAuthAndRedirect();
        throw new Error('Not authenticated');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = API_BASE + path;

    const response = await fetch(url, {
      method,
      headers,
      body
    });

    if (response.status === 401 || response.status === 403) {
      clearAuthAndRedirect();
      throw new Error('Unauthorized');
    }

    if (opts.raw) {
      return response;
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  function get(path, options) {
    return request(path, { ...(options || {}), method: 'GET' });
  }

  function postJson(path, data, options) {
    const opts = options || {};
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    return request(path, {
      ...opts,
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  }

  function putJson(path, data, options) {
    const opts = options || {};
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    return request(path, {
      ...opts,
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
  }

  function del(path, options) {
    return request(path, { ...(options || {}), method: 'DELETE' });
  }

  function logout() {
    clearAuthAndRedirect();
  }

  window.cwAuth = {
    getAuth,
    requireRole,
    isTokenExpired,
    logout
  };

  window.cwApi = {
    API_BASE,
    request,
    get,
    postJson,
    putJson,
    delete: del
  };
})(window);

