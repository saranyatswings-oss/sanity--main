import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";


export const client = createClient({
  projectId: "bkyggyf6",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
   ignoreBrowserTokenWarning: true
});
export const writeClient = createClient({
  projectId: "bkyggyf6",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.REACT_APP_SANITY_TOKEN,
   ignoreBrowserTokenWarning: true
});

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}


