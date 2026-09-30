// GitHub API Service

export const PRIMARY_BASE_PATH = 'manifests';
const SUB_BASE_PATH = 'EasyCatalog/manifests';
const LEGACY_BASE_PATH = 'tools/catalog-generator/manifests';

export function parseRepoString(repoStr) {
  if (!repoStr) return { owner: '', repo: '' };
  const parts = repoStr.trim().split('/');
  return {
    owner: parts[0] || '',
    repo: parts[1] || ''
  };
}

export function getGitHubClientId() {
  return import.meta.env.VITE_GITHUB_CLIENT_ID || '';
}

export function loginWithGitHub() {
  const clientId = getGitHubClientId();
  if (!clientId) {
    throw new Error("L'identifiant OAuth GitHub (VITE_GITHUB_CLIENT_ID) n'est pas configuré.");
  }
  const redirectUri = window.location.origin + window.location.pathname;
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}&prompt=select_account`;
  window.location.href = url;
}

export async function exchangeOAuthCode(code) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || "Échec de l'authentification GitHub.");
  }
  return data.access_token;
}

export async function fetchUserProfile(token) {
  if (!token) return null;
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) throw new Error("Token GitHub invalide ou expiré.");
  return await res.json();
}

export async function fetchUserRepos(token) {
  if (!token) return [];
  const res = await fetch('https://api.github.com/user/repos?per_page=100&affiliation=owner&sort=updated', {
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) return [];
  const list = await res.json();
  return Array.isArray(list) ? list.map(r => r.full_name) : [];
}

export async function createDefaultRepo(token, repoName = 'EasyCatalog') {
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      name: repoName,
      description: "Catalogues AIO Metadata générés par EasyCatalog",
      private: false,
      auto_init: true
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Impossible de créer le dépôt GitHub.");
  }
  return await res.json();
}

export async function requestDeviceCode(clientId, customProxy = '') {
  const base = customProxy ? customProxy.replace(/\/$/, '') : (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? '/api/github-login' : '');
  const targetUrl = base ? `${base}/login/device/code` : 'https://github.com/login/device/code';

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId.trim(),
      scope: 'repo'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || `Erreur GitHub Device Flow (${res.status})`);
  }
  return data; // { device_code, user_code, verification_uri, expires_in, interval }
}

export async function pollDeviceToken(clientId, deviceCode, interval = 5, customProxy = '', signal) {
  const base = customProxy ? customProxy.replace(/\/$/, '') : (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? '/api/github-login' : '');
  const targetUrl = base ? `${base}/login/oauth/access_token` : 'https://github.com/login/oauth/access_token';

  let pollInterval = Math.max(interval || 5, 5) * 1000;

  while (!signal?.aborted) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    if (signal?.aborted) throw new Error("Authentification annulée");

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId.trim(),
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        }),
        signal
      });

      const data = await res.json().catch(() => ({}));

      if (data.access_token) {
        return data.access_token;
      }

      if (data.error === 'authorization_pending') {
        continue;
      } else if (data.error === 'slow_down') {
        pollInterval += 5000;
        continue;
      } else if (data.error === 'expired_token') {
        throw new Error("Le code a expiré. Veuillez relancer la connexion.");
      } else if (data.error === 'access_denied') {
        throw new Error("Autorisation refusée sur GitHub.");
      } else if (data.error) {
        throw new Error(data.error_description || data.error);
      }
    } catch (e) {
      if (e.name === 'AbortError') throw new Error("Authentification annulée");
      if (e.message && !e.message.includes('fetch')) throw e;
    }
  }
  throw new Error("Authentification annulée");
}

export async function pushFile(owner, repo, token, filePath, contentObj, commitMessage) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  
  let sha = null;
  try {
    const getRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }
  } catch (e) {
    console.warn(`Could not check SHA for ${filePath}`, e);
  }

  const contentStr = JSON.stringify(contentObj, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(contentStr)));
  
  const body = {
    message: commitMessage,
    content: base64Content,
    branch: 'main'
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify(body)
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`Erreur GitHub API (${putRes.status}): ${errText}`);
  }

  return await putRes.json();
}

/**
 * Purge jsDelivr CDN cache for specific file paths.
 * Waits a short buffer (~1.8s) for GitHub main branch commit propagation
 * to ensure jsDelivr CDN fetches the latest commit when purging.
 */
export async function purgeJsDelivrCache(owner, repo, paths) {
  if (!paths || paths.length === 0) return;

  const uniquePaths = [...new Set(paths.filter(Boolean).map(p => p.startsWith('/') ? p.slice(1) : p))];
  if (uniquePaths.length === 0) return;

  // Buffer to guarantee GitHub's refs/heads/main has propagated
  await new Promise(resolve => setTimeout(resolve, 1800));

  const BATCH_SIZE = 6;
  for (let i = 0; i < uniquePaths.length; i += BATCH_SIZE) {
    const batch = uniquePaths.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async (filePath) => {
        try {
          await fetch(`https://purge.jsdelivr.net/gh/${owner}/${repo}@main/${filePath}`);
        } catch (e) {
          console.warn(`Purge failed for ${filePath}:`, e);
        }
      })
    );
  }
}

export async function deleteFile(owner, repo, token, filePath, commitMessage = `Delete ${filePath}`) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const getRes = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!getRes.ok) return; // File already gone

  const data = await getRes.json();
  const delRes = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: commitMessage,
      sha: data.sha,
      branch: 'main'
    })
  });

  if (!delRes.ok) {
    const errText = await delRes.text();
    throw new Error(`Erreur suppression (${delRes.status}): ${errText}`);
  }
}

async function fetchDirectoriesFromPath(owner, repo, token, basePath) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${basePath}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    const ignoredPatterns = ['super_manifest', 'super-manifest', 'all_catalogs', 'all-catalogs', 'pack_complet', 'pack-complet'];

    return items
      .filter(dir => {
        if (dir.type !== 'dir') return false;
        const low = dir.name.toLowerCase();
        return !ignoredPatterns.some(p => low.includes(p));
      })
      .map(dir => {
        let displayName = dir.name.replace(/^custom\./, '').replace(/_/g, ' ');
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        const manifestUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${dir.path}/manifest.json`;
        return {
          name: dir.name,
          displayName,
          path: dir.path,
          manifestUrl,
          stremioUrl: `stremio://${manifestUrl.replace(/^https?:\/\//, '')}`
        };
      });
  } catch (err) {
    return [];
  }
}

export async function fetchExistingCollections(owner, repo, token) {
  // 1. Try standard root manifests/
  const primaryCollections = await fetchDirectoriesFromPath(owner, repo, token, PRIMARY_BASE_PATH);
  
  // 2. Also check EasyCatalog/manifests
  const subCollections = await fetchDirectoriesFromPath(owner, repo, token, SUB_BASE_PATH);

  // 3. Also check legacy path tools/catalog-generator/manifests if needed
  const legacyCollections = await fetchDirectoriesFromPath(owner, repo, token, LEGACY_BASE_PATH);
  
  // Merge and deduplicate by folder name (primary takes precedence)
  const seen = new Set();
  const merged = [];
  
  for (const col of [...primaryCollections, ...subCollections, ...legacyCollections]) {
    if (!seen.has(col.name)) {
      seen.add(col.name);
      merged.push(col);
    }
  }

  return merged;
}

export async function loadCollectionData(owner, repo, token, dirPath) {
  const manifestUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}/manifest.json`;
  const mRes = await fetch(manifestUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!mRes.ok) throw new Error("Manifeste introuvable sur GitHub.");
  
  const mData = await mRes.json();
  const jsonStr = decodeURIComponent(escape(atob(mData.content)));
  const manifest = JSON.parse(jsonStr);

  let allMetas = [];
  if (manifest.metas) {
    allMetas = manifest.metas;
  } else {
    for (const cat of (manifest.catalogs || [])) {
      const catUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}/catalog/${cat.type}/${cat.id}.json`;
      try {
        const cRes = await fetch(catUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          const cObj = JSON.parse(decodeURIComponent(escape(atob(cData.content))));
          if (cObj.metas) allMetas = allMetas.concat(cObj.metas);
        }
      } catch (e) {
        console.warn("Erreur chargement catalogue secondaire", e);
      }
    }
  }

  const items = allMetas.map(meta => ({
    id: meta.id,
    type: meta.type === 'tv' ? 'series' : meta.type,
    title: meta.name || meta.title,
    year: meta.year || meta.releaseInfo || 'N/A',
    poster: meta.poster
  }));

  const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${dirPath}/manifest.json`;

  return {
    path: dirPath,
    name: manifest.name || dirPath.split('/').pop(),
    items: items,
    jsDelivrUrl: jsDelivrUrl,
    stremioUrl: `stremio://${jsDelivrUrl.replace(/^https?:\/\//, '')}`
  };
}

export async function deleteCollectionFromGithub(owner, repo, token, dirPath) {
  const manifestUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}/manifest.json`;
  const getRes = await fetch(manifestUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const pathsToPurge = [`${dirPath}/manifest.json`];
  if (getRes.ok) {
    const fileData = await getRes.json();
    const mObj = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
    for (const cat of (mObj.catalogs || [])) {
      const catPath = `${dirPath}/catalog/${cat.type}/${cat.id}.json`;
      pathsToPurge.push(catPath);
      await deleteFile(owner, repo, token, catPath);
    }
  }
  
  await deleteFile(owner, repo, token, `${dirPath}/manifest.json`, `EasyCatalog: Delete collection ${dirPath}`);
  await purgeJsDelivrCache(owner, repo, pathsToPurge);
}

export async function publishCollection(owner, repo, token, catalogName, items, oldDirPath = null) {
  if (!items || items.length === 0) {
    throw new Error("La collection ne contient aucun élément.");
  }

  const cleanId = "custom." + catalogName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  const metas = items.map(item => ({
    id: item.id,
    type: item.type === 'tv' ? 'series' : item.type,
    name: item.title,
    poster: item.poster,
    year: item.year
  }));

  const uniqueTypes = [...new Set(metas.map(m => m.type))];
  if (uniqueTypes.length === 0) uniqueTypes.push('movie');

  const manifest = {
    id: `org.custom.catalog.${cleanId}`,
    version: "1.0.0",
    name: catalogName,
    description: `Custom catalog generated via EasyCatalog`,
    resources: ["catalog"],
    types: uniqueTypes,
    catalogs: uniqueTypes.map(t => ({
      type: t,
      id: cleanId,
      name: catalogName
    }))
  };

  const newDirPath = `${PRIMARY_BASE_PATH}/${cleanId}`;
  const manifestPath = `${newDirPath}/manifest.json`;

  // Detect whether this is an update to an existing collection or a new creation
  let isUpdate = Boolean(oldDirPath);
  if (!isUpdate) {
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${manifestPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (checkRes.ok) {
        isUpdate = true;
      }
    } catch (e) {
      // ignore
    }
  }

  await pushFile(owner, repo, token, manifestPath, manifest, `EasyCatalog: Update manifest for ${catalogName}`);

  const updatedCatalogPaths = [];
  for (const type of uniqueTypes) {
    const typeMetas = metas.filter(m => m.type === type);
    const catalogObj = { metas: typeMetas };
    const catPath = `${newDirPath}/catalog/${type}/${cleanId}.json`;
    await pushFile(owner, repo, token, catPath, catalogObj, `EasyCatalog: Update ${type} catalog for ${catalogName}`);
    updatedCatalogPaths.push(catPath);
  }

  // If renaming an existing collection (old directory differs from new directory), purge old files
  if (oldDirPath && oldDirPath !== newDirPath) {
    try {
      await deleteCollectionFromGithub(owner, repo, token, oldDirPath);
    } catch (err) {
      console.warn("Could not delete previous collection path:", err);
    }
  }

  // Purge jsDelivr cache automatically ONLY when updating an existing collection
  if (isUpdate) {
    const pathsToPurge = [manifestPath, ...updatedCatalogPaths];
    if (oldDirPath && oldDirPath !== newDirPath) {
      pathsToPurge.push(`${oldDirPath}/manifest.json`);
    }
    await purgeJsDelivrCache(owner, repo, pathsToPurge);
  }

  const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${manifestPath}`;
  const stremioUrl = `stremio://${jsDelivrUrl.replace(/^https?:\/\//, '')}`;

  return {
    id: cleanId,
    path: newDirPath,
    jsDelivrUrl,
    stremioUrl
  };
}

export async function compileSuperManifest(owner, repo, token) {
  // Scan all collections from EasyCatalog/manifests (and legacy if any)
  const collections = await fetchExistingCollections(owner, repo, token);
  
  if (collections.length === 0) {
    throw new Error("Aucune collection trouvée à compiler.");
  }

  let allCatalogs = [];
  let allCatalogFiles = [];

  for (const col of collections) {
    try {
      const manifestUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${col.path}/manifest.json`;
      const mRes = await fetch(manifestUrl, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        const manifest = JSON.parse(decodeURIComponent(escape(atob(mData.content))));
        if (manifest.catalogs) {
          allCatalogs = allCatalogs.concat(manifest.catalogs);

          for (const cat of manifest.catalogs) {
            const catUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${col.path}/catalog/${cat.type}/${cat.id}.json`;
            try {
              const cRes = await fetch(catUrl, { headers: { 'Authorization': `Bearer ${token}` } });
              if (cRes.ok) {
                const cData = await cRes.json();
                const cObj = JSON.parse(decodeURIComponent(escape(atob(cData.content))));
                allCatalogFiles.push({
                  type: cat.type,
                  id: cat.id,
                  contentObj: cObj
                });
              }
            } catch (e) {
              console.warn(`Skipped catalog item ${cat.id}`, e);
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Skipped collection ${col.name}`, err);
    }
  }

  if (allCatalogs.length === 0) {
    throw new Error("Aucun catalogue valide n'a pu être extrait des collections existantes.");
  }

  const superManifest = {
    id: "org.custom.all_catalogs",
    version: "1.0.0",
    name: "Tous mes catalogues (EasyCatalog)",
    description: "Pack complet regroupant l'ensemble de vos catalogues personnalisés EasyCatalog",
    resources: ["catalog"],
    types: [...new Set(allCatalogs.map(c => c.type))],
    catalogs: allCatalogs
  };

  const superManifestPath = `${PRIMARY_BASE_PATH}/all_catalogs/manifest.json`;
  await pushFile(owner, repo, token, superManifestPath, superManifest, "EasyCatalog: Update all-in-one pack");

  const pushedCatalogPaths = [];
  for (const cf of allCatalogFiles) {
    const catPath = `${PRIMARY_BASE_PATH}/all_catalogs/catalog/${cf.type}/${cf.id}.json`;
    await pushFile(owner, repo, token, catPath, cf.contentObj, `EasyCatalog: Update all-in-one pack catalog ${cf.id}`);
    pushedCatalogPaths.push(catPath);
  }

  // Purge jsDelivr cache automatically for the Super Manifest and all consolidated catalog files
  await purgeJsDelivrCache(owner, repo, [superManifestPath, ...pushedCatalogPaths]);

  const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${superManifestPath}`;
  const stremioUrl = `stremio://${jsDelivrUrl.replace(/^https?:\/\//, '')}`;

  return {
    jsDelivrUrl,
    stremioUrl,
    catalogCount: allCatalogs.length
  };
}

export async function fetchSuperManifestInfo(owner, repo, token) {
  if (!owner || !repo || !token) return null;
  const pathsToCheck = [
    `${PRIMARY_BASE_PATH}/all_catalogs/manifest.json`,
    `${SUB_BASE_PATH}/all_catalogs/manifest.json`
  ];
  for (const path of pathsToCheck) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${path}`;
        const stremioUrl = `stremio://${jsDelivrUrl.replace(/^https?:\/\//, '')}`;
        return { jsDelivrUrl, stremioUrl };
      }
    } catch (e) {
      // Continue checking next path
    }
  }
  return null;
}
