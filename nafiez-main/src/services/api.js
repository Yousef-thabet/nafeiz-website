import { productCategories, categoryNames } from '@/data/products';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function refreshAccessToken() {
  if (!API_URL) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
      return null;
    }

    return true;
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}, retry = false) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutMs = 20000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload = null;

    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { message: raw.trim() || 'Request failed' };
      }
    }

    const isAuthEndpoint = path.startsWith('/auth/');
    if (response.status === 401 && !retry && !isAuthEndpoint) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetch(path, options, true);
      }
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(new Error(payload?.message || 'Authentication required'));
    }

    if (!response.ok) {
      const message = payload?.message || payload?.error || 'Request failed';
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.status = 408;
      timeoutError.payload = { message: 'Request timed out. Please try again.' };
      throw timeoutError;
    }

    if (error instanceof Error && error.message === 'Failed to fetch') {
      const networkError = new Error('Unable to reach the server. Please check your connection and try again.');
      networkError.status = 0;
      networkError.payload = { message: networkError.message };
      throw networkError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function apiGet(path) {
  return apiFetch(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
}

export function apiPut(path, body) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body ?? {}),
  });
}

export function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}

export function apiPatch(path, body) {
  return apiFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });
}

function getErrorMessageKey(status) {
  switch (status) {
    case 400: return 'error.400';
    case 401: return 'error.401';
    case 403: return 'error.403';
    case 404: return 'error.404';
    case 409: return 'error.409';
    case 422: return 'error.422';
    case 429: return 'error.429';
    case 500: return 'error.500';
    default: return 'error.network';
  }
}

export async function getProducts() {
  try {
    const response = await apiGet('/products?published=true');
    const products = response?.data?.products || [];
    
    // Parse multilingual fields if they're JSON strings
    const parsedProducts = products.map(p => ({
      ...p,
      nameL10n: typeof p.nameL10n === 'string' ? JSON.parse(p.nameL10n) : p.nameL10n,
      descriptionL10n: typeof p.descriptionL10n === 'string' ? JSON.parse(p.descriptionL10n) : p.descriptionL10n,
      shortDescL10n: p.shortDescL10n ? (typeof p.shortDescL10n === 'string' ? JSON.parse(p.shortDescL10n) : p.shortDescL10n) : {},
    }));
    
    return { ok: true, data: { products: parsedProducts, categories: productCategories, categoryNames } };
  } catch (error) {
    return { ok: false, status: error.status || 0, errorKey: getErrorMessageKey(error.status || 0), message: error.message };
  }
}

export async function getProduct(slug) {
  try {
    const response = await apiGet(`/products/slug/${slug}`);
    const product = response?.data?.product;
    if (!product) return { ok: false, status: 404 };
    
    // Parse multilingual fields from JSON strings
    const nameL10n = product.nameL10n ? (typeof product.nameL10n === 'string' ? JSON.parse(product.nameL10n) : product.nameL10n) : {};
    const descriptionL10n = product.descriptionL10n ? (typeof product.descriptionL10n === 'string' ? JSON.parse(product.descriptionL10n) : product.descriptionL10n) : {};
    const shortDescL10n = product.shortDescL10n ? (typeof product.shortDescL10n === 'string' ? JSON.parse(product.shortDescL10n) : product.shortDescL10n) : {};
    
    // Transform product images array to flat array of URLs
    const images = (product.images || []).map(img => img.url || img);
    
    // Create aliases for backward compatibility with mock data structure
    const parsed = {
      ...product,
      name: nameL10n,
      description: descriptionL10n,
      shortDescription: shortDescL10n,
      images,
      nameL10n,
      descriptionL10n,
      shortDescL10n,
      specifications: [], // Backend doesn't store specs, provide empty array
    };
    
    return { ok: true, data: parsed };
  } catch (error) {
    return { ok: false, status: error.status || 0, errorKey: getErrorMessageKey(error.status || 0), message: error.message };
  }
}

export async function getRelatedProducts(slug, limit = 3) {
  try {
    const response = await apiGet(`/products/slug/${slug}/related?limit=${limit}`);
    const related = response?.data?.products || [];
    return {
      ok: true,
      data: related.map((product) => ({
        ...product,
        name: typeof product.nameL10n === 'string' ? JSON.parse(product.nameL10n) : product.nameL10n,
        shortDescription: typeof product.shortDescL10n === 'string' ? JSON.parse(product.shortDescL10n) : product.shortDescL10n,
        images: (product.images || []).map((image) => image.url || image),
      })),
    };
  } catch (error) {
    return { ok: false, status: error.status || 0, errorKey: getErrorMessageKey(error.status || 0), message: error.message };
  }
}

export async function getCountries() {
  try {
    const response = await apiGet('/countries?published=true');
    const apiCountries = response?.data?.countries || [];
    
    // Parse multilingual fields
    const parsedCountries = apiCountries.map(c => ({
      ...c,
      nameL10n: typeof c.nameL10n === 'string' ? JSON.parse(c.nameL10n) : c.nameL10n,
      descriptionL10n: c.descriptionL10n ? (typeof c.descriptionL10n === 'string' ? JSON.parse(c.descriptionL10n) : c.descriptionL10n) : {},
      detailsL10n: c.detailsL10n ? (typeof c.detailsL10n === 'string' ? JSON.parse(c.detailsL10n) : c.detailsL10n) : {},
    }));
    
    return { ok: true, data: parsedCountries };
  } catch (error) {
    return { ok: false, status: error.status || 0, errorKey: getErrorMessageKey(error.status || 0), message: error.message };
  }
}

export async function getTestimonials() {
  try {
    const response = await apiGet('/testimonials');
    return { ok: true, data: response?.data?.testimonials || response?.data || [] };
  } catch (error) {
    return { ok: false, status: error.status || 0, errorKey: getErrorMessageKey(error.status || 0), message: error.message };
  }
}

export async function submitContactForm(data) {
  try {
    const response = await apiPost('/messages', {
      name: data.name,
      companyName: data.companyName || '',
      email: data.email,
      country: data.country || '',
      countryCode: data.countryCode || '',
      dialCode: data.dialCode || '',
      phoneNumber: data.phoneNumber || '',
      phone: data.phone || [data.dialCode, data.phoneNumber].filter(Boolean).join(' ').trim(),
      visitedChina: Boolean(data.visitedChina),
      interests: Array.isArray(data.interests) ? data.interests : [],
      estimatedOrderQuantity: data.estimatedOrderQuantity || '',
      startTimeline: data.startTimeline || '',
      productReadiness: data.productReadiness || '',
      message: data.message,
    });

    return {
      ok: true,
      status: 201,
      data: response?.data || response,
      message: response?.message || 'Contact submitted successfully',
    };
  } catch (error) {
    return {
      ok: false,
      status: error.status || 0,
      errorKey: getErrorMessageKey(error.status || 0),
      message: error.message || 'Unable to submit your message. Please try again.',
      payload: error.payload,
    };
  }
}

export { getErrorMessageKey };
