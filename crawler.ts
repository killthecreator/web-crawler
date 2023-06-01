import puppeteer from "puppeteer";
import type { Page } from "puppeteer";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import errorCheck from "./utils/errorHandler.js";
import z from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const crawlParams = {
  url: args[0],
  depth: +args[1],
};

const paramsSchema = z.object({
  url: z.string().url("You need to provide a valid URL string"),
  depth: z
    .number({ required_error: "You need to provide depth value" })
    .int("Depth value should be an integer")
    .nonnegative("Depth value should not be negative"),
});

const { url, depth } = paramsSchema.parse(crawlParams);

type Result = {
  imageUrl: string;
  sourceUrl: string;
  depth: number;
};

const getPageImagesInfo = async (page: Page, curDepth: number) => {
  const images = await page.evaluate(() =>
    Array.from(document.images, (e) => e.src)
  );

  const imagesInfoArr = images.map(
    (image): Result => ({
      imageUrl: image,
      sourceUrl: page.url(),
      depth: curDepth,
    })
  );
  return imagesInfoArr;
};

const crawl = async (page: Page, url: string, curDepth: number) => {
  await page.goto(url);
  const curPageImagesInfo = await getPageImagesInfo(page, curDepth);

  if (curDepth !== depth) {
    const nestedPagesImagesInfo = await crawlDeeper(page, curDepth + 1);
    return curPageImagesInfo.concat(nestedPagesImagesInfo as Result[]);
  }
  return curPageImagesInfo;
};

const crawlDeeper = async (page: Page, curDepth: number) => {
  const nestedPagesImagesInfo: Result[] = [];
  try {
    const links = await page.evaluate(() =>
      Array.from(document.links, (e) => e.href)
    );
    for (let link of links) {
      try {
        nestedPagesImagesInfo.push(...(await crawl(page, link, curDepth)));
        await page.goBack();
      } catch (e) {
        errorCheck(e);
      }
    }
    return nestedPagesImagesInfo;
  } catch (e) {
    errorCheck(e);
  }
};

(async () => {
  const curDepth = 0;
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const results = {
      results: await crawl(page, url, curDepth),
    };

    await writeFile(
      resolve(__dirname, "results.json"),
      JSON.stringify(results)
    );

    await browser.close();
    console.log("Results successfully written");
    process.exit();
  } catch (e) {
    errorCheck(e);
  }
})();
