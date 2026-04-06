/** Preset SQL-ish types for ERD columns; use CUSTOM for free text. */
export const ERD_DATA_TYPE_CUSTOM = "__custom__";

export const ERD_DATA_TYPES = [
  { value: "bigint", label: "bigint" },
  { value: "int", label: "int" },
  { value: "smallint", label: "smallint" },
  { value: "tinyint", label: "tinyint" },
  { value: "boolean", label: "boolean" },
  { value: "varchar(36)", label: "varchar(36)" },
  { value: "varchar(255)", label: "varchar(255)" },
  { value: "varchar(500)", label: "varchar(500)" },
  { value: "text", label: "text" },
  { value: "char(36)", label: "char(36)" },
  { value: "decimal(10,2)", label: "decimal(10,2)" },
  { value: "float", label: "float" },
  { value: "double", label: "double" },
  { value: "date", label: "date" },
  { value: "datetime", label: "datetime" },
  { value: "timestamp", label: "timestamp" },
  { value: "json", label: "json" },
  { value: "uuid", label: "uuid" },
  { value: ERD_DATA_TYPE_CUSTOM, label: "Custom…" },
];

export function resolveColumnDataType(preset, customValue) {
  if (preset === ERD_DATA_TYPE_CUSTOM) {
    return (customValue ?? "").trim();
  }
  return preset;
}
