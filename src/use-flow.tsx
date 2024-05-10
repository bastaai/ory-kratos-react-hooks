import { useEffect, useMemo, useRef, useState } from 'react';
import { Configuration, FrontendApi } from '@ory/client';

import {
  FlowTypeMap,
  UseFlowReturn,
  UseFlowParams,
  UseGenerateHtmlOnSubmitParams,
} from '../types';
import useRouter, { getUrlParams } from './use-router';
import { createFlow, getFlow, updateFlow } from './services';
import { handleFlowError, handleStatusError } from './errors';
import generateHtml from './generate-html';

export default function useFlow(
  { flowType, options }: UseFlowParams,
  config?: Configuration
): UseFlowReturn {
  const router = useRouter();
  const ory = useMemo(() => {
    return new FrontendApi(config);
  }, []);
  const [flow, setFlow] = useState<FlowTypeMap[typeof flowType]>();

  const { flow: flowId, return_to } = getUrlParams(router.query);
  const returnTo = options?.returnTo || return_to; // Fallback to query param
  let { current: isInitializing } = useRef(false);

  /*
   * Get or create flow
   */
  useEffect(() => {
    if (flowId || isInitializing) {
      return;
    }

    isInitializing = true;

    (flowId
      ? getFlow(flowType, flowId, ory)
      : createFlow(flowType, ory, {
          returnTo: returnTo,
        })
    )
      .then((flow) => setFlow(flow))
      // Flow errors are handled seperately
      .catch((e) => handleFlowError(flowType, e))
      // Status errors might indicate form errors
      .catch((e) => handleStatusError(flowType, e, setFlow))
      .finally(() => (isInitializing = false));
  }, [flowId]);

  /**
   * Submits flow and executes pre/post hooks
   */
  const onSubmit = async (data: UseGenerateHtmlOnSubmitParams) => {
    options?.preSubmitHook && options.preSubmitHook({ key: data.key });

    router.setQuery({
      flow: flow?.id,
    });

    updateFlow(flowType, data, flow, setFlow, ory)
      .then((returnTo) => returnTo && window.location.replace(returnTo))
      .catch((e) => handleFlowError(flowType, e))
      .catch((e) => handleStatusError(flowType, e, setFlow))
      .finally(() => options?.postSubmitHook && options.postSubmitHook());
  };

  // Generate HTML from flow
  const html = generateHtml({
    flowType,
    flow,
    renderMap: options?.render,
    onSubmit: onSubmit,
  });

  return {
    html: html,
    return_to: returnTo,
  };
}
