# Web crawler

The app is made to crawl a page with provided URL for image links and if needed crawl all the links
within also provided depth. Results of crawling are written into `results.json` file in the root
folder of the project. Each image is saved as an object in array in format
`{
  "imageUrl": "string",
  "sourceUrl": "string // the page url this image was found on",
  "depth": "number // the depth of the source at which this image was found on"
}`

To run the app you need to:

1. Clone this repository and run `npm install` to load all the packages;
2. Run the script with `npx ts-node crawler.ts <start_url: string> <depth: number>`

## What is used

1. Node.js;
2. Typescript;
3. Zod (to validate command line arguments);
4. Puppeteer for crawling;
