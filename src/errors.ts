import { Dispatch, SetStateAction } from 'react';

import { FlowTypeMap } from '../types';
import { AxiosError } from '../types/axios';

/**
 * Responds to form validation error or expiration error by mutating the flow state.
 * @throws Error if no action was taken.
 */
export const handleStatusError = async (
  type: keyof FlowTypeMap,
  e: AxiosError<{
    use_flow_id?: string;
  }>,
  setFlow: Dispatch<SetStateAction<FlowTypeMap[typeof type] | undefined>>
) => {
  const status = e.response?.status;
  switch (status) {
    case 400: {
      // Form validation error which returns a new flow
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setFlow(e.response!.data as FlowTypeMap[typeof type]);
      return;
    }
    case 410: {
      // The flow expired, let's request a new one.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newFlowId = e.response!.data.use_flow_id!;
      const url = `/auth/${type}?flow=${newFlowId}`;

      setFlow(undefined);
      window.location.replace(url);
    }
  }

  throw e;
};

/**
 * Handles Ory Kratos specific errors and possibly takes a router action.
 * @throws Throws the error if no action was taken so the status handler can take action.
 */
export const handleFlowError = async (
  type: keyof FlowTypeMap,
  e: AxiosError<{
    error?: {
      id: string;
    };
    redirect_browser_to?: string;
  }>
) => {
  const id = e.response?.data.error?.id;
  const redirectBrowserTo = e.response?.data.redirect_browser_to;

  switch (id) {
    case 'session_inactive': {
      const url = `/auth/login?return_to=${window.location.href}`;
      window.location.replace(url);
      return;
    }
    case 'session_aal2_required': {
      if (redirectBrowserTo) {
        const redirectTo = new URL(redirectBrowserTo);
        if (type === 'settings') {
          redirectTo.searchParams.set('return_to', window.location.href);
        }

        // 2FA is enabled and enforced, but user did not perform 2fa yet!
        window.location.replace(redirectTo.toString());
        return;
      }

      const url = '/auth/login?aal=aal2&return_to=' + window.location.href;
      window.location.replace(url);
      return;
    }
    case 'session_already_available': {
      // User is already signed in, let's redirect them home!
      window.location.replace('/');
      return;
    }
    case 'session_refresh_required': {
      // We need to re-authenticate to perform this action
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      window.location.href = redirectBrowserTo!;
      return;
    }
    case 'self_service_flow_return_to_forbidden': {
      // The flow expired, let's request a new one.
      alert('The return_to address is not allowed.');

      const url = '/auth/' + type;
      window.location.replace(url);
      return;
    }
    case 'self_service_flow_expired': {
      // The flow expired, let's request a new one.
      alert('Your interaction expired, please fill out the form again.');

      const url = '/auth/' + type;
      window.location.replace(url);
      return;
    }
    case 'security_csrf_violation': {
      // A CSRF violation occurred. Best to just refresh the flow!
      alert(
        'A security violation was detected, please fill out the form again.'
      );

      const url = '/auth/' + type;
      window.location.replace(url);
      return;
    }
    case 'security_identity_mismatch': {
      // The requested item was intended for someone else. Let's request a new flow...

      const url = '/auth/' + type;
      window.location.replace(url);
      return;
    }
    case 'browser_location_change_required': {
      // Ory Kratos asked us to point the user to this URL.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      window.location.href = redirectBrowserTo!;
      return;
    }
  }

  throw e;
};

const errorLabelMap: { [id: number]: string } = {
  4000001: 'Invalid email',
  4000002: 'Password is too short',
  4000003: 'Cannot be empty',
};

export const getErrorLabelById = (id: number): string | undefined => {
  return errorLabelMap[id] || undefined;
};
