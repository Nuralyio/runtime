/**
 * Micro-App Page Manager
 *
 * Manages pages and navigation within a micro-app instance.
 * Provides isolated page state and navigation without affecting parent app.
 */

import type { PageElement } from '../redux//handlers/pages/page.interface'
import { MicroAppStoreContext } from './MicroAppStoreContext'
import { eventDispatcher } from '../../utils/change-detection'

export class MicroAppPageManager {
  private storeContext: MicroAppStoreContext
  private currentPage: PageElement | null = null
  private pages: PageElement[] = []
  private navigationHistory: string[] = []
  private maxHistorySize: number = 50

  constructor(storeContext: MicroAppStoreContext) {
    this.storeContext = storeContext
  }

  /**
   * Load pages for this micro-app
   */
  async loadPages(): Promise<void> {
    this.pages = this.storeContext.getPages()

    // Set first page as current if no page is set
    if (!this.currentPage && this.pages.length > 0) {
      this.currentPage = this.pages[0]
      this.addToHistory(this.currentPage.uuid)
      this.emitPageChangeEvent()
    }
  }

  /**
   * Navigate to a page by ID
   */
  navigateTo(pageId: string): boolean {
    const page = this.pages.find(p => p.uuid === pageId)

    if (page) {
      const previousPage = this.currentPage
      this.currentPage = page
      this.addToHistory(pageId)

      // Emit scoped event
      this.storeContext.getMessageBus().send({
        from: this.storeContext.microAppId,
        type: 'PAGE_CHANGED',
        payload: {
          previousPage: previousPage?.uuid,
          currentPage: page.uuid
        }
      })

      this.emitPageChangeEvent()
      return true
    }

    console.warn(`Page with ID ${pageId} not found in micro-app ${this.storeContext.microAppId}`)
    return false
  }

  /**
   * Navigate to a page by name
   */
  navigateToByName(pageName: string): boolean {
    const page = this.pages.find(p => p.name === pageName)

    if (page) {
      return this.navigateTo(page.uuid)
    }

    console.warn(`Page with name ${pageName} not found in micro-app ${this.storeContext.microAppId}`)
    return false
  }

  /**
   * Navigate to previous page in history
   */
  goBack(): boolean {
    if (this.navigationHistory.length > 1) {
      // Remove current page from history
      this.navigationHistory.pop()

      // Get previous page
      const previousPageId = this.navigationHistory[this.navigationHistory.length - 1]
      const page = this.pages.find(p => p.uuid === previousPageId)

      if (page) {
        this.currentPage = page
        this.emitPageChangeEvent()
        return true
      }
    }

    return false
  }

  /**
   * Navigate to first page
   */
  goToFirstPage(): boolean {
    if (this.pages.length > 0) {
      return this.navigateTo(this.pages[0].uuid)
    }
    return false
  }

  /**
   * Get current page
   */
  getCurrentPage(): PageElement | null {
    return this.currentPage
  }

  /**
   * Get all pages
   */
  getAllPages(): PageElement[] {
    return [...this.pages]
  }

  /**
   * Get page by ID
   */
  getPageById(pageId: string): PageElement | undefined {
    return this.pages.find(p => p.uuid === pageId)
  }

  /**
   * Get page by name
   */
  getPageByName(pageName: string): PageElement | undefined {
    return this.pages.find(p => p.name === pageName)
  }

  /**
   * Check if page exists
   */
  hasPage(pageId: string): boolean {
    return this.pages.some(p => p.uuid === pageId)
  }

  /**
   * Get navigation history
   */
  getHistory(): string[] {
    return [...this.navigationHistory]
  }

  /**
   * Clear navigation history
   */
  clearHistory(): void {
    const currentPageId = this.currentPage?.uuid
    this.navigationHistory = currentPageId ? [currentPageId] : []
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.navigationHistory.length > 1
  }

  /**
   * Add page to history
   */
  private addToHistory(pageId: string): void {
    // Don't add if it's the same as current
    if (this.navigationHistory[this.navigationHistory.length - 1] === pageId) {
      return
    }

    this.navigationHistory.push(pageId)

    // Trim history if exceeds max size
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory = this.navigationHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * Emit page change event
   */
  private emitPageChangeEvent(): void {
    if (this.currentPage) {
      // Emit through store context's event system
      const eventNamespace = `microapp:${this.storeContext.microAppId}`

      eventDispatcher.emit(`${eventNamespace}:page:change`, {
        page: this.currentPage,
        pageId: this.currentPage.uuid,
        pageName: this.currentPage.name
      })
    }
  }

  /**
   * Reload pages from store
   */
  async reloadPages(): Promise<void> {
    const currentPageId = this.currentPage?.uuid

    await this.loadPages()

    // Try to restore current page if it still exists
    if (currentPageId && this.hasPage(currentPageId)) {
      this.navigateTo(currentPageId)
    }
  }

  /**
   * Get page count
   */
  getPageCount(): number {
    return this.pages.length
  }

  /**
   * Get current page index
   */
  getCurrentPageIndex(): number {
    if (!this.currentPage) return -1
    return this.pages.findIndex(p => p.uuid === this.currentPage!.uuid)
  }

  /**
   * Navigate to next page
   */
  goToNextPage(): boolean {
    const currentIndex = this.getCurrentPageIndex()
    if (currentIndex >= 0 && currentIndex < this.pages.length - 1) {
      return this.navigateTo(this.pages[currentIndex + 1].uuid)
    }
    return false
  }

  /**
   * Navigate to previous page
   */
  goToPreviousPage(): boolean {
    const currentIndex = this.getCurrentPageIndex()
    if (currentIndex > 0) {
      return this.navigateTo(this.pages[currentIndex - 1].uuid)
    }
    return false
  }

  /**
   * Debug information
   */
  getDebugInfo(): any {
    return {
      currentPage: this.currentPage?.name,
      currentPageId: this.currentPage?.uuid,
      pageCount: this.pages.length,
      pages: this.pages.map(p => ({ uuid: p.uuid, name: p.name })),
      historySize: this.navigationHistory.length,
      canGoBack: this.canGoBack()
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.currentPage = null
    this.pages = []
    this.navigationHistory = []
  }
}
