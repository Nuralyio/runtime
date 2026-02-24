import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './skeleton.component';
import { SkeletonShape, SkeletonSize, SkeletonElementType } from './skeleton.types';

const meta: Meta = {
  title: 'Feedback/Skeleton',
  component: 'nr-skeleton',
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Show animation effect',
    },
    avatar: {
      control: 'boolean',
      description: 'Show avatar placeholder',
    },
    loading: {
      control: 'boolean',
      description: 'Display the skeleton when true',
    },
    paragraph: {
      control: 'boolean',
      description: 'Show paragraph placeholder',
    },
    round: {
      control: 'boolean',
      description: 'Show paragraph and title radius when true',
    },
    showTitle: {
      control: 'boolean',
      description: 'Show title placeholder',
    },
    element: {
      control: 'select',
      options: [undefined, 'avatar', 'button', 'input', 'image'],
      description: 'Element type for standalone skeleton',
    },
    block: {
      control: 'boolean',
      description: 'Block style for button/input',
    },
    shape: {
      control: 'select',
      options: ['default', 'circle', 'square', 'round'],
      description: 'Shape for standalone elements',
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size for standalone elements',
    },
  },
};

export default meta;
type Story = StoryObj;

// Basic skeleton
export const Default: Story = {
  render: () => html`
    <nr-skeleton></nr-skeleton>
  `,
};

// Active animation
export const Active: Story = {
  render: () => html`
    <nr-skeleton active></nr-skeleton>
  `,
};

// Complex skeleton with avatar
export const WithAvatar: Story = {
  render: () => html`
    <nr-skeleton avatar active></nr-skeleton>
  `,
};

// Custom paragraph rows
export const CustomParagraph: Story = {
  render: () => {
    setTimeout(() => {
      const skeleton = document.getElementById('custom-paragraph');
      if (skeleton) {
        (skeleton as any).paragraphConfig = {
          rows: 5,
          width: ['100%', '100%', '100%', '80%', '60%']
        };
      }
    }, 0);

    return html`
      <nr-skeleton id="custom-paragraph" active></nr-skeleton>
    `;
  },
};

// Round corners
export const Round: Story = {
  render: () => html`
    <nr-skeleton round avatar active></nr-skeleton>
  `,
};

// Without title
export const WithoutTitle: Story = {
  render: () => html`
    <nr-skeleton ?show-title=${false} active></nr-skeleton>
  `,
};

// Without paragraph
export const WithoutParagraph: Story = {
  render: () => html`
    <nr-skeleton ?paragraph=${false} active></nr-skeleton>
  `,
};

// Loading state with content
export const LoadingState: Story = {
  render: () => {
    const toggleLoading = (e: Event) => {
      const skeleton = (e.target as HTMLElement).previousElementSibling as any;
      skeleton.loading = !skeleton.loading;
      (e.target as HTMLButtonElement).textContent = skeleton.loading ? 'Show Content' : 'Show Skeleton';
    };

    return html`
      <nr-skeleton loading>
        <div slot="content" style="padding: 20px; border: 1px solid #d9d9d9; border-radius: 4px;">
          <h3 style="margin: 0 0 12px 0;">Default Theme</h3>
          <p style="margin: 0;">
            We supply a series of design principles, practical patterns and high quality
            design resources (Sketch and Axure), to help people create their product
            prototypes beautifully and efficiently.
          </p>
        </div>
      </nr-skeleton>
      <button @click=${toggleLoading} style="margin-top: 16px; padding: 8px 16px; cursor: pointer;">
        Show Content
      </button>
    `;
  },
};

// Skeleton button variants
export const ButtonVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Default:</span>
        <nr-skeleton element=${SkeletonElementType.Button} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Large:</span>
        <nr-skeleton element=${SkeletonElementType.Button} size=${SkeletonSize.Large} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Small:</span>
        <nr-skeleton element=${SkeletonElementType.Button} size=${SkeletonSize.Small} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Round:</span>
        <nr-skeleton element=${SkeletonElementType.Button} shape=${SkeletonShape.Round} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Circle:</span>
        <nr-skeleton element=${SkeletonElementType.Button} shape=${SkeletonShape.Circle} size=${SkeletonSize.Large}></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Block:</span>
        <nr-skeleton element=${SkeletonElementType.Button} ?block=${true} active></nr-skeleton>
      </div>
    </div>
  `,
};

// Skeleton input variants
export const InputVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Default:</span>
        <nr-skeleton element=${SkeletonElementType.Input} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Large:</span>
        <nr-skeleton element=${SkeletonElementType.Input} size=${SkeletonSize.Large} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Small:</span>
        <nr-skeleton element=${SkeletonElementType.Input} size=${SkeletonSize.Small} active></nr-skeleton>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="width: 100px;">Block:</span>
        <nr-skeleton element=${SkeletonElementType.Input} ?block=${true} active></nr-skeleton>
      </div>
    </div>
  `,
};

// Skeleton avatar variants
export const AvatarVariants: Story = {
  render: () => {
    setTimeout(() => {
      const customAvatar = document.getElementById('custom-size-avatar');
      if (customAvatar) {
        (customAvatar as any).avatarConfig = { size: 80 };
      }
    }, 0);

    return html`
      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
          <nr-skeleton element=${SkeletonElementType.Avatar} active></nr-skeleton>
          <div style="margin-top: 8px;">Default</div>
        </div>
        <div style="text-align: center;">
          <nr-skeleton element=${SkeletonElementType.Avatar} size=${SkeletonSize.Large} active></nr-skeleton>
          <div style="margin-top: 8px;">Large</div>
        </div>
        <div style="text-align: center;">
          <nr-skeleton element=${SkeletonElementType.Avatar} size=${SkeletonSize.Small}></nr-skeleton>
          <div style="margin-top: 8px;">Small</div>
        </div>
        <div style="text-align: center;">
          <nr-skeleton element=${SkeletonElementType.Avatar} shape=${SkeletonShape.Square} active></nr-skeleton>
          <div style="margin-top: 8px;">Square</div>
        </div>
        <div style="text-align: center;">
          <nr-skeleton id="custom-size-avatar" element=${SkeletonElementType.Avatar} active></nr-skeleton>
          <div style="margin-top: 8px;">Custom (80px)</div>
        </div>
      </div>
    `;
  },
};

// Skeleton image
export const Image: Story = {
  render: () => html`
    <div style="width: 300px;">
      <nr-skeleton element=${SkeletonElementType.Image} active></nr-skeleton>
    </div>
  `,
};

// List skeleton
export const List: Story = {
  render: () => {
    setTimeout(() => {
      const skeletons = document.querySelectorAll('.list-skeleton');
      skeletons.forEach(skeleton => {
        (skeleton as any).paragraphConfig = { rows: 2 };
      });
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <nr-skeleton class="list-skeleton" avatar active></nr-skeleton>
        <nr-skeleton class="list-skeleton" avatar active></nr-skeleton>
        <nr-skeleton class="list-skeleton" avatar active></nr-skeleton>
      </div>
    `;
  },
};

// Article list
export const ArticleList: Story = {
  render: () => {
    setTimeout(() => {
      const skeletons = document.querySelectorAll('.article-skeleton');
      skeletons.forEach(skeleton => {
        (skeleton as any).paragraphConfig = {
          rows: 3,
          width: ['100%', '100%', '80%']
        };
      });
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div style="border: 1px solid #d9d9d9; padding: 24px; border-radius: 8px;">
          <nr-skeleton class="article-skeleton" active></nr-skeleton>
        </div>
        <div style="border: 1px solid #d9d9d9; padding: 24px; border-radius: 8px;">
          <nr-skeleton class="article-skeleton" active></nr-skeleton>
        </div>
        <div style="border: 1px solid #d9d9d9; padding: 24px; border-radius: 8px;">
          <nr-skeleton class="article-skeleton" active></nr-skeleton>
        </div>
      </div>
    `;
  },
};

// User profile
export const UserProfile: Story = {
  render: () => {
    setTimeout(() => {
      const skeleton = document.getElementById('profile-skeleton');
      if (skeleton) {
        (skeleton as any).avatarConfig = { size: 80 };
        (skeleton as any).paragraphConfig = { rows: 4 };
      }
    }, 0);

    return html`
      <div style="border: 1px solid #d9d9d9; padding: 32px; border-radius: 8px; max-width: 500px;">
        <nr-skeleton id="profile-skeleton" avatar active round></nr-skeleton>
      </div>
    `;
  },
};

// Form loading
export const FormLoading: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      <nr-skeleton element=${SkeletonElementType.Input} ?block=${true} active></nr-skeleton>
      <nr-skeleton element=${SkeletonElementType.Input} ?block=${true} active></nr-skeleton>
      <nr-skeleton element=${SkeletonElementType.Input} ?block=${true} active></nr-skeleton>
      <nr-skeleton element=${SkeletonElementType.Button} active></nr-skeleton>
    </div>
  `,
};

// Card skeleton
export const CardSkeleton: Story = {
  render: () => {
    setTimeout(() => {
      const skeleton = document.getElementById('card-content-skeleton');
      if (skeleton) {
        (skeleton as any).paragraphConfig = { rows: 3 };
      }
    }, 0);

    return html`
      <div style="border: 1px solid #d9d9d9; padding: 24px; border-radius: 8px; max-width: 400px;">
        <nr-skeleton element=${SkeletonElementType.Image} active></nr-skeleton>
        <div style="margin-top: 16px;">
          <nr-skeleton id="card-content-skeleton" active></nr-skeleton>
        </div>
      </div>
    `;
  },
};

// Carbon dark theme
export const CarbonDarkTheme: Story = {
  render: () => html`
    <div theme="carbon-dark" style="padding: 40px; background: #262626;">
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <nr-skeleton avatar active></nr-skeleton>
        <nr-skeleton avatar active></nr-skeleton>
        <div style="display: flex; gap: 16px; margin-top: 16px;">
          <nr-skeleton element=${SkeletonElementType.Button} active></nr-skeleton>
          <nr-skeleton element=${SkeletonElementType.Input} ?block=${true} active></nr-skeleton>
        </div>
      </div>
    </div>
  `,
};

// All features combined
export const AllFeatures: Story = {
  render: () => {
    setTimeout(() => {
      const customSkeleton = document.getElementById('all-features-skeleton');
      if (customSkeleton) {
        (customSkeleton as any).avatarConfig = { size: 64 };
        (customSkeleton as any).paragraphConfig = {
          rows: 4,
          width: ['100%', '100%', '90%', '70%']
        };
      }
    }, 0);

    return html`
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        <!-- Basic -->
        <div style="border: 1px solid #d9d9d9; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 16px 0;">Basic</h4>
          <nr-skeleton active></nr-skeleton>
        </div>

        <!-- With Avatar -->
        <div style="border: 1px solid #d9d9d9; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 16px 0;">With Avatar</h4>
          <nr-skeleton avatar active></nr-skeleton>
        </div>

        <!-- Round -->
        <div style="border: 1px solid #d9d9d9; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 16px 0;">Round</h4>
          <nr-skeleton round avatar active></nr-skeleton>
        </div>

        <!-- Custom -->
        <div style="border: 1px solid #d9d9d9; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 16px 0;">Custom Configuration</h4>
          <nr-skeleton id="all-features-skeleton" avatar active round></nr-skeleton>
        </div>

        <!-- Elements -->
        <div style="border: 1px solid #d9d9d9; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 16px 0;">Elements</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <nr-skeleton element=${SkeletonElementType.Button} active></nr-skeleton>
            <nr-skeleton element=${SkeletonElementType.Input} ?block=${true} active></nr-skeleton>
            <nr-skeleton element=${SkeletonElementType.Avatar} active></nr-skeleton>
          </div>
        </div>

        <!-- Image -->
        <div style="border: 1px solid #d9d9d9; padding: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 16px 0;">Image</h4>
          <nr-skeleton element=${SkeletonElementType.Image} active></nr-skeleton>
        </div>
      </div>
    `;
  },
};
