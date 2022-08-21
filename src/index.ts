import fs from "fs";
import * as cheerio from "cheerio";
import { fileURLToPath } from "node:url";
import type { AstroIntegration, RouteData } from "astro";
// for a simple integration you could use as reference, check out ref: https://github.com/Kendy205/astro-og-image/blob/main/src/index.ts

interface LunrIndexItem {
    title: string;
    loc: string;
    content?: string;
    adf_section?: string | null;
}

interface AstroLunrConfig {
    routeFilter?(value: RouteData, index?: number, array?: RouteData[]): RouteData[];
    headingFilter?(idx: number, el: cheerio.Element): boolean;
    contentFilter?(el: cheerio.Element): boolean;
    resultFilter?(obj: LunrIndexItem, idx?: number, arr?: LunrIndexItem[]): boolean;
}

export default function AstroLunr(config: AstroLunrConfig): AstroIntegration {
    const isHeading = (chr: cheerio.Element): boolean => {
        return ["h1", "h2", "h3", "h4", "h5", "h6"].indexOf(chr.name) >= 0;
    };

    return {
        name: "@jackcarey/astro-lunr",
        hooks: {
            "astro:build:done": async ({ dir, routes }) => {
                if (typeof config?.routeFilter === "function") {
                    console.log("Building search index with custom route filter");
                }
                if (typeof config?.headingFilter === "function") {
                    console.log("Building search index with custom heading filter");
                }
                if (typeof config?.resultFilter === "function") {
                    console.log("Building search index with custom result filter");
                }
                let index_path = fileURLToPath(`${dir}search_index.json`);
                let index_json: LunrIndexItem[] = [];
                if (typeof config?.routeFilter === "function") {
                    routes = routes.filter(config.routeFilter);
                }
                for (let route of routes) {
                    if (route.type == "page") {
                        //ignore endpoints
                        let path = route?.distURL?.pathname;
                        if (path && path[0] == "/") {
                            path = path.substring(1); //remove preceding slash / if it exists
                        }
                        if (path) {
                            const content = fs.readFileSync(path, "utf8");
                            const $ = cheerio.load(content);

                            let headings = $("h1,h2,h3,h4,h5,h6");
                            if (typeof config?.headingFilter === "function") {
                                headings = headings.filter(config.headingFilter);
                            } else {
                                // a sensible default filter that ignores headings inside the header and nav elements
                                headings = headings.filter(
                                    (idx, hd) =>
                                        $(hd).parents("header").length +
                                            $(hd).parents("nav").length ==
                                        0
                                );
                            }
                            headings.each((idx: number, el: cheerio.Element) => {
                                let cheery = $(el);
                                let headingID: string = el.attribs?.id || "";
                                let loc: string = `${route.route}${
                                    headingID ? "#" : ""
                                }${headingID}`;
                                let title: string = cheery.text() || loc;

                                let result: LunrIndexItem = { loc, title };
                                let indexExists = index_json.some(
                                    (x) => x.loc == result.loc && x.title == result.title
                                );
                                if (!indexExists) {
                                    // To enable advanced filtering with @jackcarey/astro-filter-content,
                                    // the astro docs filter (adf) filter is added, if it exists
                                    let adf_section = null;
                                    for (let parent of cheery.parents()) {
                                        let el = $(parent);
                                        let sec = el.data("adf-section");
                                        if (sec) {
                                            adf_section = sec;
                                            break;
                                        }
                                    }
                                    if (adf_section) {
                                        result.adf_section = "" + adf_section;
                                    }
                                    // add text content following each heading to the result
                                    // by looping through every 'nextSibling' element and children from
                                    // cheerio until another heading is found
                                    let content = "";
                                    for (let sib of cheery.nextAll()) {
                                        if (isHeading(sib)) {
                                            break;
                                        }
                                        // this function is called recursively on tags
                                        const nestedText = (cheer) => {
                                            const ignore = [
                                                "script",
                                                "style",
                                                "astro-island",
                                                "nav",
                                                "video",
                                                "svg>*:not(title,text)",
                                            ];
                                            // only ignore elements if the user hasn't specified their own filter
                                            let ignored =
                                                !config?.contentFilter &&
                                                ignore.indexOf(el.name) != -1;
                                            //otherwise, don't ignore any elements and only use the provided filter
                                            let excluded =
                                                config?.contentFilter &&
                                                !config.contentFilter(el);
                                            if (ignored || excluded) {
                                                return "";
                                            }
                                            let res = "";
                                            if (cheer.children.length) {
                                                for (let idx in cheer.children) {
                                                    let child = cheer.children[idx];
                                                    if (child.type == "text") {
                                                        res += child.data.trim();
                                                    } else {
                                                        res += nestedText($(child));
                                                    }
                                                }
                                            }
                                            return res.trim();
                                        };
                                        content += nestedText(sib).trim();
                                    }
                                    if (content) {
                                        result.content = content;
                                    }
                                    index_json.push(result);
                                }
                            });
                        }
                    }
                }
                if (typeof config?.resultFilter === "function") {
                    index_json = index_json.filter(config.resultFilter);
                }
                fs.writeFileSync(index_path, JSON.stringify(index_json), {
                    encoding: "utf8",
                    flag: "w",
                });
                console.log(
                    "Finished building search_index.json for Lunr. It has",
                    index_json.length,
                    "entries,",
                    index_json.filter((x) => Object.keys(x).indexOf("content") != -1).length,
                    "with 'content'."
                );
            },
        },
    };
}
