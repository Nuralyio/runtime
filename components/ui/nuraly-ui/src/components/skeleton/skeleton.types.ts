/**
 * Skeleton shape types
 */
export const enum SkeletonShape {
  Circle = 'circle',
  Square = 'square',
  Round = 'round',
  Default = 'default',
}

/**
 * Skeleton size types
 */
export const enum SkeletonSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}

/**
 * Skeleton element type
 */
export const enum SkeletonElementType {
  Avatar = 'avatar',
  Button = 'button',
  Input = 'input',
  Image = 'image',
}

/**
 * Skeleton avatar configuration
 */
export interface SkeletonAvatarConfig {
  active?: boolean;
  shape?: SkeletonShape;
  size?: SkeletonSize | number;
}

/**
 * Skeleton title configuration
 */
export interface SkeletonTitleConfig {
  width?: number | string;
}

/**
 * Skeleton paragraph configuration
 */
export interface SkeletonParagraphConfig {
  rows?: number;
  width?: number | string | Array<number | string>;
}

/**
 * Skeleton button configuration
 */
export interface SkeletonButtonConfig {
  active?: boolean;
  block?: boolean;
  shape?: SkeletonShape;
  size?: SkeletonSize;
}

/**
 * Skeleton input configuration
 */
export interface SkeletonInputConfig {
  active?: boolean;
  size?: SkeletonSize;
  block?: boolean;
}

/**
 * Skeleton image configuration
 */
export interface SkeletonImageConfig {
  active?: boolean;
}

/**
 * Main skeleton configuration
 */
export interface SkeletonConfig {
  active?: boolean;
  avatar?: boolean | SkeletonAvatarConfig;
  loading?: boolean;
  paragraph?: boolean | SkeletonParagraphConfig;
  round?: boolean;
  title?: boolean | SkeletonTitleConfig;
}
