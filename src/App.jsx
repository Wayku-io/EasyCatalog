import React, { useState, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { useToast } from './components/Toast';
import Header from './components/Header';
import ConfigModal from './components/ConfigModal';
import HubScreen from './components/HubScreen';
import SearchScreen from './components/SearchScreen';
import BuilderScreen from './components/BuilderScreen';
import CollectionsScreen from './components/CollectionsScreen';
import DesktopDashboard from './components/DesktopDashboard';
import LegalModal from './components/LegalModal';
import {
  publishCollection,
  parseRepoString,
  exchangeOAuthCode,
  fetchUserProfile,
  fetchUserRepos,
  createDefaultRepo
} from './services/github';
import { sortItems } from './utils/sorting';

export default function App() {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle OAuth code callback from GitHub
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // Remove ?code=... from URL cleanly without page reload
      window.history.replaceState({}, document.title, window.location.pathname);

      (async () => {
        try {
          addToast("Connexion à GitHub en cours...", "info");
          const token = await exchangeOAuthCode(code);
          const profile = await fetchUserProfile(token);

          // Get existing repos
          const repos = await fetchUserRepos(token);
          let selectedRepo = localStorage.getItem('github_repo');

          if (!selectedRepo || !repos.some((r) => r.toLowerCase() === selectedRepo.toLowerCase())) {
            const preferred =
              repos.find((r) => r.toLowerCase().endsWith('/aio-catalogs')) ||
              repos.find((r) => r.toLowerCase().endsWith('/nuvio-catalogs')) ||
              repos.find((r) => r.toLowerCase().endsWith('/mes-catalogues')) ||
              repos.find((r) => r.toLowerCase().endsWith('/easycatalog')) ||
              repos[0] ||
              `${profile.login}/aio-catalogs`;
            selectedRepo = preferred;
          }

          localStorage.setItem('github_token', token);
          localStorage.setItem('github_repo', selectedRepo);
          localStorage.setItem('gate_dismissed', 'true');

          setConfig((prev) => ({
            ...prev,
            githubToken: token,
            githubRepo: selectedRepo
          }));
          setHasDismissedGate(true);
          addToast(`🎉 Connecté avec succès ! Bienvenue @${profile.login}`, 'success');
          // Open settings so the user can verify or choose their repository
          setIsSettingsOpen(true);
        } catch (err) {
          addToast(err.message || "Erreur lors de la connexion GitHub.", 'error');
        }
      })();
    }
  }, []);

  // Config State (only personal/custom user keys are stored in user state)
  const [config, setConfig] = useState(() => {
    const customTmdb = localStorage.getItem('tmdb_key') || localStorage.getItem('tmdb_api_key') || '';
    const token = localStorage.getItem('github_token') || '';
    const repo = localStorage.getItem('github_repo') || '';
    return {
      tmdbKey: customTmdb,
      githubToken: token,
      githubRepo: repo
    };
  });

  const [hasDismissedGate, setHasDismissedGate] = useState(() => {
    return localStorage.getItem('gate_dismissed') === 'true';
  });

  // Screen State: 'hub' | 'search' | 'builder' | 'collections'
  const [currentScreen, setCurrentScreen] = useState('hub');

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Collection / Builder State
  const [catalogName, setCatalogName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortOption, setSortOption] = useState('manual');
  const [resultData, setResultData] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasExistingCollection, setHasExistingCollection] = useState(false);
  const [editingCollectionPath, setEditingCollectionPath] = useState(null);

  // Save config
  const handleSaveConfig = (newConfig) => {
    if (newConfig.tmdbKey) {
      localStorage.setItem('tmdb_key', newConfig.tmdbKey);
      localStorage.setItem('tmdb_api_key', newConfig.tmdbKey);
    } else {
      localStorage.removeItem('tmdb_key');
      localStorage.removeItem('tmdb_api_key');
    }

    if (newConfig.githubToken) {
      localStorage.setItem('github_token', newConfig.githubToken);
    } else {
      localStorage.removeItem('github_token');
    }

    if (newConfig.githubRepo) {
      localStorage.setItem('github_repo', newConfig.githubRepo);
    } else {
      localStorage.removeItem('github_repo');
    }

    localStorage.setItem('gate_dismissed', 'true');
    setConfig(newConfig);
    setHasDismissedGate(true);
    setIsSettingsOpen(false);
  };

  const handleSkipGate = () => {
    localStorage.setItem('gate_dismissed', 'true');
    setHasDismissedGate(true);
  };

  // Flow: Start new collection
  const handleCreateNew = () => {
    setCatalogName('');
    setSelectedItems([]);
    setSortOption('manual');
    setResultData(null);
    setHasExistingCollection(false);
    setEditingCollectionPath(null);
    setCurrentScreen('search');
  };

  // Flow: Sort change handler
  const handleSortChange = (newVal) => {
    const val = typeof newVal === 'string' ? newVal : newVal?.target?.value;
    setSortOption(val);
    if (val && val !== 'manual') {
      setSelectedItems(prev => sortItems(prev, val));
    }
  };

  // Flow: Add or remove item in search (Enforce strict separation: either all movies or all series)
  const handleToggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        if (prev.length > 0) {
          const currentType = prev[0].type;
          if (item.type !== currentType) {
            addToast(t('cannotMixTypesError'), 'error');
            return prev;
          }
        }
        const updated = [...prev, item];
        return sortItems(updated, sortOption);
      }
    });
  };

  // Flow: Open collection data directly into the builder
  const handleOpenEditorWithData = (data) => {
    setCatalogName(data.name || '');
    setSelectedItems(data.items || []);
    setSortOption('manual');
    setEditingCollectionPath(data.path || null);
    setResultData({
      jsDelivrUrl: data.jsDelivrUrl,
      stremioUrl: data.stremioUrl
    });
    setHasExistingCollection(true);
    setCurrentScreen('builder');
  };

  // Flow: Publish to GitHub (Handles renaming: purges old directory if name changed)
  const handlePublish = async () => {
    if (!catalogName.trim()) {
      addToast("Veuillez renseigner un nom pour la collection.", 'error');
      return;
    }
    if (selectedItems.length === 0) {
      addToast("La collection doit contenir au moins un élément.", 'error');
      return;
    }

    if (!config.githubToken || !config.githubRepo) {
      addToast("Token GitHub et dépôt requis pour publier. Configurez-les dans les Paramètres ⚙️.", 'error');
      setIsSettingsOpen(true);
      return;
    }

    setIsPublishing(true);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const res = await publishCollection(
        owner,
        repo,
        config.githubToken,
        catalogName.trim(),
        selectedItems,
        editingCollectionPath
      );
      setEditingCollectionPath(res.path);
      setResultData(res);
      addToast(t('publishSuccess'), 'success');
    } catch (err) {
      console.error(err);
      addToast(`${t('publishError')} ${err.message}`, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetBuilder = () => {
    setCatalogName('');
    setSelectedItems([]);
    setSortOption('manual');
    setResultData(null);
    setHasExistingCollection(false);
    setEditingCollectionPath(null);
  };

  return (
    <div className="app-wrapper">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHub={() => setCurrentScreen('hub')}
        currentRepo={config.githubRepo}
      />

      <main style={{ flex: 1, width: '100%' }}>
        {/* Onboarding Gate if not dismissed yet */}
        {!hasDismissedGate ? (
          <ConfigModal
            isOpen={true}
            isInitialGate={true}
            config={config}
            onSave={handleSaveConfig}
            onClose={handleSkipGate}
            onSkip={handleSkipGate}
            onOpenLegal={() => setIsLegalOpen(true)}
          />
        ) : isDesktop ? (
          /* ========================================================
             DESKTOP STUDIO DASHBOARD (SCREEN >= 1024PX)
             ======================================================== */
          <DesktopDashboard
            config={config}
            catalogName={catalogName}
            setCatalogName={setCatalogName}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            onToggleItem={handleToggleItem}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onSortChange={handleSortChange}
            resultData={resultData}
            setResultData={setResultData}
            isPublishing={isPublishing}
            handlePublish={handlePublish}
            handleResetBuilder={handleResetBuilder}
            editingCollectionPath={editingCollectionPath}
            setEditingCollectionPath={setEditingCollectionPath}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenLegal={() => setIsLegalOpen(true)}
          />
        ) : (
          /* ========================================================
             MOBILE STEP-BY-STEP SCREENS (< 1024PX)
             ======================================================== */
          <>
            {/* HUB SCREEN */}
            {currentScreen === 'hub' && (
              <HubScreen
                onCreateNew={handleCreateNew}
                onOpenCollections={() => setCurrentScreen('collections')}
                currentRepo={config.githubRepo}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenLegal={() => setIsLegalOpen(true)}
              />
            )}

            {/* COLLECTIONS SCREEN */}
            {currentScreen === 'collections' && (
              <CollectionsScreen
                config={config}
                onBack={() => setCurrentScreen('hub')}
                onOpenEditorWithData={handleOpenEditorWithData}
                onCreateNew={handleCreateNew}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {/* SEARCH SCREEN */}
            {currentScreen === 'search' && (
              <SearchScreen
                apiKey={config.tmdbKey}
                selectedItems={selectedItems}
                lockedType={selectedItems.length > 0 ? selectedItems[0].type : null}
                onToggleItem={handleToggleItem}
                onGoToBuilder={() => setCurrentScreen('builder')}
                onBack={() => {
                  if (hasExistingCollection) {
                    setCurrentScreen('builder');
                  } else {
                    setCurrentScreen('hub');
                  }
                }}
                hasExistingCollection={hasExistingCollection}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {/* BUILDER SCREEN */}
            {currentScreen === 'builder' && (
              <BuilderScreen
                catalogName={catalogName}
                setCatalogName={setCatalogName}
                items={selectedItems}
                setItems={setSelectedItems}
                sortOption={sortOption}
                setSortOption={setSortOption}
                onSortChange={handleSortChange}
                onAddMoreItems={() => setCurrentScreen('search')}
                onPublish={handlePublish}
                isPublishing={isPublishing}
                resultData={resultData}
                onReset={handleResetBuilder}
                onBackToHub={() => setCurrentScreen('hub')}
                editingCollectionPath={editingCollectionPath}
              />
            )}
          </>
        )}
      </main>

      {/* Settings Modal (available anytime) */}
      <ConfigModal
        isOpen={isSettingsOpen}
        isInitialGate={false}
        config={config}
        onSave={handleSaveConfig}
        onClose={() => setIsSettingsOpen(false)}
        onOpenLegal={() => setIsLegalOpen(true)}
      />

      {/* Legal & Privacy Modal */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />
    </div>
  );
}
