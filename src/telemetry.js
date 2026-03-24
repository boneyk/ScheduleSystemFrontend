import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { ZoneContextManager } from '@opentelemetry/context-zone';

export const setupTelemetry = () => {
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: 'orng-frontend'
    })
  });

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
    })
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/
      })
    ]
  });
};
