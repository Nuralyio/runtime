/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { IconPickerIcon, IconPickerSearchOptions } from '../icon-picker.types.js';

export class IconFilterUtils {
  /**
   * Filter icons by search query
   */
  static filterByName(
    query: string,
    icons: IconPickerIcon[],
    options: IconPickerSearchOptions = {}
  ): IconPickerIcon[] {
    if (!query || query.trim() === '') {
      return icons;
    }

    const searchTerm = options.caseSensitive ? query : query.toLowerCase();
    const matchMode = options.matchMode || 'contains';

    return icons.filter(icon => {
      const iconName = options.caseSensitive ? icon.name : icon.name.toLowerCase();

      switch (matchMode) {
        case 'exact':
          return iconName === searchTerm;
        case 'startsWith':
          return iconName.startsWith(searchTerm);
        case 'contains':
        default:
          return iconName.includes(searchTerm);
      }
    });
  }

  /**
   * Filter icons by category
   */
  static filterByCategory(category: string, icons: IconPickerIcon[]): IconPickerIcon[] {
    if (!category || category === 'all') {
      return icons;
    }

    return icons.filter(icon => icon.category === category);
  }

  /**
   * Rank search results by relevance
   */
  static rankResults(query: string, icons: IconPickerIcon[]): IconPickerIcon[] {
    if (!query || query.trim() === '') {
      return icons;
    }

    const searchTerm = query.toLowerCase();

    return icons
      .map(icon => ({
        icon,
        score: this.calculateRelevanceScore(searchTerm, icon)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.icon);
  }

  /**
   * Calculate relevance score for ranking
   */
  private static calculateRelevanceScore(query: string, icon: IconPickerIcon): number {
    const iconName = icon.name.toLowerCase();
    let score = 0;

    // Exact match gets highest score
    if (iconName === query) {
      score += 100;
    }
    // Starts with query gets high score
    else if (iconName.startsWith(query)) {
      score += 50;
    }
    // Contains query gets medium score
    else if (iconName.includes(query)) {
      score += 25;
    }

    // Keyword matches
    if (icon.keywords) {
      icon.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (keywordLower === query) {
          score += 30;
        } else if (keywordLower.includes(query)) {
          score += 10;
        }
      });
    }

    // Penalize longer names (shorter names are often more relevant)
    score -= iconName.length * 0.1;

    return score;
  }

  /**
   * Combined filter and rank
   */
  static searchAndRank(
    query: string,
    icons: IconPickerIcon[],
    options: IconPickerSearchOptions = {}
  ): IconPickerIcon[] {
    const filtered = this.filterByName(query, icons, options);
    return this.rankResults(query, filtered);
  }
}
