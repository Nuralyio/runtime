/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { IconPickerIcon } from '../icon-picker.types.js';
import { IconType } from '../icon-picker.types.js';
import { lucideIcons } from './lucide-icons.js';

export class IconLoaderUtils {
  private static iconCache: Map<IconType, IconPickerIcon[]> = new Map();

  /**
   * Load icons from Lucide library
   */
  static loadIcons(types: IconType[] = [IconType.Solid]): IconPickerIcon[] {
    const allIcons: IconPickerIcon[] = [];

    types.forEach(type => {
      if (this.iconCache.has(type)) {
        allIcons.push(...this.iconCache.get(type)!);
      } else {
        const icons = this.loadIconsByType(type);
        this.iconCache.set(type, icons);
        allIcons.push(...icons);
      }
    });

    return allIcons;
  }

  /**
   * Load icons of specific type
   */
  private static loadIconsByType(type: IconType): IconPickerIcon[] {
    // Lucide icons are all one style, so we use Solid type
    return this.extractLucideIcons(type);
  }

  /**
   * Extract icon data from Lucide icon names
   */
  private static extractLucideIcons(type: IconType): IconPickerIcon[] {
    return lucideIcons.map((iconName: string) => ({
      name: iconName,
      type,
      iconName,
      keywords: this.generateKeywords(iconName),
      category: this.categorizeIcon(iconName)
    }));
  }

  /**
   * Generate keywords from icon name for better searchability
   */
  private static generateKeywords(iconName: string): string[] {
    // Split camelCase or kebab-case into words
    const words = iconName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/-/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter(Boolean);
    
    return [...new Set(words)];
  }

  /**
   * Categorize icon based on name patterns
   */
  private static categorizeIcon(iconName: string): string {
    const name = iconName.toLowerCase();
    
    if (name.includes('arrow') || name.includes('chevron') || name.includes('corner') || name.includes('move')) {
      return 'arrow';
    }
    if (name.includes('mail') || name.includes('message') || name.includes('phone') || name.includes('chat')) {
      return 'communication';
    }
    if (name.includes('file') || name.includes('document') || name.includes('folder')) {
      return 'file';
    }
    if (name.includes('menu') || name.includes('grid') || name.includes('layout') || name.includes('panel')) {
      return 'interface';
    }
    if (name.includes('video') || name.includes('audio') || name.includes('play') || name.includes('music')) {
      return 'media';
    }
    if (name.includes('facebook') || name.includes('twitter') || name.includes('linkedin') || name.includes('github')) {
      return 'social';
    }
    if (name.includes('text') || name.includes('type') || name.includes('font')) {
      return 'text';
    }
    if (name.includes('briefcase') || name.includes('building') || name.includes('calendar') || name.includes('chart')) {
      return 'business';
    }
    if (name.includes('pen') || name.includes('brush') || name.includes('palette') || name.includes('edit')) {
      return 'design';
    }
    if (name.includes('circle') || name.includes('square') || name.includes('triangle') || name.includes('hexagon')) {
      return 'shapes';
    }
    
    return 'all';
  }

  /**
   * Get unique icon names (removes duplicates)
   */
  static getUniqueIcons(icons: IconPickerIcon[]): IconPickerIcon[] {
    const seen = new Set<string>();
    return icons.filter(icon => {
      if (seen.has(icon.name)) {
        return false;
      }
      seen.add(icon.name);
      return true;
    });
  }

  /**
   * Clear icon cache
   */
  static clearCache(): void {
    this.iconCache.clear();
  }
}
