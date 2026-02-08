import fs from "fs";
import path from "path";
import satori from "satori";
import { Octokit } from "octokit";
import dotenv from "dotenv";

import { WIDTH, HEIGHT, THEME } from "./theme.js";
import { Card, Stat, Badge, Icon } from "./components.js";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.METRICS_TOKEN || process.env.GITHUB_TOKEN,
});

async function getStats() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        name
        login
        bio
        followers { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            stargazerCount
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const { user } = await octokit.graphql(query, { login: "giuraionut" });
  return user;
}

async function generateSVG(stats) {
  const fontData = fs.readFileSync(path.resolve("fonts/Inter-Regular.ttf"));

  const totalStars = stats.repositories.nodes.reduce(
    (acc, repo) => acc + repo.stargazerCount,
    0,
  );
  const totalCommits =
    stats.contributionsCollection.contributionCalendar.totalContributions;

  const langs = {};
  stats.repositories.nodes.forEach((repo) => {
    repo.languages.edges.forEach((edge) => {
      if (!langs[edge.node.name]) {
        langs[edge.node.name] = { size: 0, color: edge.node.color };
      }
      langs[edge.node.name].size += edge.size;
    });
  });

  const sortedLangs = Object.entries(langs)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 6);
  const totalLangSize = sortedLangs.reduce(
    (acc, [_, data]) => acc + data.size,
    0,
  );

  const techStack = {
    Frontend: { skills: ["React", "Next.js", "TypeScript", "Tailwind"] },
    Backend: { skills: ["Node.js", "Python", "PostgreSQL", "Prisma"] },
    Tools: { skills: ["Docker", "Photoshop", "Premiere"] },
  };
  // 1. Base vertical space (Padding + Gap + Stats Grid)
  const baseHeight = 64 + 120;

  // 2. Calculate Tech Stack Height
  // Header (40px) + (Number of categories * (Category Title 20px + Badges Row ~40px))
  const techStackRows = Object.keys(techStack).length;
  const techStackHeight = 40 + techStackRows * 60;

  // 3. Calculate Language Card Height
  // Header (40px) + Progress Bar (24px) + (Number of langs * row height 22px)
  const langRows = sortedLangs.length;
  const langHeight = 40 + 24 + langRows * 22;

  // 4. Determine final dynamic height
  // We take the taller of the two bottom cards
  const dynamicContentHeight = Math.max(techStackHeight, langHeight);
  const totalHeight = baseHeight + dynamicContentHeight;
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          width: `${WIDTH}px`,
          height: `${totalHeight}px`,
          backgroundColor: THEME.bg,
          color: THEME.text,
          padding: "24px",
          fontFamily: "Inter",
          boxSizing: "border-box",
          gap: "16px",
        },
        children: [
          // Hero Section
          // Card(
          //   [
          //     {
          //       type: "div",
          //       props: {
          //         style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
          //         children: [
          //           {
          //             type: "div",
          //             props: {
          //               style: { display: "flex", flexDirection: "column", flex: "1" },
          //               children: [
          //                 { type: "h1", props: { style: { fontSize: "32px", fontWeight: "800", margin: 0, letterSpacing: "-0.04em", color: "#fafafa" }, children: "Hi there!" } },
          //                 { type: "p", props: { style: { fontSize: "15px", color: THEME.text, margin: "8px 0 0 0", lineHeight: "1.5" }, children: "I'm a computer Engineer & Full-Stack Developer passionate about building scalable web applications and intuitive user experiences." } },
          //               ],
          //             },
          //           },
          //           {
          //             type: "div",
          //             props: {
          //               style: { display: "flex", padding: "6px 12px", backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "20px" },
          //               children: [{ type: "span", props: { style: { fontSize: "11px", fontWeight: "600", color: THEME.accent }, children: "Ionut Giura" } }]
          //             }
          //           },
          //         ],
          //       },
          //     },
          //   ],
          //   { padding: "24px 32px" },
          // ),

          // Stats Grid
          {
            type: "div",
            props: {
              style: { display: "flex", gap: "16px" },
              children: [
                Card(
                  [
                    Stat(
                      "commit",
                      "Contributions",
                      totalCommits.toLocaleString(),
                      "Last year",
                    ),
                  ],
                  { flex: 1 },
                ),
                Card(
                  [
                    Stat(
                      "star",
                      "Total Stars",
                      totalStars.toLocaleString(),
                      "Across repos",
                    ),
                  ],
                  { flex: 1 },
                ),
                Card(
                  [
                    Stat(
                      "users",
                      "Followers",
                      stats.followers.totalCount.toLocaleString(),
                      "Community",
                    ),
                  ],
                  { flex: 1 },
                ),
              ],
            },
          },

          // Split Section: Languages & Tech Stack
          {
            type: "div",
            props: {
              style: { display: "flex", gap: "16px", flex: 1 },
              children: [
                // Tech Stack
                Card(
                  [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "16px",
                        },
                        children: [
                          Icon("terminal", 14, THEME.accent),
                          {
                            type: "span",
                            props: {
                              style: {
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#fafafa",
                              },
                              children: "Technologies & Tools",
                            },
                          },
                        ],
                      },
                    },
                    ...Object.entries(techStack).map(([category, data]) => ({
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "12px",
                        },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: {
                                fontSize: "10px",
                                color: THEME.muted,
                                textTransform: "uppercase",
                                marginBottom: "6px",
                              },
                              children: category,
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: { display: "flex", flexWrap: "wrap" },
                              children: data.skills.map(Badge),
                            },
                          },
                        ],
                      },
                    })),
                  ],
                  { flex: 1.2 },
                ),

                // Languages
                Card(
                  [
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "16px",
                          color: "#fafafa",
                        },
                        children: "Language Proficiency",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: "100%",
                          height: "8px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "16px",
                          backgroundColor: "#18181b",
                        },
                        children: sortedLangs.map(([name, data]) => ({
                          type: "div",
                          props: {
                            style: {
                              width: `${(data.size / totalLangSize) * 100}%`,
                              backgroundColor: data.color || THEME.muted,
                              height: "100%",
                            },
                          },
                        })),
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        },
                        children: sortedLangs.map(([name, data]) => ({
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            },
                            children: [
                              {
                                type: "div",
                                props: {
                                  style: {
                                    display: "flex",
                                    alignItems: "center",
                                  },
                                  children: [
                                    {
                                      type: "div",
                                      props: {
                                        style: {
                                          width: "8px",
                                          height: "8px",
                                          borderRadius: "50%",
                                          marginRight: "8px",
                                          backgroundColor:
                                            data.color || THEME.muted,
                                        },
                                      },
                                    },
                                    {
                                      type: "span",
                                      props: {
                                        style: {
                                          fontSize: "12px",
                                          color: THEME.text,
                                        },
                                        children: name,
                                      },
                                    },
                                  ],
                                },
                              },
                              {
                                type: "span",
                                props: {
                                  style: {
                                    fontSize: "12px",
                                    color: THEME.muted,
                                  },
                                  children: `${Math.round((data.size / totalLangSize) * 100)}%`,
                                },
                              },
                            ],
                          },
                        })),
                      },
                    },
                  ],
                  { flex: 1 },
                ),
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: "Inter", data: fontData, weight: 400, style: "normal" }],
    },
  );

  return svg;
}

async function main() {
  try {
    console.log("Fetching stats...");
    const stats = await getStats();
    console.log("Generating SVG...");
    const svg = await generateSVG(stats);
    fs.writeFileSync("github-metrics.svg", svg);
    console.log("SVG generated successfully!");
  } catch (error) {
    console.error("Error generating SVG:", error);
    process.exit(1);
  }
}

main();
