import axios from "axios";

export const performWebSearch = async (query: string): Promise<string[]> => {
  const response = await axios.get(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`);
  const html = response.data;

  const links = Array.from(
  html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g) as Iterable<RegExpMatchArray>
)
.map((match) => `${match[2]} - ${match[1]}`)
.slice(0, 5);


  return links;
};
