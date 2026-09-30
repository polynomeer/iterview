# Message catalog

One file per screen or domain namespace, each exporting `{ en, ko }` with the same keys.
`index.ts` merges them into `messages.ts`. Placeholders use `{name}` and are filled by
`t("ns.key", { name })` in components or `translate("ns.key", { name })` outside React.
