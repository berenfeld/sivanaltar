// Drop-in replacement for @base44/sdk
// Exposes the same API surface as the original package but routes all calls
// to our own Express backend at VITE_API_BASE_URL.

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

const http = async (method, path, body) => {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

// Generic entity proxy — entityName is the PascalCase name used in the original SDK
// e.g. BlogPost → /api/entities/BlogPost
const entityProxy = (name) => ({
  list: (sort) => http('GET', `/entities/${name}${sort ? `?sort=${encodeURIComponent(sort)}` : ''}`),
  filter: (query) => http('POST', `/entities/${name}/filter`, query),
  create: (data) => http('POST', `/entities/${name}`, data),
  update: (id, data) => http('PATCH', `/entities/${name}/${id}`, data),
  delete: (id) => http('DELETE', `/entities/${name}/${id}`),
});

export const base44 = {
  auth: {
    me: () => http('GET', '/auth/me'),

    isAuthenticated: async () => {
      try {
        await http('GET', '/auth/me');
        return true;
      } catch {
        return false;
      }
    },

    redirectToLogin: (returnUrl) => {
      const url = returnUrl ?? window.location.href;
      window.location.href = `${BASE_URL}/auth/google?return_url=${encodeURIComponent(url)}`;
    },

    logout: async (redirectUrl) => {
      try {
        await http('POST', '/auth/logout');
      } finally {
        if (redirectUrl) window.location.href = redirectUrl;
        else window.location.reload();
      }
    },
  },

  // Proxied so any entity name works: base44.entities.BlogPost, base44.entities.GalleryImage, etc.
  entities: new Proxy(
    {},
    { get: (_, entityName) => entityProxy(entityName) }
  ),

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json(); // { file_url: '/uploads/...' }
      },

      SendEmail: (args) => http('POST', '/integrations/send-email', args),

      InvokeLLM: (args) => http('POST', '/integrations/invoke-llm', args),
    },
  },

  functions: {
    invoke: (name, args) => http('POST', `/functions/${name}`, args),
  },
};

// createClient is called in src/api/base44Client.js — ignore all params, return base44
export const createClient = () => base44;

// createAxiosClient is used in src/lib/AuthContext.jsx for public-settings fetch.
// We shim it with a minimal fetch-based client since we no longer need that endpoint.
export const createAxiosClient = () => ({
  get: async () => ({ data: {} }),
});

export default base44;
