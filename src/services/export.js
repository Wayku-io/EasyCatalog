// JSON Export Service for EasyCatalog

export function exportCatalogToJson(catalogName, items) {
  const cleanName = (catalogName || 'catalogue').trim();
  const data = {
    name: cleanName,
    exportedAt: new Date().toISOString(),
    count: (items || []).length,
    type: items && items.length > 0 ? items[0].type : 'movie',
    items: (items || []).map(i => ({
      id: i.id,
      title: i.title,
      type: i.type,
      year: i.year,
      poster: i.poster
    }))
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  a.href = url;
  a.download = `${fileSlug || 'catalogue'}_easycatalog.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllCollectionsToJson(collections) {
  const data = {
    appName: "EasyCatalog",
    exportedAt: new Date().toISOString(),
    collectionsCount: (collections || []).length,
    collections: collections
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mes_catalogues_easycatalog.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
