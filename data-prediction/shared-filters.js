/**
 * CPM Horizon 2035 - Shared Filters System
 * Gère la persistance et les presets de filtres via localStorage
 * Utilisé par tous les modules de data-prediction
 */

class FilterManager {
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.storageKey = `cpm_filters_${moduleName}`;
    this.presetsKey = 'cpm_presets_global';
    this.currentKey = 'cpm_filters_current';
    this.initializeListeners();
  }

  /**
   * Récupère les filtres actuels depuis localStorage
   */
  getCurrentFilters() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erreur parsing filters:', e);
        return this.getDefaultFilters();
      }
    }
    return this.getDefaultFilters();
  }

  /**
   * Retourne les filtres par défaut
   * À redéfinir dans chaque module selon ses besoins
   */
  getDefaultFilters() {
    return {
      years: Array.from({length: 7}, (_, i) => 2020 + i), // 2020-2026
      sectors: ['AUDIOVIS', 'LOISIR'],
      status: [],
      startDate: null,
      endDate: null
    };
  }

  /**
   * Sauvegarde les filtres courants
   */
  saveFilters(filters) {
    localStorage.setItem(this.storageKey, JSON.stringify(filters));
    // Sync global
    localStorage.setItem(this.currentKey, JSON.stringify({
      module: this.moduleName,
      filters: filters,
      timestamp: new Date().toISOString()
    }));
    this.dispatchEvent('filters-changed', filters);
  }

  /**
   * Restaure les filtres du dernier chargement
   */
  restoreFilters() {
    return this.getCurrentFilters();
  }

  /**
   * Réinitialialise aux filtres par défaut
   */
  resetFilters() {
    const defaults = this.getDefaultFilters();
    this.saveFilters(defaults);
    this.dispatchEvent('filters-reset', defaults);
    return defaults;
  }

  /**
   * Enregistre une configuration comme preset nommé
   */
  savePreset(presetName, filters) {
    const presets = this.getPresets();
    
    // Trouver le prochain slot disponible
    let slot = 1;
    while (presets[`preset_${slot}`] && slot <= 5) {
      slot++;
    }
    
    if (slot > 5) {
      console.warn('Maximum de presets atteint (5)');
      return false;
    }

    const presetId = `preset_${slot}`;
    presets[presetId] = {
      id: presetId,
      name: presetName.substring(0, 30), // Max 30 chars
      filters: filters,
      module: this.moduleName,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    localStorage.setItem(this.presetsKey, JSON.stringify(presets));
    this.dispatchEvent('preset-saved', { presetId, name: presetName });
    return presetId;
  }

  /**
   * Charge un preset par son ID
   */
  loadPreset(presetId) {
    const presets = this.getPresets();
    if (!presets[presetId]) {
      console.error(`Preset non trouvé: ${presetId}`);
      return null;
    }

    const preset = presets[presetId];
    
    // Update lastUsed
    presets[presetId].lastUsed = new Date().toISOString();
    localStorage.setItem(this.presetsKey, JSON.stringify(presets));

    this.saveFilters(preset.filters);
    this.dispatchEvent('preset-loaded', { presetId, name: preset.name });
    
    return preset.filters;
  }

  /**
   * Supprime un preset
   */
  deletePreset(presetId) {
    const presets = this.getPresets();
    if (presets[presetId]) {
      delete presets[presetId];
      localStorage.setItem(this.presetsKey, JSON.stringify(presets));
      this.dispatchEvent('preset-deleted', { presetId });
      return true;
    }
    return false;
  }

  /**
   * Récupère tous les presets
   */
  getPresets() {
    const stored = localStorage.getItem(this.presetsKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erreur parsing presets:', e);
        return {};
      }
    }
    return {};
  }

  /**
   * Récupère les presets pertinents pour ce module
   */
  getModulePresets() {
    const allPresets = this.getPresets();
    return Object.values(allPresets).filter(p => p.module === this.moduleName);
  }

  /**
   * Vide TOUS les presets (attention!)
   */
  clearAllPresets() {
    if (confirm('⚠️ Supprimer définitivement tous les presets sauvegardés?')) {
      localStorage.removeItem(this.presetsKey);
      this.dispatchEvent('presets-cleared', {});
      return true;
    }
    return false;
  }

  /**
   * Exporte les filtres actuels au format JSON (pour partage)
   */
  exportFilters(filters) {
    const data = {
      module: this.moduleName,
      filters: filters,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cpm-filters-${this.moduleName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Importe des filtres depuis un fichier JSON
   */
  importFilters(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.filters) {
            this.saveFilters(data.filters);
            this.dispatchEvent('filters-imported', data);
            resolve(data.filters);
          } else {
            reject(new Error('Format fichier invalide'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsText(file);
    });
  }

  /**
   * Initialise les event listeners pour sync multi-tab
   */
  initializeListeners() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const filters = JSON.parse(event.newValue);
          this.dispatchEvent('filters-changed-external', filters);
        } catch (e) {
          console.error('Erreur sync multi-tab:', e);
        }
      }
    });
  }

  /**
   * Dispatch événement personnalisé
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Statistiques d'utilisation des presets
   */
  getStatistics() {
    const presets = this.getModulePresets();
    return {
      totalPresets: presets.length,
      presets: presets.map(p => ({
        name: p.name,
        lastUsed: p.lastUsed,
        createdAt: p.createdAt
      }))
    };
  }
}

// Export pour utilisation globale
window.FilterManager = FilterManager;
