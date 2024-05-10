import { Dispatch, SetStateAction } from 'react';
import { ContinueWith, FrontendApi, UiNodeGroupEnum } from '@ory/client';

import { FlowMethod, FlowParamsTypeMap, FlowTypeMap } from '../types';

export const getFlow = async (
  type: keyof FlowTypeMap,
  id: string,
  ory: FrontendApi
): Promise<FlowTypeMap[keyof FlowTypeMap]> => {
  let flow: FlowTypeMap[typeof type] | undefined = undefined;

  if (type === 'login') {
    flow = (await ory.getLoginFlow({ id: id })).data;
  } else if (type === 'registration') {
    flow = (await ory.getRegistrationFlow({ id: id })).data;
  } else if (type === 'recovery') {
    flow = (await ory.getRecoveryFlow({ id: id })).data;
  } else if (type === 'settings') {
    flow = (await ory.getSettingsFlow({ id: id })).data;
  } else if (type === 'verification') {
    flow = (await ory.getVerificationFlow({ id: id })).data;
  }

  if (!flow) {
    throw new Error('Flow not found');
  }

  return flow;
};

export const createFlow = async (
  type: keyof FlowTypeMap,
  ory: FrontendApi,
  params?: {
    returnTo?: string;
  }
): Promise<FlowTypeMap[keyof FlowTypeMap]> => {
  let flow: FlowTypeMap[typeof type] | undefined = undefined;

  if (type === 'login') {
    flow = (
      await ory.createBrowserLoginFlow({
        returnTo: params?.returnTo,
      })
    ).data;
  } else if (type === 'registration') {
    flow = (
      await ory.createBrowserRegistrationFlow({
        returnTo: params?.returnTo,
        afterVerificationReturnTo: params?.returnTo,
      })
    ).data;
  } else if (type === 'recovery') {
    flow = (
      await ory.createBrowserRecoveryFlow({
        returnTo: params?.returnTo,
      })
    ).data;
  } else if (type === 'settings') {
    flow = (
      await ory.createBrowserSettingsFlow({
        returnTo: params?.returnTo,
      })
    ).data;
  } else if (type === 'verification') {
    flow = (
      await ory.createBrowserVerificationFlow({
        returnTo: params?.returnTo,
      })
    ).data;
  }

  if (!flow) {
    throw new Error('Create flow not found');
  }

  return flow;
};

/**
 * Updates flow and returns a return to url or undefined.
 * @param type Flow type
 * @param params Flow payload
 * @param flow Existing flow object (for return_to usage).
 * @param setFlow
 * @returns A return to url or undefined.
 */
export const updateFlow = async <T extends keyof FlowTypeMap>(
  type: keyof FlowTypeMap,
  params: FlowParamsTypeMap[T],
  flow: FlowTypeMap[T] | undefined,
  setFlow: Dispatch<SetStateAction<FlowTypeMap[typeof type] | undefined>>,
  ory: FrontendApi
): Promise<string | undefined> => {
  if (type === 'login') {
    await ory.updateLoginFlow(params as FlowParamsTypeMap['login']);

    return flow?.return_to;
  } else if (type === 'registration') {
    const res = await ory.updateRegistrationFlow(
      params as FlowParamsTypeMap['registration']
    );

    if (res.data.continue_with) {
      return handleContinueWith(res.data.continue_with);
    }

    return flow?.return_to;
  } else if (type === 'recovery') {
    const res = await ory.updateRecoveryFlow(
      params as FlowParamsTypeMap['recovery']
    );

    if (res.data.continue_with) {
      return handleContinueWith(res.data.continue_with);
    }

    setFlow(res.data);
    return undefined;
  } else if (type === 'settings') {
    const res = await ory.updateSettingsFlow(
      params as FlowParamsTypeMap['settings']
    );

    if (res.data.continue_with) {
      return handleContinueWith(res.data.continue_with);
    }

    setFlow(res.data);
    return undefined;
  } else if (type === 'verification') {
    const res = await ory.updateVerificationFlow(
      params as FlowParamsTypeMap['verification']
    );

    setFlow(res.data);
    return undefined;
  }

  throw new Error('Update flow not found');
};

const handleContinueWith = function (continueWith: ContinueWith[]): string {
  for (const item of continueWith) {
    switch (item.action) {
      case 'show_verification_ui':
        return '/auth/verification?flow=' + item.flow.id;
      case 'set_ory_session_token':
        // TODO: implement this
        throw new Error('set_ory_session_token action not found');
      case 'show_recovery_ui':
        return '/auth/recovery?flow=' + item.flow.id;
      case 'show_settings_ui':
        return '/auth/settings?flow=' + item.flow.id;
    }
  }

  throw new Error('Continue with action not found');
};

export const formToFlowRequest = function (
  type: keyof FlowParamsTypeMap,
  flowId: string,
  node: HTMLFormElement & {
    'data-node-group': UiNodeGroupEnum;
  }
): FlowParamsTypeMap[keyof FlowParamsTypeMap] {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const formData = new FormData(document.querySelector('form')!);
  const formValues = Object.fromEntries(formData.entries());

  const csrfToken = formValues.csrf_token.toString();
  const identifier = formValues.identifier?.toString();
  const email = formValues.email?.toString() || undefined;
  const password = formValues.password?.toString();
  const code = formValues.code?.toString() || undefined;
  const traits = {
    email: formValues['traits.email']?.toString(),
    name: {
      first: formValues['traits.name.first']?.toString(),
      last: formValues['traits.name.last']?.toString(),
    },
  };

  const method = getMethodFromGroup(node['data-node-group']);
  const provider = node.value;
  const value = node.value;
  const name = node.name;

  // Login
  if (type === 'login') {
    if (method === 'password') {
      return {
        flow: flowId,
        updateLoginFlowBody: {
          method: 'password',
          identifier: identifier,
          password: password,
          csrf_token: csrfToken,
        },
      };
    } else if (method === 'oidc') {
      return {
        flow: flowId,
        updateLoginFlowBody: {
          method: 'oidc',
          provider: provider,
          csrf_token: csrfToken,
        },
      };
    }
  }
  // Registration
  else if (type === 'registration') {
    if (method === 'password') {
      return {
        flow: flowId,
        updateRegistrationFlowBody: {
          method: 'password',
          password: password,
          csrf_token: csrfToken,
          traits: traits,
        },
      };
    } else if (method === 'oidc') {
      return {
        flow: flowId,
        updateRegistrationFlowBody: {
          method: 'oidc',
          provider: provider,
          csrf_token: csrfToken,
        },
      };
    }
  }
  // Recovery
  else if (type === 'recovery') {
    if (method === 'code') {
      return {
        flow: flowId,
        updateRecoveryFlowBody: {
          method: 'code',
          csrf_token: csrfToken,
          code: code,
          email: code ? undefined : email || value, // Kratos doesn't want email if sending a `code`
        },
      };
    }
  }
  // Settings
  else if (type === 'settings') {
    if (method === 'profile') {
      return {
        flow: flowId,
        updateSettingsFlowBody: {
          method: 'profile',
          traits: traits,
          csrf_token: csrfToken,
        },
      };
    } else if (method === 'password') {
      return {
        flow: flowId,
        updateSettingsFlowBody: {
          method: 'password',
          password: password,
          csrf_token: csrfToken,
        },
      };
    } else if (method === 'oidc') {
      return {
        flow: flowId,
        updateSettingsFlowBody: {
          method: 'oidc',
          // Linking oidc provider
          ...(name === 'link' && {
            link: value,
          }),
          // Unlinking oidc provider
          ...(name === 'unlink' && {
            unlink: value,
          }),
        },
      };
    }
  }
  // Verification
  else if (type === 'verification') {
    if (method === 'code') {
      return {
        flow: flowId,
        updateVerificationFlowBody: {
          method: 'code',
          csrf_token: csrfToken,
          code: code,
          email: email,
        },
      };
    }
  }

  throw new Error('Form data flow not found');
};

const getMethodFromGroup = function (uiNodeGroup: UiNodeGroupEnum): FlowMethod {
  let method: FlowMethod | undefined = undefined;

  if (uiNodeGroup === 'password') {
    method = 'password';
  } else if (uiNodeGroup === 'code') {
    method = 'code';
  } else if (uiNodeGroup === 'oidc') {
    method = 'oidc';
  } else if (uiNodeGroup === 'profile') {
    method = 'profile';
  } else {
    throw new Error(
      `Couldn't infer method type from ui node group ${uiNodeGroup}`
    );
  }

  return method;
};
