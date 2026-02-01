import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Visual Workflow Builder',
    icon: '🔧',
    description: (
      <>
        Build AI agents and automations visually with our drag-and-drop canvas.
        No coding required to create powerful workflows.
      </>
    ),
  },
  {
    title: 'AI-Powered Components',
    icon: '🤖',
    description: (
      <>
        Pre-built AI components including LLM integrations, RAG pipelines,
        and intelligent chatbots ready to deploy.
      </>
    ),
  },
  {
    title: 'Enterprise Ready',
    icon: '🏢',
    description: (
      <>
        Deploy on cloud or on-premise. Built for scale with security,
        compliance, and team collaboration features.
      </>
    ),
  },
];

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
