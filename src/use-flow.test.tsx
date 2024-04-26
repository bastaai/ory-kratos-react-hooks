import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Button, Checkbox, Input, Link, Typography } from '@mui/joy';
import Image from 'next/image';
import { renderHook } from '@testing-library/react';

import useFlow from './use-flow';

describe('useFlow', () => {
  test('should return the correct values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Router>{children}</Router>
    );

    const { result } = renderHook(
      () =>
        useFlow({
          flowType: 'login',
          options: {
            render: {
              input: ({ props, meta }) => {
                if (props.type === 'submit') {
                  return <Button {...props}>{meta.label?.text}</Button>;
                } else if (props.type === 'checkbox') {
                  return <Checkbox {...props} label={meta.label?.text} />;
                }

                return <Input {...props} />;
              },
              a: ({ props, meta }) => (
                <Link {...props}>{meta.label?.text || 'N/A'}</Link>
              ),
              img: ({ props }) => <Image {...props} alt="" />,
              text: ({ props, meta }) => (
                <Typography {...props}>{meta.label?.text}</Typography>
              ),
              script: ({ props }) => <script {...props} />,
            },
          },
        }),
      { wrapper }
    );

    const html: React.JSX.Element = result.current.html;
    expect(html.type.toString()).toBe('Symbol(react.fragment)');
  });
});
