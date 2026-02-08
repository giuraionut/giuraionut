import { THEME } from "./theme.js";
import { ICONS } from "./icons.js";

export const Icon = (name, size = 16, color = THEME.text, style = {}) => {
  const iconDef = ICONS[name] || ICONS.terminal;

  if (typeof iconDef === "function") {
    const iconObj = iconDef(size);
    if (style) {
      iconObj.props.style = { ...iconObj.props.style, ...style };
    }
    return iconObj;
  }

  return {
    type: "svg",
    props: {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: { marginRight: "6px", flexShrink: 0, ...style },
      children: [{ type: "path", props: { d: iconDef } }],
    },
  };
};

export const Card = (children, style = {}) => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      flexDirection: "column",
      border: `1px solid ${THEME.border}`,
      borderRadius: "6px",
      padding: "16px",
      ...style,
    },
    children,
  },
});

export const Stat = (iconName, label, value, subtext) => ({
  type: "div",
  props: {
    style: { display: "flex", flexDirection: "column" },
    children: [
      {
        type: "div",
        props: {
          style: { display: "flex", alignItems: "center", marginBottom: "4px" },
          children: [
            Icon(iconName, 12, THEME.text),
            {
              type: "span",
              props: {
                style: {
                  fontSize: "10px",
                  color: THEME.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                },
                children: label,
              },
            },
          ],
        },
      },
      {
        type: "span",
        props: {
          style: {
            fontSize: "22px",
            fontWeight: "bold",
            color: THEME["text-muted"],
            margin: "2px 0",
            lineHeight: "1.2",
          },
          children: value,
        },
      },
      subtext && {
        type: "span",
        props: {
          style: {
            fontSize: "10px",
            color: THEME["text-muted"],
            lineHeight: "1.2",
          },
          children: subtext,
        },
      },
    ].filter(Boolean),
  },
});

export const Badge = (text) => {
  const iconMap = {
    React: "react",
    "Next.js": "nextjs",
    TypeScript: "typescript",
    Tailwind: "tailwind",
    "Node.js": "nodejs",
    Python: "python",
    PostgreSQL: "postgresql",
    Prisma: "prisma",
    Docker: "docker",
    Git: "git",
    Figma: "figma",
    Blender: "blender",
    Photoshop: "photoshop",
    Premiere: "premiere",
  };
  const iconName = iconMap[text];

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        padding: "6px 8px",
        // backgroundColor: "rgba(39, 39, 42, 0.5)",
        border: `1px solid ${THEME.border}`,
        borderRadius: "6px",
        fontSize: "11px",
        color: THEME["text-muted"],
        marginRight: "8px",
        marginBottom: "8px",
      },
      children: [
        iconName && Icon(iconName, 14, THEME.text, { marginRight: "6px" }),
        { type: "span", props: { children: text } },
      ].filter(Boolean),
    },
  };
};
