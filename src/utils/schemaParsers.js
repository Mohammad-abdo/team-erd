/**
 * Parses SQL CREATE TABLE statements into structured ERD data.
 * Supports MySQL, PostgreSQL, SQLite-style syntax.
 */
export function parseSql(sql) {
  const tables = [];
  const relations = [];

  const cleaned = sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\r\n/g, "\n");

  const tableRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([\s\S]*?)\)\s*(?:ENGINE|;|$)/gi;
  let match;

  while ((match = tableRe.exec(cleaned)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns = [];
    const pks = new Set();
    const uniques = new Set();

    const lines = body.split(",").map((l) => l.trim()).filter(Boolean);
    const deferredFks = [];

    for (const line of lines) {
      const upper = line.toUpperCase().replace(/\s+/g, " ");

      if (upper.startsWith("PRIMARY KEY")) {
        const pkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          pkMatch[1].split(",").map((c) => c.trim().replace(/[`"']/g, "")).forEach((c) => pks.add(c.toLowerCase()));
        }
        continue;
      }
      if (upper.startsWith("UNIQUE")) {
        const uMatch = line.match(/UNIQUE\s*(?:KEY|INDEX)?\s*(?:\w+\s*)?\(([^)]+)\)/i);
        if (uMatch) {
          uMatch[1].split(",").map((c) => c.trim().replace(/[`"']/g, "")).forEach((c) => uniques.add(c.toLowerCase()));
        }
        continue;
      }
      if (upper.startsWith("KEY") || upper.startsWith("INDEX") || upper.startsWith("CONSTRAINT") && !upper.includes("FOREIGN KEY")) {
        continue;
      }
      if (upper.includes("FOREIGN KEY")) {
        const fkMatch = line.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i);
        if (fkMatch) {
          deferredFks.push({
            fromColumn: fkMatch[1].trim().replace(/[`"']/g, ""),
            toTable: fkMatch[2],
            toColumn: fkMatch[3].trim().replace(/[`"']/g, ""),
          });
        }
        continue;
      }

      const colMatch = line.match(/^[`"']?(\w+)[`"']?\s+(\w[\w() ,]*?)(?:\s+(.*?))?$/i);
      if (!colMatch) continue;

      const name = colMatch[1];
      let dataType = colMatch[2].trim();
      const rest = (colMatch[3] || "").toUpperCase();

      const sizeMatch = line.match(new RegExp(`${name}[\\s]+\\w+\\s*\\(([^)]+)\\)`, "i"));
      if (sizeMatch) {
        dataType = dataType + "(" + sizeMatch[1] + ")";
      }

      const isPk = rest.includes("PRIMARY KEY") || rest.includes("PRIMARY");
      const isFk = rest.includes("REFERENCES");
      const isNullable = !rest.includes("NOT NULL");
      const isUnique = rest.includes("UNIQUE");

      let defaultValue = null;
      const defMatch = rest.match(/DEFAULT\s+('(?:[^']*)'|"(?:[^"]*)"|[\w.()]+)/i);
      if (defMatch) defaultValue = defMatch[1].replace(/^['"]|['"]$/g, "");

      if (isPk) pks.add(name.toLowerCase());

      let refMatch = null;
      if (isFk) {
        refMatch = (colMatch[3] || "").match(/REFERENCES\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i);
        if (refMatch) {
          deferredFks.push({ fromColumn: name, toTable: refMatch[1], toColumn: refMatch[2].trim().replace(/[`"']/g, "") });
        }
      }

      columns.push({ name, dataType, isPk, isFk, isNullable, isUnique, defaultValue });
    }

    for (const col of columns) {
      if (pks.has(col.name.toLowerCase())) col.isPk = true;
      if (uniques.has(col.name.toLowerCase())) col.isUnique = true;
    }

    tables.push({ name: tableName, columns });

    for (const fk of deferredFks) {
      const col = columns.find((c) => c.name.toLowerCase() === fk.fromColumn.toLowerCase());
      if (col) col.isFk = true;
      relations.push({
        fromTable: tableName,
        toTable: fk.toTable,
        fromColumn: fk.fromColumn,
        toColumn: fk.toColumn,
        relationType: "ONE_TO_MANY",
      });
    }
  }

  return { tables, relations };
}

/**
 * Parses Prisma schema into ERD data.
 */
export function parsePrismaSchema(content) {
  const tables = [];
  const relations = [];

  const modelRe = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let match;

  while ((match = modelRe.exec(content)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const columns = [];
    const lines = body.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"));

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      const name = parts[0];
      let rawType = parts[1];

      if (/^[A-Z]/.test(rawType) && !["String", "Int", "Float", "Boolean", "DateTime", "BigInt", "Decimal", "Json", "Bytes"].includes(rawType.replace("?", "").replace("[]", ""))) {
        const isArray = rawType.includes("[]");
        const relTarget = rawType.replace("?", "").replace("[]", "");
        if (line.includes("@relation")) {
          const fieldsMatch = line.match(/fields:\s*\[([^\]]+)\]/);
          const refsMatch = line.match(/references:\s*\[([^\]]+)\]/);
          if (fieldsMatch && refsMatch) {
            const fromCol = fieldsMatch[1].trim();
            const toCol = refsMatch[1].trim();
            relations.push({
              fromTable: modelName,
              toTable: relTarget,
              fromColumn: fromCol,
              toColumn: toCol,
              relationType: isArray ? "ONE_TO_MANY" : "ONE_TO_ONE",
            });
          }
        }
        continue;
      }

      const prismaType = rawType.replace("?", "").replace("[]", "");
      const isNullable = rawType.includes("?");

      const typeMap = {
        String: "varchar(255)", Int: "int", Float: "float", Boolean: "boolean",
        DateTime: "datetime", BigInt: "bigint", Decimal: "decimal", Json: "json", Bytes: "blob",
      };
      const dataType = typeMap[prismaType] || prismaType;

      const isPk = line.includes("@id");
      const isUnique = line.includes("@unique");
      const isFk = line.includes("@relation") || false;

      let defaultValue = null;
      const defMatch = line.match(/@default\(([^)]+)\)/);
      if (defMatch) defaultValue = defMatch[1];

      const dbTypeMatch = line.match(/@db\.(\w+(?:\([^)]*\))?)/);
      const finalType = dbTypeMatch ? dbTypeMatch[1].toLowerCase() : dataType;

      columns.push({ name, dataType: finalType, isPk, isFk, isNullable, isUnique, defaultValue });
    }

    tables.push({ name: modelName, columns });
  }

  return { tables, relations };
}

/**
 * Parses OpenAPI / Swagger JSON into API docs structure.
 */
export function parseOpenApiJson(json) {
  const groups = [];
  const groupMap = new Map();

  const paths = json.paths || {};
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete"].indexOf(method.toLowerCase()) === -1) continue;

      const tags = op.tags || ["Default"];
      const tag = tags[0];

      if (!groupMap.has(tag)) {
        groupMap.set(tag, { name: tag, prefix: "", description: "", routes: [] });
      }

      const parameters = (op.parameters || []).map((p) => ({
        location: (p.in || "query").toUpperCase(),
        name: p.name,
        dataType: p.schema?.type || "string",
        isRequired: p.required ?? false,
        description: p.description || "",
        example: p.example ? String(p.example) : "",
      }));

      if (op.requestBody?.content) {
        const bodySchema = Object.values(op.requestBody.content)[0]?.schema;
        if (bodySchema?.properties) {
          for (const [pName, pSchema] of Object.entries(bodySchema.properties)) {
            parameters.push({
              location: "BODY",
              name: pName,
              dataType: pSchema.type || "string",
              isRequired: (bodySchema.required || []).includes(pName),
              description: pSchema.description || "",
              example: pSchema.example ? String(pSchema.example) : "",
            });
          }
        }
      }

      const responses = [];
      if (op.responses) {
        for (const [code, resp] of Object.entries(op.responses)) {
          const statusCode = parseInt(code, 10);
          if (isNaN(statusCode)) continue;

          let exampleJson = null;
          if (resp.content) {
            const jsonContent = resp.content["application/json"];
            if (jsonContent?.example) {
              exampleJson = JSON.stringify(jsonContent.example, null, 2);
            } else if (jsonContent?.schema?.example) {
              exampleJson = JSON.stringify(jsonContent.schema.example, null, 2);
            }
          }

          responses.push({
            statusCode,
            description: resp.description || "",
            exampleJson,
          });
        }
      }

      groupMap.get(tag).routes.push({
        method: method.toUpperCase(),
        path,
        summary: op.summary || "",
        description: op.description || "",
        authRequired: !!(op.security?.length),
        parameters,
        responses,
      });
    }
  }

  for (const g of groupMap.values()) groups.push(g);
  return { groups };
}

/**
 * Detect format and parse accordingly.
 */
export function detectAndParse(content, filename) {
  const lower = filename?.toLowerCase() || "";
  const trimmed = content.trim();

  if (lower.endsWith(".json") || trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed);
      if (json.openapi || json.swagger || json.paths) {
        return { type: "openapi", data: parseOpenApiJson(json) };
      }
      return { type: "unknown", data: null, error: "JSON file is not an OpenAPI/Swagger document." };
    } catch {
      return { type: "unknown", data: null, error: "Invalid JSON." };
    }
  }

  if (lower.endsWith(".prisma") || trimmed.includes("model ") && trimmed.includes("@id")) {
    return { type: "prisma", data: parsePrismaSchema(trimmed) };
  }

  if (/CREATE\s+TABLE/i.test(trimmed)) {
    return { type: "sql", data: parseSql(trimmed) };
  }

  return { type: "unknown", data: null, error: "Could not detect file format. Supported: SQL, Prisma schema, OpenAPI JSON." };
}
