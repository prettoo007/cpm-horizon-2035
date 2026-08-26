/**
 * CPM Horizon 2035 - Shared Alerts System
 * Gère les alertes critiques, les seuils et les notifications toast
 */

class AlertManager {
  constructor() {
    this.toastContainer = null;
    this.activeToasts = [];
    this.alertThresholds = this.getDefaultThresholds();
    this.initializeContainer();
  }

  /**
   * Thresholds par metric (à personnaliser par module)
   */
  getDefaultThresholds() {
    return {
      // Analyse SAP
      riskScore: {
        critical: 40,  // > 40 = rouge
        warning: 25    // > 25 = orange
      },
      // Tentes
      tauxPanne: {
        critical: 0.60,
        warning: 0.50
      },
      // Météo - Taux refus
      tauxRefus: {
        critical: 0.20,
        warning: 0.15
      },
      // Prédiction - Écart forecast
      ecartForecast: {
        critical: 0.20,
        warning: 0.10
      }
    };
  }

  /**
   * Configure les seuils pour un module spécifique
   */
  setThresholds(metricName, criticalValue, warningValue) {
    this.alertThresholds[metricName] = {
      critical: criticalValue,
      warning: warningValue
    };
  }

  /**
   * Évalue le statut d'une métrique contre les seuils
   * Retourne: { status: 'ok'|'warning'|'critical', level: 0|1|2 }
   */
  evaluateMetric(metricName, value) {
    const thresholds = this.alertThresholds[metricName];
    if (!thresholds) {
      return { status: 'unknown', level: -1 };
    }

    if (value > thresholds.critical) {
      return { status: 'critical', level: 2 };
    } else if (value > thresholds.warning) {
      return { status: 'warning', level: 1 };
    } else {
      return { status: 'ok', level: 0 };
    }
  }

  /**
   * Retourne le badge HTML + classe CSS pour affichage
   */
  getAlertBadge(status) {
    const badges = {
      critical: {
        icon: '🔴',
        text: 'CRITIQUE',
        class: 'alert-badge critical',
        color: '#e74c3c'
      },
      warning: {
        icon: '🟡',
        text: 'ALERTE',
        class: 'alert-badge warning',
        color: '#f39c12'
      },
      ok: {
        icon: '🟢',
        text: 'OK',
        class: 'alert-badge ok',
        color: '#2ecc71'
      },
      unknown: {
        icon: '⚪',
        text: '?',
        class: 'alert-badge unknown',
        color: '#95a5a6'
      }
    };
    return badges[status] || badges.unknown;
  }

  /**
   * Crée un élément badge pour insertion en HTML
   */
  createBadgeElement(metricName, value) {
    const evaluation = this.evaluateMetric(metricName, value);
    const badge = this.getAlertBadge(evaluation.status);
    
    const el = document.createElement('span');
    el.className = badge.class;
    el.innerHTML = `${badge.icon} ${badge.text}`;
    el.style.color = badge.color;
    el.dataset.metric = metricName;
    el.dataset.value = value;
    el.dataset.status = evaluation.status;
    
    return el;
  }

  /**
   * Initialise le conteneur toast
   */
  initializeContainer() {
    if (document.getElementById('toast-container')) return;
    
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      font-family: 'Roboto', sans-serif;
    `;

container.id = 'toast-container';
container.style.position = 'fixed';
container.style.bottom = '20px';
container.style.right = '20px';
container.style.zIndex = '9999';
container.style.display = 'flex';
container.style.flexDirection = 'column';
container.style.gap = '10px';
    
   if (container) {
    document.body.appendChild(container);
}
    this.toastContainer = container;
  }

  /**
   * Affiche une notification toast
   * type: 'critical' | 'warning' | 'success' | 'info'
   * duration: millisecondes (0 = persistant)
   */
  showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    
    const typeConfig = {
      critical: { bg: '#e74c3c', icon: '🔴', border: '#c0392b' },
      warning: { bg: '#f39c12', icon: '🟡', border: '#e67e22' },
      success: { bg: '#2ecc71', icon: '✅', border: '#27ae60' },
      info: { bg: '#3498db', icon: 'ℹ️', border: '#2980b9' }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    toast.className = `toast ${type}`;
    toast.style.cssText = `
      background: ${config.bg};
      color: white;
      padding: 16px 20px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 4px solid ${config.border};
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    `;
    
    const content = document.createElement('span');
    content.textContent = message;
    content.style.marginRight = '16px';
    toast.appendChild(content);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    `;
    closeBtn.onclick = () => this.removeToast(toast);
    toast.appendChild(closeBtn);
    
    this.toastContainer.appendChild(toast);
    this.activeToasts.push(toast);
    
    // Auto-remove si duration > 0
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }
    
    return toast;
  }

  /**
   * Supprime un toast de l'affichage
   */
  removeToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      this.activeToasts = this.activeToasts.filter(t => t !== toast);
    }, 300);
  }

  /**
   * Affiche les animations CSS
   */
  injectAnimations() {
    if (document.getElementById('toast-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      
      .alert-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        margin-right: 8px;
      }
      
      .alert-badge.critical {
        background: rgba(231, 76, 60, 0.15);
        color: #c0392b;
      }
      
      .alert-badge.warning {
        background: rgba(243, 156, 18, 0.15);
        color: #d68910;
      }
      
      .alert-badge.ok {
        background: rgba(46, 204, 113, 0.15);
        color: #27ae60;
      }
      
      .alert-badge.unknown {
        background: rgba(149, 165, 166, 0.15);
        color: #7f8c8d;
      }
      
      .recommendation {
        padding: 12px 16px;
        margin-top: 12px;
        border-left: 3px solid #e75480;
        background: rgba(231, 84, 128, 0.05);
        border-radius: 2px;
        font-size: 13px;
        line-height: 1.5;
      }
      
      .recommendation.critical {
        border-left-color: #c0392b;
        background: rgba(231, 76, 60, 0.08);
      }
      
      .recommendation.warning {
        border-left-color: #f39c12;
        background: rgba(243, 156, 18, 0.08);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Analyse un ensemble de données et déclenche les alertes appropriées
   */
  analyzeData(data, metricsConfig) {
    /**
     * metricsConfig = {
     *   riskScore: { value: 42, metric: 'riskScore' },
     *   tauxPanne: { value: 0.65, metric: 'tauxPanne' }
     * }
     */
    const alerts = [];
    
    Object.entries(metricsConfig).forEach(([key, config]) => {
      const evaluation = this.evaluateMetric(config.metric, config.value);
      
      if (evaluation.status !== 'ok') {
        alerts.push({
          metric: config.metric,
          value: config.value,
          status: evaluation.status,
          level: evaluation.level,
          label: config.label || key
        });
      }
    });
    
    return alerts;
  }

  /**
   * Génère une notification toast pour chaque alerte
   */
  notifyAlerts(alerts) {
    alerts.forEach(alert => {
      const messages = {
        riskScore: `⚠️ ALERTE: Risk Score = ${alert.value}/100 (seuil: ${this.alertThresholds.riskScore[alert.status === 'critical' ? 'critical' : 'warning']})`,
        tauxPanne: `⚠️ ALERTE: Taux de panne = ${(alert.value * 100).toFixed(1)}% (seuil: ${(this.alertThresholds.tauxPanne[alert.status === 'critical' ? 'critical' : 'warning'] * 100).toFixed(0)}%)`,
        tauxRefus: `⚠️ ALERTE: Taux de refus = ${(alert.value * 100).toFixed(1)}% (seuil: ${(this.alertThresholds.tauxRefus[alert.status === 'critical' ? 'critical' : 'warning'] * 100).toFixed(0)}%)`,
        ecartForecast: `⚠️ ALERTE: Écart forecast = ±${(alert.value * 100).toFixed(1)}% (seuil: ${(this.alertThresholds.ecartForecast[alert.status === 'critical' ? 'critical' : 'warning'] * 100).toFixed(0)}%)`
      };
      
      const message = messages[alert.metric] || `ALERTE: ${alert.label}`;
      this.showToast(message, alert.status, alert.status === 'critical' ? 0 : 5000);
    });
  }

  /**
   * Récupère les recommandations texte pour une alerte
   */
  getRecommendation(metric, status) {
    const recommendations = {
      riskScore: {
        critical: '🔴 ACTION URGENTE: Vérifier équipements critiques et planifier maintenance préventive',
        warning: '🟡 ACTION: Analyser les défaillances et renforcer le programme de maintenance'
      },
      tauxPanne: {
        critical: '🔴 MAINTENANCE URGENTE: Tents affectées = risque opérationnel immédiat',
        warning: '🟡 MAINTENANCE: Augmenter inspections préventives'
      },
      tauxRefus: {
        critical: '🔴 PROCESSUS DE PRÊT: À revoir immédiatement (qualité équipements?)',
        warning: '🟡 PROCESSUS: Investiguer raison des refus'
      },
      ecartForecast: {
        critical: '🔴 MODÈLE: Recalibrer la prédiction (conditions ont changé)',
        warning: '🟡 SUIVI: Recalibrage recommandé pour 2026'
      }
    };
    
    return recommendations[metric]?.[status] || 'Vérifier la métrique';
  }
}

// Initialize globalement
const alertManager = new AlertManager();
alertManager.injectAnimations();

// Export pour utilisation
window.AlertManager = AlertManager;
window.alertManager = alertManager;
