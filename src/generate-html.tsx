import * as React from 'react';
import { UiNode, UiNodeGroupEnum, UiNodeTypeEnum } from '@ory/client';

import { FlowTypeMap, GenerateHtmlParams, UiNodeRenderMap } from '../types';
import { formToFlowRequest } from './services';

export const getRenderNode = <T extends UiNodeTypeEnum>(
  uiNode: UiNode & { type: T },
  renderNodeFunc: UiNodeRenderMap[T] | undefined
): React.JSX.Element => {
  const keyVal =
    uiNode.attributes.node_type === 'input'
      ? `${uiNode.attributes.value}`
      : uiNode.attributes.id;
  const key = `key-${uiNode.type}-${uiNode.group}-${keyVal}`;

  // Extract title from different attributes based on the node type
  let title = '';
  if (uiNode.attributes.node_type === 'a') {
    title = uiNode.attributes.title.text;
  } else if (uiNode.attributes.node_type === 'input') {
    title = uiNode.attributes.label?.text || '';
  }

  const props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(uiNode.attributes as any), // TODO: fix this `any` plz
    key: key,
    ['data-node-key']: key,
    ['data-node-group']: uiNode.group,
    title: title,
  };

  // Serve custom render function with parameters, if available
  if (renderNodeFunc) {
    return renderNodeFunc({
      key: key,
      messages: uiNode.messages,
      meta: uiNode.meta,
      group: uiNode.group,
      props: props,
    });
  }

  // Just return raw HTML element
  return React.createElement(uiNode.type, props);
};

/**
 * Generates HTML for a given flow.
 */
export default function generateHtml<T extends keyof FlowTypeMap>({
  flow,
  flowType,
  renderMap,
  onSubmit,
}: GenerateHtmlParams<T>) {
  if (!flow) {
    return <></>;
  }

  const messages = flow.ui.messages?.map((uiText) => {
    return (
      <div
        key={`flow-ui-msg-${uiText.id}`}
        className={`flow-ui-message flow-ui-message-${uiText.type}`}
      >
        {uiText.text}
      </div>
    );
  });

  const nodes = flow.ui.nodes.map((uiNode) =>
    getRenderNode(uiNode, renderMap ? renderMap[uiNode.type] : undefined)
  );

  const hasError = flow.ui.messages?.some((x) => x.type === 'error') || false;

  /**
   * Fetch form data from dom and submit it programmatically.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Fetch form data from dom
    const node = event.target as HTMLFormElement & {
      'data-node-key': string;
      'data-node-group': UiNodeGroupEnum;
    };
    const data = formToFlowRequest(flowType, flow.id, node);

    onSubmit({ ...data, key: node['data-node-key'] });
  };

  const form = (
    <form
      id="flow-form"
      className={`flow-form ${hasError ? 'flow-form-error' : ''}`}
      onSubmit={handleSubmit}
    >
      {messages}
      {nodes}
    </form>
  );

  return form;
}
