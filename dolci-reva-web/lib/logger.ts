/**
 * Système de logging centralisé pour l'application
 * 
 * En production, seules les erreurs sont loggées.
 * En développement, tous les logs sont actifs.
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log un message d'information
   * @param message - Message à logger
   * @param data - Données additionnelles (optionnel)
   */
  log(message: string, ...data: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...data);
    }
  }

  /**
   * Log un message d'information
   * @param message - Message à logger
   * @param data - Données additionnelles (optionnel)
   */
  info(message: string, ...data: unknown[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...data);
    }
  }

  /**
   * Log un message de débogage
   * @param message - Message à logger
   * @param data - Données additionnelles (optionnel)
   */
  debug(message: string, ...data: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Log un avertissement
   * @param message - Message à logger
   * @param data - Données additionnelles (optionnel)
   */
  warn(message: string, ...data: unknown[]): void {
    // Les warnings sont toujours loggés
    console.warn(`[WARN] ${message}`, ...data);
  }

  /**
   * Log une erreur
   * @param message - Message à logger
   * @param error - Erreur à logger (optionnel)
   * @param data - Données additionnelles (optionnel)
   */
  error(message: string, error?: unknown, ...data: unknown[]): void {
    // Les erreurs sont toujours loggées
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}`, error, ...data);
    } else {
      console.error(`[ERROR] ${message}`, error, ...data);
    }
  }

  /**
   * Log un message avec un niveau personnalisé
   * @param level - Niveau de log
   * @param message - Message à logger
   * @param data - Données additionnelles (optionnel)
   */
  logWithLevel(level: LogLevel, message: string, ...data: unknown[]): void {
    switch (level) {
      case 'log':
        this.log(message, ...data);
        break;
      case 'info':
        this.info(message, ...data);
        break;
      case 'debug':
        this.debug(message, ...data);
        break;
      case 'warn':
        this.warn(message, ...data);
        break;
      case 'error':
        this.error(message, undefined, ...data);
        break;
    }
  }
}

// Export d'une instance singleton
export const logger = new Logger();

// Export du type pour utilisation dans d'autres fichiers
export type { LogLevel };

