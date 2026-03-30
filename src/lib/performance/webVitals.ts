import type { MetricWithAttribution } from 'web-vitals/attribution';

interface WebVitalsPayload {
  name: MetricWithAttribution['name'];
  value: number;
  rating: MetricWithAttribution['rating'];
  delta: number;
  id: string;
  path: string;
  timestamp: number;
  attribution?: MetricWithAttribution['attribution'];
  connectionType?: string;
}

const METRICS_ENDPOINT = import.meta.env.VITE_WEB_VITALS_ENDPOINT?.trim();

function createPayload(metric: MetricWithAttribution): WebVitalsPayload {
  const navigatorWithConnection = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
    };
  };
  const connection = navigatorWithConnection.connection;

  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    path: `${window.location.pathname}${window.location.search}`,
    timestamp: Date.now(),
    attribution: metric.attribution,
    connectionType: connection?.effectiveType
  };
}

function emitMetric(metric: MetricWithAttribution) {
  const payload = createPayload(metric);

  window.dispatchEvent(new CustomEvent('web-vitals:metric', { detail: payload }));

  if (METRICS_ENDPOINT) {
    const body = JSON.stringify(payload);
    const blob = new Blob([body], { type: 'application/json' });
    const sent = navigator.sendBeacon?.(METRICS_ENDPOINT, blob);

    if (!sent) {
      void fetch(METRICS_ENDPOINT, {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json'
        },
        keepalive: true
      }).catch(() => undefined);
    }

    return;
  }

  console.info('[web-vitals]', payload);
}

export async function initWebVitalsReporting() {
  const { onCLS, onINP, onLCP } = await import('web-vitals/attribution');

  onCLS(emitMetric, { reportAllChanges: true });
  onINP(emitMetric);
  onLCP(emitMetric);
}
