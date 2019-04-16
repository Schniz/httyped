import ts from "typescript";

type Types = { [exportName: string]: string };

export function getTypes(filepath: string): Types {
  const program = ts.createProgram([filepath], {
    noEmit: true
  });

  const exportedTypes: Types = {};

  const sourceFile = program.getSourceFile(filepath);
  if (!sourceFile) {
    return exportedTypes;
  }

  const checker = program.getTypeChecker();
  ts.forEachChild(sourceFile, visit);

  return exportedTypes;

  function visit(node: ts.Node) {
    node.getChildren(sourceFile).map(visit);

    const symbol = checker.getSymbolAtLocation(node);
    if (!symbol) return;
    const exported = symbol.getJsDocTags().find(x => x.name === "export");
    if (!exported || !exported.text) return;
    exportedTypes[exported.text] = checker.typeToString(
      checker.getTypeOfSymbolAtLocation(symbol, node)
    );
  }
}
