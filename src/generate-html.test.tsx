import React from 'react';
import { FlowTypeMap } from '../types';
import generateHtml, { getRenderNode } from './generate-html';
import { UiNodeAttributes } from '@ory/client';

describe('getRenderNode() tests', () => {
  it('Should render a `<a>` with the custom attribute `title`', () => {
    const node: React.JSX.Element = getRenderNode(
      {
        type: 'a',
        attributes: {
          href: '',
          id: '',
          node_type: 'a',
          title: {
            // TODO: `attributes.title` is ignored in favor of `label`. Is this ok?
            id: 1,
            text: 'Mamma mia',
            type: 'info',
          },
        },
        group: 'password',
        messages: [],
        meta: {
          label: {
            id: 1,
            text: 'Pepperoni slize', // this is `meta.label.text`
            type: 'info',
          },
        },
      },
      ({ props, meta }) => <div {...props}>{meta.label?.text}</div>
    );

    expect(node.type).toBe('div');
    expect(node.props.children).toBe('Pepperoni slize');
  });

  it('Should render a <input>', () => {
    const attrs: UiNodeAttributes & { node_type: 'input' } = {
      name: 'email',
      type: 'email',
      required: true,
      node_type: 'input',
      disabled: false,
      value: 'Mamma mia',
    };

    const node: React.JSX.Element = getRenderNode(
      {
        type: 'input',
        attributes: attrs,
        group: 'password',
        messages: [],
        meta: {
          label: {
            id: 2,
            text: 'Email',
            type: 'error',
          },
        },
      },
      ({ props }) => <input {...props} />
    );

    expect(node.props.value).toBe('Mamma mia');
    expect(node.type).toBe('input');
  });
});

describe('Generate html form', () => {
  it('It should have a <form> tag', () => {
    const html = generateHtml<'login'>({
      flow: _FLOW_LOGIN,
      flowType: 'login',
      renderMap: {},
      onSubmit: () => {
        // Empty
      },
    });

    expect(html.type).toBe('form');
  });
});

const _FLOW_LOGIN: FlowTypeMap['login'] = {
  id: '123',
  type: 'browser',
  state: {
    method: 'password',
    return_to: 'http://localhost:1337',
  },
  expires_at: '2021-08-17T14:00:00Z',
  issued_at: '2021-08-17T13:00:00Z',
  request_url: 'http://localhost:4455',
  ui: {
    messages: [
      {
        id: 1,
        type: 'info',
        text: 'Please enter your credentials',
      },
    ],
    nodes: [
      {
        type: 'input',
        group: 'default',
        messages: [],
        meta: {
          label: {
            id: 2,
            text: 'Email',
            type: 'error',
          },
        },
        attributes: {
          name: 'email',
          type: 'email',
          required: true,
          node_type: 'input',
          disabled: false,
        },
      },
    ],
    action: 'http://localhost:1337',
    method: 'POST',
  },
};
