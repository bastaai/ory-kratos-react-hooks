import {
  FrontendApiUpdateLoginFlowRequest,
  FrontendApiUpdateRecoveryFlowRequest,
  FrontendApiUpdateRegistrationFlowRequest,
  FrontendApiUpdateSettingsFlowRequest,
  FrontendApiUpdateVerificationFlowRequest,
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  UiNodeAttributes,
  UiNodeGroupEnum,
  UiNodeMeta,
  UiNodeTypeEnum,
  UiText,
  VerificationFlow,
} from '@ory/client';

export const useFlow: (params: UseFlowParams) => UseFlowReturn;

type UseFlowReturn = {
  html: React.JSX.Element;
  return_to: string | undefined;
};

type PureHTMLAttributes<T extends UiNodeTypeEnum> = Exclude<
  UiNodeAttributes,
  'label' | 'text' | 'node_type' | 'title'
> & {
  node_type: T;
  title: string;
};

type UiNodeRenderProps<T extends UiNodeTypeEnum> = {
  key: string;
  messages: UiText[];
  meta: UiNodeMeta;
  group: UiNodeGroupEnum;
  props: PureHTMLAttributes<T>;
};

type UiNodeRenderMap = {
  [K in UiNodeTypeEnum]?: (props: UiNodeRenderProps<K>) => React.JSX.Element;
};

/**
 * Represents the parameters for the useFlow hook.
 */
type UseFlowParams = {
  flowType: keyof FlowTypeMap;

  options?: {
    /**
     * Uncontrolled render map. If a node type is not found in this map, the default HTML element will be used.
     */
    render?: UiNodeRenderMap;
    /**
     * Note: this will override the `?return_to=` parameter.
     */
    returnTo?: string;
    /**
     * Executes a piece of code before submitting the form.
     */
    preSubmitHook?: (params: { key: string }) => void;
    postSubmitHook?: () => void;
  };
};

type FlowTypeMap = {
  login: LoginFlow;
  registration: RegistrationFlow;
  settings: SettingsFlow;
  recovery: RecoveryFlow;
  verification: VerificationFlow;
};

type FlowParamsTypeMap = {
  login: FrontendApiUpdateLoginFlowRequest;
  registration: FrontendApiUpdateRegistrationFlowRequest;
  settings: FrontendApiUpdateSettingsFlowRequest;
  recovery: FrontendApiUpdateRecoveryFlowRequest;
  verification: FrontendApiUpdateVerificationFlowRequest;
};

type FlowMethod =
  | 'oidc'
  | 'password'
  | 'code'
  | 'webauthn'
  | 'totp'
  | 'lookup_secret'
  | 'profile';

type GenerateHtmlParams<T extends keyof FlowTypeMap> = {
  flowType: keyof FlowTypeMap;
  flow: FlowTypeMap[T] | undefined;
  renderMap: UiNodeRenderMap | undefined;
  onSubmit: (data: UseGenerateHtmlOnSubmitParams) => void;
};

type UseGenerateHtmlOnSubmitParams =
  FlowParamsTypeMap[keyof FlowParamsTypeMap] & { key: string };
