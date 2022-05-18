import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  Provider as AppBridgeProvider,
  useAppBridge
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect, NavigationMenu, AppLink } from "@shopify/app-bridge/actions";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ProductsList } from "./components/ProductsList";
import { Dashboard } from "./components/Dashboard";
import { CreateProduct } from "./components/CreateProduct";

export default function App() {

  return (
    <BrowserRouter>
      <PolarisProvider i18n={translations}>
        <AppBridgeProvider
          config={{
            apiKey: process.env.SHOPIFY_API_KEY,
            host: new URL(location).searchParams.get("host"),
            forceRedirect: true,
          }}
        >
          <MyProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/create" element={<CreateProduct />} />
            </Routes>
          </MyProvider>
        </AppBridgeProvider>
      </PolarisProvider>
    </BrowserRouter>
  );
}

function MyProvider({ children }) {
  const app = useAppBridge();

  // NAVIGATION SECTION 
  const dashboardLink = AppLink.create(app, {
    label: 'Dashboard',
    destination: '/',
  });
  const itemsLink = AppLink.create(app, {
    label: 'Products',
    destination: '/products',
  });
  const createProductLink = AppLink.create(app, {
    label: 'Create',
    destination: '/create'
  });
  const navigationMenu = NavigationMenu.create(app, {
    items: [dashboardLink, itemsLink, createProductLink]
  });
  app.subscribe(Redirect.Action.APP, function (redirectData) {
    navigationMenu.set({ active: (navigationMenu.children.find((point) => { return point.destination === redirectData.path })) })
  });
  // NAVIGATION SECTION END

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      credentials: "include",
      fetch: userLoggedInFetch(app),
    }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}
