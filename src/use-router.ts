import {
  useNavigate,
  useLocation,
  useParams,
  useMatch,
  PathMatch,
} from 'react-router-dom';

export interface Router {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: (to: string, options?: { state?: any }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  push: (to: string, options?: { state?: any }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replace: (to: string, state?: any) => void;
  goBack: () => void;
  pathname: string;
  query: URLSearchParams;
  setQuery: (params: Record<string, string | undefined>) => void;
  match: PathMatch<string> | null;
  params: Readonly<Record<string, string | undefined>>;
}

export const useRouter = function (): Router {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const match = useMatch('*');

  const setQuery = (newParams: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams(location.search);
    Object.keys(newParams).forEach((key) => {
      const value = newParams[key];
      if (value === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });
    navigate(`${location.pathname}?${searchParams}`, { replace: true });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = (to: string, options?: { state?: any }) => {
    navigate(to, { ...options, replace: false });
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate: (to: string, options?: { state?: any }) =>
      navigate(to, { ...options }),
    push,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replace: (to: string, state?: any) =>
      navigate(to, { replace: true, state }),
    goBack: () => navigate(-1),
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    setQuery,
    match,
    params,
  };
};

export default useRouter;

export const getUrlParams = (routerQuery: URLSearchParams) => {
  return {
    // Flow id
    flow: routerQuery.get('flow') || undefined,
    // Return to url
    return_to: routerQuery.get('return_to') || undefined,
    // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password of a user.
    refresh: routerQuery.get('refresh') || undefined,
    // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want to perform two-factor authentication/verification.
    aal: routerQuery.get('aal') || undefined,
  };
};
